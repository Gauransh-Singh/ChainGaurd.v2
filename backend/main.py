import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.blockchain.chain import Blockchain
from backend.events.bus import EventBus
from backend.simulation.engine import SimulationEngine
from backend.websocket.manager import ConnectionManager
from backend.api.routes import router as api_router, init_api

blockchain = Blockchain()
event_bus = EventBus()
engine = SimulationEngine(event_bus=event_bus, blockchain=blockchain)
ws_manager = ConnectionManager()

# Hook event bus to broadcast immediately to WebSockets
async def on_event_published(event):
    await ws_manager.broadcast_json({
        "type": "EVENT_PUBLISHED",
        "event": event.model_dump()
    })

event_bus.subscribe(on_event_published)
init_api(engine, blockchain, event_bus)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Background simulation tick loop (10 ticks / sec for smooth interpolation)
    tick_task = asyncio.create_task(sim_loop())
    yield
    tick_task.cancel()

async def sim_loop():
    dt = 0.1  # 100ms tick interval
    while True:
        try:
            await engine.tick(dt)
            # Broadcast state periodically to all connected clients
            if ws_manager.active_connections:
                state = engine.get_state()
                await ws_manager.broadcast_json({
                    "type": "STATE_UPDATE",
                    "state": state
                })
            await asyncio.sleep(dt)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[SimLoop] Error: {e}")
            await asyncio.sleep(dt)

app = FastAPI(
    title="ChainGuard API",
    description="Real-Time Supply Chain Resilience & Verification Engine",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial state snapshot on connect
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "state": engine.get_state()
        })
        while True:
            data = await websocket.receive_text()
            try:
                import json
                msg = json.loads(data)
                # Broadcast real-time message across all multi-node clients (Master Hub, Carrier, Receiver)
                await ws_manager.broadcast_json(msg)
            except Exception as e:
                print(f"[WS Relay Error]: {e}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"system": "ChainGuard API", "status": "ONLINE", "version": "2.0.0"}
