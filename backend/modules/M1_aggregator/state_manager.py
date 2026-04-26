import json
import logging
from typing import Optional, Dict, Any
import redis.asyncio as redis

logger = logging.getLogger("state_manager")

class AggregationSaga:
    """
    Gère l'état d'avancement d'une demande d'agrégation (Saga Pattern).
    Utilise des Hash Redis pour la persistance temporaire (30 min).
    """
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    def _key(self, request_id: str) -> str:
        return f"saga:{request_id}"

    async def init_state(self, request_id: str, msisdn: str):
        """Initialise le suivi pour une nouvelle demande."""
        state = {
            "msisdn": msisdn,
            "orange_status": "pending",
            "mtn_status": "pending",
            "score_status": "pending",
            "created_at": str(datetime.utcnow())
        }
        # On évite l'import circulaire en utilisant datetime ici
        from datetime import datetime
        state["created_at"] = datetime.utcnow().isoformat()

        await self.redis.hset(self._key(request_id), mapping=state)
        await self.redis.expire(self._key(request_id), 1800) # TTL 30 minutes
        logger.info(f"🆕 Saga initialisée pour {request_id} ({msisdn})")

    async def update_provider_data(self, request_id: str, provider: str, data: Dict[str, Any]):
        """
        Met à jour l'état quand un simulateur répond.
        Stocke la donnée brute dans une clé séparée pour ne pas surcharger le Hash.
        """
        # Mise à jour du statut dans le Hash
        await self.redis.hset(self._key(request_id), f"{provider}_status", "received")
        
        # Stockage de la donnée brute
        await self.redis.set(f"data:{request_id}:{provider}", json.dumps(data), ex=1800)
        logger.info(f"✅ Données {provider} reçues pour {request_id}")
        
        return await self.is_complete(request_id)

    async def is_complete(self, request_id: str) -> bool:
        """Vérifie si Orange et MTN ont tous les deux répondu."""
        state = await self.redis.hgetall(self._key(request_id))
        return (state.get("orange_status") == "received" and 
                state.get("mtn_status") == "received")

    async def get_state(self, request_id: str) -> Dict[str, str]:
        """Retourne l'état actuel pour le polling du frontend."""
        return await self.redis.hgetall(self._key(request_id))

    async def set_final_score(self, request_id: str, score_data: Dict[str, Any]):
        """Marque la saga comme terminée avec le score final."""
        await self.redis.hset(self._key(request_id), mapping={
            "score_status": "completed",
            "final_result": json.dumps(score_data)
        })
        logger.info(f"🏁 Saga terminée pour {request_id}")
