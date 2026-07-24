import hashlib
from typing import List, Tuple, Dict
from src.core.interfaces.algorithm import ISimilarityAlgorithm
from src.core.entities.submission import Submission
from src.core.entities.match import MatchRegion

class WinnowingAlgorithm(ISimilarityAlgorithm):
    def __init__(self, kgram_size: int = 5, window_size: int = 4):
        self.kgram_size = kgram_size
        self.window_size = window_size

    @property
    def name(self) -> str:
        return "Winnowing Fingerprinting"

    @property
    def weight(self) -> float:
        return 0.3

    def _hash(self, kgram: str) -> int:
        return int(hashlib.md5(kgram.encode('utf-8')).hexdigest()[:8], 16)

    def _get_fingerprints(self, tokens: List[str]) -> Dict[int, List[int]]:
        if len(tokens) < self.kgram_size:
            return {}

        hashes = []
        for i in range(len(tokens) - self.kgram_size + 1):
            kgram = "".join(tokens[i:i + self.kgram_size])
            hashes.append(self._hash(kgram))

        fingerprints = {}
        for i in range(len(hashes) - self.window_size + 1):
            window = hashes[i:i + self.window_size]
            min_hash = min(window)
            min_index = i + window.index(min_hash)
            
            if min_hash not in fingerprints:
                fingerprints[min_hash] = []
            
            if min_index not in fingerprints[min_hash]:
                fingerprints[min_hash].append(min_index)
                
        return fingerprints

    def compare(self, sub_a: Submission, sub_b: Submission) -> Tuple[float, List[MatchRegion]]:
        tokens_a = [t.value for t in sub_a.tokens]
        tokens_b = [t.value for t in sub_b.tokens]

        fp_a = self._get_fingerprints(tokens_a)
        fp_b = self._get_fingerprints(tokens_b)

        common_hashes = set(fp_a.keys()).intersection(set(fp_b.keys()))
        
        if not fp_a and not fp_b:
            return 1.0, []
        if not fp_a or not fp_b:
            return 0.0, []

        total_unique_hashes = len(set(fp_a.keys()).union(set(fp_b.keys())))
        score = len(common_hashes) / total_unique_hashes if total_unique_hashes > 0 else 0.0

        regions = []
        if score > 0.0:
            regions.append(MatchRegion(
                start_line_a=1, end_line_a=len(tokens_a),
                start_line_b=1, end_line_b=len(tokens_b),
                score=score
            ))

        return score, regions
