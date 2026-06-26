import os
import asyncio
from utils.http_client import http_manager, retry_http
from utils.image_utils import generate_image_with_imagen
from utils.video_utils import generate_video_with_happyhorse_t2v, generate_video_with_happyhorse_i2v
from utils.logger import logger
import time
import base64

def save_base64_image(base64_str: str, asset_id: str) -> str:
    """Saves base64 image string to disk and returns the HTTP URL."""
    try:
        if base64_str.startswith("http"):
            return base64_str
            
        if "base64," in base64_str:
            header, encoded = base64_str.split("base64,", 1)
            ext = header.split("/")[1].split(";")[0] if "/" in header else "png"
        else:
            encoded = base64_str
            ext = "png"
        
        assets_dir = os.path.join(os.path.dirname(__file__), "..", "assets")
        os.makedirs(assets_dir, exist_ok=True)
        
        file_path = os.path.join(assets_dir, f"{asset_id}.{ext}")
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(encoded))
        
        # Use PUBLIC_URL if explicitly set (production).
        # In local dev, PUBLIC_URL is NOT set, so fallback to localhost:8000
        # so the browser can actually load the image from the local FastAPI server.
        public_url = os.environ.get("PUBLIC_URL", "").strip().rstrip("/")
        if not public_url:
            port = os.environ.get("PORT", "8000")
            public_url = f"http://localhost:{port}"
            
        return f"{public_url}/assets/{asset_id}.{ext}"
    except Exception as e:
        logger.error(f"Failed to save image {asset_id}: {e}")
        return base64_str

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "https://api.setaradapps.com")

