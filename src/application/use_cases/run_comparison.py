from typing import List, Callable
from src.core.entities.submission import Submission
from src.core.entities.match import ComparisonResult
from src.infrastructure.parsers.python_parser import PythonParser
from src.engine.plugin_manager import PluginManager

class RunComparisonUseCase:
    def __init__(self):
        self.parser = PythonParser()
        self.plugin_manager = PluginManager()
        self.plugin_manager.load_builtins()

    def execute(self, submissions: List[Submission], progress_callback: Callable[[int, int], None] = None) -> List[ComparisonResult]:
        # 1. Parse and Tokenize
        for sub in submissions:
            sub.ast_root = self.parser.parse(sub.raw_code.encode('utf8'))
            sub.tokens = self.parser.tokenize(sub.ast_root, sub.raw_code.encode('utf8'))
            sub.normalized_code = self.parser.normalize(sub.ast_root, sub.raw_code.encode('utf8'))
            
        # 2. Pairwise Comparison
        results = []
        total_pairs = (len(submissions) * (len(submissions) - 1)) // 2
        current_pair = 0
        
        algorithms = self.plugin_manager.get_all()
        
        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                sub_a = submissions[i]
                sub_b = submissions[j]
                
                algo_scores = {}
                overall_score = 0.0
                total_weight = 0.0
                all_regions = []
                
                for algo in algorithms:
                    score, regions = algo.compare(sub_a, sub_b)
                    algo_scores[algo.name] = score
                    overall_score += score * algo.weight
                    total_weight += algo.weight
                    all_regions.extend(regions)
                    
                if total_weight > 0:
                    overall_score /= total_weight
                    
                result = ComparisonResult(
                    sub_a=sub_a,
                    sub_b=sub_b,
                    overall_score=overall_score,
                    algorithm_scores=algo_scores,
                    matched_regions=all_regions
                )
                results.append(result)
                
                current_pair += 1
                if progress_callback:
                    progress_callback(current_pair, total_pairs)
                    
        # Sort by similarity descending
        results.sort(key=lambda x: x.overall_score, reverse=True)
        return results
