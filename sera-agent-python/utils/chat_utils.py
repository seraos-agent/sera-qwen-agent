import re

# ── Self-introduction suppression ──────────────────────────────────────────
SELF_INTRO_RE = re.compile(
    r"(I\s+am\s+(a\s+large\s+language\s+model|an?\s+AI|SERA|a\s+language\s+model|an?\s+AI\s+(?:assistant|model))"
    r"|As\s+(?:an?\s+)?(?:AI|language\s+model|SERA)"
    r"|I'm\s+(?:an?\s+AI|a\s+language\s+model|SERA)"
    r"|(?:Hello|Hi)[,!]?\s+I(?:'m|\s+am)"
    r"|I(?:'d|\s+would)\s+be\s+(?:happy|glad|pleased)\s+to"
    r"|Certainly[,!]?\s*"
    r"|Of\s+course[,!]?\s*"
    r"|Sure[,!]?\s+I"
    r"|Absolutely[,!]?\s*)",
    re.IGNORECASE
)

def filter_self_intro(text: str) -> str:
    """Remove AI self-introduction phrases from agent output."""
    if not text:
        return text
    lines = text.split("\n")
    filtered = []
    for line in lines:
        stripped = line.strip()
        if stripped and SELF_INTRO_RE.match(stripped):
            continue
        filtered.append(line)
    result = "\n".join(filtered)
    result = SELF_INTRO_RE.sub("", result)
    
    # Strip tool tags that might leak from the LLM
    result = re.sub(r'<tool[\s\S]*', '', result, flags=re.IGNORECASE)
    result = re.sub(r'✿FUNCTION✿[\s\S]*', '', result, flags=re.IGNORECASE)
    
    # Strip Qwen thinking tokens (<think>...</think> or dangling <think>)
    result = re.sub(r'<think>[\s\S]*?</think>', '', result, flags=re.IGNORECASE)
    result = re.sub(r'<think>[\s\S]*', '', result, flags=re.IGNORECASE)  # unclosed
    result = re.sub(r'<\|[^|]*\|>', '', result)  # strip <|tool_response|> etc.
    
    return result.strip()


# ── Dynamic phase inference ──────────────────────────────────────────────────
PHASE_KEYWORDS = [
    ("brand_strategy",     ["brand", "positioning", "identity", "concept", "strategy"]),
    ("catalog_design",     ["catalog", "product", "inventory", "sku", "pricing", "curating"]),
    ("layout_design",      ["layout", "section", "hero", "structure", "schema", "design"]),
    ("asset_generation",   ["image", "asset", "photo", "visual", "imagen", "generating"]),
    ("quality_check",      ["check", "verif", "review", "audit", "inspect", "conflict"]),
    ("campaign_design",    ["campaign", "promo", "marketing", "discount", "flash"]),
    ("data_fetching",      ["fetching", "querying", "store", "existing", "mongodb"]),
    ("analysis",           ["analyz", "intent", "request", "understand", "orchestrat"]),
]

def infer_phase(message: str) -> str:
    """Dynamically infer execution phase from cognition message content."""
    msg_lower = (message or "").lower()
    for phase, keywords in PHASE_KEYWORDS:
        if any(kw in msg_lower for kw in keywords):
            return phase
    return "thinking"


def determine_agent_type(user_input: str, chat_mode: str, active_tab: str = None) -> str:
    input_lower = user_input.lower()
    if chat_mode == "buyer":
        return "buyer_agent"
        
    if chat_mode == "plan":
        return "plan_agent"
        
    if active_tab == "analytics":
        return "analytics_agent"
        
    words = set(re.findall(r'\b\w+\b', input_lower))
    
    store_edit_kws = {"change", "update", "replace", "edit", "modify", "remove", "add", "delete", "image", "picture", "layout", "color", "text", "title", "create", "make", "build"}
    
    analytics_kws = {"analytics", "analysis", "visitor", "sales", "revenue", "conversion", "performance", "report", "metric", "data", "statistic", "stat", "trend"}
    if words.intersection(analytics_kws) and not words.intersection(store_edit_kws):
        return "analytics_agent"

    plan_kws = {"plan", "strategy", "idea", "consult", "business"}
    if words.intersection(plan_kws):
        return "plan_agent"
        
    marketing_kws = {"campaign", "marketing", "promo", "discount", "ad", "ads", "promotion", "video", "wanx", "cinematic", "mp4"}
    if words.intersection(marketing_kws):
        return "marketing_agent"
        
    return "store_agent"
