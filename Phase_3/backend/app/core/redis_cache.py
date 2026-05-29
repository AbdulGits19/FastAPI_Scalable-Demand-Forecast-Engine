import os
import json
import redis
from typing import Optional

# Pull Redis URL parameter from environment, matching your Celery setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6333/0")

try:
    # Initialize connection state with Redis
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"⚠️ Redis Connection Failed: Cache operating in bypassed fallback mode. Error: {str(e)}")
    redis_client = None

def get_cached_data(key: str) -> Optional[dict]:
    """
    Fetches raw string payloads from Redis memory and converts them back to dict arrays.
    """
    if not redis_client:
        return None
    try:
        cached_value = redis_client.get(key)
        if cached_value:
            print(f"⚡ Cache HIT for key: {key}")
            return json.loads(cached_value)
    except Exception:
        pass
    return None

def set_cached_data(key: str, data: dict, ttl_seconds: int = 60):
    """
    Caches stringified JSON objects into Redis with a strict Time-To-Live boundary expiration.
    """
    if not redis_client:
        return
    try:
        redis_client.setex(
            key,
            ttl_seconds,
            json.dumps(data)
        )
        print(f"💾 Cache MISS! Serialized fresh metrics to key: {key} (TTL: {ttl_seconds}s)")
    except Exception:
        pass