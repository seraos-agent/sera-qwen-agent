import httpx
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception
from utils.logger import logger

class HTTPClientManager:
    """Manager for global httpx.AsyncClient to ensure connection pooling."""
    def __init__(self):
        self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise RuntimeError("HTTP Client is not initialized. Call init_client() first.")
        return self._client

    def init_client(self):
        if self._client is None:
            # Set default timeout to 30 seconds, allowing limits to scale automatically
            limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
            timeout = httpx.Timeout(30.0)
            self._client = httpx.AsyncClient(limits=limits, timeout=timeout)
            logger.info("🔌 Global HTTPX AsyncClient initialized with connection pooling.")

    async def close_client(self):
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("🔌 Global HTTPX AsyncClient closed cleanly.")

# Global instance
http_manager = HTTPClientManager()

# Custom retry logic using tenacity
# It will retry on httpx.RequestError (network issues) or HTTPStatusError (like 429, 502, 503, 504)
def is_retryable_http_error(exception):
    if isinstance(exception, httpx.RequestError):
        return True
    if isinstance(exception, httpx.HTTPStatusError):
        # Retry on Rate Limit or Server Errors
        return exception.response.status_code in [429, 500, 502, 503, 504]
    return False

retry_http = retry(
    retry=retry_if_exception(is_retryable_http_error),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(4),
    before_sleep=lambda retry_state: logger.warning(
        f"⚠️ HTTP request failed. Retrying... (Attempt {retry_state.attempt_number}/4). Error: {retry_state.outcome.exception()}"
    ),
    reraise=True
)
