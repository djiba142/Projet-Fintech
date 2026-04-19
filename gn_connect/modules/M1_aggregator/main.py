from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
from datetime import datetime
import asyncio

# Dans un projet réel, on utiliserait des variables d'environnement pour ces URLs
M2_URL = "http://localhost:8002"
M3_URL = "http://localhost:8003"

app = FastAPI(title="GN-Connect Aggregator (M1)", description="Moteur d'agrégation et de normalisation")

# --- Configuration CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/aggregate/{phone}")
async def aggregate_data(phone: str):
    async with httpx.AsyncClient() as client:
        # 1. Appel asynchrone simultané vers Orange et MTN (M2)
        try:
            orange_task = client.get(f"{M2_URL}/orange/balance/{phone}")
            mtn_task = client.get(f"{M2_URL}/mtn/balance/{phone}")
            
            orange_res, mtn_res = await asyncio.gather(orange_task, mtn_task)
            
            o_data = orange_res.json()
            m_data = mtn_res.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Erreur de connexion aux simulateurs: {str(e)}")

        # 2. Normalisation (Mapping des champs hétérogènes)
        total_balance = o_data.get("available_balance", 0) + m_data.get("current_balance", 0)
        
        # 3. Appel au Scoring (M3)
        scoring_res = await client.get(f"{M3_URL}/scoring/{phone}?total_balance={total_balance}")
        s_data = scoring_res.json()

        return {
            "client_id": phone,
            "consolidation": {
                "total_balance_gnf": total_balance,
                "sources": {
                    "orange": {"balance": o_data.get("available_balance"), "last_update": o_data.get("last_update")},
                    "mtn": {"balance": m_data.get("current_balance"), "last_update": m_data.get("event_date")}
                }
            },
            "scoring": s_data,
            "timestamp": datetime.now()
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
