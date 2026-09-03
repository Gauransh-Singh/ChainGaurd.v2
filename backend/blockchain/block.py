from datetime import datetime, timezone
from typing import Any, Dict
from pydantic import BaseModel, Field
from backend.blockchain.hashing import calculate_sha256

class Block(BaseModel):
    index: int
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: str
    shipment_id: str
    actor: str
    data: Dict[str, Any]
    previous_hash: str
    hash: str
    signature: str = "ECDSA_SECP256K1_SIMULATED_SIG"

    @classmethod
    def create(cls, index: int, event_type: str, shipment_id: str, actor: str, data: Dict[str, Any], previous_hash: str) -> "Block":
        timestamp = datetime.now(timezone.utc).isoformat()
        calculated_hash = calculate_sha256(
            index=index,
            timestamp=timestamp,
            event_type=event_type,
            shipment_id=shipment_id,
            actor=actor,
            data=data,
            previous_hash=previous_hash
        )
        return cls(
            index=index,
            timestamp=timestamp,
            event_type=event_type,
            shipment_id=shipment_id,
            actor=actor,
            data=data,
            previous_hash=previous_hash,
            hash=calculated_hash,
            signature=f"SIG_{calculated_hash[:12]}_{actor.upper()}"
        )
