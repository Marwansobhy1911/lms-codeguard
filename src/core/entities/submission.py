from dataclasses import dataclass, field
from typing import Any, List, Optional

@dataclass
class Token:
    type: str
    value: str
    start_line: int
    end_line: int
    start_column: int
    end_column: int

@dataclass
class Submission:
    id: str
    student_identifier: str
    file_path: str
    language: str
    raw_code: str
    normalized_code: Optional[str] = None
    tokens: List[Token] = field(default_factory=list)
    ast_root: Any = None  # Using Any to avoid strict dependency on tree_sitter in core
