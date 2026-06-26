import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from utils.logger import logger
from routers import agent_router, store_router

# Initialize FastAPI App
app = FastAPI(title="SERA Multi-Agent Service")

assets_dir = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(assets_dir, exist_ok=True)
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(agent_router.router)
app.include_router(store_router.router)

# ── Architecture Banner ───────────────────────────────────────────────────────
ARCHITECTURE_BANNER = """
╔══════════════════════════════════════════════════════════════════╗
║           SERA — Autonomous Commerce Operating System            ║
║                   Powered by Qwen AI Cloud                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Multi-Agent Architecture:                                       ║
║  ┌─────────────────────────────────────────────────────────┐    ║
║  │ OrchestratorAgent  (qwen3.6-plus, 🧠 Thinking Mode ON)  │    ║
║  └──────────┬──────────────────┬──────────────────────┬────┘    ║
║             ▼                  ▼                      ▼          ║
║  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  ║
║  │  StoreAgent  │  │  BuyerAgent    │  │  AnalyticsAgent     │  ║
║  │ 🧠 Thinking  │  │ ⚡ Adaptive    │  │ 🧠 Thinking Mode    │  ║
║  └──────────────┘  └────────────────┘  └─────────────────────┘  ║
║             │              │                      │              ║
║  ┌──────────────────────────────────────────────────────────┐    ║
║  │           MCP Server (Model Context Protocol)            │    ║
║  │    get_stores | search_products | get_analytics | ...    │    ║
║  └──────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════╝
"""

from utils.http_client import http_manager
from memory.manager import memory_manager

@app.on_event("startup")
async def startup_event():
    # Initialize global HTTP client pool for cross-service calls
    http_manager.init_client()
    # Setup Memory MongoDB indices (TTL)
    await memory_manager.setup_indexes()
    logger.info("🚀 SERA Multi-Agent Service started successfully")
    logger.info("🔌 MCP Server: sera-commerce tools available via mcp_server.py")
    logger.info("🧠 Thinking Mode: ENABLED for store, analytics, orchestrator")
    logger.info("⚡ Fast Mode: ENABLED for buyer, marketing, vision, video")
    http_manager.init_client()

@app.on_event("shutdown")
async def shutdown_event():
    await http_manager.close_client()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'sera-agent-python'}
