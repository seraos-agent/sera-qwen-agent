import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "analytics_agent.txt"), encoding="utf-8").read()

model_name = "deepseek-v4-flash"

analytics_agent_config = {
    "name": "analytics_agent",
    "description": "Analytics agent for fetching, analyzing, and reporting store metrics",
    "model": model_name,
    "instruction": _instruction,
    "tools": ["get_store_analytics"],
    # Thinking mode ON: analytics requires multi-step reasoning
    # to correlate metrics, identify trends, and form actionable insights
    "enable_thinking": True,
}
