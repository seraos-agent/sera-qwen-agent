import json
import time
import re
import asyncio
from utils.logger import logger
from utils.chat_utils import filter_self_intro, infer_phase
from utils.cognition import detect_context
from utils.asset_store import ASSET_STORE
from agent_registry import update_session_history, LLM_CFG_MAP, get_runner
from memory.manager import memory_manager
from services.asset_service import fallback_asset_generation
from services.buyer_direct import run_buyer_direct
from agents.buyer_agent import buyer_agent_config as _buyer_cfg

_BUYER_SYSTEM_PROMPT = _buyer_cfg["instruction"]

def extract_json_from_text(text: str):
    fence = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if fence: return fence.group(1)
    matches = list(re.finditer(r"\{", text))
    for m in matches:
        candidate = text[m.start():]
        depth = 0
        for i, ch in enumerate(candidate):
            if ch == "{": depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    fragment = candidate[:i+1]
                    if '"action"' in fragment: return fragment
    return None

async def execute_agent_pass(start_time, session_id, agent_type, runner, messages, request):
    """Executes a single agent pass and yields UI chunks + returns final data."""
    yielded_lines = set()
    agent_started = False
    messages_texts = {}
    tool_calls_made = []

    try:
        AGENT_TITLES = {
            "plan_agent": "PlanAgent",
            "store_agent": "StoreAgent",
            "marketing_agent": "MarketingAgent",
            "image_product_agent": "ImageProductAgent",
            "analytics_agent": "AnalyticsAgent",
            "consensus_agent": "ConsensusAgent",
            "orchestrator_agent": "Orchestrator",
        }
        AGENT_PHASE_TITLES = {
            "plan_agent": "Planning",
            "store_agent": "Designing",
            "marketing_agent": "Strategizing",
            "image_product_agent": "Generating",
            "analytics_agent": "Analyzing",
            "consensus_agent": "Reviewing",
            "orchestrator_agent": "Orchestrating",
            "buyer_agent": "Searching",
        }
        agent_title = AGENT_TITLES.get(agent_type, agent_type.replace('_', ' ').title())
        state_title = AGENT_PHASE_TITLES.get(agent_type, "Processing")

        iterator = iter(runner.run(messages))
        while True:
            response_msgs = await asyncio.to_thread(next, iterator, None)
            if response_msgs is None:
                break
            if not response_msgs: continue
            event = response_msgs[-1]
            
            if isinstance(event, dict):
                event_role = event.get('role', '')
                event_content = event.get('content', '')
                event_fc = event.get('function_call', None)
            else:
                event_role = getattr(event, 'role', '')
                event_content = getattr(event, 'content', '')
                event_fc = getattr(event, 'function_call', None)
            
            if event_role == "assistant":
                if event_content:
                    current_text = ""
                    if isinstance(event_content, list):
                        for part in event_content:
                            if isinstance(part, dict) and 'text' in part:
                                current_text += part['text']
                            elif hasattr(part, 'text'):
                                current_text += part.text
                    else:
                        current_text = str(event_content)
                    
                    stable_msg_id = f"evt_step_{len(response_msgs)}_{agent_type}"
                    messages_texts[stable_msg_id] = current_text
                    clean = filter_self_intro(current_text)
                    
                    pre_json_text = clean.split('```')[0].split('{')[0].strip()
                    
                    if agent_type == 'orchestrator_agent':
                        chat_bubble_text = ""
                    elif request.chatMode != 'buyer' and agent_type not in ['plan_agent', 'spokesperson_agent']:
                        chat_bubble_text = ""
                    else:
                        chat_bubble_text = pre_json_text.strip()
                        
                    if chat_bubble_text:
                        agent_started = True
                        yield json.dumps({
                            "event_id": stable_msg_id,
                            "timestamp": int(time.time()),
                            "session_id": session_id,
                            "type": "agent_message_start",
                            "agent": event_role,
                            "text": chat_bubble_text,
                            "ephemeral": True,
                        }) + "\n"
                        
                    if agent_type not in ['plan_agent', 'orchestrator_agent', 'spokesperson_agent'] and pre_json_text:
                        lines = pre_json_text.split('\n')
                        for i, line in enumerate(lines):
                            line = line.strip()
                            if not line: continue
                            cognition_msg = re.sub(r'^[-*0-9.]+\s+', '', line).strip()
                            if cognition_msg and cognition_msg not in yielded_lines:
                                yielded_lines.add(cognition_msg)
                                
                                phase_id = infer_phase(cognition_msg)
                                
                                if request.chatMode == 'buyer':
                                    display_cognition = cognition_msg
                                else:
                                    display_cognition = f"**{agent_title}** — {cognition_msg}"
                                    
                                yield json.dumps({
                                    "event_id": f"{stable_msg_id}_line_{i}",
                                    "timestamp": int(time.time()),
                                    "session_id": session_id,
                                    "type": "cognition",
                                    "agent": event_role,
                                    "title": state_title,
                                    "message": display_cognition,
                                    "phase": phase_id,
                                    "done": True
                                }) + "\n"

                if event_fc:
                    fc = event_fc
                    fc_name = fc.get('name') if isinstance(fc, dict) else getattr(fc, 'name', 'unknown')
                    if fc_name not in tool_calls_made:
                        tool_calls_made.append(fc_name)
                        
                        BUYER_TOOL_LABELS = {
                            'search_products':      'Searching product catalog',
                            'get_products':         'Browsing available products',
                            'search_stores':        'Scanning active stores',
                            'get_stores':           'Loading store directory',
                            'get_promotions':       'Looking for promotions & deals',
                            'get_store_promotions': 'Fetching store-specific deals',
                            'get_categories':       'Loading product categories',
                            'check_local_stock':    'Checking stock availability',
                            'check_local_price':    'Verifying current prices',
                        }
                        
                        if request.chatMode == 'buyer':
                            friendly_label = BUYER_TOOL_LABELS.get(fc_name, f'Running {fc_name.replace("_", " ")}')
                            display_message = friendly_label
                        else:
                            display_message = f"**{agent_title}** — Executing {fc_name}..."
                            
                        yield json.dumps({
                            "event_id": f"evt_{int(time.time())}_{fc_name}",
                            "timestamp": int(time.time()),
                            "session_id": session_id,
                            "type": "cognition",
                            "agent": event_role,
                            "title": "Executing",
                            "tool": fc_name,
                            "message": display_message,
                            "phase": "execution",
                        }) + "\n"
        
        if not session_id.endswith("_opinion"):
            await update_session_history(session_id, response_msgs, domain=request.chatMode)

    except Exception as e:
        logger.error(f"Error during ADK run for {agent_type}: {str(e)}")
        # Many Dashscope streaming errors (like JSONDecodeError on chunking) happen 
        # at the very tail end of generation when the JSON is already fully sent.
        # Silently ignoring the crash allows the system to extract the accumulated JSON
        # without adding a 20s delay or showing a scary error to the user.
        pass
    
    final_text = list(messages_texts.values())[-1].strip() if messages_texts else ""
    yield final_text

