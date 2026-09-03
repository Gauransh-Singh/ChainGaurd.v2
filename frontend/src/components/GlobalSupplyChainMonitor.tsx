import { LOCATIONS, LOCATIONS_MAP } from '../data/locations';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Ship,
  Plane,
  X,
  Package,
  Clock,
  ShieldCheck,
  Thermometer,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export interface Location {
  id: string;
  name: string;
  country: string;
  flag: string;
  modes: ('sea' | 'air')[];
  lat: number;
  lng: number;
  xPct: number;
  yPct: number;
}

export interface StrategicArea {
  id: string;
  name: string;
  category: 'chokepoint' | 'canal' | 'strait' | 'cape';
  icon: string;
  hint: string;
  xPct?: number;
  yPct?: number;
}

export const STRATEGIC_CHOKEPOINTS_LIST: Omit<StrategicArea, 'xPct' | 'yPct'>[] = [
  { id: 'suez', name: 'Suez Canal', category: 'canal', icon: '⚓', hint: 'Egypt • Connects Red Sea to Mediterranean' },
  { id: 'babelmandeb', name: 'Bab-el-Mandeb Strait', category: 'strait', icon: '⚓', hint: 'Yemen / Djibouti • Red Sea Entrance' },
  { id: 'malacca', name: 'Strait of Malacca', category: 'strait', icon: '⚓', hint: 'Singapore / Malaysia • Indian-Pacific Oceans' },
  { id: 'hormuz', name: 'Strait of Hormuz', category: 'strait', icon: '⚓', hint: 'Persian Gulf Entrance • Near Dubai' },
  { id: 'panama', name: 'Panama Canal', category: 'canal', icon: '⚓', hint: 'Central America • Connects Atlantic to Pacific' },
  { id: 'taiwan_strait', name: 'Taiwan Strait & SCS', category: 'strait', icon: '🌪️', hint: 'East Asia • Between China, Taiwan & Philippines' },
  { id: 'cape_good_hope', name: 'Cape of Good Hope', category: 'cape', icon: '⚓', hint: 'South Africa • The Africa Detour Route' },
  { id: 'gibraltar', name: 'Strait of Gibraltar', category: 'strait', icon: '⚓', hint: 'Spain / Morocco • Atlantic to Mediterranean' },
  { id: 'english_channel', name: 'English Channel', category: 'strait', icon: '⚓', hint: 'UK / France • Route to Rotterdam & Hamburg' },
  { id: 'bosphorus', name: 'Bosphorus Strait', category: 'strait', icon: '⚓', hint: 'Istanbul • Connects Black Sea to Mediterranean' },
];

import { CustomRoute, INITIAL_CUSTOM_ROUTES } from '../data/routes';

export { type CustomRoute, INITIAL_CUSTOM_ROUTES };

export const STRATEGIC_CHOKEPOINTS = [
  {
    id: 'suez',
    name: 'Suez Canal',
    category: 'canal',
    icon: '⚓',
    hint: 'Egypt • Connects Red Sea to Mediterranean',
    xPct: 51.72,
    yPct: 46.83,
  },
  {
    id: 'babelmandeb',
    name: 'Bab-el-Mandeb Strait',
    category: 'strait',
    icon: '⚓',
    hint: 'Yemen / Djibouti • Red Sea Entrance',
    xPct: 54.84,
    yPct: 57.77,
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    category: 'strait',
    icon: '⚓',
    hint: 'Persian Gulf Entrance • Near Dubai',
    xPct: 58.01,
    yPct: 49.5,
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    category: 'canal',
    icon: '⚓',
    hint: 'Central America • Connects Atlantic to Pacific',
    xPct: 23.32,
    yPct: 58.71,
  },
  {
    id: 'taiwan_strait',
    name: 'Taiwan Strait & SCS',
    category: 'strait',
    icon: '🌪️',
    hint: 'East Asia • Between China, Taiwan & Philippines',
    xPct: 75.8,
    yPct: 48.5,
  },
  {
    id: 'cape_good_hope',
    name: 'Cape of Good Hope',
    category: 'cape',
    icon: '⚓',
    hint: 'South Africa • The Africa Detour Route',
    xPct: 47.9,
    yPct: 85.5,
  },
  {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    category: 'strait',
    icon: '⚓',
    hint: 'Spain / Morocco • Atlantic to Mediterranean',
    xPct: 41.2,
    yPct: 38.0,
  },
  {
    id: 'english_channel',
    name: 'English Channel',
    category: 'strait',
    icon: '⚓',
    hint: 'UK / France • Route to Rotterdam & Hamburg',
    xPct: 43.6,
    yPct: 33.8,
  },
  {
    id: 'bosphorus',
    name: 'Bosphorus Strait',
    category: 'strait',
    icon: '⚓',
    hint: 'Istanbul • Connects Black Sea to Mediterranean',
    xPct: 50.14,
    yPct: 40.67,
  },
];

