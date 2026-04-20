from typing import List, Optional
from datetime import datetime, timedelta, timezone

from .base import ScoringStrategy
from ..models import OperatorSource, UtilitySource, CreditAnalysis

class V2ScoringStrategy(ScoringStrategy):
    """
    Stratégie V2 incluant les données de facturation (EDG / SEG).
    Paramétrable pour permettre aux entités (ex: FINADEV, CRG) d'ajuster les règles métier.
    """

    def __init__(
        self,
        base_score: int = 50,
        balance_bonus: int = 10,
        activity_bonus: int = 20,
        empty_account_malus: int = 10,
        edg_on_time_bonus: int = 15,
        edg_debt_threshold_gnf: float = 500_000,
        edg_debt_malus: int = 15,
        edg_regular_payment_bonus: int = 10
    ):
        self.base_score = base_score
        self.balance_bonus = balance_bonus
        self.activity_bonus = activity_bonus
        self.empty_account_malus = empty_account_malus
        
        self.edg_on_time_bonus = edg_on_time_bonus
        self.edg_debt_threshold_gnf = edg_debt_threshold_gnf
        self.edg_debt_malus = edg_debt_malus
        self.edg_regular_payment_bonus = edg_regular_payment_bonus

    @property
    def version(self) -> str:
        return "v2"

    def calculate(
        self, 
        sources: List[OperatorSource], 
        utility_sources: Optional[List[UtilitySource]] = None
    ) -> CreditAnalysis:
        total = sum(s.balance for s in sources)
        score = self.base_score

        # ── Règles V1 (Telco) ───────────────────────────────────────────────
        if total > 1_000_000:
            score += self.balance_bonus

        yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).date().isoformat()
        activity_bonus_applied = False
        for source in sources:
            if not activity_bonus_applied and source.last_activity and source.last_activity >= yesterday:
                score += self.activity_bonus
                activity_bonus_applied = True

        for source in sources:
            if source.balance == 0:
                score -= self.empty_account_malus

        # ── Règles V2 (Utility / EDG) ───────────────────────────────────────
        if utility_sources:
            for utility in utility_sources:
                # Bonus Paiement Régulier (Factures payées > 3 mois consécutifs)
                if utility.invoices_paid_on_time >= 3:
                    score += self.edg_regular_payment_bonus
                    # Bonus Paiement à l'heure (inclus si factures payées à temps)
                    score += self.edg_on_time_bonus

                # Malus Dette importante
                if utility.current_debt > self.edg_debt_threshold_gnf:
                    score -= self.edg_debt_malus

        # ── Borner entre 0 et 100 ────────────────────────────────────────
        score = max(0, min(100, score))

        # ── Déterminer statut et recommandation ──────────────────────────
        status, recommendation = self._interpret(score, total)

        return CreditAnalysis(
            score=score,
            status=status,
            recommendation=recommendation
        )

    @staticmethod
    def _interpret(score: int, total: float) -> tuple[str, str]:
        if score >= 71:
            cap = int(total * 0.35)  # Légère bonification de confiance dans V2 (35% au lieu de 30%)
            return (
                "ELIGIBLE",
                f"Profil éligible certifié. Capacité d'emprunt estimée : {cap:,.0f} GNF."
            )
        elif score >= 41:
            return (
                "RISQUE_MOYEN",
                "Profil acceptable mais requiert des vérifications manuelles."
            )
        else:
            return (
                "REFUSE",
                "Profil insuffisant selon les critères consolidés (Télécom + Facturation)."
            )
