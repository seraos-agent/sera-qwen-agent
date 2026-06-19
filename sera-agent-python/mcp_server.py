"""
SERA MCP Server — Model Context Protocol Integration
Exposes all SERA Commerce tools as standard MCP endpoints.
Runs on port 8001 alongside the main agent server on port 8000.

This enables Qwen agents to call tools via the MCP protocol,
satisfying the hackathon requirement for explicit MCP integrations.
"""
import os
import asyncio
import json
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp import types

# Import SERA tools
import sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from tools.sera_tools import (
    get_stores,
    get_products,
    search_products,
    search_stores,
    get_promotions,
    get_categories,
    get_store_analytics,
    save_campaign,
    get_marketing_history,
)
from utils.logger import logger

# Create MCP server instance
app = Server("sera-commerce-mcp")


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    """List all available SERA commerce tools in MCP format."""
    return [
        types.Tool(
            name="get_stores",
            description="Fetches all active stores. Pass session_id='all' to get all marketplace stores.",
            inputSchema={
                "type": "object",
                "properties": {
                    "session_id": {
                        "type": "string",
                        "description": "Session ID to filter stores. Use 'all' for marketplace view.",
                        "default": "all"
                    }
                }
            }
        ),
        types.Tool(
            name="get_products",
            description="Fetch all products for a specific store by store_id.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "The unique ID of the store to fetch products from."
                    }
                },
                "required": ["store_id"]
            }
        ),
        types.Tool(
            name="search_products",
            description="Semantic search for products across the marketplace or within a specific store. Returns ranked results.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query, e.g. 'moisturizer for dry skin'."
                    },
                    "store_id": {
                        "type": "string",
                        "description": "Optional store ID to scope search within a single store."
                    }
                },
                "required": ["query"]
            }
        ),
        types.Tool(
            name="search_stores",
            description="Search for stores matching a keyword or category, e.g. 'skincare', 'electronics'.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keyword or category to search for."
                    }
                },
                "required": ["query"]
            }
        ),
        types.Tool(
            name="get_promotions",
            description="Fetch only products that have an active promotion or discount.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "Optional store ID to scope promotions."
                    }
                }
            }
        ),
        types.Tool(
            name="get_categories",
            description="Get a list of all product categories available in the marketplace or a specific store.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "Optional store ID to scope categories."
                    }
                }
            }
        ),
        types.Tool(
            name="get_store_analytics",
            description="Fetch analytics metrics (revenue, visitors, conversions, sales trend) for a specific store.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "The unique ID of the store to fetch analytics for."
                    }
                },
                "required": ["store_id"]
            }
        ),
        types.Tool(
            name="save_campaign",
            description="Save a marketing or discount campaign for a specific store.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "The store ID to attach the campaign to."
                    },
                    "campaigns": {
                        "type": "array",
                        "description": "List of campaign objects with name, discount, and dates.",
                        "items": {"type": "object"}
                    },
                    "session_id": {
                        "type": "string",
                        "description": "Session ID of the seller.",
                        "default": "guest_default"
                    }
                },
                "required": ["store_id", "campaigns"]
            }
        ),
        types.Tool(
            name="get_marketing_history",
            description="Fetch past marketing campaigns and historical performance for a specific store.",
            inputSchema={
                "type": "object",
                "properties": {
                    "store_id": {
                        "type": "string",
                        "description": "The unique ID of the store."
                    }
                },
                "required": ["store_id"]
            }
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """Dispatch MCP tool calls to SERA commerce functions."""
    logger.info(f"🔌 [MCP] Tool called: '{name}' with args: {arguments}")
    
    try:
        result = None
        
        if name == "get_stores":
            result = await get_stores(arguments.get("session_id", "all"))
        elif name == "get_products":
            result = await get_products(arguments["store_id"])
        elif name == "search_products":
            result = await search_products(
                arguments["query"],
                arguments.get("store_id")
            )
        elif name == "search_stores":
            result = await search_stores(arguments["query"])
        elif name == "get_promotions":
            result = await get_promotions(arguments.get("store_id"))
        elif name == "get_categories":
            result = await get_categories(arguments.get("store_id"))
        elif name == "get_store_analytics":
            result = await get_store_analytics(arguments["store_id"])
        elif name == "save_campaign":
            result = await save_campaign(
                arguments["store_id"],
                arguments["campaigns"],
                arguments.get("session_id", "guest_default")
            )
        elif name == "get_marketing_history":
            result = await get_marketing_history(arguments["store_id"])
        else:
            result = {"error": f"Unknown tool: {name}"}
            
        logger.info(f"✅ [MCP] Tool '{name}' completed successfully.")
        return [types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]
        
    except Exception as e:
        logger.error(f"❌ [MCP] Tool '{name}' failed: {e}")
        return [types.TextContent(type="text", text=json.dumps({"error": str(e)}))]


async def run_stdio():
    """Run the MCP server in stdio mode (for subprocess integration)."""
    from mcp.server.lowlevel.server import NotificationOptions
    from utils.http_client import http_manager
    
    # Initialize the HTTP client for the MCP subprocess
    http_manager.init_client()
    
    try:
        async with stdio_server() as (read_stream, write_stream):
            await app.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="sera-commerce-mcp",
                    server_version="1.0.0",
                    capabilities=app.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )
    finally:
        await http_manager.close_client()

if __name__ == "__main__":
    logger.info("🚀 Starting SERA MCP Server (stdio mode)...")
    asyncio.run(run_stdio())
