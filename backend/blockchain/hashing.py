import hashlib
import json
from typing import Any, Dict

def canonical_json(data: Dict[str, Any]) -> str:
    return json.dumps(data, sort_keys=True, separators=(',', ':'))

def calculate_sha256(index: int, timestamp: str, event_type: str, shipment_id: str, actor: str, data: Dict[str, Any], previous_hash: str) -> str:
    payload = f"{index}#{timestamp}#{event_type}#{shipment_id}#{actor}#{canonical_json(data)}#{previous_hash}"
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()
