import pytest
from datetime import datetime, timedelta, timezone
from modules.modules.M1_aggregator.scoring.v1 import V1ScoringStrategy
from modules.modules.M1_aggregator.scoring.v2 import V2ScoringStrategy
from modules.modules.M1_aggregator.models import OperatorSource, UtilitySource, CreditAnalysis

# --- Helpers ---
def get_recent_date_str():
    return (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

def get_old_date_str():
    return (datetime.now(timezone.utc) - timedelta(hours=48)).date().isoformat()

# --- Tests V1 ---

def test_v1_scoring_base():
    strategy = V1ScoringStrategy()
    # Base 50 + no bonus
    sources = [OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_old_date_str())]
    result = strategy.calculate(sources)
    
    assert isinstance(result, CreditAnalysis)
    assert result.score == 50
    assert result.status == "RISQUE_MOYEN"

def test_v1_scoring_bonus_balance():
    strategy = V1ScoringStrategy()
    # Base 50 + Bonus Balance 10 = 60
    sources = [OperatorSource(operator="ORANGE", msisdn="224622123456", balance=1500000, last_activity=get_old_date_str())]
    result = strategy.calculate(sources)
    assert result.score == 60

def test_v1_scoring_bonus_activity():
    strategy = V1ScoringStrategy()
    # Base 50 + Bonus Activity 20 = 70
    sources = [OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_recent_date_str())]
    result = strategy.calculate(sources)
    assert result.score == 70

def test_v1_scoring_malus_zero():
    strategy = V1ScoringStrategy()
    # Base 50 + Malus -10 = 40
    sources = [OperatorSource(operator="ORANGE", msisdn="224622123456", balance=0, last_activity=get_old_date_str())]
    result = strategy.calculate(sources)
    assert result.score == 40
    assert result.status == "REFUSE"

def test_v1_scoring_full_bonus():
    strategy = V1ScoringStrategy()
    # Base 50 + 10 (balance) + 20 (activity) = 80
    sources = [
        OperatorSource(operator="ORANGE", msisdn="224622123456", balance=1500000, last_activity=get_recent_date_str()),
        OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_recent_date_str())
    ]
    result = strategy.calculate(sources)
    assert result.score == 80
    assert result.status == "ELIGIBLE"

# --- Tests V2 ---

def test_v2_scoring_base_with_utility():
    strategy = V2ScoringStrategy()
    # Base 50
    sources = [OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_old_date_str())]
    # No Utilities
    result = strategy.calculate(sources)
    assert result.score == 50
    
def test_v2_scoring_utility_bonus():
    strategy = V2ScoringStrategy()
    # Base 50 + 15 (on time) + 10 (regular) = 75
    sources = [OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_old_date_str())]
    utilities = [
        UtilitySource(provider="EDG", client_id="12345", invoices_paid_on_time=3, current_debt=0.0)
    ]
    
    result = strategy.calculate(sources, utilities)
    assert result.score == 75
    assert result.status == "ELIGIBLE"

def test_v2_scoring_utility_malus():
    strategy = V2ScoringStrategy(edg_debt_threshold_gnf=500_000, edg_debt_malus=15)
    # Base 50 - 15 (debt > 500k) = 35
    sources = [OperatorSource(operator="MTN", msisdn="224664123456", balance=500000, last_activity=get_old_date_str())]
    utilities = [
        UtilitySource(provider="EDG", client_id="12345", invoices_paid_on_time=1, current_debt=600000.0)
    ]
    
    result = strategy.calculate(sources, utilities)
    assert result.score == 35
    assert result.status == "REFUSE"

def test_v2_interpret_thresholds():
    strategy = V2ScoringStrategy()
    # Test _interpret directly for bounds
    status, rec = strategy._interpret(71, 10000)
    assert status == "ELIGIBLE"
    assert "Capacité d'emprunt estimée" in rec
    
    status, rec = strategy._interpret(41, 10000)
    assert status == "RISQUE_MOYEN"
    
    status, rec = strategy._interpret(40, 10000)
    assert status == "REFUSE"
