import os

_dir = os.path.dirname(__file__)
_instruction_core = open(os.path.join(_dir, "prompts", "spokesperson_agent.txt"), encoding="utf-8").read()
_persona = open(os.path.join(_dir, "prompts", "sera_persona.txt"), encoding="utf-8").read()
_instruction = f"{_instruction_core}\n\n{_persona}"

model_name = "qwen3.5-flash"

spokesperson_agent_config = {
    "name": "spokesperson_agent",
    "description": "SERA Front-Desk Spokesperson - Crafts beautiful markdown narratives from technical JSON results.",
    "model": model_name,
    "instruction": _instruction,
    "tools": [],
    "enable_thinking": False, # No reasoning needed, just formatting and storytelling
}
