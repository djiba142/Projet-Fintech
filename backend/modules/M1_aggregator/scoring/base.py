from abc import ABC, abstractmethod
from typing import List, Optional
from ..models import OperatorSource, UtilitySource, CreditAnalysis

class ScoringStrategy(ABC):
    @property
    @abstractmethod
    def version(self) -> str:
        """Retourne l'identifiant de la version de la stratégie."""
        pass

    @abstractmethod
    def calculate(
        self, 
        sources: List[OperatorSource], 
        utility_sources: Optional[List[UtilitySource]] = None,
        threshold: Optional[int] = None
    ) -> CreditAnalysis:
        """
        Calcule le score de crédit basé sur les sources fournies.
        """
        pass
