from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
import os

router = APIRouter(prefix="/api")

ROUTES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "custom_routes.json")

# Global dependencies injected by init_api
_engine = None
_blockchain = None
_event_bus = None

def init_api(engine, blockchain, event_bus):
    global _engine, _blockchain, _event_bus
    _engine = engine
    _blockchain = blockchain
    _event_bus = event_bus

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "ChainGuard API"}

@router.get("/routes")
def get_custom_routes():
    if os.path.exists(ROUTES_FILE):
        try:
            with open(ROUTES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

@router.post("/routes")
def save_custom_routes(routes: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(ROUTES_FILE), exist_ok=True)
    with open(ROUTES_FILE, "w", encoding="utf-8") as f:
        json.dump(routes, f, indent=2)
    return {"status": "saved", "count": len(routes)}

@router.get("/state")
def get_simulation_state():
    if _engine:
        return _engine.get_state()
    return {"status": "uninitialized"}

@router.post("/simulation/start")
def start_simulation():
    if _engine:
        _engine.start()
        return {"status": "started"}
    return {"status": "ok"}

@router.post("/simulation/pause")
def pause_simulation():
    if _engine:
        _engine.pause()
        return {"status": "paused"}
    return {"status": "ok"}

@router.post("/simulation/reset")
def reset_simulation():
    if _engine:
        _engine.reset()
        return {"status": "reset"}
    return {"status": "ok"}

@router.get("/blockchain/chain")
def get_blockchain_ledger():
    if _blockchain:
        return _blockchain.get_chain()
    return []
