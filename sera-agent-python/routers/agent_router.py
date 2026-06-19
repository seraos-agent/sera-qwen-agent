import json
import os
import time
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from agent_registry import get_runner
from utils.logger import logger
from utils.intent import classify_intent
from utils.chat_utils import determine_agent_type
from schemas.base import ChatRequest, RetryAssetsRequest, EmbedRequest

from services.llm_service import (
    handle_conversational_greeting,
    handle_conversational_thanks,
    handle_conversational_identity,
    handle_conversational,
    handle_reasoning,
)
from services.chat_service import run_execution_pipeline
from services.asset_service import handle_retry_assets

router = APIRouter(prefix="/api/agent", tags=["agent"])

@router.post("/retry-assets")
async def retry_assets(request: RetryAssetsRequest):
    logger.info(f"🔄 Received retry-assets request for items: {request.failed_item_ids}")
    
    schema = request.schema_data
    failed_ids = set(request.failed_item_ids)

    async def response_generator():
        progress_queue = asyncio.Queue()
        asyncio.create_task(handle_retry_assets(schema, failed_ids, progress_queue))
        
        while True:
            msg = await progress_queue.get()
            if msg is None:
                break
            if isinstance(msg, str):
                yield msg
            else:
                yield json.dumps(msg) + "\n"
                
    return StreamingResponse(response_generator(), media_type="text/event-stream")


@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    logger.info(f"📩 Received chat request for chatMode={request.chatMode}")
    
    active_tab = request.storeContext.get("activeTab") if request.storeContext else None
    
    # 1. Routing: select agent runner
    agent_type = determine_agent_type(request.input, request.chatMode or "agent", active_tab)
    runner = get_runner(agent_type)
    
    # Session identifier
    session_id = request.storeContext.get("session_id", "guest_default") if request.storeContext else "guest_default"
    user_id = "sera_user"

    async def response_generator():
        start_time = time.time()
        active_tab = request.storeContext.get("activeTab") if request.storeContext else None
        
        # Check if we should use orchestrator for agent mode (default seller chat)
        use_orchestrator = (request.chatMode or "agent") == "agent" and active_tab != "analytics"
        
        if use_orchestrator:
            orchestrator_runner = get_runner("orchestrator_agent")
            final_data = None
            lifecycle_chunks = []
            
            async for chunk in run_execution_pipeline(start_time, session_id, "orchestrator_agent", orchestrator_runner, user_id, request):
                is_lifecycle = False
                try:
                    data = json.loads(chunk.strip())
                    if data.get("type") == "final":
                        final_data = data
                    if data.get("type") in ["final", "completed", "ui_ready", "schema_preview", "narrating"]:
                        is_lifecycle = True
                except Exception:
                    pass
                    
                if is_lifecycle:
                    lifecycle_chunks.append(chunk)
                else:
                    yield chunk
            
            if final_data:
                action = final_data.get("action", "idle")
                target_agent = None
                if action == "route_to_store_agent":
                    target_agent = "store_agent"
                elif action == "route_to_plan_agent":
                    target_agent = "plan_agent"
                elif action == "route_to_analytics_agent":
                    target_agent = "analytics_agent"
                elif action == "route_to_marketing_agent":
                    target_agent = "marketing_agent"
                    
                if target_agent:
                    logger.info(f"🔀 Orchestrator routed to: {target_agent}")
                    sub_runner = get_runner(target_agent)
                    async for chunk in run_execution_pipeline(start_time, session_id, target_agent, sub_runner, user_id, request):
                        yield chunk
                else:
                    # Orchestrator is answering directly, yield its lifecycle events so frontend finishes
                    for chunk in lifecycle_chunks:
                        yield chunk
            return
            
        # 3. Intent Detection & Fast Track Routing
        # Check fast heuristic first to intercept simple greetings/thanks even in buyer mode
        from utils.intent import classify_intent_local
        local_intent = classify_intent_local(request.input)
        
        if local_intent:
            intent_mode = local_intent
        else:
            intent_mode = "EXECUTION" if active_tab == "analytics" else await classify_intent(request.input)
        
        if intent_mode in ["CONVERSATIONAL_GREETING", "CONVERSATIONAL_THANKS", "CONVERSATIONAL_IDENTITY", "CONVERSATIONAL"]:
            yield handle_conversational(session_id, request.input, request.chatMode)
            return
            
        elif intent_mode == "REASONING":
            yield handle_reasoning(session_id, request.input, request.chatMode)
            return

        # Fallback/non-orchestrated EXECUTION path (buyer / analytics / plan mode execution)
        async for chunk in run_execution_pipeline(start_time, session_id, agent_type, runner, user_id, request):
            yield chunk
        return
            
        yield json.dumps({
            "event_id": f"evt_final_{int(time.time())}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "type": "final",
            "action": "idle",
            "params": {},
            "text": "I am SERA. How can I help you?",
        }) + "\n"
        return

    return StreamingResponse(response_generator(), media_type="application/x-ndjson")


@router.post("/embed")
async def embed_text(request: EmbedRequest):
    logger.info(f"📊 Received embedding request for text length={len(request.text)}")
    try:
        import dashscope
        from dashscope import TextEmbedding
        response = TextEmbedding.call(
            model=TextEmbedding.Models.text_embedding_v1,
            input=request.text,
            api_key=os.environ.get('QWEN_API_KEY') or os.environ.get('DASHSCOPE_API_KEY')
        )
        if response.status_code == 200:
            embedding = response.output['embeddings'][0]['embedding']
        else:
            embedding = [0.0] * 768
        return {"success": True, "embedding": embedding}
    except Exception as e:
        logger.error(f"Error generating embedding in Python: {str(e)}")
        return {"success": False, "error": str(e), "embedding": [0.0] * 768}