def emit_lifecycle(state: str, session_id: str):
    return json.dumps({
        "event_id": f"evt_lc_{int(time.time())}_{state}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "lifecycle",
        "state": state
    }) + "\n"

async def run_execution_pipeline(start_time, session_id, agent_type, runner, user_id, request):
    ctx = detect_context(request.input)
    context_str = ""
    if request.chatMode == "buyer":
        buyer_ctx = {"contextScope": request.contextScope, "activeStoreId": request.activeStoreId, "activeProductId": request.activeProductId}
        context_str = f"\n\nContext Location: {json.dumps(buyer_ctx)}"
    elif request.storeContext:
        safe_ctx = {}
        SAFE_KEYS = {"session_id", "title", "themeColor", "heroBg", "storeName", "storeId", "chatMode", "activeStores", "activeTab"}
        for k, v in request.storeContext.items():
            if k in SAFE_KEYS: safe_ctx[k] = v
            elif k == "products" and isinstance(v, list):
                safe_ctx["products"] = [{pk: pv for pk, pv in p.items() if pk not in ["imageUrl", "pendingUrl", "verifiedUrl", "imagePrompt"]} for p in v]
            elif isinstance(v, str) and len(v) < 200: safe_ctx[k] = v
        if safe_ctx: context_str = f"\n\nStore Context: {json.dumps(safe_ctx)}"

    history_str = ""
    if request.history:
        max_history = 6 if request.chatMode == 'buyer' else 4  # 3 pairs of user+AI for buyer
        for msg in request.history[-max_history:]:
            role = "Customer" if msg.get("role") == "user" else "SERA"
            text = msg.get("text", "") or msg.get("chat", "")  # support both field names
            if request.chatMode == 'buyer': text = text[:500]  # increased from 300
            if text.strip():
                history_str += f"{role}: {text}\n"
    
    memories = await memory_manager.get_semantic_context(request.chatMode, request.input)
    
    mem_str = ""
    ui_mem_bullets = []
    if memories:
        mem_str = "\n\n[SYSTEM INSTRUCTION]\nYou are SERA, a smart and professional commerce assistant. Here are memories about this user:\n"
        for m in memories:
            mem_str += f"- {m['type'].title()} ({m['entity']}): {m['value']}\n"
            ui_mem_bullets.append(f"{str(m['value']).title()}")
            
        mem_str += "\nMandatory Instruction: Use the memory above to personalize your response naturally and professionally. Do not explicitly say 'based on the system memory', just integrate it into your answer like a personal assistant. ALWAYS RESPOND IN THE SAME LANGUAGE AS THE USER'S ACTUAL INPUT (ignore the language of this system instruction)."
            
    rich_input = f"Previous Conversation:\n{history_str}\n\nCurrent Request: {request.input}{context_str}{mem_str}" if history_str else f"{request.input}{context_str}{mem_str}"
    
    if ui_mem_bullets:
        # Join into a single line: "Retrieved Memory: Arabica, Budget"
        ui_mem_string = "Retrieved Memory: " + ", ".join(ui_mem_bullets)
        yield json.dumps({
            "event_id": f"evt_mem_{int(time.time())}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "type": "cognition",
            "title": "Processing",
            "agent": "System",
            "message": ui_mem_string,
            "phase": "analysis",
            "done": True
        }) + "\n"
        # No sleep — stream immediately after memory event
        
    final_text = ""
    
    if agent_type == "plan_agent":
        logger.info("=== STARTING COLLABORATIVE MULTI-AGENT ORCHESTRATION ===")
        yield emit_lifecycle("planning", session_id)
        
        # Phase 1: Team Leader Planning
        yield json.dumps({
            "event_id": f"evt_cog_{int(time.time())}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "type": "cognition",
            "title": "Planning",
            "agent": "PlanAgent",
            "message": "Analyzing request and assembling the specialized team...",
            "phase": "analysis",
            "done": True
        }) + "\n"
        
        # Detect language from user's input — no external lib needed
        def detect_user_language(text: str) -> str:
            """Simple heuristic language detector. Defaults to English for ambiguous short inputs."""
            t = text.lower().strip()
            # Check for Mandarin/CJK characters
            if any('\u4e00' <= c <= '\u9fff' for c in text):
                return "Mandarin Chinese"
            # Check for Japanese
            if any('\u3040' <= c <= '\u30ff' for c in text):
                return "Japanese"
            # Check for Korean
            if any('\uac00' <= c <= '\ud7a3' for c in text):
                return "Korean"
            # Indonesian heuristics: common Indonesian words
            id_markers = ["buat", "bangun", "toko", "saya", "untuk", "yang", "dengan", "ini", "itu", "di", "ke", "dari", "dan", "atau", "tidak", "bisa", "ada", "akan", "sudah", "kamu", "apa", "bagaimana", "sekarang", "hewan", "peliharaan"]
            words = t.split()
            id_count = sum(1 for w in words if w in id_markers)
            if id_count >= 2 or (len(words) > 0 and words[0] in id_markers):
                return "Indonesian"
            # Default to English for Latin script
            return "English"

        detected_lang_name = detect_user_language(request.input)

        plan_lang_instruction = (
            f"LANGUAGE LOCK — HIGHEST PRIORITY RULE: The user's message is \"{request.input}\". "
            f"The detected language is: {detected_lang_name}. "
            f"Your introductory text BEFORE the JSON block MUST be written in {detected_lang_name} only. "
            f"NEVER switch language. NEVER use Mandarin/Chinese unless detected_lang_name is Mandarin Chinese."
        )
        messages = [{'role': 'user', 'content': [{'text': f"{rich_input}\n\n{plan_lang_instruction}"}]}]
        async for chunk in execute_agent_pass(start_time, session_id, "plan_agent", runner, messages, request):
            if isinstance(chunk, str) and chunk.endswith("\n"): yield chunk
            else: final_text = chunk
            
        raw_json = extract_json_from_text(final_text)
        sub_agents_team = [{"agent": "store_agent", "objective": "Design store structure"}] # default
        action_from_plan = "idle"
        if raw_json:
            try:
                data = json.loads(raw_json)
                action_from_plan = data.get("action", "idle")
                if action_from_plan == "idle" and "team" not in data.get("params", {}):
                    sub_agents_team = []
                else:
                    sub_agents_team = data.get("params", {}).get("team", sub_agents_team)
            except Exception: pass
            
        if action_from_plan != "idle":
            # Phase 2: Workspace Ideation
            yield emit_lifecycle("executing", session_id)
            
            workspace = {
                "goal": request.input,
                "team": sub_agents_team,
                "findings": [],
                "opinions": [],
                "objections": [],
                "recommendations": [],
                "discussion_log": []
            }
            
            for member in sub_agents_team:
                sub_agent = member.get("agent")
                objective = member.get("objective")
                if not sub_agent or sub_agent == "analytics_agent": continue
                
                # Show Team Leader moderating/transitioning:
                yield json.dumps({
                    "event_id": f"evt_cog_{int(time.time())}_moderation_{sub_agent}",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "cognition",
                    "title": "Delegating",
                    "agent": "PlanAgent",
                    "message": f"Delegating analysis and proposal drafting to **{sub_agent.replace('_', ' ').title()}** for: *{objective}*",
                    "phase": "analysis",
                    "done": True
                }) + "\n"
                
                # Wait a small delay to make it feel natural
                await asyncio.sleep(1)
                
                sub_runner = get_runner(sub_agent)
                lang_lock = f"CRITICAL LANGUAGE LOCK: The user's message is in this language — detect it from: \"{request.input}\". Your `opinion` field and all narrative MUST be in that exact language. NEVER use Mandarin/Chinese unless the user wrote in Mandarin."
                sub_messages = [{'role': 'user', 'content': [{'text': f"WORKSPACE GOAL:\n{rich_input}\n\nYOUR OBJECTIVE: {objective}\n\n{lang_lock}\n\nYou are {sub_agent}. Provide your expert opinion based on your specialization. Review current workspace state (if any): {json.dumps(workspace)}\n\nOutput your opinion in JSON format exactly with action: 'opinion'.\nInclude fields: 'opinion' (string), 'confidence' (float 0.0-1.0), 'findings' (list of strings), 'recommendations' (list of strings), and 'objections' (list of objects with keys {{from, against, reason}} if you disagree with previous agents)."}]}]
                
                sub_final_text = ""
                async for chunk in execute_agent_pass(start_time, f"{session_id}_opinion", sub_agent, sub_runner, sub_messages, request):
                    if isinstance(chunk, str) and chunk.endswith("\n"): 
                        yield chunk
                        try:
                            chunk_data = json.loads(chunk.strip())
                            if chunk_data.get("type") == "cognition" and chunk_data.get("message"):
                                workspace["discussion_log"].append({"agent": sub_agent, "message": chunk_data["message"]})
                        except Exception: pass
                    else: sub_final_text = chunk
                
                sub_json = extract_json_from_text(sub_final_text)
                opinion_text = ""
                confidence = 1.0
                objections = []
                if sub_json:
                    try:
                        parsed_sub = json.loads(sub_json)
                        opinion_text = parsed_sub.get("opinion", "")
                        confidence = parsed_sub.get("confidence", 1.0)
                        objections = parsed_sub.get("objections", [])
                        workspace["opinions"].append({"agent": sub_agent, "opinion": opinion_text, "confidence": confidence})
                        if parsed_sub.get("findings"): workspace["findings"].extend([{"agent": sub_agent, "finding": f} for f in parsed_sub["findings"]])
                        if parsed_sub.get("recommendations"): workspace["recommendations"].extend([{"agent": sub_agent, "recommendation": r} for r in parsed_sub["recommendations"]])
                        if parsed_sub.get("objections"): workspace["objections"].extend([dict(obj, **{"from": sub_agent}) for obj in parsed_sub["objections"]])
                    except Exception:
                        opinion_text = sub_final_text
                        workspace["opinions"].append({"agent": sub_agent, "opinion": sub_final_text})
                else:
                    opinion_text = sub_final_text
                    workspace["opinions"].append({"agent": sub_agent, "opinion": sub_final_text})

                # Now, Team Leader reports the agent's progress/conclusions in a very human, communicative report format!
                objections_summary = ""
                if objections:
                    objections_summary = "\n\n⚠️ **Objections raised:**\n" + "\n".join([f"- *Against {obj.get('against')}:* {obj.get('reason')}" for obj in objections])
                
                yield json.dumps({
                    "event_id": f"evt_cog_{int(time.time())}_summary_{sub_agent}",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "cognition",
                    "title": "Reviewing",
                    "agent": "PlanAgent",
                    "message": f"**{sub_agent.replace('_', ' ').title()}** has completed their assessment (Confidence: **{int(confidence * 100)}%**).\n\n**Their Proposal:**\n{opinion_text}{objections_summary}\n\nUpdating the team workspace...",
                    "phase": "analysis",
                    "done": True
                }) + "\n"
                
                # Wait a small delay to make it feel natural
                await asyncio.sleep(1.5)
                
            # Phase 3: Consensus
            yield emit_lifecycle("consensus", session_id)
            yield json.dumps({
                "event_id": f"evt_cog_{int(time.time())}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "cognition",
                "title": "Merging",
                "agent": "ConsensusAgent",
                "message": "All agents have contributed their assessments. I am now passing the consolidated workspace to the **ConsensusAgent** to merge proposals, resolve any objections, and compile the final store structure.",
                "phase": "layout_design",
                "done": True
            }) + "\n"
            
            await asyncio.sleep(1)
            
            consensus_runner = get_runner("consensus_agent")
            # Detect user language and pass as explicit instruction to prevent Mandarin leakage
            user_lang_instruction = f"LANGUAGE LOCK: The user's original request was: \"{request.input}\". Detect the language of this request. All `chat` fields in your JSON and any agent narrative MUST be written in that exact language. NEVER use Mandarin/Chinese unless the user wrote in Mandarin."
            consensus_messages = [{'role': 'user', 'content': [{'text': f"WORKSPACE DATA:\n{json.dumps(workspace, indent=2)}\n\n{user_lang_instruction}\n\nReview the opinions and output the final update_schema JSON for the store."}]}]
            async for chunk in execute_agent_pass(start_time, session_id, "consensus_agent", consensus_runner, consensus_messages, request):
                if isinstance(chunk, str) and chunk.endswith("\n"): yield chunk
                else: final_text = chunk

            # ── Phase 4: ReAct Schema Verification ────────────────────────────
            # Observe: Programmatically check if the schema output is complete.
            # If not, Reason about what's missing → Act: call StoreAgent to fix it.
            consensus_json_str = extract_json_from_text(final_text)
            
            def check_schema_integrity(json_str: str) -> list:
                """Returns a list of missing required sections, or empty list if complete."""
                missing = []
                if not json_str:
                    return ["entire schema (no valid JSON found)"]
                try:
                    parsed = json.loads(json_str)
                    params = parsed.get("params", parsed)
                    schema = params.get("schema", params)
                    layout = schema.get("layout", [])
                    section_types = [s.get("type") for s in layout]
                    required = ["hero", "featured_products"]
                    for req in required:
                        if req not in section_types:
                            missing.append(req)
                except Exception:
                    missing.append("entire schema (JSON parse failed)")
                return missing

            missing_sections = check_schema_integrity(consensus_json_str)
            
            if missing_sections:
                # Reason: Schema is incomplete. Log and plan correction.
                logger.warning(f"🔍 [ReAct Verify] Schema incomplete. Missing: {missing_sections}. Triggering correction pass.")
                yield json.dumps({
                    "event_id": f"evt_cog_{int(time.time())}_verify",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "cognition",
                    "title": "Verifying",
                    "agent": "StoreAgent",
                    "message": f"Schema integrity check failed. Missing sections: **{', '.join(missing_sections)}**. Triggering autonomous correction pass...",
                    "phase": "analysis",
                    "done": True
                }) + "\n"
                
                await asyncio.sleep(0.5)

                # Act: Call StoreAgent with a targeted correction prompt.
                correction_runner = get_runner("store_agent")
                correction_prompt = (
                    f"The ConsensusAgent produced an incomplete store schema for the goal: \"{request.input}\".\n"
                    f"The following required sections are MISSING: {missing_sections}.\n\n"
                    f"Current (incomplete) output:\n{final_text}\n\n"
                    f"Your task: Output a COMPLETE and VALID `update_schema` JSON that includes ALL missing sections. "
                    f"Do not explain — just produce the corrected JSON immediately.\n\n"
                    f"{user_lang_instruction}"
                )
                correction_messages = [{'role': 'user', 'content': [{'text': correction_prompt}]}]
                
                correction_final_text = ""
                async for chunk in execute_agent_pass(start_time, session_id, "store_agent", correction_runner, correction_messages, request):
                    if isinstance(chunk, str) and chunk.endswith("\n"): yield chunk
                    else: correction_final_text = chunk

                # Observe: Use corrected output if it's more complete
                corrected_json_str = extract_json_from_text(correction_final_text)
                still_missing = check_schema_integrity(corrected_json_str)
                
                if not still_missing:
                    logger.info("✅ [ReAct Verify] Correction pass succeeded. Using corrected schema.")
                    final_text = correction_final_text
                    yield json.dumps({
                        "event_id": f"evt_cog_{int(time.time())}_fixed",
                        "timestamp": int(time.time()),
                        "session_id": session_id,
                        "type": "cognition",
                        "title": "Verifying",
                        "agent": "StoreAgent",
                        "message": "Schema correction successful. All required sections are now present. ✅",
                        "phase": "analysis",
                        "done": True
                    }) + "\n"
                else:
                    logger.error(f"❌ [ReAct Verify] Correction pass still incomplete. Missing: {still_missing}. Proceeding with best available output.")
                    yield json.dumps({
                        "event_id": f"evt_cog_{int(time.time())}_partial",
                        "timestamp": int(time.time()),
                        "session_id": session_id,
                        "type": "cognition",
                        "title": "Verifying",
                        "agent": "StoreAgent",
                        "message": f"Correction attempted but sections still incomplete: **{', '.join(still_missing)}**. Proceeding with best available result.",
                        "phase": "analysis",
                        "done": True
                    }) + "\n"
            else:
                logger.info("✅ [ReAct Verify] Schema integrity check passed. All required sections present.")
                yield json.dumps({
                    "event_id": f"evt_cog_{int(time.time())}_verify_ok",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "cognition",
                    "title": "Verifying",
                    "agent": "StoreAgent",
                    "message": "Schema integrity verified. All required sections confirmed present. ✅",
                    "phase": "analysis",
                    "done": True
                }) + "\n"

    # ── BUYER: Direct async streaming path (bypasses qwen-agent) ──────────────
    if request.chatMode == 'buyer':
        buyer_final_text = ""
        
        # Build system prompt with memory context
        system_prompt = _BUYER_SYSTEM_PROMPT
        if mem_str:
            system_prompt += mem_str  # memory instruction already in mem_str

        # Emit "retrieving memory" badge if semantic memory was loaded
        if memories:
            yield json.dumps({
                "event_id": f"evt_mem_badge_{int(time.time())}",
                "timestamp": int(time.time()),
                "session_id": session_id,
                "type": "cognition",
                "agent": "assistant",
                "tool": "retrieving_memory",
                "message": "retrieving memory",
                "phase": "memory",
            }) + "\n"

        async for chunk in run_buyer_direct(session_id, rich_input, system_prompt, request):
            yield chunk
            # Track final text for memory write-back
            try:
                evt = json.loads(chunk.strip())
                if evt.get("type") == "final":
                    buyer_final_text = evt.get("text", "")
            except Exception:
                pass

        # Write-back to memory (async, non-blocking on response)
        try:
            await memory_manager.process_interaction(session_id, "user", request.input, domain="buyer")
            if buyer_final_text:
                await memory_manager.process_interaction(session_id, "assistant", buyer_final_text, domain="buyer")
        except Exception as e:
            logger.warning(f"Memory write-back failed: {e}")

        return  # Skip seller pipeline entirely

    elif agent_type != "plan_agent":
        # Standard Single Agent Execution — LLM decides routing naturally
        # NOTE: plan_agent already ran its full multi-agent pipeline above,
        # so we must NOT execute it again here or final_text gets overwritten.
        messages = [{'role': 'user', 'content': [{'text': rich_input}]}]
        async for chunk in execute_agent_pass(start_time, session_id, agent_type, runner, messages, request):
            if isinstance(chunk, str) and chunk.endswith("\n"): yield chunk
            else: final_text = chunk

    # Final Processing
    raw_json = extract_json_from_text(final_text)
    action = "idle"
    params = {}
    chat_out = final_text.split('```')[0].split('{')[0].strip()
    text_out = "Execution completed."
    
    if raw_json:
        try:
            data = json.loads(raw_json)
            action = data.get("action", "idle")
            params = data.get("params", {})
            if data.get("chat"):
                chat_out = data.get("chat")
            if data.get("text"):
                text_out = data.get("text")
        except Exception as e:
            logger.error(f"JSON Decode Error in final output: {e}\nRaw JSON was: {raw_json}\nFull text was: {final_text}")
    else:
        logger.error(f"Failed to extract JSON from final output! Full text was: {final_text}")
        chat_out = final_text

    if action in ["batch_create", "update_schema", "update_philosophy"]:
        schema = params.get("schema")
        if not schema:
            schema = dict(params)
        if "layout" not in schema: schema["layout"] = []
        
        # ── Fix: Map top-level brand fields into the schema layout sections ──
        store_name    = params.get("store_name") or params.get("title")
        hero_headline = params.get("hero_headline") or params.get("title")
        hero_desc     = params.get("hero_description") or params.get("subtitle")
        cta_primary   = params.get("cta_primary") or params.get("buttonText")
        hero_img_prompt = params.get("heroImagePrompt")
        theme_color   = params.get("themeColor")
        hero_bg       = params.get("heroBg")
        
        for sec in schema["layout"]:
            if sec.get("type") == "header" and store_name:
                sec.setdefault("props", {})
                sec["props"]["title"] = store_name
            if sec.get("type") == "hero":
                sec.setdefault("props", {})
                if store_name:
                    sec["props"]["title"] = store_name
                if hero_headline:
                    sec["props"]["collection"] = hero_headline
                if hero_desc:
                    sec["props"]["subtitle"] = hero_desc
                if cta_primary:
                    sec["props"]["buttonText"] = cta_primary
                if hero_img_prompt and not sec["props"].get("heroImagePrompt"):
                    sec["props"]["heroImagePrompt"] = hero_img_prompt
        
        # Ensure metadata has the brand name for store list registration
        schema.setdefault("metadata", {})
        if store_name: schema["metadata"]["brand_identity"] = store_name

        # Put updated schema back into params
        params["schema"] = schema

    def restore_assets(obj, visited=None):
        if visited is None: visited = set()
        if id(obj) in visited: return
        visited.add(id(obj))
        
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, str) and v in ASSET_STORE: obj[k] = ASSET_STORE[v]
                elif isinstance(v, (dict, list)): restore_assets(v, visited)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                if isinstance(v, str) and v in ASSET_STORE: obj[i] = ASSET_STORE[v]
                elif isinstance(v, (dict, list)): restore_assets(v, visited)
    restore_assets(params)

    # 1. Dual Output System: Instant UI Render
    # IMPORTANT: schema_preview MUST come before asset generation so the 
    # frontend can render the store skeleton immediately. Images stream in after.
    yield emit_lifecycle("ui_ready", session_id)
    yield json.dumps({
        "event_id": f"evt_preview_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "schema_preview",
        "action": action,
        "params": params,
    }) + "\n"

    # 2. Asset Generation (after schema_preview so store renders immediately)
    if action in ["batch_create", "update_schema", "update_philosophy"]:
        schema = params.get("schema", {}) or params
        needs_gen = False
        for sec in schema.get("layout", []):
            st = sec.get("type")
            props = sec.get("props", {})
            if st == "hero" and props.get("heroImagePrompt") and (not props.get("heroImage") or "unsplash.com" in str(props.get("heroImage", ""))): needs_gen = True
            elif st == "featured_products":
                for p in props.get("products", []):
                    if isinstance(p, dict) and not p.get("verifiedUrl") and (not p.get("imageUrl") or "unsplash.com" in str(p.get("imageUrl", ""))): needs_gen = True
            elif st == "philosophy":
                for item in props.get("items", []):
                    if isinstance(item, dict) and not item.get("verifiedUrl") and (not item.get("imageUrl") or "unsplash.com" in str(item.get("imageUrl", ""))): needs_gen = True
            # Note: video_landscape and video_vertical are EXCLUDED from default generation pipeline.
            # Videos are only generated on explicit user request via change_landscape_video / change_vertical_video.
                        
        if needs_gen:
            try:
                async for chunk in fallback_asset_generation(schema, session_id, action, params):
                    yield chunk
                    
                # Re-emit the schema preview now that params has the generated URLs
                yield json.dumps({
                    "event_id": f"evt_preview_final_{int(time.time())}",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "schema_preview",
                    "action": action,
                    "params": params,
                }) + "\n"
            except Exception as e:
                import traceback
                err_trace = traceback.format_exc()
                logger.error(f"Asset generation error: {str(e)}\n{err_trace}")
                yield json.dumps({
                    "event_id": f"evt_asset_error_{int(time.time())}",
                    "timestamp": int(time.time()),
                    "session_id": session_id,
                    "type": "cognition",
                    "title": "Error",
                    "agent": "ImageProductAgent",
                    "message": f"Asset generation crashed with error: **{str(e)}**. Store layout was saved but some images may be missing. You can retry individual images from the store editor.",
                    "phase": "asset_generation",
                    "done": True
                }) + "\n"
                # Do NOT overwrite params — keep the schema intact
                if "failed_assets" not in params:
                    params["failed_assets"] = [{"itemId": "unknown", "error": str(e)}]

    # ── Compute actual asset generation outcome for Spokesperson ──────────────
    failed_assets = params.get("failed_assets", [])
    asset_generation_status = "success" if not failed_assets else f"partial_failure ({len(failed_assets)} images failed)"

    # 2. Dual Output System: Async Spokesperson Narration
    # For ALL actions (including idle), use the Spokesperson Agent to report the result consistently
    opinions = workspace["opinions"] if 'workspace' in locals() else []
    agreement_map = {o.get("agent", "unknown"): ("strong support" if o.get("confidence", 0) > 0.8 else "conditional support") for o in opinions}
    
    spokesperson_input = {
        "chat_mode": request.chatMode,
        "sync_anchor": {"event_id": f"evt_preview_{int(time.time())}", "ui_status": "rendered"},
        "goal": request.input,
        "final_decision": action,
        "final_parameters": params,
        "decision_rationale": workspace["recommendations"] if 'workspace' in locals() else [],
        "conflict_summary": workspace["objections"] if 'workspace' in locals() else [],
        "agent_agreement_map": agreement_map,
        "backend_agent_message": chat_out if chat_out else None,
        # CRITICAL: This field is the GROUND TRUTH. Spokesperson MUST reflect this exactly.
        "asset_generation_status": asset_generation_status,
        "failed_assets_after_retries": failed_assets,
        "INSTRUCTION_FOR_SPOKESPERSON": (
            "CRITICAL HONESTY RULE: You MUST read the `asset_generation_status` field above before writing your report. "
            "If it contains 'partial_failure', you MUST acknowledge that some images failed to generate. "
            "NEVER claim 'all visual assets have passed generation protocols' if `asset_generation_status` is not 'success'. "
            "If there are failed assets, tell the user clearly which ones failed and suggest they retry from the store editor."
        )
    }
    
    if request.chatMode == "buyer":
        spokesperson_text = chat_out
    else:
        try:
            spokesperson_runner = get_runner("spokesperson_agent")
            
            # Pass the user's explicit language instruction to spokesperson as well
            user_lang_instruction = f"LANGUAGE LOCK: The user's original request was: \"{request.input}\". Detect the language of this request. Your ENTIRE response MUST be written in that exact language."
            spokesperson_msgs = [{'role': 'user', 'content': [{'text': f"STRICT NARRATIVE PAYLOAD:\n{json.dumps(spokesperson_input, indent=2)}\n\n{user_lang_instruction}"}]}]
            
            yield emit_lifecycle("narrating", session_id)
            
            spokesperson_text = ""
            async for chunk in execute_agent_pass(start_time, session_id, "spokesperson_agent", spokesperson_runner, spokesperson_msgs, request):
                if isinstance(chunk, str) and chunk.endswith("\n"): 
                    yield chunk
                else:
                    spokesperson_text = chunk
                    
        except Exception as e:
            import traceback
            err_msg = f"Spokesperson Error: {e}\n{traceback.format_exc()}"
            logger.error(err_msg)
            spokesperson_text = err_msg

    # 3. Final event to close the transaction
    yield emit_lifecycle("completed", session_id)
    
    yield json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "agent": agent_type,
        "action": action,
        "params": params,
        "text": spokesperson_text,
        "chat": spokesperson_text
    }) + "\n"
