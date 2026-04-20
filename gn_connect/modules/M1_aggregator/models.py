import re
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRE MSISDN
# ─────────────────────────────────────────────────────────────────────────────

_VALID_PREFIXES = ("622", "623", "624", "625", "664")
_MSISDN_REGEX = re.compile(
    r"^\+?(?:224)?(6(?:2[2-5]|64))\d{6}$"
)

def normalize_msisdn(raw: str) -> str:
    cleaned = raw.strip().replace(" ", "").replace("-", "")
    if _MSISDN_REGEX.match(cleaned):
        cleaned = cleaned.lstrip("+")
        if not cleaned.startswith("224"):
            cleaned = "224" + cleaned
        return cleaned
    raise ValueError(
        f"MSISDN '{raw}' invalide. "
        f"Préfixes acceptés : {', '.join(_VALID_PREFIXES)} "
        f"(avec ou sans indicatif +224 / 224)."
    )

# ─────────────────────────────────────────────────────────────────────────────
# RÉPONSES BRUTES DES OPÉRATEURS
# ─────────────────────────────────────────────────────────────────────────────

class OrangeBalance(BaseModel):
    msisdn: str
    available_balance: float
    last_deposit: Optional[str] = None
    status: str = "ACTIVE"

class MTNBalance(BaseModel):
    subscriber_number: str
    current_balance: float
    currency: str = "GNF"
    account_state: str = "OPEN"

# ─────────────────────────────────────────────────────────────────────────────
# MODÈLES NORMALISÉS (format interne M1 après adaptation)
# ─────────────────────────────────────────────────────────────────────────────

class OperatorSource(BaseModel):
    operator: str            # "ORANGE" | "MTN"
    msisdn: str
    balance: float
    currency: str = "GNF"
    last_activity: Optional[str] = None
    is_active: bool = True

class UtilitySource(BaseModel):
    provider: str            # "EDG" | "SEG"
    client_id: str
    invoices_paid_on_time: int
    current_debt: float
    currency: str = "GNF"
    is_active: bool = True

class Consolidation(BaseModel):
    total_balance: float
    currency: str = "GNF"
    sources_active: List[str]
    orange_balance: Optional[float] = None
    mtn_balance: Optional[float] = None
    utility_data_present: bool = False

class CreditAnalysis(BaseModel):
    score: int = Field(ge=0, le=100)
    status: str
    recommendation: str

# ─────────────────────────────────────────────────────────────────────────────
# CONTRAT DE SORTIE FINAL (ce que /aggregate/{msisdn} retourne)
# ─────────────────────────────────────────────────────────────────────────────

class AggregatedResponse(BaseModel):
    client_id: str
    consolidation: Consolidation
    credit_analysis: CreditAnalysis
    timestamp: datetime = Field(default_factory=datetime.utcnow)
