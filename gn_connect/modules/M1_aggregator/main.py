import re
import logging
import asyncio
import os
from datetime import datetime
from typing import List, Tuple, Optional

import httpx
from fastapi import FastAPI, HTTPException, Path, Request, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from .models import (
    OrangeBalance, 
    MTNBalance, 
    AggregatedResponse, 
    Consolidation, 
    CreditAnalysis,
    OperatorSource,
    UtilitySource
)
from .scoring.engine import ScoringEngine

# Load environment variables
load_dotenv()

ORANGE_URL = os.getenv("ORANGE_SIMULATOR_URL", "http://localhost:8002")
MTN_URL = os.getenv("MTN_SIMULATOR_URL", "http://localhost:8002")
TIMEOUT = float(os.getenv("AGGREGATOR_TIMEOUT", "2.0"))

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("aggregator")

app = FastAPI(
    title="GN-Connect Core Aggregator",
    description="Module 1: Le Cerveau du Système - Agrégation et Scoring",
    version="1.1.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Tenacity Config pour appels HTTP ---
@retry(
    stop=stop_after_attempt(2), 
    wait=wait_exponential(min=0.2, max=0.8),
    retry=retry_if_exception_type(httpx.RequestError),
    reraise=True
)
async def _fetch_with_retry(client: httpx.AsyncClient, url: str) -> httpx.Response:
    # Pour ne pas dépasser le TIMEOUT global, chaque tentative utilise un timeout court (ex: 1s)
    logger.debug(f"Fetching (avec retry potentiel) : {url}")
    return await client.get(url, timeout=1.0)


# --- Helper Functions ---
def validate_and_format_msisdn(msisdn: str) -> str:
    r"""
    Validates Guinean MSISDN and formats it to 224XXXXXXXXX.
    Regex: ^(?:\+224|224)?(6(?:2[2-5]|64))\d{6}$
    """
    pattern = r"^(?:\+?224)?(6(?:2[2-5]|64))\d{6}$"
    match = re.match(pattern, msisdn)
    if not match:
        raise HTTPException(
            status_code=422,
            detail="Format MSISDN invalide. Numéro guinéen attendu (préfixes 622-625, 664)."
        )
    
    clean_number = msisdn[-9:]
    return f"224{clean_number}"


# --- Auth & Normalization Helpers ---
async def require_valid_token(authorization: Optional[str] = Header(None)):
    """Verifie la présence d'un token M3 (simulation)."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token GN-Connect manquant")
    if not authorization.startswith("m3-"):
        raise HTTPException(status_code=401, detail="Token GN-Connect invalide")
    return authorization

def normalize_sources(msisdn: str, orange_data: Optional[OrangeBalance], mtn_data: Optional[MTNBalance]) -> List[OperatorSource]:
    sources = []
    if orange_data:
        sources.append(OperatorSource(
            operator="ORANGE",
            msisdn=msisdn,
            balance=orange_data.available_balance,
            last_activity=orange_data.last_deposit,
            is_active=orange_data.status == "ACTIVE"
        ))
    
    if mtn_data:
        sources.append(OperatorSource(
            operator="MTN",
            msisdn=msisdn,
            balance=mtn_data.current_balance,
            last_activity=None, # Non fourni par MTN dans cet exemple
            is_active=mtn_data.account_state == "OPEN"
        ))
    return sources


# --- Middleware de Logging ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Path: {request.url.path} | Method: {request.method} | Status: {response.status_code} | Time: {process_time:.3f}s")
    return response


# --- Endpoints ---

@app.get("/health")
async def health_check():
    """Checks if simulators are reachable."""
    async with httpx.AsyncClient(timeout=1.0) as client:
        try:
            orange_task = _fetch_with_retry(client, f"{ORANGE_URL}/health")
            mtn_task = _fetch_with_retry(client, f"{MTN_URL}/health")
            
            results = await asyncio.gather(orange_task, mtn_task, return_exceptions=True)
            
            status = {}
            for i, name in enumerate(["ORANGE", "MTN"]):
                res = results[i]
                if isinstance(res, httpx.Response) and res.status_code == 200:
                    status[name] = "UP"
                else:
                    status[name] = "DOWN"
            
            return {
                "status": "healthy" if all(v == "UP" for v in status.values()) else "degraded",
                "simulators": status,
                "timestamp": datetime.now()
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)}


@app.get("/aggregate/{msisdn}", response_model=AggregatedResponse)
async def aggregate(
    msisdn: str,
    strategy: str = Query("v1", description="Strategie de scoring à appliquer (v1 ou v2)"),
    _authorized: str = Depends(require_valid_token)
):
    # 1. Validation and Formatting
    formatted_msisdn = validate_and_format_msisdn(msisdn)
    logger.info(f"Processing aggregation for: {formatted_msisdn} avec stratégie {strategy}")

    # 2. Parallel Fetching avec Tenacity
    async with httpx.AsyncClient() as client:
        tasks = [
            _fetch_with_retry(client, f"{ORANGE_URL}/provider/orange/balance/{formatted_msisdn}"),
            _fetch_with_retry(client, f"{MTN_URL}/provider/mtn/balance/{formatted_msisdn}")
        ]
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        orange_data = None
        mtn_data = None
        
        # 3. Process Responses
        # Orange
        o_res = responses[0]
        if isinstance(o_res, httpx.Response) and o_res.status_code == 200:
            orange_data = OrangeBalance(**o_res.json())
        elif isinstance(o_res, Exception):
            logger.warning(f"Echec de récupération Orange: {o_res}")
            
        # MTN
        m_res = responses[1]
        if isinstance(m_res, httpx.Response) and m_res.status_code == 200:
            mtn_data = MTNBalance(**m_res.json())
        elif isinstance(m_res, Exception):
            logger.warning(f"Echec de récupération MTN: {m_res}")

        # 4. Fallbacks et Erreurs
        if orange_data is None and mtn_data is None:
            raise HTTPException(
                status_code=503, 
                detail="Service indisponible (les opérateurs n'ont pas répondu)"
            )
            
        total_balance = (orange_data.available_balance if orange_data else 0.0) + \
                        (mtn_data.current_balance if mtn_data else 0.0)
        active_sources = ([ "ORANGE" ] if orange_data else []) + ([ "MTN" ] if mtn_data else [])

        # 5. Normalize and Run Scoring
        sources = normalize_sources(formatted_msisdn, orange_data, mtn_data)
        
        # Support basique pour EDG si V2 est choisie, simulons sans data réelle pour l'instant
        utility_sources = None
        if strategy == "v2":
            # On pourrait simuler un UtilitySource ici ou lire d'un autre endpoint.
            # Pour l'instant, on passe None pour voir la flexibilité.
            pass

        try:
            engine = ScoringEngine(strategy=strategy)
            credit_analysis = engine.run(sources, utility_sources)
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))
        
        # 6. Final Response Assembly
        return AggregatedResponse(
            client_id=formatted_msisdn,
            consolidation=Consolidation(
                total_balance=total_balance,
                currency="GNF",
                sources_active=active_sources,
                orange_balance=orange_data.available_balance if orange_data else None,
                mtn_balance=mtn_data.current_balance if mtn_data else None,
                utility_data_present=bool(utility_sources)
            ),
            credit_analysis=credit_analysis,
            timestamp=datetime.now()
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
