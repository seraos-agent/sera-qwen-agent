import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "plan_agent.txt"), encoding="utf-8").read()

# Using qwen-plus-character for deep planning roleplay
model_name = os.environ.get("PLAN_MODEL", "qwen3.5-plus")

plan_agent_config = {
    "name": "plan_agent",
    "description": "Strategic consultant agent that asks questions to create business/marketing plans.",
    "model": model_name,
    "instruction": _instruction,
    # Read-only tools for existing users
    "tools": ["get_stores", "get_products", "get_store_analytics", "get_marketing_history"],
    "enable_thinking": False,
}
