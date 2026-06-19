import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "image_product_agent.txt"), encoding="utf-8").read()

# qwen3.7-plus: multimodal model — can process both text and images
# Used for product image analysis (vision) and generation (wanxiang tool)
model_name = "qwen-vl-plus"

image_product_agent_config = {
    "name": "image_product_agent",
    "description": "Multimodal agent for visual product analysis, edit and generation",
    "model": model_name,
    "instruction": _instruction,
    "tools": ["generate_image_asset"],
    # thinking OFF: image tasks are creative/generative, not deep reasoning
    "enable_thinking": False,
}
