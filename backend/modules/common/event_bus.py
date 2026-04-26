import json
import logging
from typing import Optional, Callable, Any
import redis
from redis import asyncio as redis_async

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("event_bus")

class EventBus:
    """
    Utilitaire pour gérer les Redis Streams (Bus d'événements).
    Permet de publier et de s'abonner aux flux avec persistance.
    """
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.client: Optional[redis_async.Redis] = None

    async def connect(self):
        if not self.client:
            self.client = await redis_async.from_url(self.redis_url, decode_responses=True)
            logger.info(f"🔌 Connecté au Event Bus Redis : {self.redis_url}")

    async def publish(self, stream_name: str, event_data: dict, max_len: int = 1000):
        """Publie un événement dans un flux."""
        if not self.client:
            await self.connect()
        
        # On convertit tout en string/json pour le stream
        payload = {k: (json.dumps(v) if isinstance(v, (dict, list)) else str(v)) 
                   for k, v in event_data.items()}
        
        event_id = await self.client.xadd(stream_name, payload, maxlen=max_len)
        logger.debug(f"📤 Événement publié dans {stream_name} (ID: {event_id})")
        return event_id

    async def listen(self, stream_name: str, handler: Callable[[dict], Any], group_name: Optional[str] = None):
        """
        Écoute un flux et exécute un handler pour chaque message.
        Supporte les Consumer Groups pour la répartition de charge.
        """
        if not self.client:
            await self.connect()

        # Création du groupe si spécifié et s'il n'existe pas
        if group_name:
            try:
                await self.client.xgroup_create(stream_name, group_name, id="0", mkstream=True)
            except redis.exceptions.ResponseError:
                pass # Déjà existant

        logger.info(f"👂 Écoute du flux {stream_name}...")
        last_id = "0" if not group_name else ">"

        while True:
            try:
                # Lecture (bloquante pendant 5s)
                if group_name:
                    streams = await self.client.xreadgroup(group_name, "worker-1", {stream_name: ">"}, count=1, block=5000)
                else:
                    streams = await self.client.xread({stream_name: last_id}, count=1, block=5000)

                for stream, messages in streams:
                    for msg_id, data in messages:
                        logger.info(f"📥 Message reçu [{msg_id}]")
                        await handler(data)
                        
                        # Ack si on est dans un groupe
                        if group_name:
                            await self.client.xack(stream_name, group_name, msg_id)
                        
                        if not group_name:
                            last_id = msg_id

            except Exception as e:
                logger.error(f"❌ Erreur lors de l'écoute du flux {stream_name}: {e}")
                import asyncio
                await asyncio.sleep(2)
