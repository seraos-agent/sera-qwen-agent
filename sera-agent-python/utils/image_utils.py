import base64
import asyncio
import os
import httpx
import dashscope
from dashscope import MultiModalConversation
from utils.logger import logger
from utils.http_client import http_manager, retry_http

# Placeholder fallback (Unsplash) to prevent infinite loops if API key lacks Image Generation access
PLACEHOLDER_IMAGES = {
    "default": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
}

dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

async def generate_image_with_imagen(prompt: str, aspect_ratio: str = "1:1") -> str:
    """
    Generates an image using qwen-image-plus via DashScope MultiModalConversation API.
    Returns a base64 encoded data URI (data:image/jpeg;base64,...).
    If the API key is invalid, it gracefully falls back to a placeholder.
    """
    # Allowed sizes: 1664*928, 1472*1104, 1328*1328, 1104*1472, 928*1664
    size = '1328*1328'
    if aspect_ratio == "16:9":
        size = '1664*928' 
    elif aspect_ratio == "9:16":
        size = '928*1664'
        
    api_key = os.environ.get("QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")
    dashscope.api_key = api_key

    messages = [
        {
            "role": "user",
            "content": [
                {"text": prompt}
            ]
        }
    ]

    max_retries = 1
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"🎨 [Qwen Image] Requesting prompt: '{prompt[:50]}...', size: '{size}' (Attempt {attempt+1}/{max_retries+1})")
            
            def make_call():
                return MultiModalConversation.call(
                    api_key=api_key,
                    model="qwen-image-plus",
                    messages=messages,
                    result_format='message',
                    stream=False,
                    watermark=False,
                    prompt_extend=True,
                    negative_prompt='',
                    size=size
                )
            
            response = await asyncio.to_thread(make_call)
            
            if response.status_code != 200:
                raise Exception(f"{response.code}: {response.message}")
                
            image_url = response.output.choices[0].message.content[0]["image"]
            
            @retry_http
            async def download_image():
                async with httpx.AsyncClient() as client:
                    img_response = await client.get(image_url, timeout=30.0)
                    img_response.raise_for_status()
                    return img_response.content
                
            img_bytes = await download_image()
            base64_str = base64.b64encode(img_bytes).decode("utf-8")
            return f"data:image/png;base64,{base64_str}"
            
        except Exception as e:
            err_str = str(e)
            if "invalid_api_key" in err_str.lower() or "401" in err_str or "InvalidApiKey" in err_str:
                # Fatal auth error — no point retrying, raise immediately so ReAct marks it failed
                logger.error(f"❌ [Qwen Image Fatal] {err_str}. Raising exception for ReAct to handle.")
                raise Exception(f"InvalidApiKey: {err_str}")
                
            logger.error(f"❌ [Qwen Image Error] Attempt {attempt+1} failed: {err_str}")
            if attempt == max_retries:
                # All retries exhausted — raise so ReAct loop marks this asset as failed
                raise Exception(f"Image generation failed after {max_retries + 1} attempts. Last error: {err_str}")
            await asyncio.sleep(2)
