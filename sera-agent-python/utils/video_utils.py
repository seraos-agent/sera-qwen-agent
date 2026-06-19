"""
video_utils.py — SERA Video Generation

Using direct HTTP to Qwen Cloud (dashscope-intl) according to official documentation.
Not using DashScope SDK — just httpx.

Models:
    - happyhorse-1.0-t2v  → Text to Video
    - happyhorse-1.0-i2v  → Image to Video

Endpoint:
    POST https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis
"""

import os
import time
import base64
import asyncio
from utils.logger import logger
from utils.http_client import http_manager, retry_http

# ── Constants ──────────────────────────────────────────────────────────────────
API_KEY       = os.getenv("QWEN_API_KEY") or os.getenv("DASHSCOPE_API_KEY")
VIDEO_URL     = "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis"
POLL_INTERVAL = 5    # seconds between polling
MAX_POLLS     = 36   # max polling (5s × 36 = ~3 minutes)
MAX_DURATION  = 8    # max SERA video duration (seconds)

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type":  "application/json",
    "X-DashScope-Async": "enable",   # required for async job
}

# ── Internal: Submit Job ───────────────────────────────────────────────────────
@retry_http
async def _submit_video_job(payload: dict) -> str:
    """Submit video generation job, return task_id."""
    response = await http_manager.client.post(VIDEO_URL, headers=HEADERS, json=payload, timeout=30.0)
    response.raise_for_status()
    data = response.json()

    task_id = data.get("output", {}).get("task_id")
    if not task_id:
        raise Exception(f"[Video] Failed to get task_id: {data}")

    logger.info(f"🎬 [Video] Job submitted — task_id: {task_id}")
    return task_id

# ── Internal: Poll Status ──────────────────────────────────────────────────────
async def _poll_video_job(task_id: str) -> str:
    """Poll task until SUCCEEDED, return video_url."""
    poll_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
    poll_headers = {"Authorization": f"Bearer {API_KEY}"}

    for attempt in range(1, MAX_POLLS + 1):
        await asyncio.sleep(POLL_INTERVAL)
        logger.info(f"🎬 [Video] Polling... attempt {attempt} ({attempt * POLL_INTERVAL}s elapsed)")

        @retry_http
        async def do_poll():
            resp = await http_manager.client.get(poll_url, headers=poll_headers, timeout=30.0)
            resp.raise_for_status()
            return resp.json()

        data = await do_poll()
        status = data.get("output", {}).get("task_status")

        if status == "SUCCEEDED":
            video_url = data["output"]["video_url"]
            logger.info(f"✅ [Video] SUCCEEDED — URL: {video_url}")
            return video_url

        elif status == "FAILED":
            raise Exception(f"[Video] Task FAILED: {data['output'].get('message', 'unknown error')}")

        elif status == "CANCELED":
            raise Exception("[Video] Task CANCELED.")

        # PENDING / RUNNING → continue polling

    raise Exception(f"[Video] Timeout after {MAX_POLLS * POLL_INTERVAL} seconds.")

# ── Internal: Download & Encode ────────────────────────────────────────────────
@retry_http
async def _download_and_encode(video_url: str) -> str:
    """Download video from URL, return base64 data URI. URL is valid for 24 hours."""
    logger.info(f"🎬 [Video] Downloading from {video_url}...")
    resp = await http_manager.client.get(video_url, timeout=120.0)
    resp.raise_for_status()
    video_bytes = resp.content

    base64_str = base64.b64encode(video_bytes).decode("utf-8")
    logger.info(f"✅ [Video] Download complete — {len(video_bytes) / 1024:.1f} KB")
    return f"data:video/mp4;base64,{base64_str}"

# ── Async Wrappers (non-blocking untuk asyncio event loop) ─────────────────────
async def generate_video_with_happyhorse_t2v(
    prompt: str,
    aspect_ratio: str = "16:9",
    resolution: str = "720P",
    duration: int = 5,
) -> str:
    """
    Async wrapper — Text to Video.
    Returns: data:video/mp4;base64,...
    """
    duration = min(duration, MAX_DURATION)  # hard cap 7 seconds
    logger.info(f"🎬 [T2V] Prompt: '{prompt}' | {aspect_ratio} | {resolution} | {duration}s")

    payload = {
        "model": "happyhorse-1.0-t2v",
        "input": {
            "prompt": prompt,
        },
        "parameters": {
            "resolution":   resolution,
            "duration":     duration,
        }
    }

    task_id   = await _submit_video_job(payload)
    video_url = await _poll_video_job(task_id)
    return await _download_and_encode(video_url)

async def generate_video_with_happyhorse_i2v(
    prompt: str,
    img_url: str,
    aspect_ratio: str = "16:9",
    resolution: str = "720P",
    duration: int = 5,
) -> str:
    """
    Async wrapper — Image to Video.
    Returns: data:video/mp4;base64,...
    """
    duration = min(duration, MAX_DURATION)  # hard cap 7 seconds
    logger.info(f"🎬 [I2V] Prompt: '{prompt}' | Image: {img_url} | {resolution} | {duration}s")

    payload = {
        "model": "happyhorse-1.0-i2v",
        "input": {
            "prompt": prompt,
            "media": [
                {
                    "type": "first_frame",
                    "url":  img_url,
                }
            ],
        },
        "parameters": {
            "resolution":   resolution,
            "duration":     duration,
        }
    }

    task_id   = await _submit_video_job(payload)
    video_url = await _poll_video_job(task_id)
    return await _download_and_encode(video_url)
