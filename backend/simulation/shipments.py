import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import copy

WAYPOINTS = {
    "SHA": {"id": "SHA", "name": "Shanghai Port", "lat": 31.2304, "lng": 121.4737, "country": "China", "type": "PORT"},
    "SIN": {"id": "SIN", "name": "Port of Singapore", "lat": 1.3521, "lng": 103.8198, "country": "Singapore", "type": "PORT"},
    "BOM": {"id": "BOM", "name": "Port of Mumbai", "lat": 18.9438, "lng": 72.8354, "country": "India", "type": "PORT"},
    "JEA": {"id": "JEA", "name": "Jebel Ali Port", "lat": 24.9857, "lng": 55.0273, "country": "UAE", "type": "PORT"},
    "DXB": {"id": "DXB", "name": "Dubai Logistics Hub", "lat": 25.2048, "lng": 55.2708, "country": "UAE", "type": "PORT"},
    "CPT": {"id": "CPT", "name": "Cape Town Bypass Port", "lat": -33.9249, "lng": 18.4241, "country": "South Africa", "type": "PORT"},
    "RTM": {"id": "RTM", "name": "Port of Rotterdam", "lat": 51.9244, "lng": 4.4777, "country": "Netherlands", "type": "PORT"},
    "BER": {"id": "BER", "name": "Berlin Cold Hub", "lat": 52.5200, "lng": 13.4050, "country": "Germany", "type": "ORIGIN"},
    "STJ": {"id": "STJ", "name": "St. Jude Regional Hospital", "lat": 52.3676, "lng": 4.9041, "country": "Netherlands", "type": "HOSPITAL"},
    "RMC": {"id": "RMC", "name": "Regional Medical Center", "lat": 24.4539, "lng": 54.3773, "country": "UAE", "type": "HOSPITAL"},
    "EDH": {"id": "EDH", "name": "European Distribution Hub", "lat": 50.8503, "lng": 4.3517, "country": "Belgium", "type": "DISTRIBUTION"}
}

def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def interpolate_coordinates(lat1: float, lng1: float, lat2: float, lng2: float, fraction: float) -> tuple[float, float]:
    fraction = max(0.0, min(1.0, fraction))
    lat = lat1 + (lat2 - lat1) * fraction
    lng = lng1 + (lng2 - lng1) * fraction
    return lat, lng

INITIAL_SHIPMENTS = [
    {
        "id": "ORD-5415",
        "cargo": "Sterile Bio-Resorbable Cardiac Stents",
        "origin": "Shanghai",
        "destination": "St. Jude Regional Hospital",
        "priority": "CRITICAL",
        "current_temp": 20.9,
        "target_temp": 21.0,
        "temp_min": 15.0,
        "temp_max": 25.0,
        "battery_pct": 94,
        "container_seal": "SEAL-SHA-9921-VALID",
        "status": "IN_TRANSIT",
        "risk": 12,
        "escrow_usd": 1250000,
        "escrow_status": "ESCROWED",
        "eta_days": 8.5,
        "waypoint_ids": ["SHA", "SIN", "DXB", "RTM", "STJ"],
        "current_segment_index": 0,
        "segment_progress": 0.15,
        "total_progress": 4.0,
        "current_lat": 31.2304,
        "current_lng": 121.4737,
        "speed_knots": 22.4,
        "active_disruption": None,
        "alternative_routes": [],
        "route_history": ["SHA -> SIN -> DXB -> RTM -> STJ (Original Cold-Corridor)"],
        "verification_checklist": {
            "seal_intact": True,
            "temp_compliant": True,
            "cargo_valid": True,
            "shipment_valid": True,
            "route_history_valid": True,
            "chain_valid": True
        }
    },
    {
        "id": "ORD-4741",
        "cargo": "Ultra-Cold Pediatric mRNA Vaccines",
        "origin": "Berlin",
        "destination": "Regional Medical Center",
        "priority": "CRITICAL",
        "current_temp": -20.3,
        "target_temp": -20.0,
        "temp_min": -25.0,
        "temp_max": -15.0,
        "battery_pct": 88,
        "container_seal": "SEAL-BER-4412-VALID",
        "status": "IN_TRANSIT",
        "risk": 18,
        "escrow_usd": 2100000,
        "escrow_status": "ESCROWED",
        "eta_days": 4.2,
        "waypoint_ids": ["BER", "RTM", "DXB", "RMC"],
        "current_segment_index": 0,
        "segment_progress": 0.40,
        "total_progress": 13.0,
        "current_lat": 52.5200,
        "current_lng": 13.4050,
        "speed_knots": 24.0,
        "active_disruption": None,
        "alternative_routes": [],
        "route_history": ["BER -> RTM -> DXB -> RMC (Cryo-Express Path)"],
        "verification_checklist": {
            "seal_intact": True,
            "temp_compliant": True,
            "cargo_valid": True,
            "shipment_valid": True,
            "route_history_valid": True,
            "chain_valid": True
        }
    },
    {
        "id": "ORD-3928",
        "cargo": "Emergency Medical Supplies",
        "origin": "Mumbai",
        "destination": "European Distribution Hub",
        "priority": "HIGH",
        "current_temp": 18.5,
        "target_temp": 18.0,
        "temp_min": 10.0,
        "temp_max": 25.0,
        "battery_pct": 91,
        "container_seal": "SEAL-BOM-1109-VALID",
        "status": "IN_TRANSIT",
        "risk": 8,
        "escrow_usd": 680000,
        "escrow_status": "ESCROWED",
        "eta_days": 5.0,
        "waypoint_ids": ["BOM", "JEA", "RTM", "EDH"],
        "current_segment_index": 0,
        "segment_progress": 0.25,
        "total_progress": 8.0,
        "current_lat": 18.9438,
        "current_lng": 72.8354,
        "speed_knots": 21.0,
        "active_disruption": None,
        "alternative_routes": [],
        "route_history": ["BOM -> JEA -> RTM -> EDH (Euro-Med Relay)"],
        "verification_checklist": {
            "seal_intact": True,
            "temp_compliant": True,
            "cargo_valid": True,
            "shipment_valid": True,
            "route_history_valid": True,
            "chain_valid": True
        }
    }
]

def get_initial_shipments() -> List[Dict[str, Any]]:
    return copy.deepcopy(INITIAL_SHIPMENTS)
