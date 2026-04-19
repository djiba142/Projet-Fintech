from fastapi import FastAPI, HTTPException
import uvicorn
import random
from datetime import datetime

try:
    from common.schemas import ScoringResult, OTPValidation
except ImportError:
    from pydantic import BaseModel
    class ScoringResult(BaseModel):
        client_id: str
        score: int
        risk_level: str
        last_analysis: datetime
        recommendation: str

app = FastAPI(title="GN-Connect Scoring (M3)", description="Moteur de Scoring et Gestion OTP")

# Stockage temporaire des OTP (Simulé)
active_otps = {}

@app.post("/otp/generate")
async def generate_otp(phone: str):
    code = str(random.randint(1000, 9999))
    active_otps[phone] = code
    print(f"[SIMULATION SMS] Vers {phone} : Votre code GN-Connect est {code}")
    return {"status": "sent", "message": "OTP simulé dans la console"}

@app.post("/otp/verify")
async def verify_otp(phone: str, code: str):
    if phone in active_otps and active_otps[phone] == code:
        return {"status": "verified"}
    raise HTTPException(status_code=401, detail="Code OTP invalide")

@app.get("/scoring/{phone}", response_model=ScoringResult)
async def get_score(phone: str, total_balance: float = 0):
    # Algorithme basique (V1)
    base_score = 50
    bonus = int(total_balance / 1000000) * 5 # +5 points par million
    final_score = min(max(base_score + bonus, 0), 100)
    
    risk_level = "Low" if final_score > 70 else "Medium" if final_score > 40 else "High"
    
    return {
        "client_id": phone,
        "score": final_score,
        "risk_level": risk_level,
        "last_analysis": datetime.now(),
        "recommendation": "Approuvé" if final_score > 60 else "Analyse approfondie requise"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
