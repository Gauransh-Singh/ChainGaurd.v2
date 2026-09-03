import { useState, useEffect, useRef, useCallback } from "react";
import { SimulationState, AppEvent } from "../types";
import { api } from "../services/api";

const WS_URL = "ws://localhost:8000/ws";

export function useChainGuardWs() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // 1. Initial REST API load for zero-latency mount
  useEffect(() => {
    let isMounted = true;
    api.getState().then((data) => {
      if (isMounted && data) {
        setState(data);
        if (data.recent_events) {
          setEvents(data.recent_events);
        }
      }
    }).catch((err) => {
      console.warn("[ChainGuard API] Initial fetch fallback:", err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time WebSocket connection
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data);
          if (payload.type === "INITIAL_STATE" || payload.type === "STATE_UPDATE") {
            setState(payload.state);
            if (payload.state?.recent_events) {
              setEvents(payload.state.recent_events);
            }
          } else if (payload.type === "EVENT_PUBLISHED") {
            setEvents((prev) => [payload.event, ...prev.slice(0, 49)]);
          }
        } catch (err) {
          console.error("[ChainGuard WS] Parse error:", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        // Handled silently by onclose
      };
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return { state, connected, events };
}
