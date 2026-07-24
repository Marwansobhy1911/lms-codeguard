import importlib
import pkgutil
from typing import List
from src.core.interfaces.algorithm import ISimilarityAlgorithm

class PluginManager:
    def __init__(self):
        self._algorithms: List[ISimilarityAlgorithm] = []

    def load_builtins(self):
        """Loads built-in algorithms from src.engine.algorithms"""
        import src.engine.algorithms as algo_package
        self._load_from_package(algo_package)

    def load_plugins(self, package_name: str = "plugins"):
        """Loads external plugins from the specified package"""
        try:
            plugin_module = importlib.import_module(package_name)
            self._load_from_package(plugin_module)
        except ImportError:
            pass

    def _load_from_package(self, package):
        for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
            if not is_pkg:
                module = importlib.import_module(f"{package.__name__}.{module_name}")
                for attribute_name in dir(module):
                    attribute = getattr(module, attribute_name)
                    if isinstance(attribute, type) and issubclass(attribute, ISimilarityAlgorithm) and attribute is not ISimilarityAlgorithm:
                        try:
                            self.register(attribute())
                        except Exception:
                            pass

    def register(self, algorithm: ISimilarityAlgorithm):
        # Prevent duplicates
        if not any(isinstance(a, type(algorithm)) for a in self._algorithms):
            self._algorithms.append(algorithm)

    def get_all(self) -> List[ISimilarityAlgorithm]:
        return self._algorithms
