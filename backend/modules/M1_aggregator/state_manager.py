import json
import logging
from typing import Optional, Dict, Any
import redis.asyncio as redis

logger = logging.getLogger("state_manager")

class AggregationSaga:
    """
    Gère l'état d'avancement d'une demande d'agrégation (Saga Pattern).
    Utilise des Hash Redis pour la persistance temporaire (30 min).
    Fallback en mémoire si Redis est indisponible.
    """
    _memory_store = {}

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client
        self.use_memory = redis_client is None

    def _key(self, request_id: str) -> str:
        return f"saga:{request_id}"

    async def init_state(self, request_id: str, msisdn: str):
        from datetime import datetime
        state = {
            "msisdn": msisdn,
            "orange_status": "pending",
            "mtn_status": "pending",
            "score_status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        if self.use_memory:
            self._memory_store[self._key(request_id)] = state
        else:
            try:
                await self.redis.hset(self._key(request_id), mapping=state)
                await self.redis.expire(self._key(request_id), 1800)
            except Exception:
                self.use_memory = True
                self._memory_store[self._key(request_id)] = state
        
        logger.info(f"🆕 Saga initialisée pour {request_id} ({msisdn}) {'(MEMORY)' if self.use_memory else '(REDIS)'}")

    async def update_provider_data(self, request_id: str, provider: str, data: Dict[str, Any]):
        if self.use_memory:
            key = self._key(request_id)
            if key in self._memory_store:
                self._memory_store[key][f"{provider}_status"] = "received"
                self._memory_store[f"data:{request_id}:{provider}"] = data
        else:
            try:
                await self.redis.hset(self._key(request_id), f"{provider}_status", "received")
                await self.redis.set(f"data:{request_id}:{provider}", json.dumps(data), ex=1800)
            except Exception:
                pass
        
        logger.info(f"✅ Données {provider} reçues pour {request_id}")
        return await self.is_complete(request_id)

    async def is_complete(self, request_id: str) -> bool:
        if self.use_memory:
            state = self._memory_store.get(self._key(request_id), {})
        else:
            try:
                state = await self.redis.hgetall(self._key(request_id))
            except Exception:
                state = self._memory_store.get(self._key(request_id), {})
        
        return (state.get("orange_status") == "received" and 
                state.get("mtn_status") == "received")

    async def get_state(self, request_id: str) -> Dict[str, str]:
        if self.use_memory:
            return self._memory_store.get(self._key(request_id), {})
        try:
            return await self.redis.hgetall(self._key(request_id))
        except Exception:
            return self._memory_store.get(self._key(request_id), {})

    async def set_final_score(self, request_id: str, score_data: Dict[str, Any]):
        if self.use_memory:
            key = self._key(request_id)
            if key in self._memory_store:
                self._memory_store[key]["score_status"] = "completed"
                self._memory_store[key]["final_result"] = json.dumps(score_data)
        else:
            try:
                await self.redis.hset(self._key(request_id), mapping={
                    "score_status": "completed",
                    "final_result": json.dumps(score_data)
                })
            except Exception:
                pass
        logger.info(f"🏁 Saga terminée pour {request_id}")
