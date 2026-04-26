import asyncio
import logging
import os
import json
from datetime import datetime
from typing import Optional

from modules.common.event_bus import EventBus
from modules.common.schemas_events import ProviderDataReady, ScoringCompleted
from .state_manager import AggregationSaga
from .scoring.engine import ScoringEngine
from .models import OrangeBalance, MTNBalance, OperatorSource, Consolidation, AggregatedResponse

# ─────────────────────────────────────────────────────────────────────────────
# Config & Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("scoring_worker")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

bus = EventBus(REDIS_URL)
saga: Optional[AggregationSaga] = None

# ─────────────────────────────────────────────────────────────────────────────
# Logique de Normalisation (reprise de M1)
# ─────────────────────────────────────────────────────────────────────────────

def normalize_sources(msisdn: str, orange_data: Optional[dict], mtn_data: Optional[dict]) -> list:
    sources = []
    if orange_data and "error" not in orange_data:
        o = OrangeBalance(**orange_data)
        sources.append(OperatorSource(
            operator="ORANGE",
            msisdn=msisdn,
            balance=o.available_balance,
            last_activity=o.last_deposit,
            is_active=o.status == "ACTIVE"
        ))
    
    if mtn_data and "error" not in mtn_data:
        m = MTNBalance(**mtn_data)
        sources.append(OperatorSource(
            operator="MTN",
            msisdn=msisdn,
            balance=m.current_balance,
            last_activity=None,
            is_active=m.account_state == "OPEN"
        ))
    return sources

# ─────────────────────────────────────────────────────────────────────────────
# Handler de résultats
# ─────────────────────────────────────────────────────────────────────────────

async def handle_provider_result(event_data: dict):
    """
    Reçoit les données d'un opérateur et vérifie si le scoring peut être lancé.
    """
    try:
        request_id = event_data.get("request_id")
        provider = event_data.get("provider")
        msisdn = event_data.get("msisdn")
        
        logger.info(f"📥 [SCORING] Données reçues pour {provider} (REQ:{request_id})")

        # 1. Mise à jour de la Saga
        is_complete = await saga.update_provider_data(request_id, provider, event_data)

        # 2. Si le dossier est complet, on score !
        if is_complete:
            await perform_scoring(request_id, msisdn)

    except Exception as e:
        logger.error(f"❌ Erreur scoring worker: {e}")

async def perform_scoring(request_id: str, msisdn: str):
    """Récupère toutes les données et calcule le score final."""
    logger.info(f"🧠 [SCORING] Calcul du score final pour {request_id}...")

    # 1. Récupération des données brutes stockées dans Redis
    orange_raw = await bus.client.get(f"data:{request_id}:orange")
    mtn_raw = await bus.client.get(f"data:{request_id}:mtn")
    
    orange_data = json.loads(orange_raw) if orange_raw else None
    mtn_data = json.loads(mtn_raw) if mtn_raw else None

    # 2. Normalisation
    sources = normalize_sources(msisdn, 
                                orange_data.get("raw_data") if orange_data else None, 
                                mtn_data.get("raw_data") if mtn_data else None)

    if not sources:
        logger.warning(f"⚠️ Aucune source valide pour {request_id}")
        return

    # 3. Calcul du Score
    engine = ScoringEngine(strategy="v1") # On pourrait dynamiser la stratégie via la Saga
    credit_analysis = engine.run(sources, None)

    # 4. Construction de la réponse finale (format AggregatedResponse)
    total_balance = sum(s.balance for s in sources)
    active_sources = [s.operator for s in sources]
    
    final_result = AggregatedResponse(
        client_id=msisdn,
        consolidation=Consolidation(
            total_balance=total_balance,
            currency="GNF",
            sources_active=active_sources,
            orange_balance=next((s.balance for s in sources if s.operator == "ORANGE"), None),
            mtn_balance=next((s.balance for s in sources if s.operator == "MTN"), None),
            utility_data_present=False
        ),
        credit_analysis=credit_analysis,
        timestamp=datetime.utcnow()
    )

    # 5. Enregistrement dans la Saga
    await saga.set_final_score(request_id, final_result.dict())
    
    # 6. Publication de l'événement final
    score_event = ScoringCompleted(
        request_id=request_id,
        msisdn=msisdn,
        score=credit_analysis.score,
        decision=credit_analysis.status,
        recommendation=credit_analysis.recommendation
    )
    await bus.publish("final_scores", score_event.dict())
    
    logger.info(f"✅ [SCORING] Score calculé pour {msisdn} : {credit_analysis.score}")

# ─────────────────────────────────────────────────────────────────────────────
# Main Loop
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    global saga
    await bus.connect()
    saga = AggregationSaga(bus.client)
    
    # On écoute les résultats avec un Consumer Group dédié pour le scoring
    logger.info("📡 Scoring Worker démarré. À l'écoute de results_stream...")
    await bus.listen("results_stream", handle_provider_result, group_name="scoring-group")

if __name__ == "__main__":
    from typing import Optional
    asyncio.run(main())
