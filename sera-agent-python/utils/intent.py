import re

def classify_intent_local(user_input: str) -> str | None:
    """Fast heuristic layer to catch simple greetings and bypass LLM inference."""
    cleaned = re.sub(r'[^\w\s]', '', user_input.lower()).strip()
    
    greetings = {"hey", "hi", "hello", "halo", "hai", "helo", "yo", "morning", "pagi", "siang", "sore", "malam"}
    thanks = {"thanks", "thank you", "makasih", "terima kasih", "thx", "ok", "okay", "sip", "mantap", "good"}
    identity = {"who", "what", "siapa", "apa"}
    
    words = set(cleaned.split())
    if len(words) <= 4:
        if words.intersection(greetings):
            return "CONVERSATIONAL_GREETING"
        if words.intersection(thanks):
            return "CONVERSATIONAL_THANKS"
        if words.intersection(identity) and ("are" in words or "you" in words or "kamu" in words):
            return "CONVERSATIONAL_IDENTITY"
            
    return None

async def classify_intent(user_input: str) -> str:
    """Classifies user intent using a fast Deepseek LLM router, with local heuristics for greetings."""
    local_intent = classify_intent_local(user_input)
    if local_intent:
        return local_intent
        
    import os
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        api_key=os.environ.get('QWEN_API_KEY') or os.environ.get('DASHSCOPE_API_KEY'),
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )
    
    prompt = f"""You are an intent classification router for an e-commerce AI system.
Categorize the user's input into exactly ONE of these three intents:
1. EXECUTION : The user wants to perform an action, search for products, view stores, check prices, build a store, or analyze data.
2. REASONING : The user is asking a conceptual, strategic, or "how-to" question that requires deep thought.
3. CONVERSATIONAL : The user is just chatting, greeting, or making small talk.

User input: "{user_input}"

Output ONLY the exact intent word (EXECUTION, REASONING, or CONVERSATIONAL). Do not output any other text or punctuation."""

    try:
        response = await client.chat.completions.create(
            model='deepseek-v4-flash',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
            temperature=0.0
        )
        result = response.choices[0].message.content.strip().upper()
        
        # Cleanup in case the model adds extra text
        for valid_intent in ["EXECUTION", "REASONING", "CONVERSATIONAL"]:
            if valid_intent in result:
                return valid_intent
                
        return "CONVERSATIONAL"
    except Exception as e:
        print(f"Error in LLM intent routing: {e}")
        # Absolute fallback if API fails
        fallback_kws = ["toko", "store", "cari", "beli", "harga", "produk", "build", "create", "analyze"]
        return "EXECUTION" if any(kw in user_input.lower() for kw in fallback_kws) else "CONVERSATIONAL"
