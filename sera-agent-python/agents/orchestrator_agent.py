import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "orchestrator_agent.txt"), encoding="utf-8").read()

# Use qwen3.6-plus for orchestration — strong reasoning for routing decisions
# Override via ORCHESTRATOR_MODEL env var if needed
model_name = os.environ.get("ORCHESTRATOR_MODEL", "qwen3.6-plus")

orchestrator_agent_config = {
    "name": "orchestrator_agent",
    "description": "Central SERA orchestrator that analyzes user intent and delegates to specialized sub-agents",
    "model": model_name,
    "instruction": _instruction,
    # The orchestrator itself doesn't call commerce tools directly.
    # It delegates to specialized agents which have the tools.
    "tools": [],
    # Enable thinking mode for the orchestrator — it needs to reason
    # about which agent to route to and whether to chain multiple agents.
    "enable_thinking": True,
}
