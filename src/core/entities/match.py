from dataclasses import dataclass
from typing import Dict, List
from src.core.entities.submission import Submission

@dataclass
class MatchRegion:
    start_line_a: int
    end_line_a: int
    start_line_b: int
    end_line_b: int
    score: float

@dataclass
class ComparisonResult:
    sub_a: Submission
    sub_b: Submission
    overall_score: float
    algorithm_scores: Dict[str, float]
    matched_regions: List[MatchRegion]
