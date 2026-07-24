from abc import ABC, abstractmethod
from typing import List, Tuple
from src.core.entities.submission import Submission
from src.core.entities.match import MatchRegion

class ISimilarityAlgorithm(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the algorithm"""
        pass
    
    @property
    @abstractmethod
    def weight(self) -> float:
        """Weight of this algorithm in the final score calculation."""
        pass
        
    @abstractmethod
    def compare(self, sub_a: Submission, sub_b: Submission) -> Tuple[float, List[MatchRegion]]:
        """
        Compares two submissions and returns:
        1. A similarity score between 0.0 and 1.0
        2. A list of matching regions between the two submissions.
        """
        pass
