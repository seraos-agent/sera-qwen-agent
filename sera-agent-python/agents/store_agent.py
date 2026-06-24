import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "store_agent.txt"), encoding="utf-8").read()

model_name = "qwen3.5-plus"

store_agent_config = {
    "name": "store_agent",
    "description": "Autonomous storefront execution engine — builds, designs, and deploys AI-powered e-commerce stores",
    "model": model_name,
    "instruction": _instruction,
    "tools": ["get_stores", "generate_store_assets", "generate_image_asset", "generate_video_asset", "check_local_stock", "check_local_price"],
    # Thinking mode ON: store design requires deep creative reasoning
    # (brand identity, layout composition, color strategy, product curation)
    "enable_thinking": False,
}
