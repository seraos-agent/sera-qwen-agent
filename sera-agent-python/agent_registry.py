"""
SERA Agent Registry — Qwen-Agent + MCP Integration

Architecture (FINAL):

    User Request
        ↓
    OrchestratorAgent  — qwen3.6-plus   [thinking ON]   (routing cepat)
    
    SELLER AGENTS
    ├── [MODE PLAN]
    │   └─→ PlanAgent            — qwen3.6-plus   [thinking ON]
    └── [MODE EXECUTE]
        ├─→ StoreAgent           — deepseek-v4-flash      [thinking ON]
        ├─→ AnalyticsAgent       — deepseek-v4-flash      [thinking ON]
        ├─→ ImageProductAgent    — qwen-image-2.0 [generate + edit]
        └─→ MarketingAgent       — deepseek-v4-flash      [thinking OFF, visual tools]

    BUYER AGENT
    └─→ BuyerAgent               — qwen3.6-flash  [adaptive thinking]
                ↓
    MCP Protocol (mcp_server.py) — sera-commerce tools
"""
import os
import json
import asyncio
import threading
from qwen_agent.agents import Assistant
from qwen_agent.tools.base import BaseTool, register_tool
import tools.sera_tools as st
from utils.logger import logger

from agents.store_agent import store_agent_config
from agents.analytics_agent import analytics_agent_config
from agents.marketing_agent import marketing_agent_config
from agents.buyer_agent import buyer_agent_config
from agents.orchestrator_agent import orchestrator_agent_config
from agents.image_product_agent import image_product_agent_config
from agents.plan_agent import plan_agent_config
from agents.consensus_agent import consensus_agent_config
from agents.spokesperson_agent import spokesperson_agent_config

# ── Base Config ────────────────────────────────────────────────────────────────
BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
API_KEY  = os.environ.get("QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")

# ── Per-Agent LLM Configs ──────────────────────────────────────────────────────

# Orchestrator: fast routing decisions + multimodal (can see images)
orchestrator_llm_cfg = {
    "model": "qwen3.5-flash",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {"extra_body": {"enable_thinking": False}}
}

# Store: deep creative reasoning for layout/brand
store_llm_cfg = {
    "model": "qwen3.5-plus",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {"extra_body": {"enable_thinking": False}}
}

# Analytics: multi-step data interpretation
analytics_llm_cfg = {
    "model": "qwen3.5-plus",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {"extra_body": {"enable_thinking": False}}
}

# Marketing: creative content + multimodal analysis
marketing_llm_cfg = {
    "model": "qwen3.5-flash",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {}
}

# Image Product: multimodal vision + generation — thinking OFF
image_product_llm_cfg = {
    "model": "qwen-vl-plus",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {}
}

# Plan: deep strategy reasoning
plan_llm_cfg = {
    "model": "qwen3.5-plus",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {"extra_body": {"enable_thinking": False}}
}

# Buyer: fast commerce assistant + multimodal
buyer_llm_cfg = {
    "model": "qwen3.5-flash",
    "model_server": BASE_URL,
    "api_key": API_KEY,
    "generate_cfg": {}
}

# Map agent_type → its specific llm_cfg
LLM_CFG_MAP = {
    "orchestrator_agent":   orchestrator_llm_cfg,
    "store_agent":          store_llm_cfg,
    "analytics_agent":      analytics_llm_cfg,
    "marketing_agent":      marketing_llm_cfg,
    "image_product_agent":  image_product_llm_cfg,
    "plan_agent":           plan_llm_cfg,
    "buyer_agent":          buyer_llm_cfg,
    "consensus_agent":      store_llm_cfg, # Use same speed config as store
    "spokesperson_agent":   marketing_llm_cfg, # Use fast standard config, no thinking needed
}

# ── MCP Configuration ──────────────────────────────────────────────────────────
MCP_SERVER_SCRIPT = os.path.join(os.path.dirname(__file__), "mcp_server.py")

def get_mcp_server_config() -> dict:
    """Returns the MCP server config block for qwen-agent function_list."""
    return {
        "mcpServers": {
            "sera-commerce": {
                "command": "python",
                "args": [MCP_SERVER_SCRIPT],
                "env": {
                    "NODE_BACKEND_URL": os.environ.get("NODE_BACKEND_URL", "http://localhost:3001"),
                    "QWEN_API_KEY": API_KEY or "",
                }
            }
        }
    }

# ── Tool Registration (Direct Python Tools — non-MCP) ─────────────────────────
# Asset generation tools (image/video) stay as direct Python tools.
# Commerce data tools (stores, products, etc.) are exposed via MCP.
def wrap_qwen_tool(func_name, func):
    @register_tool(func_name)
    class DynamicTool(BaseTool):
        description = func.__doc__ or f"Execute {func_name}"
        parameters = [{
            'name': 'params_json',
            'type': 'string',
            'description': 'JSON string of kwargs for this tool',
            'required': False
        }]

        def call(self, params: str, **kwargs) -> str:
            try:
                p = json.loads(params) if params else {}
            except Exception:
                p = {}

            if asyncio.iscoroutinefunction(func):
                res = None
                exc = None

                def run_in_thread():
                    nonlocal res, exc
                    try:
                        new_loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(new_loop)
                        res = new_loop.run_until_complete(func(**p))
                        new_loop.close()
                    except Exception as e:
                        exc = e

                t = threading.Thread(target=run_in_thread)
                t.start()
                t.join()
                if exc:
                    return json.dumps({"error": str(exc)})
            else:
                res = func(**p)
            return json.dumps(res)

