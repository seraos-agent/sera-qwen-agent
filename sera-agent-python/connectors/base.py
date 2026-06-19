from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseConnector(ABC):
    """
    Abstract base class for all data connectors.
    All specific connectors (LocalDB, Shopify, WooCommerce, dll) must implement these methods.
    """

    @abstractmethod
    def search_products(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for products based on a query.
        Returns a list of product dictionaries.
        """
        pass

    @abstractmethod
    def get_stock(self, product_id: str) -> Optional[int]:
        """
        Get the current stock for a specific product ID.
        Returns the stock count, or None if product not found.
        """
        pass

    @abstractmethod
    def get_price(self, product_id: str) -> Optional[float]:
        """
        Get the current price for a specific product ID.
        Returns the price, or None if product not found.
        """
        pass
