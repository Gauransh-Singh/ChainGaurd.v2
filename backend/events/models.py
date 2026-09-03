from enum import Enum
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import uuid

class EventType(str, Enum):
    SHIPMENT_STARTED = "SHIPMENT_STARTED"
    SHIPMENT_MOVED = "SHIPMENT_MOVED"
    SHIPMENT_DELAYED = "SHIPMENT_DELAYED"
    CRISIS_DETECTED = "CRISIS_DETECTED"
    ROUTE_BLOCKED = "ROUTE_BLOCKED"
    ALTERNATIVES_GENERATED = "ALTERNATIVES_GENERATED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    STRATEGY_APPROVED = "STRATEGY_APPROVED"
    ROUTE_UPDATED = "ROUTE_UPDATED"
    RECOVERY_STARTED = "RECOVERY_STARTED"
    RECOVERY_COMPLETED = "RECOVERY_COMPLETED"
    CUSTOMS_VERIFIED = "CUSTOMS_VERIFIED"
    SHIPMENT_ARRIVED = "SHIPMENT_ARRIVED"
    SHIPMENT_ACCEPTED = "SHIPMENT_ACCEPTED"
    ESCROW_RELEASED = "ESCROW_RELEASED"
    BLOCK_CREATED = "BLOCK_CREATED"
    CHAIN_VALID = "CHAIN_VALID"
    TAMPERING_DETECTED = "TAMPERING_DETECTED"
    SHIPMENT_REJECTED = "SHIPMENT_REJECTED"

class EventSeverity(str, Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class Event(BaseModel):
    id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8]}")
    type: EventType
    shipment_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    actor: str
    severity: EventSeverity = EventSeverity.INFO
    title: str
    message: str
    payload: Dict[str, Any] = Field(default_factory=dict)
