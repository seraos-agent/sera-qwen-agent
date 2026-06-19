import os

_dir = os.path.dirname(__file__)
_instruction_core = open(os.path.join(_dir, "prompts", "buyer_agent.txt"), encoding="utf-8").read()
_persona = open(os.path.join(_dir, "prompts", "sera_buyer_persona.txt"), encoding="utf-8").read()
_instruction = f"{_instruction_core}\n\n{_persona}"

# deepseek-v4-flash: fast, high quality commerce assistant
model_name = "deepseek-v4-flash"


buyer_agent_config = {
    "name": "buyer_agent",
    "description": "Buyer agent for assisting customers in discovering shops and products",
    "model": model_name,
    "instruction": _instruction,
    "tools": ["get_stores", "get_products", "search_products", "search_stores", "get_promotions", "get_categories"],
}
