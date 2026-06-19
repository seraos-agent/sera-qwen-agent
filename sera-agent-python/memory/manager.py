import os
import json
import time
import threading
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import motor.motor_asyncio
from utils.logger import logger


# ─── Local JSON Fallback ──────────────────────────────────────────────────────
class LocalMemoryFallback:
    """Thread-safe JSON file fallback when MongoDB is unavailable."""

    _lock = threading.Lock()

    def __init__(self):
        self._path = os.path.join(os.path.dirname(__file__), "..", "data", "local_memory.json")
        self._path = os.path.abspath(self._path)
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self._path), exist_ok=True)
        if not os.path.exists(self._path):
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump({"semantic": [], "working": {}}, f)

    def _load(self) -> dict:
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"semantic": [], "working": {}}

    def _save(self, data: dict):
        with open(self._path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, default=str, indent=2)

    # ── Semantic Memory ──────────────────────────────────────────────────────
    def upsert_semantic(self, mem_dict: dict):
        with self._lock:
            data = self._load()
            semantic = data.get("semantic", [])
            # Find existing by domain + entity + type
            for i, existing in enumerate(semantic):
                if (existing.get("domain") == mem_dict.get("domain") and
                        existing.get("entity") == mem_dict.get("entity") and
                        existing.get("type") == mem_dict.get("type")):
                    semantic[i] = mem_dict
                    data["semantic"] = semantic
                    self._save(data)
                    return
            semantic.append(mem_dict)
            data["semantic"] = semantic
            self._save(data)

    def get_semantic_by_domain(self, domain: str) -> List[dict]:
        data = self._load()
        return [m for m in data.get("semantic", []) if m.get("domain") == domain]

    # ── Working Memory ───────────────────────────────────────────────────────
    def append_working(self, session_id: str, role: str, content: str):
        with self._lock:
            data = self._load()
            working = data.get("working", {})
            msgs = working.get(session_id, [])
            msgs.append({"role": role, "content": content, "ts": str(datetime.utcnow())})
            # Keep only last 50 messages per session
            working[session_id] = msgs[-50:]
            data["working"] = working
            self._save(data)

    def get_working(self, session_id: str, limit: int = 20) -> List[dict]:
        data = self._load()
        msgs = data.get("working", {}).get(session_id, [])
        return [{"role": m["role"], "content": m["content"]} for m in msgs[-limit:]]

@dataclass
class MemoryObject:
    type: str           # preference, goal, fact, project, behavior, insight
    domain: str         # buyer, seller, system
    entity: str         # e.g., "coffee", "budget"
    value: str          # e.g., "arabica", "1000000"
    confidence: float   # 0.0 to 1.0
    importance: float   # 0.0 to 1.0
    created_at: datetime
    last_confirmed: datetime
    decay_score: float  # 0.0 to 1.0
    source: str         # "conversation", "system", "inference"

class WorkingMemoryLayer:
    """Short-term session memory for fast context retrieval."""
    def __init__(self, db):
        self.collection = db.working_memory

    async def append(self, session_id: str, role: str, content: str):
        msg = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "created_at": datetime.utcnow()
        }
        await self.collection.insert_one(msg)

    async def get(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"session_id": session_id}).sort("created_at", 1).limit(limit)
        messages = []
        async for doc in cursor:
            messages.append({"role": doc["role"], "content": doc["content"]})
        return messages

    async def clear(self, session_id: str):
        await self.collection.delete_many({"session_id": session_id})
        
    async def setup_indexes(self):
        # Create TTL index on created_at to expire documents after 24 hours (86400 seconds)
        await self.collection.create_index("created_at", expireAfterSeconds=86400)
        logger.info("🕒 Working Memory TTL Index setup complete (86400s).")


class ExperienceEventLayer:
    """Immutable event log for actions, decisions, and system events."""
    def __init__(self, db):
        self.collection = db.experience_memory

    async def log_event(self, session_id: str, event_type: str, data: Dict[str, Any]):
        event = {
            "session_id": session_id,
            "type": event_type,
            "data": data,
            "data": data,
            "created_at": datetime.utcnow()
        }
        await self.collection.insert_one(event)


