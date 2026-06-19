"""
SERA Buyer Direct Streaming Service
─────────────────────────────────────────────────────────────────────────────
Bypasses qwen-agent framework entirely.
Uses direct async streaming to Dashscope OpenAI-compatible API via HTTPX.

Architecture:
    User → chat_service → run_buyer_direct()
                              ↓
                    httpx.AsyncClient.stream()  (native async, no thread switching)
                              ↓
                    Dashscope deepseek-v4-flash
                              ↓
                    Token 1 → yield to UI immediately
                    Tool call → execute → inject result → continue

Advantages over qwen-agent:
    - TTFT: ~150-300ms faster (no asyncio.to_thread overhead)
    - True per-token streaming (not per-chunk)
    - Full control over tool call cycle
    - Zero dependency on qwen-agent library updates
"""

import json
import time
import os
import asyncio
import re
import unicodedata
from typing import AsyncGenerator, List, Dict, Any
from utils.http_client import http_manager
from utils.logger import logger
import tools.sera_tools as st

# ── Response Sanitizer ──────────────────────────────────────────────────────────
_EMOJI_PATTERN = re.compile(
    r'['
    r'\U0001F600-\U0001F64F'  # emoticons
    r'\U0001F300-\U0001F5FF'  # symbols & pictographs
    r'\U0001F680-\U0001F6FF'  # transport & map
    r'\U0001F1E0-\U0001F1FF'  # flags
    r'\U00002702-\U000027B0'
    r'\U000024C2-\U0001F251'
    r'\U0001f926-\U0001f937'
    r'\U00010000-\U0010ffff'
    r'\u2600-\u2BFF'
    r'\u23cf\u23e9-\u23f3\u23f8-\u23fa'
    r'\u200d\u20e3\ufe0f'
    r"]+",
    flags=re.UNICODE
)
_VARIATION_SELECTOR = re.compile(r'\uFE0F', re.UNICODE)

def _sanitize_response(text: str, max_emojis: int = 2) -> str:
    """Strip excess emojis (keep only first max_emojis) and fix question-mark spacing."""
    if not text:
        return text

    # 1. Find all emoji positions
    found = list(_EMOJI_PATTERN.finditer(text))
    if len(found) > max_emojis:
        # Build set of spans to remove for excess emojis
        excess_spans = sorted([m.span() for m in found[max_emojis:]], reverse=True)
        text_chars = list(text)
        for start, end in excess_spans:
            del text_chars[start:end]
        text = ''.join(text_chars)

    # 2. Remove em-dash and en-dash: replace " — " and " – " with comma or colon
    # " — text" at middle of sentence → ", text" (inline connector)
    text = re.sub(r'\s*[—–]\s*', ', ', text)

    # 3. Fix question-mark spacing: ensure blank line after '?' when followed by non-whitespace text
    text = re.sub(r'\?([\s]*)([^\n\s])', lambda m: '?\n\n' + m.group(2), text)

    # 4. Collapse triple+ newlines to double
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()

# ── Config ─────────────────────────────────────────────────────────────────────
BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
API_KEY = os.environ.get("QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY", "")
MODEL = "deepseek-v4-flash"

