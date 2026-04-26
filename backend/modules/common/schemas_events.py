from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class BaseEvent(BaseModel):
    """Schéma de base inspiré des standards Fintech (CinetPay/Stripe)."""
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    env: str = "sandbox"  # 'sandbox' ou 'live'

class AggregationTriggered(BaseEvent):
    """Événement publié par M1 pour lancer la récolte de données."""
    msisdn: str
    providers: list[str] = ["orange", "mtn"]

class ProviderDataReady(BaseEvent):
    """Événement publié par un simulateur (M2) quand une donnée est prête."""
    provider: str  # 'orange' ou 'mtn'
    msisdn: str
    status: str = "COMPLETED"  # SUCCESS, FAILED, TIMEOUT
    balance: float
    raw_data: Dict[str, Any]  # Log complet pour audit/conformité

class ScoringCompleted(BaseEvent):
    """Événement final une fois que la Saga est terminée."""
    msisdn: str
    score: int
    decision: str  # ELIGIBLE (GREEN), RISQUE (ORANGE), REFUSE (RED)
    recommendation: str