tools_to_register = {
    'get_stores':           st.get_stores,
    'get_products':         st.get_products,
    'search_products':      st.search_products,
    'search_stores':        st.search_stores,
    'get_promotions':       st.get_promotions,
    'get_categories':       st.get_categories,
    'save_campaign':        st.save_campaign,
    'get_marketing_history':st.get_marketing_history,
    'generate_image_asset': st.generate_image_asset,
    'generate_video_asset': st.generate_video_asset,
    'generate_video_from_image_asset': st.generate_video_from_image_asset,
    'generate_store_assets':st.generate_store_assets,
    'get_store_analytics':  st.get_store_analytics,
    'check_local_stock':    st.check_local_stock,
    'check_local_price':    st.check_local_price,
}

for name, func in tools_to_register.items():
    wrap_qwen_tool(name, func)
    
# ── Agent Config Map ───────────────────────────────────────────────────────────
AGENT_CONFIG_MAP = {
    "orchestrator_agent":   orchestrator_agent_config,
    "store_agent":          store_agent_config,
    "analytics_agent":      analytics_agent_config,
    "marketing_agent":      marketing_agent_config,
    "image_product_agent":  image_product_agent_config,
    "plan_agent":           plan_agent_config,
    "buyer_agent":          buyer_agent_config,
    "consensus_agent":      consensus_agent_config,
    "spokesperson_agent":   spokesperson_agent_config,
}

# MCP tools → commerce data (short name → MCP URI)
MCP_TOOLS_MAP = {
    "get_stores":           "mcp::sera-commerce::get_stores",
    "get_products":         "mcp::sera-commerce::get_products",
    "search_products":      "mcp::sera-commerce::search_products",
    "search_stores":        "mcp::sera-commerce::search_stores",
    "get_promotions":       "mcp::sera-commerce::get_promotions",
    "get_categories":       "mcp::sera-commerce::get_categories",
    "get_store_analytics":  "mcp::sera-commerce::get_store_analytics",
    "save_campaign":        "mcp::sera-commerce::save_campaign",
    "get_marketing_history":"mcp::sera-commerce::get_marketing_history",
}

def get_plan_agent_tools(user_has_store: bool) -> list:
    """Returns tools for PlanAgent based on user state."""
    if user_has_store:
        return [
            "get_stores", 
            "get_products", 
            "get_promotions", 
            "get_store_analytics", 
            "get_marketing_history"
        ]
    return []

# ── Agent Factory ──────────────────────────────────────────────────────────────
def get_runner(agent_type: str) -> Assistant:
    """
    Instantiates the correct Qwen-Agent Assistant for the given agent_type.

    Each agent uses its own dedicated llm_cfg with the appropriate model
    and thinking mode. Commerce tools are called via MCP protocol;
    asset generation stays as direct Python tools.
    """
    cfg = AGENT_CONFIG_MAP.get(agent_type, store_agent_config)
    llm_cfg = LLM_CFG_MAP.get(agent_type, store_llm_cfg)

    thinking_on = llm_cfg.get("generate_cfg", {}).get("enable_thinking", False)
    logger.info(
        f"🤖 [Registry] Agent='{agent_type}' | Model='{llm_cfg['model']}' | "
        f"Thinking={'ON 🧠' if thinking_on else 'OFF ⚡'}"
    )

    # Resolve tool list: swap commerce tools to MCP URIs
    agent_tools = cfg.get("tools", [])
    resolved_tools = []
    use_mcp = False

    for tool in agent_tools:
        if tool in MCP_TOOLS_MAP:
            resolved_tools.append(MCP_TOOLS_MAP[tool])
            use_mcp = True
        else:
            resolved_tools.append(tool)

    # Append MCP server config if any MCP tools are used
    if use_mcp:
        resolved_tools.append(get_mcp_server_config())
        logger.info(f"🔌 [MCP] Commerce tools routed via MCP for '{agent_type}'")

    try:
        return Assistant(
            llm=llm_cfg,
            function_list=resolved_tools,
            name=cfg["name"],
            description=cfg["description"],
            system_message=cfg["instruction"],
        )
    except Exception as e:
        logger.warning(f"⚠️ [Registry] MCP init failed ({e}), falling back to direct tools")
        return Assistant(
            llm=llm_cfg,
            function_list=cfg.get("tools", []),
            name=cfg["name"],
            description=cfg["description"],
            system_message=cfg["instruction"],
        )


from memory.manager import memory_manager

async def reset_session(agent_type: str, user_id: str, session_id: str):
    await memory_manager.reset_session(session_id)
    logger.info(f"✨ Fresh session {session_id} created for {agent_type} via CognitiveMemoryManager")

async def get_session_history(session_id: str):
    return await memory_manager.get_context_for_agent(session_id)

async def update_session_history(session_id: str, messages: list, domain: str = "general"):
    # Process the latest message
    if messages:
        latest = messages[-1]
        role = latest.get("role", "") if isinstance(latest, dict) else getattr(latest, "role", "")
        content = latest.get("content", "") if isinstance(latest, dict) else getattr(latest, "content", "")
        
        # Serialize content if it's complex
        if isinstance(content, list):
            content_str = ""
            for part in content:
                if isinstance(part, dict) and 'text' in part:
                    content_str += part['text']
                elif hasattr(part, 'text'):
                    content_str += part.text
        else:
            content_str = str(content)
            
        await memory_manager.process_interaction(session_id, role, content_str, domain)
    
# Trigger uvicorn reload
