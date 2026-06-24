import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "consensus_agent.txt"), encoding="utf-8").read()

model_name = os.environ.get("CONSENSUS_MODEL", "qwen3.5-plus")

consensus_agent_config = {
    "name": "consensus_agent",
    "description": "Final decision maker that reviews opinions from the team and produces the final execution schema.",
    "model": model_name,
    "instruction": _instruction,
    "tools": [],
    "enable_thinking": False,
}
