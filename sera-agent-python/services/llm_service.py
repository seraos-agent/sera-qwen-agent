import os
import json
import time

def generate_text_sync(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(
        api_key=os.environ.get('QWEN_API_KEY') or os.environ.get('DASHSCOPE_API_KEY'),
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )
    try:
        response = client.chat.completions.create(
            model='qwen-plus',
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        import logging
        logging.error(f"Error in generate_text_sync: {e}")
        return prompt  # fallback to original prompt


def handle_conversational_greeting(session_id: str, chat_mode: str = "agent"):
    if chat_mode == "buyer":
        final_text = "**Hello!** What are you looking for today?"
    else:
        final_text = "**Hey** \u2014 what would you like to build today?"
        
    return json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "action": "idle",
        "params": {},
        "text": final_text,
    }) + "\n"

def handle_conversational_thanks(session_id: str):
    final_text = "**You're welcome!** Let me know if there is anything else I can optimize for you."
    return json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "action": "idle",
        "params": {},
        "text": final_text,
    }) + "\n"

def handle_conversational_identity(session_id: str, chat_mode: str = "agent"):
    if chat_mode == "buyer":
        final_text = "I am SERA, your friendly and smart shopping companion. How can I pamper your shopping experience today?"
    else:
        final_text = "I am SERA, an autonomous AI operating system designed for premium commerce creation. What would you like to build?"
        
    return json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "action": "idle",
        "params": {},
        "text": final_text,
    }) + "\n"

def handle_conversational(session_id: str, user_input: str, chat_mode: str = "agent"):
    _dir = os.path.dirname(os.path.dirname(__file__))
    
    if chat_mode == "buyer":
        persona_text = open(os.path.join(_dir, "agents", "prompts", "sera_buyer_persona.txt"), encoding="utf-8").read()
        cap_text = "- You are a luxury shopping companion. Help the user discover products and navigate the store with elegance and warmth."
    else:
        persona_text = open(os.path.join(_dir, "agents", "prompts", "sera_persona.txt"), encoding="utf-8").read()
        cap_text = "- You can build and design full e-commerce storefronts.\n- You CAN generate raw image assets AND raw video assets (.mp4) using Tongyi Wanx AI. If the user asks if you can make a video, say YES! You can generate both cinematic landscape videos and vertical TikTok-style videos."
        
    prompt = f"{persona_text}\n\nIMPORTANT KNOWLEDGE ABOUT YOUR CAPABILITIES:\n{cap_text}\n\nThe user said: '{user_input}'. \n\nRespond directly, concisely, and naturally. Do NOT introduce yourself or say 'I am an AI' unless they explicitly ask who you are."
    from openai import OpenAI
    client = OpenAI(
        api_key=os.environ.get('QWEN_API_KEY') or os.environ.get('DASHSCOPE_API_KEY'),
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )
    try:
        response = client.chat.completions.create(
            model='qwen3.6-flash',
            messages=[{"role": "user", "content": prompt}]
        )
        final_text = response.choices[0].message.content
    except Exception as e:
        final_text = "Hello! I am ready to operate."
    
    return json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "action": "idle",
        "params": {},
        "text": final_text,
    }) + "\n"

def handle_reasoning(session_id: str, user_input: str, chat_mode: str = "agent"):
    if chat_mode == "buyer":
        prompt = f"You are SERA, a highly intelligent and friendly shopping concierge. The user is asking a reasoning question about products or shopping: '{user_input}'. Provide a helpful, warm, marketing-savvy reasoning response without full markdown blocks or code. Keep it elegant."
    else:
        prompt = f"You are SERA, a highly intelligent AI operating system for autonomous commerce. The user is asking a strategic/conceptual question: '{user_input}'. Provide a concise, expert-level strategic reasoning response without full markdown blocks or code."
    
    from openai import OpenAI
    client = OpenAI(
        api_key=os.environ.get('QWEN_API_KEY') or os.environ.get('DASHSCOPE_API_KEY'),
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )
    try:
        response = client.chat.completions.create(
            model='deepseek-v4-flash',
            messages=[{"role": "user", "content": prompt}],
            extra_body={"enable_thinking": True}
        )
        final_text = response.choices[0].message.content
    except Exception as e:
        final_text = "Reasoning module completed."
    
    return json.dumps({
        "event_id": f"evt_final_{int(time.time())}",
        "timestamp": int(time.time()),
        "session_id": session_id,
        "type": "final",
        "action": "idle",
        "params": {},
        "text": final_text,
    }) + "\n"
