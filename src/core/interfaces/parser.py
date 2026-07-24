from abc import ABC, abstractmethod
from typing import Any, List
from src.core.entities.submission import Token

class IParser(ABC):
    @abstractmethod
    def parse(self, source_code: bytes) -> Any:
        """Parses the source code and returns the AST root node."""
        pass
    
    @abstractmethod
    def tokenize(self, root_node: Any, source_code: bytes) -> List[Token]:
        """Extracts a sequence of normalized tokens from the AST."""
        pass
    
    @abstractmethod
    def normalize(self, root_node: Any, source_code: bytes) -> str:
        """Returns normalized source code (e.g., variables renamed, comments removed)."""
        pass
