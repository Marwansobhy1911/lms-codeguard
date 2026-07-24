import pytest
from src.infrastructure.parsers.python_parser import PythonParser

@pytest.fixture
def parser():
    return PythonParser()

def test_python_parse_and_tokenize(parser):
    code = b'''
def hello_world():
    print("Hello, World!")
    # This is a comment
    return 42
'''
    
    root_node = parser.parse(code)
    assert root_node is not None
    assert root_node.type == "module"
    
    tokens = parser.tokenize(root_node, code)
    assert len(tokens) > 0
    
    # Check that comment is ignored
    for token in tokens:
        assert "comment" not in token.type
        
def test_python_normalize(parser):
    code1 = b'''
def calculate_sum(a, b):
    # Add two numbers
    result = a + b
    return result
'''

    code2 = b'''
def add(x, y):
    res = x + y
    return res
'''
    root1 = parser.parse(code1)
    root2 = parser.parse(code2)
    
    norm1 = parser.normalize(root1, code1)
    norm2 = parser.normalize(root2, code2)
    
    # Both should normalize to the same sequence since identifiers are replaced with 'ID'
    assert norm1 == norm2
