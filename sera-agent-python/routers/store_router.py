from fastapi import APIRouter

router = APIRouter()

@router.get("/architecture")
async def get_architecture():
    """Returns the SERA multi-agent architecture description for demo purposes."""
    return {
        "system": "SERA Autonomous Commerce Operating System",
        "powered_by": "Qwen AI Cloud (DashScope International)",
        "mcp_integration": {
            "server": "sera-commerce-mcp",
            "protocol": "Model Context Protocol (MCP) over stdio",
            "tools": ["get_stores", "get_products", "search_products",
                     "search_stores", "get_promotions", "get_categories",
                     "get_store_analytics", "save_campaign"]
        },
        "agents": [
            {
                "name": "orchestrator_agent",
                "role": "Central router — delegates tasks to specialized agents",
                "thinking_mode": True,
                "model": "qwen3.6-plus (configurable via ORCHESTRATOR_MODEL)"
            },
            {
                "name": "store_agent",
                "role": "Builds and designs AI-powered e-commerce storefronts",
                "thinking_mode": True,
                "model": "deepseek-v4-flash"
            },
            {
                "name": "analytics_agent",
                "role": "Analyzes store metrics, revenue, and performance trends",
                "thinking_mode": True,
                "model": "deepseek-v4-flash"
            },
            {
                "name": "plan_agent",
                "role": "Strategic consultant that creates business and marketing plans",
                "thinking_mode": True,
                "model": "qwen3.6-plus"
            },
            {
                "name": "image_product_agent",
                "role": "Multimodal agent for visual product analysis and generation",
                "thinking_mode": False,
                "model": "qwen3.7-plus"
            },
            {
                "name": "buyer_agent",
                "role": "Assists customers in discovering and purchasing products",
                "thinking_mode": "adaptive",
                "model": "qwen3.6-flash (fast)"
            },
            {
                "name": "marketing_agent",
                "role": "Creates promotional campaigns and discount strategies",
                "thinking_mode": False,
                "model": "qwen3.7-plus"
            }
        ]
    }
