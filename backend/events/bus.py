import asyncio
from typing import Callable, List, Dict, Any
from backend.events.models import Event, EventType, EventSeverity

class EventBus:
    def __init__(self):
        self.subscribers: List[Callable[[Event], Any]] = []
        self.history: List[Event] = []
        self.max_history: int = 300

    def subscribe(self, callback: Callable[[Event], Any]):
        if callback not in self.subscribers:
            self.subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[Event], Any]):
        if callback in self.subscribers:
            self.subscribers.remove(callback)

    async def publish(self, event: Event):
        self.history.append(event)
        if len(self.history) > self.max_history:
            self.history.pop(0)

        # Notify all active subscribers
        for sub in list(self.subscribers):
            try:
                if asyncio.iscoroutinefunction(sub):
                    await sub(event)
                else:
                    sub(event)
            except Exception as e:
                print(f"[EventBus] Error dispatching to subscriber: {e}")

    def get_recent(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [e.model_dump() for e in self.history[-limit:]]
