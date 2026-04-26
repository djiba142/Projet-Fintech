from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Module 2: Sources Simulatrices (Orange / MTN) ---

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

# --- Module 1: Agrégateur (Normalisation) ---

class NormalizedBalance(BaseModel):
    client_id: str
    total_balance: float
    currency: str = "GNF"
    details: List[dict]
    generated_at: datetime = datetime.now()

class UnifiedTransaction(BaseModel):
    id: str
    date: datetime
    type: str # Dépôt, Retrait, Transfert
    amount: float
    source: str # Orange ou MTN
    status: str

# --- Module 3: Scoring & Consentement ---

class OTPRequest(BaseModel):
    phone_number: str

class OTPValidation(BaseModel):
    phone_number: str
    code: str

class ScoringResult(BaseModel):
    client_id: str
    score: int # 0-100
    risk_level: str # Low, Medium, High
    last_analysis: datetime
    recommendation: str

# --- Module 4: Dashboard & Auth ---

class AgentLogin(BaseModel):
    username: str
    password: str

class DashboardOverview(BaseModel):
    total_users_aggregated: int
    total_volume_gnf: float
    system_status: str
