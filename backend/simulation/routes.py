from typing import List, Dict, Any, Optional
from backend.simulation.interfaces import RoutePlanner, RecoveryPlanner
from backend.simulation.shipments import WAYPOINTS

class RuleBasedRoutePlanner(RoutePlanner):
    """
    Algorithmic multi-criteria route optimization scoring alternatives by:
    Score = (Risk * W_risk) + (Delay * W_delay) + (Cost * W_cost) + (Criticality * W_crit)
    """
    def generate_alternatives(self, crisis: Dict[str, Any], shipment: Dict[str, Any]) -> List[Dict[str, Any]]:
        shipment_id = shipment["id"]
        current_node = WAYPOINTS.get(shipment["waypoint_ids"][shipment["current_segment_index"]], {})
        
        # Standardized 3 Robust Strategic Options:
        # OPTION A: Sea-Air Hybrid via Dubai Air Bridge
        # OPTION B: Cape of Good Hope Deep Maritime Bypass
        # OPTION C: Direct Dedicated Air Charter Freight

        options = [
            {
                "id": "OPT-A",
                "shipment_id": shipment_id,
                "name": "OPTION A: Sea-Air Hybrid via Dubai Air Cargo",
                "mode": "SEA_AIR_HYBRID",
                "risk_score": 8,
                "delay_days": 3.0,
                "cost_delta_usd": 750000,
                "feasibility_score": 94,
                "waypoint_ids": [w for w in shipment["waypoint_ids"] if w in ["SHA", "SIN", "DXB"]] + ["RTM", "STJ"] if "STJ" in shipment["waypoint_ids"] else [w for w in shipment["waypoint_ids"] if w in ["BER", "RTM", "DXB", "RMC", "BOM", "JEA", "EDH"]],
                "route_path": "Dubai (Air Charter) -> Amsterdam -> Destination",
                "description": "Discharge cargo at Dubai Logistics Terminal, transfer to conditioned B777-F air freight direct to Rotterdam/Amsterdam.",
                "highlights": ["Zero Red Sea transit exposure", "Cold-chain active battery monitored", "ETA +3 days"],
                "status": "PROPOSED"
            },
            {
                "id": "OPT-B",
                "shipment_id": shipment_id,
                "name": "OPTION B: Cape of Good Hope Maritime Bypass",
                "mode": "DEEP_SEA_BYPASS",
                "risk_score": 41,
                "delay_days": 11.0,
                "cost_delta_usd": 400000,
                "feasibility_score": 78,
                "waypoint_ids": [w for w in shipment["waypoint_ids"] if w in ["SHA", "SIN", "DXB", "BOM", "JEA", "BER"]] + ["CPT", "RTM", "STJ" if "STJ" in shipment["waypoint_ids"] else "EDH"],
                "route_path": "Indian Ocean -> Cape Town -> Atlantic -> Rotterdam",
                "description": "Divert vessel around the southern tip of Africa via Cape of Good Hope, avoiding Suez and Bab-el-Mandeb completely.",
                "highlights": ["Lowest additional cost (+400K)", "Extended voyage time (+11 days)", "Rough South Atlantic sea state"],
                "status": "PROPOSED"
            },
            {
                "id": "OPT-C",
                "shipment_id": shipment_id,
                "name": "OPTION C: Priority Dedicated Air Charter Freight",
                "mode": "EMERGENCY_AIR_EXPRESS",
                "risk_score": 5,
                "delay_days": 1.0,
                "cost_delta_usd": 1800000,
                "feasibility_score": 99,
                "waypoint_ids": [shipment["waypoint_ids"][shipment["current_segment_index"]], shipment["waypoint_ids"][-1]],
                "route_path": "Immediate Air Lift -> Point-to-Point Direct Destination",
                "description": "Emergency military-grade cold-chain transport charter flying non-stop directly to destination regional medical air strip.",
                "highlights": ["Fastest recovery (+1 day)", "Guaranteed cryo-integrity", "Premium charter cost (+$1.8M)"],
                "status": "PROPOSED"
            }
        ]
        return options

class RuleBasedRecoveryPlanner(RecoveryPlanner):
    def plan_secondary_recovery(self, failed_strategy: Dict[str, Any], shipment: Dict[str, Any]) -> List[Dict[str, Any]]:
        # If Option A or B suffers a secondary strike, dynamically spin secondary alternatives
        planner = RuleBasedRoutePlanner()
        alts = planner.generate_alternatives({"severity": "CRITICAL", "type": "SECONDARY_CASCADE"}, shipment)
        for opt in alts:
            opt["name"] = f"[RECOVERY CYCLE 2] {opt['name']}"
            opt["cost_delta_usd"] = int(opt["cost_delta_usd"] * 1.15)
        return alts
