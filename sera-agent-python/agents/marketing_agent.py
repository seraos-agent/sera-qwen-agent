import os

_dir = os.path.dirname(__file__)
_instruction = open(os.path.join(_dir, "prompts", "marketing_agent.txt"), encoding="utf-8").read()

# qwen3.7-plus: multimodal model for image-aware campaign creation
model_name = "qwen3.5-flash"

marketing_agent_config = {
    "name": "marketing_agent",
    "description": "Marketing agent specialized in campaigns, promotions, and generating promotional assets.",
    "model": model_name,
    "instruction": _instruction,
    "tools": ["save_campaign", "generate_image_asset", "generate_video_asset"],
    "enable_thinking": False,
}