async def get_store_analytics(store_id: str) -> dict:
    """
    Fetches the analytics metrics and products list for a specific store from the database.
    CRITICAL: YOU MUST ALWAYS CALL THIS TOOL BEFORE RESPONDING TO ANY QUERY ABOUT ANALYTICS, REVENUE, SALES, OR PERFORMANCE.
    NEVER answer with general knowledge. ALWAYS fetch real data using this tool first.
    """
    url = f"{NODE_BACKEND_URL}/api/analytics"
    params = {"store_id": store_id}
    logger.info(f"📊 Calling Node.js GET /api/analytics with store_id={store_id}")
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.get(url, params=params, timeout=8.0)
            resp.raise_for_status()
            return resp.json()
        return await do_req()
    except Exception as e:
        logger.error(f"Error calling GET /api/analytics: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_stores(session_id: str = "all") -> dict:
    """
    Fetches all active stores associated with the given session ID.
    CRITICAL: If you are the buyer agent looking for stores, you MUST pass "all" as the session_id.
    Use this tool to discover existing stores or check if a store name exists.
    """
    url = f"{NODE_BACKEND_URL}/api/stores"
    # Override session_id for buyers to discover all stores
    actual_session = "all" if session_id in ["current_session", "all", ""] else session_id
    if str(session_id).startswith("buyer_"):
        actual_session = "all"
    params = {"session_id": actual_session}
    logger.info(f"🏬 Calling Node.js GET /api/stores with session_id={actual_session}")
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.get(url, params=params, timeout=8.0)
            resp.raise_for_status()
            return resp.json()
        data = await do_req()
        logger.info(f"get_stores returning: {len(data.get('stores', []))} stores")
        return data
    except Exception as e:
        logger.error(f"Error calling GET /api/stores: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_products(store_id: str) -> dict:
    """
    Fetch products for a specific store.
    """
    logger.info(f"📦 Calling Node.js GET /api/products with store_id={store_id}")
    url = f"{NODE_BACKEND_URL}/api/products"
    params = {"store_id": store_id}
    
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.get(url, params=params, timeout=8.0)
            resp.raise_for_status()
            return resp.json()
        data = await do_req()
        logger.info(f"get_products returning: {len(data.get('products', []))} products")
        return data
    except Exception as e:
        logger.error(f"Error calling GET /api/products/search: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_marketing_history(store_id: str) -> dict:
    """
    Fetches the marketing and campaign history for a store.
    """
    logger.info(f"📈 Calling GET /api/marketing_history with store_id={store_id}")
    return {"success": True, "history": []} # Mocked for now as requested

async def search_products(query: str, store_id: str = None) -> dict:
    """
    Search for products across the marketplace or within a specific store.
    Provides semantic ranking/scoring to find the best recommendations.
    """
    logger.info(f"🔍 Searching products for query='{query}' (store_id={store_id})")
    url = f"{NODE_BACKEND_URL}/api/search-products"
    payload = {"query": query}
    if store_id:
        payload["store_id"] = store_id
        
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.post(url, json=payload, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
        data = await do_req()
        logger.info(f"search_products returning: {len(data.get('results', []))} products")
        return data
    except Exception as e:
        logger.error(f"Error calling POST /api/search-products: {str(e)}")
        return {"success": False, "error": str(e)}

async def search_stores(query: str) -> dict:
    """
    Search for stores in the marketplace matching the given query (e.g. 'electronics', 'fashion').
    Uses token-based scoring to find the best matches even with paraphrases or partial words.
    """
    logger.info(f"🏬 Searching stores for query='{query}'")
    try:
        stores_data = await get_stores("all")
        if not stores_data.get("success", True):
            return stores_data
            
        stores = stores_data.get("stores", [])
        query_tokens = set(query.lower().split())
        
        scored = []
        for s in stores:
            name = (s.get("store_name") or s.get("name") or "").lower()
            desc = (s.get("description") or s.get("desc") or "").lower()
            cat  = (s.get("category") or "").lower()
            combined = f"{name} {desc} {cat}"
            combined_tokens = set(combined.split())
            
            # Score: token overlap + substring partial match
            overlap = len(query_tokens & combined_tokens)
            partial = sum(1 for qt in query_tokens if any(qt in ct for ct in combined_tokens))
            score = (overlap * 2) + partial
            
            if score > 0:
                scored.append((score, s))
        
        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [s for _, s in scored]
        
        # Fallback: if no scored matches, return all stores
        if not results:
            results = stores
            
        return {"success": True, "stores": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Error in search_stores: {str(e)}")
        return {"success": False, "error": str(e)}

async def save_campaign(store_id: str, campaigns: list, session_id: str = "guest_default") -> dict:
    """
    Saves a marketing or discount campaign for a specific store.
    Use this tool only when the user approves or wants to run a marketing campaign.
    """
    url = f"{NODE_BACKEND_URL}/api/campaigns"
    payload = {
        "store_id": store_id,
        "session_id": session_id,
        "campaigns": campaigns
    }
    logger.info(f"📣 Calling Node.js POST /api/campaigns for store_id={store_id}")
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.post(url, json=payload, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
        return await do_req()
    except Exception as e:
        logger.error(f"Error calling POST /api/campaigns: {str(e)}")
        return {"success": False, "error": str(e)}

async def generate_image_asset(prompt: str, aspect_ratio: str = "1:1") -> dict:
    """
    Generates a high-fidelity image asset using Tongyi Wanxiang based on a text prompt.
    aspect_ratio can be '1:1' (default for products) or '16:9' (for hero sections and banners).
    Returns a dictionary with the generated base64 image data URL in the 'url' field.
    """
    logger.info(f"🎨 Generating image asset via tool: '{prompt}', ratio: '{aspect_ratio}'")
    try:
        base64_url = await generate_image_with_imagen(prompt, aspect_ratio)
        asset_id = f"asset_{int(time.time()*1000)}_{hash(prompt)%10000}"
        
        final_url = save_base64_image(base64_url, asset_id)
        
        return {
            "success": True,
            "url": final_url,
            "aspect_ratio": aspect_ratio
        }
    except Exception as e:
        logger.error(f"Error in generate_image_asset tool: {str(e)}")
        return {"success": False, "error": str(e)}

async def generate_video_asset(prompt: str, aspect_ratio: str = "16:9", duration_seconds: int = 4, brand_name: str = "") -> dict:
    """
    Generates a high-fidelity cinematic video using Tongyi Video based on a text prompt.
    aspect_ratio can be '16:9' (for Store Banners) or '9:16' (for Promo Campaigns).
    duration_seconds is capped at a maximum of 8 seconds to save API costs.
    brand_name is an optional name of the brand or product to automatically name the store.
    Returns a dictionary with the generated video URL.
    """
    duration_seconds = min(8, max(1, duration_seconds))
    logger.info(f"🎬 Generating video asset via HappyHorse tool: '{prompt}', ratio: '{aspect_ratio}', duration: {duration_seconds}s")
    try:
        # Call the real HappyHorse generation API
        base64_url = await generate_video_with_happyhorse_t2v(prompt, aspect_ratio, duration=duration_seconds)
        asset_id = f"video_{int(time.time()*1000)}_{hash(prompt)%10000}"
        
        # Save the returned base64 video string as an .mp4 file in assets/
        final_url = save_base64_image(base64_url, asset_id)
        
        return {
            "success": True,
            "url": final_url,
            "aspect_ratio": aspect_ratio,
            "brand_name": brand_name
        }
    except Exception as e:
        logger.error(f"Error in generate_video_asset tool: {str(e)}")
        return {"success": False, "error": str(e)}

async def generate_video_from_image_asset(prompt: str, image_url: str, aspect_ratio: str = "16:9", duration_seconds: int = 4, brand_name: str = "") -> dict:
    """
    Generates a cinematic video from an existing product image using happyhorse-1.1-i2v.
    Requires both a prompt and the source image_url.
    Returns a dictionary with the generated video URL.
    """
    duration_seconds = min(4, max(1, duration_seconds))
    logger.info(f"🎬 Generating video asset via HappyHorse I2V tool: '{prompt}', ratio: '{aspect_ratio}', duration: {duration_seconds}s")
    try:
        base64_url = await generate_video_with_happyhorse_i2v(prompt, image_url, aspect_ratio, duration=duration_seconds)
        asset_id = f"video_i2v_{int(time.time()*1000)}_{hash(prompt)%10000}"
        
        final_url = save_base64_image(base64_url, asset_id)
        
        return {
            "success": True,
            "url": final_url,
            "aspect_ratio": aspect_ratio,
            "brand_name": brand_name
        }
    except Exception as e:
        logger.error(f"Error in generate_video_from_image_asset tool: {str(e)}")
        return {"success": False, "error": str(e)}

async def generate_store_assets(schema: dict, progress_queue=None) -> dict:
    """
    Generates high-fidelity image assets for all storefront components in the schema (hero, products, philosophy)
    using Tongyi Wanxiang in a phased sequential order.
    Replaces all image prompts in the schema with the generated base64 image data URLs.
    """
    logger.info("🎨 Running parallel storefront asset generation tool...")
    
    layout = schema.get("layout", [])
    tasks = []
    
    # 1. Identify hero prompt
    hero_sec = None
    for section in layout:
        if section.get("type") == "hero":
            hero_sec = section
            break
            
    if hero_sec:
        props = hero_sec.setdefault("props", {})
        hero_prompt = props.get("heroImagePrompt")
        if not hero_prompt and props.get("title"):
            hero_prompt = f"{props.get('title')} luxury lifestyle photography, cinematic lighting"
        # Skip if heroImage already exists
        if hero_prompt and not props.get("heroImage"):
            # Force safety suffix to ensure header image passes filters
            safe_hero_prompt = f"{hero_prompt}, elegant abstract aesthetic, safe, empty, no people, no faces, clean architectural design"
            tasks.append(("hero_bg", hero_sec, safe_hero_prompt, "16:9", "Header Background Phase", "image"))
            
    # 2. Identify products
    prod_sec = None
    for section in layout:
        if section.get("type") == "featured_products":
            prod_sec = section
            break
            
    if prod_sec:
        products = prod_sec.setdefault("props", {}).setdefault("products", [])
        for idx, prod in enumerate(products):
            # Skip if image already exists
            if prod.get("imageUrl") or prod.get("verifiedUrl") or prod.get("pendingUrl"):
                continue
            prompt = prod.get("imagePrompt") or prod.get("name")
            tasks.append((f"prod_{idx}", prod, prompt, "1:1", "Product Images Phase", "image"))
            
    # 3. Identify philosophy
    philo_sec = None
    for section in layout:
        if section.get("type") == "philosophy":
            philo_sec = section
            break
            
    if philo_sec:
        items = philo_sec.setdefault("props", {}).setdefault("items", [])
        for idx, item in enumerate(items):
            # Skip if image already exists
            if item.get("imageUrl") or item.get("verifiedUrl") or item.get("pendingUrl"):
                continue
            prompt = item.get("imagePrompt") or item.get("imgPrompt") or f"ethos representing {item.get('label', '')} cinematic photography"
            tasks.append((f"philo_{idx}", item, prompt, "1:1", "Philosophy Images Phase", "image"))
            
    # 4. Videos: SKIPPED by default — only generated on explicit user request.
    # Use change_landscape_video / change_vertical_video actions instead.
    # This prevents store creation from blocking on slow/expensive video generation.
    logger.info("⏭️ [Asset Gen] Skipping video sections (not default for new store). User can add videos explicitly.")

    # ── ReAct Self-Correcting Asset Generator ────────────────────────────────────
    # Reason → Act → Observe loop with max 2 retries per asset.
    MAX_RETRIES = 2

    def simplify_prompt(original_prompt: str, attempt: int, error_str: str) -> str:
        """Reason step: Analyze failure and generate a safer fallback prompt."""
        error_lower = error_str.lower()
        
        # If content was blocked by safety filter → strip specifics, use abstract version
        if any(kw in error_lower for kw in ["content", "safety", "policy", "inappropriate", "rejected", "blocked"]):
            # Remove potentially triggering descriptors
            safe_words_to_remove = ["sexy", "nude", "violent", "blood", "weapon", "explicit", "human", "face", "person", "people"]
            cleaned = original_prompt
            for word in safe_words_to_remove:
                cleaned = cleaned.replace(word, "")
            return f"{cleaned.strip()}, elegant abstract aesthetic, minimal, clean, safe for work, no people, soft lighting"
        
        # If timeout or API error → use a much shorter, simpler prompt
        if any(kw in error_lower for kw in ["timeout", "timed out", "connection", "network", "500", "503"]):
            # Take only the first 8 words of the original prompt
            short = " ".join(original_prompt.split()[:8])
            return f"{short}, minimal, clean composition, professional photography"
        
        # Generic fallback: progressively shorten and neutralize
        words = original_prompt.split()
        shortened = " ".join(words[:max(5, len(words) - (attempt * 4))])
        return f"{shortened}, clean elegant simple product photo, studio lighting, white background"

    async def run_gen_with_react(task_id, target_dict, prompt, ratio, media_type):
        """
        ReAct loop: Reason (analyze error) → Act (retry with new prompt) → Observe (check result).
        Retries up to MAX_RETRIES times before declaring failure.
        """
        current_prompt = prompt
        last_error = None

        for attempt in range(MAX_RETRIES + 1):
            try:
                if attempt > 0:
                    logger.info(f"🔄 [ReAct] Retry {attempt}/{MAX_RETRIES} for '{task_id}' with simplified prompt: '{current_prompt}'")
                    # Wait before retry — back-off to avoid rate limiting
                    await asyncio.sleep(2 * attempt)
                    # Emit retry progress so the UI audit log shows this step
                    if progress_queue:
                        await progress_queue.put({
                            "react_event": True,
                            "task_id": task_id,
                            "attempt": attempt,
                            "message": f"Retrying asset '{task_id}' (attempt {attempt + 1}/{MAX_RETRIES + 1}) with adjusted prompt..."
                        })
                else:
                    logger.info(f"🎨 [ReAct] Generating {media_type} for '{task_id}': '{current_prompt}'")

                # ── Act: Call the actual generation API ──────────────────────
                if media_type == "video":
                    base64_url = await generate_video_with_happyhorse_t2v(current_prompt, ratio, duration=4)
                else:
                    base64_url = await generate_image_with_imagen(current_prompt, ratio)

                # ── Observe: Generation succeeded ────────────────────────────
                asset_id = f"asset_{int(time.time()*1000)}_{hash(current_prompt)%10000}"
                final_url = save_base64_image(base64_url, asset_id)

                if task_id == "hero_bg":
                    target_dict["props"]["heroImage"] = final_url
                elif media_type == "video":
                    target_dict["videoUrl"] = final_url
                else:
                    target_dict["imageUrl"] = final_url
                    target_dict["verifiedUrl"] = final_url

                if attempt > 0:
                    logger.info(f"✅ [ReAct] '{task_id}' succeeded on retry {attempt}")
                return {"itemId": task_id, "status": "success", "url": final_url, "proxy_url": final_url, "retries": attempt}

            except Exception as err:
                last_error = err
                error_str = str(err)
                logger.warning(f"⚠️ [ReAct] Attempt {attempt + 1} failed for '{task_id}': {error_str}")

                if attempt < MAX_RETRIES:
                    # ── Reason: Analyze why it failed and adapt ───────────────
                    current_prompt = simplify_prompt(current_prompt, attempt + 1, error_str)
                    logger.info(f"🧠 [ReAct] Diagnosed failure. New strategy for '{task_id}': '{current_prompt}'")
                # else: all retries exhausted, fall through to failure handling

        # ── All retries exhausted: report failure ──────────────────────────
        logger.error(f"❌ [ReAct] All {MAX_RETRIES + 1} attempts failed for '{task_id}'. Last error: {last_error}")
        if task_id == "hero_bg":
            target_dict["props"]["heroImage"] = "error"
        elif media_type == "video":
            target_dict["videoUrl"] = "error"
        else:
            target_dict["imageUrl"] = "error"
            target_dict["verifiedUrl"] = "error"
        return {"itemId": task_id, "status": "failed", "error": str(last_error), "retries": MAX_RETRIES}

    results = []

    # Sort tasks to enforce phased execution order
    order_map = {"Header Background Phase": 0, "Product Images Phase": 1, "Philosophy Images Phase": 2, "Video Generation Phase": 3}
    tasks.sort(key=lambda t: order_map.get(t[4], 99))

    for t_id, tgt, pr, rat, phase, m_type in tasks:
        res = await run_gen_with_react(t_id, tgt, pr, rat, m_type)
        results.append(res)
        if progress_queue:
            await progress_queue.put({"results": list(results)})

    return {
        "success": True,
        "schema": schema,
        "results": results
    }


async def get_promotions(store_id: str = None) -> dict:
    """
    Fetch only products that have an active promotion or discount.
    Helps the buyer find the best deals quickly without searching the entire catalog.
    """
    logger.info(f"🎁 Calling Node.js GET /api/products for promotions (store_id={store_id})")
    url = f"{NODE_BACKEND_URL}/api/products"
    params = {}
    if store_id and store_id != "all":
        params["store_id"] = store_id
        
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.get(url, params=params, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
        data = await do_req()
        products = data.get('products', [])
        # Filter products that have a promo field
        promos = [p for p in products if p.get('promo') and str(p.get('promo')).strip() != ""]
        logger.info(f"get_promotions returning: {len(promos)} promotional products")
        return {"success": True, "promotions": promos}
    except Exception as e:
        logger.error(f"Error calling GET /api/products for promos: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_categories(store_id: str = None) -> dict:
    """
    Get a simple list of product categories available in the marketplace or store.
    Use this to give buyers an overview of what's available before diving into specific products.
    """
    logger.info(f"📂 Fetching categories (store_id={store_id})")
    url = f"{NODE_BACKEND_URL}/api/products"
    params = {}
    if store_id and store_id != "all":
        params["store_id"] = store_id
        
    try:
        @retry_http
        async def do_req():
            resp = await http_manager.client.get(url, params=params, timeout=15.0)
            resp.raise_for_status()
            return resp.json()
        data = await do_req()
        products = data.get('products', [])
        categories = list(set([p.get('category') for p in products if p.get('category')]))
        logger.info(f"get_categories returning: {len(categories)} categories")
        return {"success": True, "categories": categories}
    except Exception as e:
        logger.error(f"Error calling GET /api/products for categories: {str(e)}")
        return {"success": False, "error": str(e)}

async def check_local_stock(product_name: str) -> dict:
    return {"success": True, "stock": 50, "message": f"{product_name} is in stock."}

async def check_local_price(product_name: str) -> dict:
    return {"success": True, "price": ".99"}
