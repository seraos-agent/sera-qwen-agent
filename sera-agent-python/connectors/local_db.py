import json
import os
from typing import List, Dict, Any, Optional
from .base import BaseConnector

class LocalDBConnector(BaseConnector):
    """
    Connector for a local JSON-based mock database.
    Reads from data/katalog_dummy.json
    """
    
    def __init__(self, file_path: str = None):
        if file_path is None:
            # Default to data/katalog_dummy.json relative to the project root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(base_dir, 'data', 'katalog_dummy.json')
            
        self.file_path = file_path
        self.data = self._load_data()

    def _load_data(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.file_path):
            print(f"[Warning] Local DB file not found: {self.file_path}")
            return []
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[Error] Failed to load local DB: {e}")
            return []

    def search_products(self, query: str) -> List[Dict[str, Any]]:
        if not query:
            return self.data
            
        query = query.lower()
        results = []
        for item in self.data:
            name = item.get('name', '').lower()
            desc = item.get('description', '').lower()
            cat = item.get('category', '').lower()
            if query in name or query in desc or query in cat:
                results.append(item)
        return results

    def get_stock(self, product_id: str) -> Optional[int]:
        for item in self.data:
            if item.get('id') == product_id:
                return item.get('stock')
        return None

    def get_price(self, product_id: str) -> Optional[float]:
        for item in self.data:
            if item.get('id') == product_id:
                return item.get('price')
        return None
