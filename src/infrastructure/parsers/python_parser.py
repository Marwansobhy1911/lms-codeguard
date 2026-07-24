import tree_sitter_python
from tree_sitter import Language, Parser
from typing import Any, Set
from src.infrastructure.parsers.base_parser import BaseTreeSitterParser

class PythonParser(BaseTreeSitterParser):
    def _create_parser(self) -> Parser:
        PY_LANGUAGE = Language(tree_sitter_python.language())
        parser = Parser(PY_LANGUAGE)
        return parser

    def _get_ignore_node_types(self) -> Set[str]:
        return {"comment"}

    def normalize(self, root_node: Any, source_code: bytes) -> str:
        """
        Normalizes the source code by removing comments, ignoring whitespace,
        and replacing identifiers and literals with placeholders.
        """
        normalized_tokens = []
        
        def traverse(node):
            if node.type == "comment":
                return
                
            if len(node.children) == 0:
                val = source_code[node.start_byte:node.end_byte].decode('utf8', errors='ignore')
                
                # Normalize literals and identifiers
                if node.type == "string":
                    val = '"STR_LITERAL"'
                elif node.type in ["integer", "float"]:
                    val = 'NUM_LITERAL'
                elif node.type == "identifier":
                    # Note: a true robust normalizer would keep a symbol table and 
                    # rename variables consistently within their scope (e.g. VAR_1, VAR_2).
                    # For simplicity in this scaffold, we just replace all identifiers with 'ID'.
                    val = 'ID'
                
                normalized_tokens.append(val)
                
            for child in node.children:
                traverse(child)
                
        traverse(root_node)
        return " ".join(normalized_tokens)
