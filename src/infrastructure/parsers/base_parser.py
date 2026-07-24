from typing import Any, List, Set
from src.core.interfaces.parser import IParser
from src.core.entities.submission import Token

class BaseTreeSitterParser(IParser):
    def __init__(self):
        self.parser = self._create_parser()
        
    def _create_parser(self) -> Any:
        raise NotImplementedError()
        
    def parse(self, source_code: bytes) -> Any:
        tree = self.parser.parse(source_code)
        return tree.root_node
        
    def _get_ignore_node_types(self) -> Set[str]:
        return set()
        
    def tokenize(self, root_node: Any, source_code: bytes) -> List[Token]:
        tokens = []
        ignore_types = self._get_ignore_node_types()
        
        def traverse(node):
            if node.type not in ignore_types:
                # If it's a leaf node
                if len(node.children) == 0:
                    val = source_code[node.start_byte:node.end_byte].decode('utf8', errors='ignore')
                    tokens.append(Token(
                        type=node.type,
                        value=val,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        start_column=node.start_point[1],
                        end_column=node.end_point[1]
                    ))
            
            for child in node.children:
                traverse(child)
                
        traverse(root_node)
        return tokens
