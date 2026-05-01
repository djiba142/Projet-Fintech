from typing import List, Optional
from datetime import datetime, timedelta, timezone

from .base import ScoringStrategy
from ..models import OperatorSource, UtilitySource, CreditAnalysis

class V1ScoringStrategy(ScoringStrategy):

    @property
    def version(self) -> str:
        return "v1"

    def calculate(
        self, 
        sources: List[OperatorSource], 
        utility_sources: Optional[List[UtilitySource]] = None,
        threshold: Optional[int] = None
    ) -> CreditAnalysis:
        total = sum(s.balance for s in sources)
        score = 50  # Base

        # ── Règle 1 : Bonus solde ──────────────────────────────────────────
        if total > 1_000_000:
            score += 10

        # ── Règle 2 : Bonus activité récente (dernières 24h) ──────────────
        yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).date().isoformat()
        activity_bonus_applied = False
        for source in sources:
            if (
                not activity_bonus_applied
                and source.last_activity
                and source.last_activity >= yesterday
            ):
                score += 20
                activity_bonus_applied = True

        # ── Règle 3 : Malus compte vide ──────────────────────────────────
        for source in sources:
            if source.balance == 0:
                score -= 10

        # ── Borner entre 0 et 100 ────────────────────────────────────────
        score = max(0, min(100, score))

        # ── Déterminer statut et recommandation ──────────────────────────
        status, recommendation = self._interpret(score, total, threshold=threshold)

        return CreditAnalysis(
            score=score,
            status=status,
            recommendation=recommendation
        )

    @staticmethod
    def _interpret(score: int, total: float, threshold: Optional[int] = None) -> tuple[str, str]:
        # Utilisation du seuil dynamique (défaut 71 si non fourni)
        min_eligible = int(threshold) if threshold is not None else 71
        
        if score >= min_eligible:
            cap = int(total * 0.30)
            return (
                "ELIGIBLE",
                f"Profil éligible. Capacité d'emprunt estimée : {cap:,.0f} GNF (prêt court terme conseillé)."
            )
        elif score >= 41:
            return (
                "RISQUE_MOYEN",
                "Profil à surveiller. Analyse complémentaire recommandée avant décision de crédit."
            )
        else:
            return (
                "REFUSE",
                "Profil insuffisant. Solde et/ou activité trop faibles pour un crédit au niveau actuel."
            )
