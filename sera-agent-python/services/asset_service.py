import json
import time
import asyncio
from utils.logger import logger
from tools.sera_tools import generate_store_assets
from utils.cognition import emit_pre_run, emit_completion

async def handle_retry_assets(schema: dict, failed_ids: set, progress_queue: asyncio.Queue):
    """Handles self-correction for failed assets triggered via /retry-assets."""
    for section in schema.get("layout", []):
        if section.get("type") == "hero" and "hero_bg" in failed_ids:
            if "props" in section and "heroImage" in section["props"]:
                section["props"].pop("heroImage")
                
        if section.get("type") == "featured_products":
            for prod in section.get("props", {}).get("products", []):
                if prod.get("id") in failed_ids:
                    prod.pop("verifiedUrl", None)
                    prod.pop("imageUrl", None)
                    prod.pop("pendingUrl", None)
                    
        if section.get("type") == "philosophy":
            for item in section.get("props", {}).get("items", []):
                if item.get("id") in failed_ids:
                    item.pop("verifiedUrl", None)
                    item.pop("imageUrl", None)
                    item.pop("pendingUrl", None)

    try:
        await emit_pre_run(progress_queue, "Initiating safety self-correction for failed assets...")
        schema_result = await generate_store_assets(schema, progress_queue)
        yield_data = json.dumps({"type": "execution_state", "state": {"results": schema_result.get("results", [])}}) + "\n"
        await progress_queue.put(yield_data)
        await emit_completion(progress_queue, "All failed assets have been successfully regenerated.")
    except Exception as e:
        logger.error(f"Error in retry_assets task: {e}")
        await emit_completion(progress_queue, "Failed to regenerate assets.")
    finally:
        await progress_queue.put(None)

async def fallback_asset_generation(schema: dict, session_id: str, action: str, params: dict):
    """
    Executes fallback high-fidelity asset generation via Tongyi Wanxiang, 
    including self-correction retries.
    Yields stringified JSON events for streaming.
    """
    yield json.dumps({
        "event_id": f"evt_fallback_cognition_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "cognition",
        "message": "Generating missing high-fidelity storefront assets via Tongyi Wanxiang...",
        "phase": "asset_generation"
    }) + "\n"
    
    yield json.dumps({
        "event_id": f"evt_fallback_preview_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "schema_preview",
        "action": action,
        "params": params
    }) + "\n"
    
    q = asyncio.Queue()
    async def run_gen_task():
        try:
            result = await generate_store_assets(schema, q)
            await q.put({"done": True, "res": result})
        except Exception as ex:
            await q.put({"done": True, "res": {"success": False, "error": str(ex)}})
            
    asyncio.create_task(run_gen_task())
    res = None
    results = []
    
    while True:
        msg = await q.get()
        if msg.get("done"):
            res = msg["res"]
            break
        yield json.dumps({
            "event_id": f"evt_fallback_execution_{int(time.time())}_{len(msg['results'])}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "type": "execution_state",
            "state": {
                "task_id": f"task_{int(time.time())}",
                "results": msg["results"]
            }
        }) + "\n"

    if res and res.get("success"):
        results = res.get("results", [])
        max_retries = 3
        attempt = 0
        while attempt < max_retries:
            failed_items = [r for r in results if r.get("status") == "failed"]
            if not failed_items:
                break
            
            yield json.dumps({
                "event_id": f"evt_fallback_correction_{int(time.time())}_{attempt}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "cognition",
                "message": f"Detected {len(failed_items)} failed assets. Initiating self-correction (Attempt {attempt+1}/{max_retries})...",
                "phase": "quality_check",
                "done": False
            }) + "\n"
            
            for sec in schema.get("layout", []):
                st = sec.get("type")
                props = sec.get("props", {})
                if st == "featured_products":
                    for idx, p in enumerate(props.get("products", [])):
                        if any(f.get("itemId") == f"prod_{idx}" for f in failed_items):
                            p["verifiedUrl"] = ""
                            p["imageUrl"] = ""
                elif st == "philosophy":
                    for idx, item in enumerate(props.get("items", [])):
                        if any(f.get("itemId") == f"philo_{idx}" for f in failed_items):
                            item["verifiedUrl"] = ""
                            item["imageUrl"] = ""
                            
            q_retry = asyncio.Queue()
            async def run_retry_task():
                try:
                    retry_res = await generate_store_assets(schema, q_retry)
                    await q_retry.put({"done": True, "res": retry_res})
                except Exception as ex:
                    await q_retry.put({"done": True, "res": {"success": False}})
            
            asyncio.create_task(run_retry_task())
            retry_res = None
            while True:
                r_msg = await q_retry.get()
                if r_msg.get("done"):
                    retry_res = r_msg["res"]
                    break
                yield json.dumps({
                    "event_id": f"evt_fallback_execution_retry_{int(time.time())}_{attempt}",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "execution_state",
                    "state": {
                        "task_id": f"task_retry_{int(time.time())}",
                        "results": r_msg.get("results", [])
                    }
                }) + "\n"

            if retry_res and retry_res.get("success"):
                retry_results = retry_res.get("results", [])
                for rr in retry_results:
                    if rr.get("status") == "success":
                        for i, old_r in enumerate(results):
                            if old_r.get("itemId") == rr.get("itemId"):
                                results[i] = rr
                                break
            attempt += 1

        params["schema"] = res.get("schema")
        if action == "update_philosophy":
            for sec in params["schema"].get("layout", []):
                if sec.get("type") == "philosophy":
                    params["items"] = sec.get("props", {}).get("items", [])
                    break
                    
        yield json.dumps({
            "event_id": f"evt_fallback_execution_final_{int(time.time())}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "type": "execution_state",
            "state": {
                "task_id": f"task_final_{int(time.time())}",
                "results": results
            }
        }) + "\n"
    # End of fallback_asset_generation
