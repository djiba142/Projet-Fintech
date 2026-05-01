import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from .router import require_valid_token, get_transactions_internal
from modules.common.database import get_db_connection, log_event, get_all_users

logger = logging.getLogger("risk-analyst")
router = APIRouter()

# --- Modèles ---
class ScoringData(BaseModel):
    income: float
    expense: float
    transactions_freq: int
    anomalies: int

# --- Algorithme de Scoring PRO ---
def calculate_risk_score(data: Dict):
    """Calcule un score de 0 à 100 basé sur les flux financiers."""
    score = 100
    
    # 1. Ratio Revenus / Dépenses
    income = data.get("income", 0)
    expense = data.get("expense", 0)
    if income > 0:
        ratio = expense / income
        if ratio > 0.8: score -= 25
        elif ratio > 0.6: score -= 15
    else:
        score -= 40 # Pas de revenus détectés

    # 2. Fréquence des transactions (Activité)
    freq = data.get("transactions_freq", 0)
    if freq < 5: score -= 15
    elif freq < 10: score -= 5

    # 3. Solde Moyen (Consistance)
    balance = data.get("avg_balance", 0)
    if balance < 100000: score -= 20
    elif balance < 500000: score -= 10

    # 4. Anomalies / Retraits massifs
    anomalies = data.get("anomalies", 0)
    score -= (anomalies * 10)

    return max(0, min(score, 100))

def get_risk_level(score: int):
    if score >= 70: return "LOW"
    if score >= 40: return "MEDIUM"
    return "HIGH"

# ─── ENDPOINTS RISK ───

@router.get("/overview")
async def get_risk_overview(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") not in ["Analyste Risque", "Administrateur"]:
        raise HTTPException(status_code=403, detail="Accès réservé aux analystes")

    users = get_all_users()
    clients = [u for u in users if u['role'] == 'Client']
    
    # Simulation des agrégats pour le dashboard
    total_clients = len(clients)
    high_risk_count = 0
    scores = []
    
    for c in clients:
        # On simule un score pour chaque client pour la démo
        import random
        s = random.randint(30, 95)
        scores.append(s)
        if s < 40: high_risk_count += 1

    avg_score = sum(scores) / total_clients if total_clients > 0 else 0
    
    return {
        "kpis": {
            "avg_score": round(avg_score, 1),
            "high_risk_percent": round((high_risk_count / total_clients * 100), 1) if total_clients > 0 else 0,
            "credits_active": 42,
            "defaults": 3,
            "total_exposure": 1500000000
        },
        "score_distribution": [
            {"range": "0-40", "count": high_risk_count},
            {"range": "40-70", "count": total_clients - high_risk_count - (total_clients // 2)},
            {"range": "70-100", "count": total_clients // 2}
        ]
    }

@router.get("/clients")
async def get_risk_clients(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") not in ["Analyste Risque", "Administrateur"]:
        raise HTTPException(status_code=403, detail="Accès réservé")

    users = get_all_users()
    clients = [u for u in users if u['role'] == 'Client']
    
    for c in clients:
        # Mocking score and risk for list view
        import random
        c['score'] = random.randint(35, 90)
        c['risk_level'] = get_risk_level(c['score'])
        c['credit_status'] = "NONE" if c['score'] < 50 else "ELIGIBLE"
    
    return clients

@router.get("/analysis/{username}")
async def get_client_analysis(username: str, token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") not in ["Analyste Risque", "Administrateur"]:
        raise HTTPException(status_code=403, detail="Accès réservé")

    # 1. Récupérer les flux
    tx_data = await get_transactions_internal(username)
    txs = tx_data.get("transactions", [])
    
    # 2. Calculer les metrics réelles
    income = sum(t['amount'] for t in txs if t['type'] == 'CREDIT')
    expense = sum(t['amount'] for t in txs if t['type'] == 'DEBIT')
    freq = len(txs)
    anomalies = sum(1 for t in txs if t['amount'] > 2000000) # Seuil arbitraire
    
    # 3. Calculer le score
    score = calculate_risk_score({
        "income": income,
        "expense": expense,
        "transactions_freq": freq,
        "anomalies": anomalies,
        "avg_balance": (income - expense) / 2 if income > expense else 10000
    })
    
    risk_level = get_risk_level(score)
    
    return {
        "username": username,
        "score": score,
        "risk_level": risk_level,
        "recommendation": "ACCEPTER" if score >= 70 else "ANALYSE MANUELLE" if score >= 40 else "REFUSER",
        "metrics": {
            "income": income,
            "expense": expense,
            "frequency": freq,
            "anomalies": anomalies
        },
        "factors": [
            {"label": "Stabilité des revenus", "impact": "POSITIVE" if income > 1000000 else "NEUTRAL"},
            {"label": "Ratio de dépenses", "impact": "NEGATIVE" if (expense/income if income>0 else 1) > 0.8 else "POSITIVE"},
            {"label": "Activité du compte", "impact": "POSITIVE" if freq > 10 else "NEGATIVE"}
        ]
    }

@router.get("/alerts")
async def get_risk_alerts(token_data: Dict = Depends(require_valid_token)):
    # Simulation d'alertes de baisse de score
    return [
        {"id": 1, "client": "client1", "type": "SCORE_DROP", "old_score": 75, "new_score": 32, "date": datetime.now().isoformat()},
        {"id": 2, "client": "djiba", "type": "SUSPICIOUS_WITHDRAWAL", "amount": 5000000, "date": datetime.now().isoformat()},
    ]