class SemanticMemoryLayer:
    """Long-term knowledge storage (preferences, intents)."""
    def __init__(self, db):
        self.collection = db.semantic_memory

    async def upsert_memory(self, memory: MemoryObject):
        # We find existing memory by entity and type in the same domain
        query = {"domain": memory.domain, "entity": memory.entity, "type": memory.type}
        
        doc = asdict(memory)
        # Future: handle embeddings here
        
        await self.collection.update_one(
            query,
            {"$set": doc},
            upsert=True
        )

    async def search_relevant(self, domain: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        # This base search is now replaced by CognitiveMemoryManager.get_semantic_context
        # which implements the advanced Retrieval Score.
        cursor = self.collection.find({"domain": domain})
        results = []
        async for doc in cursor:
            results.append(doc)
        return results


class InsightEngine:
    """Aggregation layer for cross-user intelligence."""
    def __init__(self, db):
        self.db = db

    async def get_popular_intents(self) -> List[Dict[str, Any]]:
        # Placeholder for MongoDB aggregation pipeline
        return []


class MemoryPolicyEngine:
    """Rules engine to decide what to remember and when to forget."""
    
    def should_remember_as_event(self, content: str, role: str) -> bool:
        if role == "assistant" and ("Executing" in content or "decision" in content.lower()):
            return True
        return False
        
    def calculate_decay(self, memory_doc: Dict[str, Any]) -> float:
        """Calculate new decay score based on time since last_confirmed."""
        last_confirmed = memory_doc.get("last_confirmed")
        if not last_confirmed:
            return memory_doc.get("decay_score", 1.0)
            
        # Example decay: 10% decay per week (7 days)
        days_passed = (datetime.utcnow() - last_confirmed).days
        decay_factor = 1.0 - (0.1 * (days_passed / 7.0))
        new_decay = max(0.1, min(1.0, decay_factor))
        return new_decay
        
    def reinforce_score(self, current_importance: float, current_confidence: float) -> tuple[float, float]:
        """Boost importance and confidence when memory is reinforced."""
        # Boost importance by 20%, max 1.0
        new_importance = min(1.0, current_importance + 0.2)
        # Boost confidence by 10%, max 1.0
        new_confidence = min(1.0, current_confidence + 0.1)
        return new_importance, new_confidence

    def extract_memory_objects(self, content: str, domain: str) -> List[MemoryObject]:
        """
        Phase 2 Heuristic Extractor: Preference, Goal, Fact, Behavior, Project
        """
        content_lower = content.lower()
        memories = []
        now = datetime.utcnow()
        
        def create_mem(m_type, entity, kw):
            # Extract raw value after the keyword
            parts = content_lower.split(kw, 1)
            raw_val = parts[1].strip() if len(parts) > 1 else content
            return MemoryObject(
                type=m_type, domain=domain, entity=entity, value=raw_val,
                confidence=0.9, importance=0.8, created_at=now, last_confirmed=now, decay_score=1.0, source="conversation"
            )

        if any(kw in content_lower for kw in ["membangun", "bikin", "buat", "rencana"]):
            # Project memory
            for kw in ["membangun", "bikin", "buat", "rencana"]:
                if kw in content_lower:
                    memories.append(create_mem("project", "current_project", kw))
                    break
        elif any(kw in content_lower for kw in ["budget", "anggaran", "dana"]):
            # Fact memory
            for kw in ["budget", "anggaran", "dana"]:
                if kw in content_lower:
                    memories.append(create_mem("fact", "financial_fact", kw))
                    break
        elif any(kw in content_lower for kw in ["selalu", "sering", "biasanya"]):
            # Behavior memory
            for kw in ["selalu", "sering", "biasanya"]:
                if kw in content_lower:
                    memories.append(create_mem("behavior", "user_habit", kw))
                    break
        elif any(kw in content_lower for kw in ["suka", "prefer", "like", "favorit"]):
            # Preference memory
            for kw in ["suka", "prefer", "like", "favorit"]:
                if kw in content_lower:
                    memories.append(create_mem("preference", "likes_item", kw))
                    break
        elif any(kw in content_lower for kw in ["butuh", "cari", "ingin", "mau"]):
            # Goal memory
            for kw in ["butuh", "cari", "ingin", "mau"]:
                if kw in content_lower:
                    memories.append(create_mem("goal", "search_intent", kw))
                    break
            
        return memories


class CognitiveMemoryManager:
    """Main orchestrator for the memory architecture."""
    def __init__(self):
        mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
        self.client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
        self.db = self.client.sera_memory
        
        self.working_memory = WorkingMemoryLayer(self.db)
        self.experience_memory = ExperienceEventLayer(self.db)
        self.semantic_memory = SemanticMemoryLayer(self.db)
        self.intelligence_layer = InsightEngine(self.db)
        self.policy_engine = MemoryPolicyEngine()
        
        # JSON fallback — always available, no dependency on MongoDB
        self.local_fallback = LocalMemoryFallback()
        self._mongo_ok = True  # will be set False on first failure
        
        logger.info("🧠 Cognitive Memory Manager initialized connected to MongoDB")

    async def process_interaction(self, session_id: str, role: str, content: str, domain: str = "general"):
        try:
            # ── Working Memory ──────────────────────────────────────────────
            if self._mongo_ok:
                try:
                    await self.working_memory.append(session_id, role, content)
                except Exception:
                    self._mongo_ok = False
                    logger.warning("⚠️ MongoDB unavailable — switching to local JSON fallback")
                    self.local_fallback.append_working(session_id, role, content)
            else:
                self.local_fallback.append_working(session_id, role, content)

            # ── Event Log ───────────────────────────────────────────────────
            if self._mongo_ok and self.policy_engine.should_remember_as_event(content, role):
                try:
                    await self.experience_memory.log_event(session_id, "interaction", {"content": content})
                except Exception:
                    pass  # non-critical

            # ── Semantic Memory ─────────────────────────────────────────────
            if role == "user":
                memories = self.policy_engine.extract_memory_objects(content, domain)
                for mem in memories:
                    mem_dict = asdict(mem)
                    if self._mongo_ok:
                        try:
                            existing = await self.semantic_memory.collection.find_one({
                                "domain": mem.domain,
                                "entity": mem.entity,
                                "type": mem.type
                            })
                            if existing:
                                new_imp, new_conf = self.policy_engine.reinforce_score(
                                    existing.get("importance", mem.importance),
                                    existing.get("confidence", mem.confidence)
                                )
                                mem.importance = new_imp
                                mem.confidence = new_conf
                                mem.created_at = existing.get("created_at", mem.created_at)
                                logger.info(f"🧠 [Memory] Reinforced {mem.entity}: importance -> {new_imp}")
                            else:
                                logger.info(f"🧠 [Memory] New {mem.type} stored: {mem.entity} = {mem.value}")
                            await self.semantic_memory.upsert_memory(mem)
                        except Exception:
                            self._mongo_ok = False
                            logger.warning("⚠️ MongoDB write failed — writing to local JSON fallback")
                            self.local_fallback.upsert_semantic(mem_dict)
                    else:
                        # Reinforce locally if possible
                        existing_local = next(
                            (m for m in self.local_fallback.get_semantic_by_domain(domain)
                             if m.get("entity") == mem.entity and m.get("type") == mem.type),
                            None
                        )
                        if existing_local:
                            new_imp, new_conf = self.policy_engine.reinforce_score(
                                existing_local.get("importance", mem.importance),
                                existing_local.get("confidence", mem.confidence)
                            )
                            mem_dict["importance"] = new_imp
                            mem_dict["confidence"] = new_conf
                            logger.info(f"🧠 [Fallback] Reinforced {mem.entity}: importance -> {new_imp}")
                        else:
                            logger.info(f"🧠 [Fallback] New {mem.type} stored: {mem.entity} = {mem.value}")
                        self.local_fallback.upsert_semantic(mem_dict)
        except Exception as e:
            logger.error(f"Memory processing failed: {e}")

    async def setup_indexes(self):
        """Called at startup to initialize TTL and other indices."""
        try:
            await self.working_memory.setup_indexes()
            logger.info("🧠 Cognitive Memory Manager indices configured.")
        except Exception as e:
            logger.warning(f"⚠️ Could not connect to MongoDB for memory indices. Ensure MongoDB is running. Error: {str(e)}")

    async def get_context_for_agent(self, session_id: str, domain: str = "general") -> List[Dict[str, Any]]:
        # This fetches Working Memory (short-term)
        return await self.working_memory.get(session_id)
        
    async def get_semantic_context(self, domain: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Advanced Retrieval Strategy:
        Retrieval Score = (Relevance * 0.5) + (Importance * 0.3) + (Recency * 0.2)
        Falls back to local JSON when MongoDB is offline.
        """
        try:
            if self._mongo_ok:
                try:
                    all_memories = await self.semantic_memory.search_relevant(domain, query, limit=100)
                except Exception:
                    self._mongo_ok = False
                    logger.warning("⚠️ MongoDB read failed — using local JSON fallback for retrieval")
                    all_memories = self.local_fallback.get_semantic_by_domain(domain)
            else:
                all_memories = self.local_fallback.get_semantic_by_domain(domain)

            if not all_memories:
                return []

            query_lower = query.lower()
            scored_memories = []
            now = datetime.utcnow()

            for mem in all_memories:
                val_lower = mem.get("value", "").lower()
                relevance = 0.8 if any(word in val_lower for word in query_lower.split() if len(word) > 3) else 0.2
                importance = mem.get("importance", 0.5)

                last_confirmed_raw = mem.get("last_confirmed", now)
                if isinstance(last_confirmed_raw, str):
                    try:
                        last_confirmed = datetime.fromisoformat(last_confirmed_raw.replace("Z", "+00:00").split("+")[0])
                    except Exception:
                        last_confirmed = now
                elif isinstance(last_confirmed_raw, datetime):
                    last_confirmed = last_confirmed_raw
                else:
                    last_confirmed = now

                days_passed = (now - last_confirmed).days
                recency = max(0.1, 1.0 - (days_passed * 0.05))

                retrieval_score = (relevance * 0.5) + (importance * 0.3) + (recency * 0.2)
                mem["retrieval_score"] = retrieval_score
                scored_memories.append(mem)

            scored_memories.sort(key=lambda x: x["retrieval_score"], reverse=True)
            return scored_memories[:limit]

        except Exception as e:
            logger.error(f"Memory retrieval failed: {e}")
            return []
        
    async def reset_session(self, session_id: str):
        await self.working_memory.clear(session_id)
        logger.info(f"✨ Session {session_id} working memory cleared")

# Global instance
memory_manager = CognitiveMemoryManager()
