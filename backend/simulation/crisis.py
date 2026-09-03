from typing import List, Dict, Any, Optional
import uuid
from backend.simulation.interfaces import DisruptionDetector, ImpactCalculator

CRISIS_TEMPLATES = {
    "RED_SEA": {
        "type": "RED_SEA",
        "title": "Red Sea Geopolitical Corridor Blockade",
        "severity": "CRITICAL",
        "location": "Bab-el-Mandeb Strait / Red Sea",
        "affected_segment": ("DXB", "RTM"),
        "coordinates": {"lat": 15.35, "lng": 41.80, "radius_km": 600},
        "probability": 91,
        "expected_delay_days": 8.0,
        "cost_impact_usd": 420000,
        "human_impact": "High risk of cardiac stent expiry before patient procedure",
        "description": "Geopolitical hostilities and missile threats have halted commercial container passage through Bab-el-Mandeb Strait."
    },
    "PORT_CLOSURE": {
        "type": "PORT_CLOSURE",
        "title": "Rotterdam Port Terminal Labor Strike & Congestion",
        "severity": "HIGH",
        "location": "Port of Rotterdam (RTM)",
        "affected_segment": ("DXB", "RTM"),
        "coordinates": {"lat": 51.92, "lng": 4.48, "radius_km": 200},
        "probability": 84,
        "expected_delay_days": 4.0,
        "cost_impact_usd": 180000,
        "human_impact": "Critical delay in cryogenic restocking cycle",
        "description": "Unannounced wildcat dockworker strike halting automated container crane discharging."
    },
    "TYPHOON": {
        "type": "TYPHOON",
        "title": "Super Typhoon Malakas (Category 5)",
        "severity": "CRITICAL",
        "location": "South China Sea / Straits of Malacca",
        "affected_segment": ("SHA", "SIN"),
        "coordinates": {"lat": 12.50, "lng": 113.20, "radius_km": 750},
        "probability": 96,
        "expected_delay_days": 5.0,
        "cost_impact_usd": 310000,
        "human_impact": "Severe maritime storm risk causing container loss",
        "description": "240 km/h wind gusts and 11-meter storm surge blocking eastern maritime passages."
    },
    "SUPPLIER_FAILURE": {
        "type": "SUPPLIER_FAILURE",
        "title": "Cold-Chain Secondary Dry-Ice Replenishment Shortage",
        "severity": "HIGH",
        "location": "Dubai Hub Cold Facility",
        "affected_segment": ("SIN", "DXB"),
        "coordinates": {"lat": 25.20, "lng": 55.27, "radius_km": 150},
        "probability": 78,
        "expected_delay_days": 2.5,
        "cost_impact_usd": 120000,
        "human_impact": "Cryo dry-ice depletion risk for pediatric vaccines",
        "description": "Primary cryogenic coolant supplier experienced plant power outage."
    },
    "TEMP_EXCURSION": {
        "type": "TEMP_EXCURSION",
        "title": "Container Thermal Compressor Seal Compromised",
        "severity": "CRITICAL",
        "location": "Active Transit Corridor",
        "affected_segment": None,
        "coordinates": {"lat": 20.0, "lng": 65.0, "radius_km": 300},
        "probability": 89,
        "expected_delay_days": 1.0,
        "cost_impact_usd": 95000,
        "human_impact": "Biomedical payload thermal shock hazard",
        "description": "Telemetry reports continuous ambient heat intrusion exceeding +4.0°C/hr threshold."
    },
    "TRANSPORT_FAILURE": {
        "type": "TRANSPORT_FAILURE",
        "title": "Vessel Main Propulsion Turbine Mechanical Failure",
        "severity": "HIGH",
        "location": "Arabian Sea Transit",
        "affected_segment": ("BOM", "JEA"),
        "coordinates": {"lat": 22.10, "lng": 63.40, "radius_km": 250},
        "probability": 82,
        "expected_delay_days": 6.0,
        "cost_impact_usd": 240000,
        "human_impact": "Hospital buffer stock exhaustion before arrival",
        "description": "Emergency drift anchor deployed; propulsion requires tug assistance or port diversion."
    }
}

class RuleBasedDisruptionDetector(DisruptionDetector):
    def detect(self, shipment_state: Dict[str, Any], telemetry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Rule: If shipment is in progress and near a crisis location or triggered externally
        return None

class RuleBasedImpactCalculator(ImpactCalculator):
    def assess_impact(self, crisis: Dict[str, Any], shipment: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "shipment_id": shipment["id"],
            "crisis_id": crisis.get("id"),
            "severity": crisis.get("severity", "CRITICAL"),
            "eta_impact_days": crisis.get("expected_delay_days", 5.0),
            "cost_impact_usd": crisis.get("cost_impact_usd", 250000),
            "human_impact": crisis.get("human_impact", "High criticality delivery delay"),
            "recommended_action": "REROUTE_IMMEDIATE"
        }