# ── Tool Definitions (OpenAI function calling format) ──────────────────────────
BUYER_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_stores",
            "description": "Fetch all active stores. Use session_id='all' for marketplace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "session_id": {"type": "string", "default": "all"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_products",
            "description": "Get products for a specific store.",
            "parameters": {
                "type": "object",
                "properties": {
                    "store_id": {"type": "string"},
                    "limit": {"type": "integer", "default": 20}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Search products by keyword across all stores.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 10}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_stores",
            "description": "Search stores by name or category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 10}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_promotions",
            "description": "Get active promotions and deals.",
            "parameters": {
                "type": "object",
                "properties": {
                    "store_id": {"type": "string", "default": ""}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_categories",
            "description": "Get all available product categories.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
]

# ── Tool Executor ──────────────────────────────────────────────────────────────
BUYER_TOOL_LABELS: Dict[str, str] = {
    "search_products":    "search products",
    "get_products":       "browsing products",
    "search_stores":      "search stores",
    "get_stores":         "get stores",
    "get_promotions":     "get promotions",
    "get_categories":     "get categories",
    "check_local_stock":  "check stock",
    "check_local_price":  "check price",
    "get_store_promotions": "get store promotions",
}

TOOL_FUNCTIONS = {
    "get_stores":    st.get_stores,
    "get_products":  st.get_products,
    "search_products": st.search_products,
    "search_stores": st.search_stores,
    "get_promotions": st.get_promotions,
    "get_categories": st.get_categories,
}

async def _execute_tool(name: str, arguments: str) -> str:
    """Execute a buyer tool and return result as string."""
    try:
        args = json.loads(arguments) if arguments else {}
        func = TOOL_FUNCTIONS.get(name)
        if not func:
            return json.dumps({"error": f"Tool '{name}' not found"})

        if asyncio.iscoroutinefunction(func):
            result = await func(**args)
        else:
            result = await asyncio.to_thread(func, **args)

        # Force the LLM to output banner and button by injecting the exact markdown string
        if name in ["get_stores", "search_stores"] and isinstance(result, dict) and "stores" in result:
            for s in result["stores"]:
                s_id = s.get("store_id") or s.get("id")
                img = s.get("branding", {}).get("heroImage") or s.get("heroBg") or "https://via.placeholder.com/800x400"
                s["INSTRUCTION_COPY_PASTE_THIS_EXACT_MARKDOWN"] = f"![Store Banner]({img})\n[View Store](#store_{s_id})"

        if name in ["get_products", "search_products"] and isinstance(result, dict):
            # The result could have "products" or "results"
            items = result.get("products") or result.get("results") or []
            for p in items:
                p_id = p.get("product_id") or p.get("id")
                img = p.get("imageUrl") or "https://via.placeholder.com/400x400"
                p["INSTRUCTION_COPY_PASTE_THIS_EXACT_MARKDOWN"] = f"![Product Image]({img})\n[View Product](#product_{p_id})"

        return json.dumps(result, ensure_ascii=False, default=str)
    except Exception as e:
        logger.error(f"Tool execution error [{name}]: {e}")
        return json.dumps({"error": str(e)})


# ── Direct Streaming Core ──────────────────────────────────────────────────────
async def run_buyer_direct(
    session_id: str,
    rich_input: str,
    system_prompt: str,
    request,
) -> AsyncGenerator[str, None]:
    """
    Native async streaming call to Dashscope.
    Yields NDJSON event strings compatible with the existing frontend consumer.
    Supports multi-turn tool calling without qwen-agent overhead.
    """

    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": rich_input},
    ]

    MAX_TOOL_ROUNDS = 5  # prevent infinite tool loops

    for tool_round in range(MAX_TOOL_ROUNDS):
        # Emit "analyzing request" badge only on the first round (before any tool calls)
        if tool_round == 0:
            yield json.dumps({
                "event_id": f"evt_analyze_{int(time.time())}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "cognition",
                "agent": "assistant",
                "tool": "analyzing_request",
                "message": "analyzing request",
                "phase": "thinking",
            }) + "\n"

        payload = {
            "model": MODEL,
            "messages": messages,
            "tools": BUYER_TOOLS,
            "tool_choice": "auto",
            "stream": True,
            "stream_options": {"include_usage": False},
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        }

        full_text = ""
        tool_calls_buffer: Dict[int, Dict] = {}  # index → {id, name, arguments}
        has_yielded_text = False

        try:
            async with http_manager.client.stream(
                "POST",
                f"{BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
                timeout=60.0,
            ) as resp:
                resp.raise_for_status()

                async for raw_line in resp.aiter_lines():
                    if not raw_line or not raw_line.startswith("data: "):
                        continue
                    data_str = raw_line[6:]
                    if data_str.strip() == "[DONE]":
                        break

                    try:
                        chunk = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue

                    choice = chunk.get("choices", [{}])[0]
                    delta = choice.get("delta", {})
                    finish_reason = choice.get("finish_reason")

                    # ── Text token ────────────────────────────────────────────
                    text_piece = delta.get("content") or ""
                    if text_piece:
                        full_text += text_piece
                        has_yielded_text = True
                        yield json.dumps({
                            "event_id": f"evt_stream_{int(time.time() * 1000)}",
                            "timestamp": int(time.time()),
                            "session_id": session_id,
                            "type": "agent_message_start",
                            "agent": "assistant",
                            "text": full_text,
                            "ephemeral": True,
                        }) + "\n"

                    # ── Tool call delta accumulation ──────────────────────────
                    for tc_delta in delta.get("tool_calls", []):
                        idx = tc_delta.get("index", 0)
                        if idx not in tool_calls_buffer:
                            tool_calls_buffer[idx] = {
                                "id": tc_delta.get("id", ""),
                                "name": tc_delta.get("function", {}).get("name", ""),
                                "arguments": "",
                            }
                        if tc_delta.get("id"):
                            tool_calls_buffer[idx]["id"] = tc_delta["id"]
                        fn = tc_delta.get("function", {})
                        if fn.get("name"):
                            tool_calls_buffer[idx]["name"] = fn["name"]
                        tool_calls_buffer[idx]["arguments"] += fn.get("arguments", "")

                    # ── Handle finish ─────────────────────────────────────────
                    if finish_reason == "tool_calls":
                        break  # exit stream loop, will process tool calls below
                    elif finish_reason == "stop":
                        break  # final answer, exit all loops

        except Exception as e:
            logger.error(f"[BuyerDirect] Stream error: {e}")
            yield json.dumps({
                "event_id": f"evt_err_{int(time.time())}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "final",
                "agent": "buyer_agent",
                "action": "idle",
                "params": {},
                "text": "Maaf, terjadi gangguan koneksi. Silakan coba lagi.",
                "chat": ""
            }) + "\n"
            return

        # ── If no tool calls → final answer, we're done ───────────────────────
        if not tool_calls_buffer:
            # Sanitize: strip excess emojis, fix question spacing
            clean_text = _sanitize_response(full_text)
            # Emit final event
            yield json.dumps({
                "event_id": f"evt_final_{int(time.time())}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "final",
                "agent": "buyer_agent",
                "action": "idle",
                "params": {},
                "text": clean_text,
                "chat": clean_text
            }) + "\n"
            return

        # ── Process tool calls ────────────────────────────────────────────────
        # Build assistant message with tool_calls array for message history
        assistant_tool_calls = []
        for idx in sorted(tool_calls_buffer.keys()):
            tc = tool_calls_buffer[idx]
            assistant_tool_calls.append({
                "id": tc["id"] or f"call_{idx}",
                "type": "function",
                "function": {"name": tc["name"], "arguments": tc["arguments"]}
            })

        messages.append({
            "role": "assistant",
            "content": full_text or None,
            "tool_calls": assistant_tool_calls
        })

        # Execute each tool and emit cognition + inject result
        for tc in assistant_tool_calls:
            fc_name = tc["function"]["name"]
            fc_args = tc["function"]["arguments"]

            # Emit cognition event for UI
            friendly_label = BUYER_TOOL_LABELS.get(fc_name, f"Running {fc_name.replace('_', ' ')}")
            yield json.dumps({
                "event_id": f"evt_{int(time.time())}_{fc_name}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "cognition",
                "agent": "assistant",
                "title": "Executing",
                "tool": fc_name,
                "message": friendly_label,
                "phase": "execution",
            }) + "\n"

            # Execute tool
            tool_result = await _execute_tool(fc_name, fc_args)
            logger.info(f"[BuyerDirect] Tool {fc_name} completed.")

            # Inject tool result into message history
            messages.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "content": tool_result,
            })

        # Loop back → LLM sees tool results and generates final answer
        # (tool_calls_buffer will be empty in next round unless LLM calls again)

    # Safety: if we exit the loop without returning (too many tool rounds)
    clean_text = _sanitize_response(full_text)
    yield json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "agent": "buyer_agent",
        "action": "idle",
        "params": {},
        "text": clean_text,
        "chat": clean_text
    }) + "\n"
