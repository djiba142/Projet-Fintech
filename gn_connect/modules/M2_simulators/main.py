from fastapi import FastAPI
import uvicorn
import time
import random
from datetime import datetime

# Import local si possible, sinon on définit localement pour le squelette
try:
    from common.schemas import OrangeBalanceResponse, MTNBalanceResponse
except ImportError:
    from pydantic import BaseModel
    class OrangeBalanceResponse(BaseModel):
        msisdn: str
        available_balance: float
        cur_code: str = "GNF"
        last_update: str
    class MTNBalanceResponse(BaseModel):
        subscriber_number: str
        current_balance: float
        iso_currency: str = "GNF"
        event_date: str

app = FastAPI(title="GN-Connect Simulators (M2)", description="Simulateur API Orange et MTN")

@app.get("/health")
def health():
    return {"status": "online", "modules": ["OrangeMoney", "MTNMoMo"]}

# --- ORANGE MONEY ENDPOINTS ---
@app.get("/orange/balance/{phone}", response_model=OrangeBalanceResponse)
async def get_orange_balance(phone: str):
    # Simulation de latence (200ms - 500ms)
    time.sleep(random.uniform(0.2, 0.5))
    return {
        "msisdn": phone,
        "available_balance": random.uniform(100000, 5000000),
        "cur_code": "GNF",
        "last_update": datetime.now().isoformat()
    }

# --- MTN MOMO ENDPOINTS ---
@app.get("/mtn/balance/{phone}", response_model=MTNBalanceResponse)
async def get_mtn_balance(phone: str):
    # Simulation de latence (200ms - 500ms)
    time.sleep(random.uniform(0.2, 0.5))
    return {
        "subscriber_number": phone,
        "current_balance": random.uniform(50000, 3000000),
        "iso_currency": "GNF",
        "event_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