export const GlobalSupplyChainMonitor: React.FC = () => {
  const { shipments, selectedShipmentId, selectShipment, isSimulating, activeCrises = [], activeCrisis, previewOption } = useSimulation();

  const [zoom, setZoom] = useState<number>(1.0);
  const [rotationRatio, setRotationRatio] = useState<number>(0.5);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 340,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // ResizeObserver for reliable, smooth dimension measurement in windowed & fullscreen modes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setStageDimensions({
            width: Math.max(300, entry.contentRect.width),
            height: Math.max(200, entry.contentRect.height),
          });
        }
      }
    });

    ro.observe(stage);
    return () => ro.disconnect();
  }, [isFullscreen]);

  // Natural 2:1 World Map Geometry (Never stretched, fits natural continent shapes)
  const mapAspect = 2.0; // Equirectangular aspect ratio (2:1)
  const baseMapWidth = Math.max(stageDimensions.width, stageDimensions.height * mapAspect);
  const tileWidth = baseMapWidth * zoom;
  const renderedHeight = tileWidth / mapAspect;

  const [panX, setPanX] = useState<number>(0);

  const maxPanY = Math.max(0, (renderedHeight - stageDimensions.height) / 2 + 150 * (zoom - 1));

  // Handle Dragging & Smooth Infinite Sliding
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .point-marker, .shipment-marker, .shipment-popup')) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      // Sliding / Panning X & Y
      setPanX((prev) => {
        const next = prev + deltaX;
        // Keep in smooth wrap window [-tileWidth, tileWidth]
        if (next > tileWidth) return next - tileWidth;
        if (next < -tileWidth) return next + tileWidth;
        return next;
      });

      setPanY((prev) => Math.max(-maxPanY, Math.min(maxPanY, prev + deltaY)));

      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
    },
    [isDragging, dragStartX, dragStartY, tileWidth, maxPanY]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom isolation
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.max(1.0, Math.min(4.0, prev * zoomFactor)));
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1.0));
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (wrapperRef.current && wrapperRef.current.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Multi-tile wrapping: because tileWidth >= stageDimensions.width, only 1 map is visible in center
  // Left (-1) and right (+1) buffer tiles allow infinite seamless sliding across all longitudes
  const stageCenter = stageDimensions.width / 2;
  const tileIndices = [-1, 0, 1];

  const computeCustomRoutePath = (route: CustomRoute, offsetTiles: number = 0) => {
    const fromLoc = LOCATIONS.find((l) => l.id === route.from);
    const toLoc = LOCATIONS.find((l) => l.id === route.to);
    if (!fromLoc || !toLoc) return '';

    let startX = (fromLoc.xPct / 100) * tileWidth;
    const startY = (fromLoc.yPct / 100) * renderedHeight;
    let endX = (toLoc.xPct / 100) * tileWidth;
    const endY = (toLoc.yPct / 100) * renderedHeight;

    if (route.isTranspacific) {
      if (startX > endX) {
        endX += tileWidth;
      } else {
        startX += tileWidth;
      }
    }

    const tileShift = offsetTiles * tileWidth;

    const coords: { x: number; y: number }[] = [];
    coords.push({ x: startX + tileShift, y: startY });

    if (route.controlPoints && route.controlPoints.length > 0) {
      for (const cp of route.controlPoints) {
        let cpX = (cp.xPct / 100) * tileWidth;
        if (route.isTranspacific) {
          const minX = Math.min(startX, endX);
          const maxX = Math.max(startX, endX);
          if (cpX < minX && cpX + tileWidth <= maxX + tileWidth * 0.2) {
            cpX += tileWidth;
          }
        }
        coords.push({
          x: cpX + tileShift,
          y: (cp.yPct / 100) * renderedHeight,
        });
      }
    }

    coords.push({ x: endX + tileShift, y: endY });

    if (coords.length === 2) {
      const p1 = coords[0];
      const p2 = coords[1];
      return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    if (coords.length === 3) {
      const p1 = coords[0];
      const cp = coords[1];
      const p2 = coords[2];
      return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    let path = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      const u = 1 - 0.5;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const activeSelectedShipment = shipments.find((s) => s.id === selectedShipmentId);

  return (
    <div
      ref={wrapperRef}
      className={`bg-[#0f1524] border border-[#1b2336] rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden select-none transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-none p-4 sm:p-6 bg-[#070e1b]'
          : 'p-4 h-[460px] lg:h-[490px]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div className="flex items-center space-x-2.5">
          <h3 className="text-xs font-bold text-slate-100 font-sans tracking-tight">
            Global Supply Chain Monitor
          </h3>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#101e1d] border border-[#1b3f36] text-[10px] font-mono text-emerald-400">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isSimulating ? 'animate-pulse' : ''}`}></span>
            {isSimulating ? 'Simulation Live' : 'Simulation Paused'} • {shipments.length} Active Units
          </span>
        </div>

        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Fullscreen</span>
          </button>
        )}
      </div>

      {/* Main World Map Stage */}
      <div
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 w-full rounded-xl overflow-hidden relative border border-[#162136] bg-[#071426] flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* LAYER 1: Background World Map Image Tiles */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {tileIndices.map((idx) => {
            return (
              <div
                key={`map-tile-${idx}`}
                className="absolute"
                style={{
                  width: `${tileWidth}px`,
                  height: `${renderedHeight}px`,
                  left: `${stageCenter + panX + idx * tileWidth - tileWidth / 2}px`,
                  top: `calc(50% + ${panY}px - ${renderedHeight / 2}px)`,
                }}
              >
                <img
                  src="/world_map_base.png"
                  alt="World Map"
                  className="w-full h-full object-fill pointer-events-none opacity-85 select-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* LAYER 2, 3, 4: Multi-Tile Overlay (Routes, Chokepoints, Cities, Moving Vessels) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
          {tileIndices.map((idx) => {
            return (
              <div
                key={`content-tile-${idx}`}
                className="absolute"
                style={{
                  width: `${tileWidth}px`,
                  height: `${renderedHeight}px`,
                  left: `${stageCenter + panX + idx * tileWidth - tileWidth / 2}px`,
                  top: `calc(50% + ${panY}px - ${renderedHeight / 2}px)`,
                }}
              >
                {/* SVG Route Paths */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${tileWidth} ${renderedHeight}`}
                  style={{ overflow: 'visible' }}
                >
                  {INITIAL_CUSTOM_ROUTES.map((route) => {
                    const isSea = route.mode === 'sea';
                    const isAir = route.mode === 'air';
                    const isRoad = route.mode === 'road';
                    const pathD = computeCustomRoutePath(route, 0);
                    const pathD_wrap = route.isTranspacific ? computeCustomRoutePath(route, -1) : null;
                    if (!pathD) return null;

                    // Check if this route is BLOCKED by any active crisis
                    const isRouteBlocked = Boolean(
                      activeCrises.some((ac) =>
                        (ac.affectedRouteId && ac.affectedRouteId === route.id) ||
                        (ac.affectedSegment &&
                          ac.affectedSegment.mode === route.mode &&
                          ((ac.affectedSegment.from === route.from && ac.affectedSegment.to === route.to) ||
                           (ac.affectedSegment.from === route.to && ac.affectedSegment.to === route.from)))
                      )
                    );

                    // Check if this specific route is part of selected shipment's exact path
                    const isPartOfSelected = Boolean(
                      activeSelectedShipment &&
                      activeSelectedShipment.mode === route.mode &&
                      activeSelectedShipment.segments?.some((seg) => {
                        if (seg.routeId && seg.routeId === route.id) return true;
                        return (
                          (seg.from === route.from && seg.to === route.to) ||
                          (seg.from === route.to && seg.to === route.from)
                        );
                      })
                    );

                    return (
                      <React.Fragment key={`${route.id}-${idx}`}>
                        {/* Red Hazard Outer Glow for Blocked Corridor */}
                        {isRouteBlocked && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="6"
                            opacity="0.35"
                            className="animate-pulse"
                          />
                        )}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={
                            isRouteBlocked
                              ? '#ef4444'
                              : isPartOfSelected
                              ? '#facc15'
                              : isSea
                              ? '#0ea5e9'
                              : '#c084fc'
                          }
                          strokeWidth={isRouteBlocked ? '3.0' : isPartOfSelected ? '2.4' : isSea ? '1.5' : '1.3'}
                          strokeDasharray={isRouteBlocked ? '6 6' : isPartOfSelected ? 'none' : isSea ? '4 4' : '2 4'}
                          opacity={isRouteBlocked ? '1.0' : isPartOfSelected ? '1.0' : isSea ? '0.65' : '0.50'}
                          className={
                            isRouteBlocked
                              ? 'drop-shadow-[0_0_12px_#ef4444] animate-pulse'
                              : isPartOfSelected
                              ? 'drop-shadow-[0_0_8px_#facc15]'
                              : ''
                          }
                        />
                        {pathD_wrap && (
                          <path
                            d={pathD_wrap}
                            fill="none"
                            stroke={
                              isRouteBlocked
                                ? '#ef4444'
                                : isPartOfSelected
                                ? '#facc15'
                                : isSea
                                ? '#0ea5e9'
                                : '#c084fc'
                            }
                            strokeWidth={isRouteBlocked ? '3.0' : isPartOfSelected ? '2.4' : isSea ? '1.5' : '1.3'}
                            strokeDasharray={isRouteBlocked ? '6 6' : isPartOfSelected ? 'none' : isSea ? '4 4' : '2 4'}
                            opacity={isRouteBlocked ? '1.0' : isPartOfSelected ? '1.0' : isSea ? '0.65' : '0.50'}
                            className={
                              isRouteBlocked
                                ? 'drop-shadow-[0_0_12px_#ef4444] animate-pulse'
                                : isPartOfSelected
                                ? 'drop-shadow-[0_0_8px_#facc15]'
                                : ''
                            }
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* LAYER 2.5: Glowing Green Alternative Recovery Path Preview */}
                  {previewOption && previewOption.segments && previewOption.segments.map((seg, sIdx) => {
                    const crObj = {
                      id: seg.routeId || `opt-seg-${sIdx}`,
                      from: seg.from,
                      to: seg.to,
                      mode: seg.mode,
                      isTranspacific: seg.isTranspacific,
                      controlPoints: seg.controlPoints,
                    };
                    const optPathD = computeCustomRoutePath(crObj, 0);
                    if (!optPathD) return null;
                    return (
                      <React.Fragment key={`opt-path-${sIdx}-${idx}`}>
                        <path
                          d={optPathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="6.0"
                          opacity="0.35"
                          className="animate-pulse"
                        />
                        <path
                          d={optPathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.8"
                          strokeDasharray="6 4"
                          opacity="1.0"
                          className="drop-shadow-[0_0_14px_#10b981] animate-pulse"
                        />
                      </React.Fragment>
                    );
                  })}
                </svg>

                {/* LAYER 2.8: Detour Intermediate Hub Badges (e.g. 🟢 Cape Town) */}
                {previewOption && previewOption.pathNodes && previewOption.pathNodes.slice(1, -1).map((hubId) => {
                  const hubLoc = LOCATIONS_MAP[hubId];
                  if (!hubLoc) return null;
                  return (
                    <div
                      key={`hub-opt-${hubId}-${idx}`}
                      className="detour-hub-marker absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                      style={{ left: `${hubLoc.xPct}%`, top: `${hubLoc.yPct}%` }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="absolute -inset-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        <div className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono text-[9px] font-bold shadow-[0_0_15px_#10b981] flex items-center gap-1">
                          <span>🟢</span>
                          <span>{hubLoc.name} (Reroute Hub)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* LAYER 3: Strategic Chokepoint & Canal Warning Beacons (ONLY visible when active crisis strikes at that chokepoint) */}
                {STRATEGIC_CHOKEPOINTS.map((cp) => {
                  const isCrisisHere = activeCrises.some((ac) =>
                    ac.locationNodeId === cp.id ||
                    ac.locationName.toLowerCase().includes(cp.name.toLowerCase()) ||
                    ac.title.toLowerCase().includes(cp.name.toLowerCase())
                  );

                  if (!isCrisisHere) return null;

                  return (
                    <div
                      key={`cp-active-${cp.id}-${idx}`}
                      className="chokepoint-marker absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-25"
                      style={{
                        left: `${cp.xPct}%`,
                        top: `${cp.yPct}%`,
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Crisis Danger Aura */}
                        <div className="absolute -inset-3 rounded-full bg-red-600 animate-ping opacity-80 pointer-events-none" />

                        {/* Tactical Diamond Chokepoint Icon */}
                        <div className="w-5 h-5 rotate-45 border-2 border-white bg-red-600 text-white shadow-[0_0_20px_#ef4444] animate-pulse flex items-center justify-center">
                          <span className="-rotate-45 text-[9px] leading-none font-bold">
                            {cp.icon}
                          </span>
                        </div>

                        {/* Floating Crisis Name Banner */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-mono whitespace-nowrap shadow-2xl border bg-red-950 text-red-200 border-red-500 font-bold animate-bounce pointer-events-none">
                          🚨 {cp.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* LAYER 3.5: 17 Registered City Nodes */}
                {LOCATIONS.map((loc) => {
                  const hasSea = loc.modes.includes('sea');
                  const hasAir = loc.modes.includes('air');
                  const isAirOnly = !hasSea && hasAir;

                  const isOriginOrDest =
                    activeSelectedShipment?.from === loc.id || activeSelectedShipment?.to === loc.id;

                  return (
                    <div
                      key={`loc-${loc.id}-${idx}`}
                      className="point-marker absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      style={{
                        left: `${loc.xPct}%`,
                        top: `${loc.yPct}%`,
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Crisis Danger Aura */}
                        {activeCrisis?.locationNodeId === loc.id && (
                          <div className="absolute -inset-3 rounded-full bg-red-600 animate-ping opacity-75 pointer-events-none" />
                        )}
                        <div
                          className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 group-hover:scale-150 ${
                            activeCrisis?.locationNodeId === loc.id
                              ? 'bg-red-500 border-white shadow-[0_0_15px_#ef4444] scale-150 animate-pulse'
                              : isOriginOrDest
                              ? 'bg-amber-400 border-white shadow-[0_0_10px_#f59e0b] scale-135 animate-pulse'
                              : isAirOnly
                              ? 'bg-[#c084fc] border-[#7e22ce] group-hover:shadow-[0_0_8px_#c084fc]'
                              : 'bg-[#38bdf8] border-[#0284c7] group-hover:shadow-[0_0_8px_#38bdf8]'
                          }`}
                        >
                          <div className="w-1 h-1 rounded-full bg-white/90 mx-auto mt-[2px]" />
                        </div>

                        {/* City Label Tooltip */}
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono whitespace-nowrap shadow-xl border bg-[#071324]/95 text-slate-300 border-slate-700/60 opacity-60 group-hover:opacity-100 pointer-events-none transition-all">
                          {loc.flag} {loc.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* LAYER 4: Moving Shipments (Vessels & Aircraft) */}
                {shipments.map((s) => {
                  const isSelected = selectedShipmentId === s.id;
                  const isSea = s.mode === 'sea';
                  const coord = s.currentCoord || { xPct: 50, yPct: 50, headingDeg: 0 };

                  return (
                    <div
                      key={`shipment-marker-${s.id}-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectShipment(isSelected ? null : s.id);
                      }}
                      className="shipment-marker absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                      style={{
                        left: `${coord.xPct}%`,
                        top: `${coord.yPct}%`,
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Disrupted Warning Pulse */}
                        {s.status === 'DISRUPTED' && (
                          <div className="absolute -inset-3 rounded-full bg-red-500 animate-ping opacity-80 pointer-events-none" />
                        )}
                        {/* Shipment Vessel / Plane Badge */}
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-2xl transition-all ${
                            s.status === 'DISRUPTED'
                              ? 'bg-red-600 border-white text-white shadow-[0_0_20px_#ef4444] animate-pulse'
                              : isSelected
                              ? 'bg-amber-400 border-white text-slate-950 shadow-[0_0_15px_#f59e0b]'
                              : isSea
                              ? 'bg-[#082f49] border-[#38bdf8] text-cyan-300 shadow-[0_0_10px_#0284c7]'
                              : 'bg-[#3b0764] border-[#c084fc] text-purple-300 shadow-[0_0_10px_#9333ea]'
                          }`}
                          style={{ transform: `rotate(${isSea ? coord.headingDeg : coord.headingDeg}deg)` }}
                        >
                          {isSea ? (
                            <Ship className="w-3.5 h-3.5 transform -rotate-45" />
                          ) : (
                            <Plane className="w-3.5 h-3.5 transform -rotate-45" />
                          )}
                        </div>

                        {/* Floating Order Badge with Stopover Status & Crisis Flag */}
                        <div
                          className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md border text-[9px] font-mono whitespace-nowrap shadow-xl transition-all flex items-center gap-1 ${
                            s.status === 'DISRUPTED'
                              ? 'bg-red-600 text-white border-white font-bold animate-bounce shadow-[0_0_10px_#ef4444]'
                              : s.phase === 'DESTINATION_WAIT'
                              ? 'bg-emerald-500 text-slate-950 border-white font-bold animate-bounce'
                              : s.phase === 'HUB_WAIT' || s.phase === 'ORIGIN_WAIT'
                              ? 'bg-amber-500 text-slate-950 border-white font-bold'
                              : isSelected
                              ? 'bg-amber-400 text-slate-950 border-white font-bold'
                              : 'bg-[#070e1c]/90 text-slate-200 border-slate-700'
                          }`}
                        >
                          <span>{s.id}</span>
                          <span>
                            {s.status === 'DISRUPTED'
                              ? '🚨 BLOCKED'
                              : s.phase === 'ORIGIN_WAIT'
                              ? `⚓ ${(s.waitTimer ?? 0).toFixed(0)}s`
                              : s.phase === 'HUB_WAIT'
                              ? `🛑 ${(s.waitTimer ?? 0).toFixed(0)}s`
                              : s.phase === 'DESTINATION_WAIT'
                              ? `🏁 ${(s.waitTimer ?? 0).toFixed(0)}s`
                              : `${s.progress.toFixed(0)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* LAYER 5: Interactive Shipment Detail Modal */}
        {activeSelectedShipment && (
          <div className="shipment-popup absolute top-3 right-3 z-40 bg-[#09101f]/95 backdrop-blur-xl border border-cyan-500/60 rounded-2xl p-4 shadow-2xl w-84 space-y-3 font-sans text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold text-cyan-300 text-sm">{activeSelectedShipment.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                  {activeSelectedShipment.currentSpeedKmH?.toFixed(1)} km/h
                </span>
              </div>
              <button
                onClick={() => selectShipment(null)}
                className="w-6 h-6 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vessel / Aircraft Carrier Banner */}
            <div className="bg-[#0e1627] p-2 rounded-xl border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  {activeSelectedShipment.mode === 'sea' ? <Ship className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-100">{activeSelectedShipment.vesselName || 'Cargo Carrier'}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{activeSelectedShipment.vesselType || 'Commercial Freighter'}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-emerald-400 font-bold">● {activeSelectedShipment.speedCondition || 'NOMINAL'}</span>
              </div>
            </div>

            {/* Cargo & Route */}
            <div className="space-y-1 bg-[#101829] p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-white font-semibold">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeSelectedShipment.cargo}</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">
                  {activeSelectedShipment.totalDistanceKm ? `${activeSelectedShipment.totalDistanceKm.toLocaleString()} km` : '—'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1 mt-1">
                <span>{LOCATIONS_MAP[activeSelectedShipment.from]?.flag} {LOCATIONS_MAP[activeSelectedShipment.from]?.name}</span>
                <span className="text-cyan-400">➔</span>
                <span>{LOCATIONS_MAP[activeSelectedShipment.to]?.flag} {LOCATIONS_MAP[activeSelectedShipment.to]?.name}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 pt-0.5 truncate">
                Corridor: {activeSelectedShipment.pathNodes.join(' ➔ ')}
              </div>
            </div>

            {/* Live Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#101829] p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">Travel Duration</span>
                <span className="font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {activeSelectedShipment.eta}
                </span>
                <span className="text-[8px] text-slate-500 block mt-0.5">
                  Dist ÷ {activeSelectedShipment.baseSpeedKmH?.toFixed(0)} km/h
                </span>
              </div>

              <div className="bg-[#101829] p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">Simulated Time</span>
                <span className="font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                  ~{activeSelectedShipment.simDurationSeconds.toFixed(0)}s
                </span>
                <span className="text-[8px] text-slate-500 block mt-0.5">1d = 5s (17k x)</span>
              </div>

              <div className="bg-[#101829] p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">Risk Level</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {activeSelectedShipment.riskLevel}
                </span>
              </div>

              <div className="bg-[#101829] p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">IoT Temperature</span>
                <span className="font-semibold text-sky-300 flex items-center gap-1 mt-0.5">
                  <Thermometer className="w-3 h-3 text-sky-400" />
                  {activeSelectedShipment.temperature.toFixed(1)}°C
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 bg-[#101829] p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Voyage Progress:</span>
                <span className="font-bold text-cyan-300">{activeSelectedShipment.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${activeSelectedShipment.progress}%` }}
                />
              </div>
            </div>

            {/* Status Badge & Stopover Timer */}
            <div className="space-y-1.5 pt-1">
              {activeSelectedShipment.waitMessage && (
                <div className="px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                  <span>⏱️ {activeSelectedShipment.waitMessage}</span>
                  <span className="font-bold text-white">{(activeSelectedShipment.waitTimer ?? 0).toFixed(1)}s</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border ${
                  activeSelectedShipment.status === 'DELIVERED'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : activeSelectedShipment.status === 'PORT DOCKED' || activeSelectedShipment.status === 'TRANSSHIPMENT' || activeSelectedShipment.status === 'AIRPORT DOCKED'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    : activeSelectedShipment.status === 'DISRUPTED'
                    ? 'bg-red-950 border-red-500 text-red-300 font-bold'
                    : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activeSelectedShipment.status === 'DELIVERED'
                      ? 'bg-emerald-400'
                      : activeSelectedShipment.status === 'PORT DOCKED' || activeSelectedShipment.status === 'TRANSSHIPMENT' || activeSelectedShipment.status === 'AIRPORT DOCKED'
                      ? 'bg-amber-400'
                      : activeSelectedShipment.status === 'DISRUPTED'
                      ? 'bg-red-400'
                      : 'bg-cyan-400'
                  } animate-pulse`} />
                  ● {activeSelectedShipment.status}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Telemetry: Live</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#071324]/95 backdrop-blur-md p-2.5 rounded-xl border border-[#162742] text-[10px] font-sans space-y-1.5 shadow-2xl pointer-events-none">
          <div className="text-[10px] font-bold text-slate-200 font-sans">Transport Networks</div>
          <div className="flex items-center gap-2 text-cyan-300 font-medium">
            <span className="w-3 h-0.5 bg-[#0ea5e9] shadow-[0_0_4px_#38bdf8]"></span>
            <span>🔵 🚢 Maritime Lines</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <span className="w-3 h-0.5 bg-[#c084fc] border-b border-dotted border-[#c084fc] shadow-[0_0_4px_#c084fc]"></span>
            <span>🟣 ✈️ Air Lines</span>
          </div>
        </div>

        {/* Bottom Right Standard Clean Controls */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col space-y-1 bg-[#071324]/95 backdrop-blur-md border border-[#162742] rounded-xl p-1 shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-800"></div>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-800"></div>
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
