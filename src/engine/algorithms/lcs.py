from typing import List, Tuple
from src.core.interfaces.algorithm import ISimilarityAlgorithm
from src.core.entities.submission import Submission
from src.core.entities.match import MatchRegion

class TokenLCSAlgorithm(ISimilarityAlgorithm):
    @property
    def name(self) -> str:
        return "Token Sequence Longest Common Subsequence"

    @property
    def weight(self) -> float:
        return 0.5

    def compare(self, sub_a: Submission, sub_b: Submission) -> Tuple[float, List[MatchRegion]]:
        tokens_a = [t.value for t in sub_a.tokens]
        tokens_b = [t.value for t in sub_b.tokens]
        
        n = len(tokens_a)
        m = len(tokens_b)
        
        if n == 0 or m == 0:
            return 0.0, []

        dp = [[0] * (m + 1) for _ in range(n + 1)]
        
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if tokens_a[i-1] == tokens_b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
                    
        lcs_length = dp[n][m]
        
        # Calculate similarity score: 2 * LCS / (len(A) + len(B))
        score = (2.0 * lcs_length) / (n + m)
        
        regions = []
        if score > 0.0:
            regions.append(MatchRegion(
                start_line_a=1, end_line_a=n,
                start_line_b=1, end_line_b=m,
                score=score
            ))
            
        return score, regions
