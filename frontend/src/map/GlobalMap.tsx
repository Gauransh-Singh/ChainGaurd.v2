import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Shipment, Waypoint, Crisis } from "../types";
import { Ship, Plane, ShieldAlert, CheckCircle2, AlertTriangle, Navigation, MapPin, Radio } from "lucide-react";

interface GlobalMapProps {
  shipments: Shipment[];
  waypoints: Record<string, Waypoint>;
  activeCrises: Crisis[];
  selectedShipmentId?: string;
  onSelectShipment?: (id: string) => void;
}

// Custom DivIcons for Map
const createShipmentIcon = (status: string, priority: string, isSelected: boolean) => {
  let color = "#10b981"; // green
  let glow = "rgba(16, 185, 129, 0.5)";
  let iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21a8 8 0 0 1 13.292-6"/><path d="M19.38 20A2 2 0 0 0 21 18v-6l-4-4H8L4 12v6a2 2 0 0 0 1.62 1.96"/><path d="M12 12V6"/></svg>`;

  if (status === "CRITICAL" || status === "REJECTED") {
    color = "#ef4444"; // red
    glow = "rgba(239, 68, 68, 0.8)";
  } else if (status === "AT_RISK") {
    color = "#f59e0b"; // yellow
    glow = "rgba(245, 158, 11, 0.6)";
  } else if (status === "ARRIVED" || status === "ACCEPTED") {
    color = "#3b82f6"; // blue
    glow = "rgba(59, 130, 246, 0.5)";
  }

  const borderClass = isSelected ? "ring-2 ring-cyan-400 scale-125" : "";

  return L.divIcon({
    className: "custom-shipment-icon",
    html: `
      <div style="
        background: #0d1322;
        border: 2px solid ${color};
        box-shadow: 0 0 16px ${glow};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color};
        transition: all 0.3s ease;
      " class="${borderClass} animate-pulse-slow">
        ${iconHtml}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const createPortIcon = (type: string, code: string) => {
  const isHospital = type === "HOSPITAL";
  const bg = isHospital ? "#8b5cf6" : "#1e293b";
  const border = isHospital ? "#a78bfa" : "#475569";

  return L.divIcon({
    className: "custom-port-icon",
    html: `
      <div style="
        background: ${bg};
        border: 1.5px solid ${border};
        box-shadow: 0 0 8px rgba(0,0,0,0.6);
        padding: 2px 6px;
        border-radius: 4px;
        color: #f1f5f9;
        font-size: 10px;
        font-family: monospace;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      ">
        <span style="width: 5px; height: 5px; border-radius: 50%; background: ${isHospital ? '#c084fc' : '#38bdf8'};"></span>
        ${code}
      </div>
    `,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
  });
};

export const GlobalMap: React.FC<GlobalMapProps> = ({
  shipments,
  waypoints,
  activeCrises,
  selectedShipmentId,
  onSelectShipment,
}) => {
  const defaultCenter: [number, number] = [28.0, 50.0];

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-[#080c14] shadow-2xl">
      {/* Top Map HUD overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-mono font-medium">LIVE CORRIDORS</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-3 text-slate-300 font-mono text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-emerald-500 rounded"></span> Active</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-amber-500 rounded"></span> Alternative</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-rose-500 rounded"></span> Blocked</span>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={3}
        minZoom={2}
        maxZoom={8}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "#080c14" }}
      >
        {/* Dark CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Render Port/Waypoint Nodes */}
        {Object.values(waypoints).map((wp) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={createPortIcon(wp.type, wp.id)}
          >
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <div className="font-bold text-slate-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {wp.name} ({wp.country})
                </div>
                <div className="text-slate-400 font-mono text-[10px]">
                  Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  Type: {wp.type}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 2. Render Active Shipment Route Polylines */}
        {shipments.map((s) => {
          const isSelected = selectedShipmentId === s.id;
          const coords: [number, number][] = s.waypoint_ids
            .map((id) => waypoints[id])
            .filter(Boolean)
            .map((wp) => [wp.lat, wp.lng]);

          let lineColor = "#10b981"; // green
          let dashArray: string | undefined = undefined;

          if (s.status === "CRITICAL") {
            lineColor = "#ef4444";
            dashArray = "6, 6";
          } else if (s.status === "AT_RISK") {
            lineColor = "#f59e0b";
            dashArray = "8, 8";
          }

          return (
            <React.Fragment key={`route-${s.id}`}>
              {/* Outer soft glow line */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color: lineColor,
                  weight: isSelected ? 6 : 4,
                  opacity: isSelected ? 0.35 : 0.15,
                }}
              />
              {/* Inner core line */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color: lineColor,
                  weight: isSelected ? 3 : 2,
                  dashArray: dashArray,
                  opacity: 0.9,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* 3. Render Crisis Zones & Red Sea Blocks */}
        {activeCrises.map((crisis) => (
          <React.Fragment key={crisis.id}>
            <Circle
              center={[crisis.coordinates.lat, crisis.coordinates.lng]}
              radius={crisis.coordinates.radius_km * 1000}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.22,
                weight: 2,
                dashArray: "4, 6",
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs max-w-[220px]">
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" />
                    {crisis.title}
                  </div>
                  <div className="text-slate-300 text-[11px]">{crisis.description}</div>
                  <div className="font-mono text-[10px] text-amber-400">
                    Delay: +{crisis.expected_delay_days}d | Cost: +${crisis.cost_impact_usd.toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Circle>
          </React.Fragment>
        ))}

        {/* 4. Render Moving Shipment Markers */}
        {shipments.map((s) => {
          const isSelected = selectedShipmentId === s.id;
          return (
            <Marker
              key={s.id}
              position={[s.current_lat, s.current_lng]}
              icon={createShipmentIcon(s.status, s.priority, isSelected)}
              eventHandlers={{
                click: () => onSelectShipment && onSelectShipment(s.id),
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs min-w-[220px] font-sans">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-mono font-bold text-cyan-400">{s.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        s.status === "CRITICAL"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : s.status === "AT_RISK"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="text-slate-200 font-medium text-[11px]">
                    {s.cargo}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div>
                      <span className="text-slate-500">Route:</span> {s.origin} → {s.destination.split(" ")[0]}
                    </div>
                    <div>
                      <span className="text-slate-500">Progress:</span> {s.total_progress.toFixed(1)}%
                    </div>
                    <div>
                      <span className="text-slate-500">Temp:</span>{" "}
                      <span className={s.current_temp > s.temp_max || s.current_temp < s.temp_min ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {s.current_temp.toFixed(1)}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Risk:</span>{" "}
                      <span className={s.risk > 50 ? "text-rose-400" : "text-slate-300"}>
                        {s.risk}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">ETA:</span> {s.eta_days.toFixed(1)} Days
                    </div>
                    <div>
                      <span className="text-slate-500">Escrow:</span> ${(s.escrow_usd / 1000).toFixed(0)}k
                    </div>
                  </div>

                  {s.active_disruption && (
                    <div className="bg-rose-950/60 border border-rose-800/80 rounded p-1.5 text-[10px] text-rose-300">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {s.active_disruption.title}
                      </div>
                      <div className="text-slate-400 mt-0.5">Approval required on Carrier Node</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Status Ticker */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>AIS / SATELLITE ORBITAL TELEMETRY SYNC</span>
      </div>
    </div>
  );
};
