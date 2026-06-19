from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    input: str
    history: List[Dict[str, Any]]
    storeContext: Optional[Dict[str, Any]] = None
    chatMode: Optional[str] = "agent"
    images: Optional[List[str]] = []
    contextScope: Optional[str] = "marketplace"
    activeStoreId: Optional[str] = None
    activeProductId: Optional[str] = None

class RetryAssetsRequest(BaseModel):
    schema_data: Dict[str, Any]
    failed_item_ids: List[str]

class EmbedRequest(BaseModel):
    text: str
