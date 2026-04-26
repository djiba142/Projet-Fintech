import logging
from typing import List, Optional

from .base import ScoringStrategy
from .v1 import V1ScoringStrategy
from .v2 import V2ScoringStrategy
from ..models import OperatorSource, UtilitySource, CreditAnalysis

logger = logging.getLogger("kandjou.scoring")

# Registre des stratégies disponibles (par nom)
_REGISTRY: dict[str, ScoringStrategy] = {
    "v1": V1ScoringStrategy(),
    "v2": V2ScoringStrategy(),
}

class ScoringEngine:
    """
    Exécuteur de stratégies de scoring.

    Usage (les deux sont équivalents) :
        engine = ScoringEngine(strategy="v1")
        engine = ScoringEngine(strategies=[V1ScoringStrategy()])
        result = engine.run(sources)
    """

    def __init__(
        self,
        strategy: str = "v1",
        strategies: Optional[List[ScoringStrategy]] = None
    ):
        if strategies is not None:
            # Signature liste d'instances — prend la première
            if not strategies:
                raise ValueError("La liste 'strategies' ne peut pas être vide.")
            self._strategy: ScoringStrategy = strategies[0]
        else:
            # Signature par nom de version
            if strategy not in _REGISTRY:
                raise ValueError(
                    f"Stratégie '{strategy}' inconnue. "
                    f"Disponibles : {list(_REGISTRY.keys())}"
                )
            self._strategy = _REGISTRY[strategy]

        logger.info(f"ScoringEngine initialisé — stratégie active : '{self._strategy.version}'")

    def run(
        self, 
        sources: List[OperatorSource],
        utility_sources: Optional[List[UtilitySource]] = None
    ) -> CreditAnalysis:
        """
        Exécute le calcul de scoring.

        Args:
            sources: Sources normalisées (1 ou 2 opérateurs).
            utility_sources: Sources facturation (EDG...). Optionnel.

        Returns:
            CreditAnalysis avec score, statut et recommandation.
        """
        if not sources and not utility_sources:
            raise ValueError("Impossible de calculer un score sans sources de données.")

        result = self._strategy.calculate(sources, utility_sources)

        # Log structuré pour audit
        total_telco = sum(s.balance for s in sources)
        operators = [s.operator for s in sources]
        
        log_msg = (
            f"Scoring [{self._strategy.version}] | "
            f"Opérateurs: {operators} | "
            f"Total Telco: {total_telco:,.0f} GNF | "
            f"Score: {result.score} | "
            f"Statut: {result.status}"
        )
        
        if utility_sources:
            providers = [u.provider for u in utility_sources]
            log_msg += f" | Utilitaires: {providers}"

        logger.info(log_msg)

        return result

    @property
    def active_strategy(self) -> str:
        return self._strategy.version
