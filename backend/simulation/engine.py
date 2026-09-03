import asyncio
import time
import uuid
import copy
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from backend.blockchain.chain import Blockchain
from backend.events.bus import EventBus
from backend.events.models import Event, EventType, EventSeverity
from backend.simulation.shipments import WAYPOINTS, INITIAL_SHIPMENTS, interpolate_coordinates, calculate_distance_km
from backend.simulation.crisis import CRISIS_TEMPLATES, RuleBasedDisruptionDetector, RuleBasedImpactCalculator
from backend.simulation.routes import RuleBasedRoutePlanner, RuleBasedRecoveryPlanner

class SimulationEngine:
    def __init__(self, event_bus: EventBus, blockchain: Blockchain):
        self.event_bus = event_bus
        self.blockchain = blockchain
        self.detector = RuleBasedDisruptionDetector()
        self.impact_calc = RuleBasedImpactCalculator()
        self.route_planner = RuleBasedRoutePlanner()
        self.recovery_planner = RuleBasedRecoveryPlanner()

        self.running: bool = False
        self.speed: float = 1.0
        self.mode: str = "manual"  # "manual" | "auto"
        self.shipments: List[Dict[str, Any]] = copy.deepcopy(INITIAL_SHIPMENTS)
        self.active_crises: List[Dict[str, Any]] = []
        self.successful_recoveries: int = 0
        self.demo_phase: int = 0
        self.demo_active: bool = False
        self.demo_task: Optional[asyncio.Task] = None
        self.last_tick_time = time.time()
        self.auto_crisis_timer = 0.0

    def get_state(self) -> Dict[str, Any]:
        is_chain_valid, corruption_details = self.blockchain.validate_chain()
        
        # Calculate dynamic KPIs
        active_count = sum(1 for s in self.shipments if s["status"] in ["IN_TRANSIT", "AT_RISK", "CRITICAL"])
        at_risk_count = sum(1 for s in self.shipments if s["status"] == "AT_RISK" or s["risk"] > 30)
        critical_count = sum(1 for s in self.shipments if s["status"] == "CRITICAL" or s["risk"] > 70)
        active_disruptions = len(self.active_crises)
        integrity_breaches = 1 if not is_chain_valid else 0

        # Additional executive metrics matching mockup
        total_escrow = sum(s.get("escrow_usd", 0) for s in self.shipments)
        avg_delay_avoided = 2.4 + (self.successful_recoveries * 1.8)
        cost_saved_m = round(1.38 + (self.successful_recoveries * 0.45), 2)

        return {
            "running": self.running,
            "speed": self.speed,
            "mode": self.mode,
            "demo_active": self.demo_active,
            "demo_phase": self.demo_phase,
            "kpis": {
                "active_shipments": active_count,
                "at_risk": at_risk_count,
                "critical": critical_count,
                "active_disruptions": active_disruptions,
                "successful_recoveries": self.successful_recoveries,
                "integrity_breaches": integrity_breaches,
                "total_escrow_secured": total_escrow,
                "avg_delay_avoided_days": avg_delay_avoided,
                "cost_saved_m": cost_saved_m
            },
            "chain_status": {
                "is_valid": is_chain_valid,
                "block_count": len(self.blockchain.chain),
                "latest_hash": self.blockchain.chain[-1].hash if self.blockchain.chain else "",
                "corruption_details": corruption_details
            },
            "shipments": self.shipments,
            "active_crises": self.active_crises,
            "waypoints": WAYPOINTS,
            "recent_events": self.event_bus.get_recent(35)
        }

    async def start(self):
        if not self.running:
            self.running = True
            await self.event_bus.publish(Event(
                type=EventType.SHIPMENT_STARTED,
                shipment_id="ALL",
                actor="CONTROL_TOWER",
                severity=EventSeverity.INFO,
                title="Simulation Started",
                message=f"Global logistics simulation running at {self.speed}x speed.",
                payload={"speed": self.speed, "mode": self.mode}
            ))

    async def pause(self):
        if self.running:
            self.running = False
            await self.event_bus.publish(Event(
                type=EventType.SHIPMENT_MOVED,
                shipment_id="ALL",
                actor="CONTROL_TOWER",
                severity=EventSeverity.INFO,
                title="Simulation Paused",
                message="Global telemetry and vessel movements paused.",
                payload={}
            ))

    async def reset(self):
        self.running = False
        self.demo_active = False
        self.demo_phase = 0
        if self.demo_task and not self.demo_task.done():
            self.demo_task.cancel()
        
        self.shipments = copy.deepcopy(INITIAL_SHIPMENTS)
        self.active_crises = []
        self.successful_recoveries = 0
        self.blockchain._init_genesis()
        
        await self.event_bus.publish(Event(
            type=EventType.SHIPMENT_STARTED,
            shipment_id="ALL",
            actor="SYSTEM_ADMIN",
            severity=EventSeverity.INFO,
            title="Simulation State Reset",
            message="All 3 shipments, blockchain ledger, and routes restored to initial baseline.",
            payload={}
        ))

    def set_speed(self, speed: float):
        self.speed = max(0.25, min(10.0, float(speed)))

    def set_mode(self, mode: str):
        if mode in ["manual", "auto"]:
            self.mode = mode

    async def tick(self, dt: float):
        if not self.running:
            return

        effective_dt = dt * self.speed
        self.auto_crisis_timer += effective_dt

        # Auto Mode crisis injection
        if self.mode == "auto" and self.auto_crisis_timer > 30.0 and not self.active_crises:
            self.auto_crisis_timer = 0.0
            eligible = [s for s in self.shipments if s["status"] == "IN_TRANSIT" and s["id"] == "ORD-5415"]
            if eligible:
                await self.trigger_crisis("RED_SEA", eligible[0]["id"])

        for shipment in self.shipments:
            if shipment["status"] in ["ARRIVED", "ACCEPTED", "REJECTED"]:
                continue

            # If stopped at crisis point, skip movement
            if shipment.get("active_disruption") and shipment["status"] in ["AT_RISK", "CRITICAL"]:
                # Minor temperature drift simulation during crisis
                if shipment["active_disruption"].get("type") == "TEMP_EXCURSION":
                    shipment["current_temp"] = round(shipment["current_temp"] + (0.04 * effective_dt), 2)
                    if shipment["current_temp"] > shipment["temp_max"]:
                        shipment["verification_checklist"]["temp_compliant"] = False
                continue

            # Movement along waypoints
            waypoint_ids = shipment["waypoint_ids"]
            curr_idx = shipment["current_segment_index"]

            if curr_idx >= len(waypoint_ids) - 1:
                # Reached final destination
                shipment["status"] = "ARRIVED"
                shipment["total_progress"] = 100.0
                shipment["segment_progress"] = 1.0
                final_node = WAYPOINTS[waypoint_ids[-1]]
                shipment["current_lat"] = final_node["lat"]
                shipment["current_lng"] = final_node["lng"]
                
                await self.event_bus.publish(Event(
                    type=EventType.SHIPMENT_ARRIVED,
                    shipment_id=shipment["id"],
                    actor="CARRIER",
                    severity=EventSeverity.SUCCESS,
                    title="Shipment Arrived at Destination",
                    message=f"{shipment['id']} ({shipment['cargo']}) reached {final_node['name']}. Awaiting hospital custody inspection.",
                    payload={"destination": final_node["name"]}
                ))
                continue

            wp1 = WAYPOINTS[waypoint_ids[curr_idx]]
            wp2 = WAYPOINTS[waypoint_ids[curr_idx + 1]]

            # Distance-based movement increment
            segment_distance_km = calculate_distance_km(wp1["lat"], wp1["lng"], wp2["lat"], wp2["lng"])
            speed_kmh = shipment["speed_knots"] * 1.852 * 50.0  # scaled for visible simulation
            increment = (speed_kmh * (effective_dt / 3600.0)) / max(segment_distance_km, 10.0)

            shipment["segment_progress"] = min(1.0, shipment["segment_progress"] + increment)
            lat, lng = interpolate_coordinates(wp1["lat"], wp1["lng"], wp2["lat"], wp2["lng"], shipment["segment_progress"])
            shipment["current_lat"] = round(lat, 4)
            shipment["current_lng"] = round(lng, 4)

            # Overall progress calculation
            total_segments = len(waypoint_ids) - 1
            shipment["total_progress"] = round(((curr_idx + shipment["segment_progress"]) / total_segments) * 100.0, 1)

            # Realistic micro temp fluctuation
            temp_jitter = ((int(time.time() * 10) % 5) - 2) * 0.01
            shipment["current_temp"] = round(shipment["target_temp"] + temp_jitter, 2)

            # Decrement battery very slowly
            shipment["battery_pct"] = max(15, round(shipment["battery_pct"] - (0.005 * effective_dt), 1))

            # Segment advance check
            if shipment["segment_progress"] >= 1.0:
                shipment["current_segment_index"] += 1
                shipment["segment_progress"] = 0.0
                passed_node = WAYPOINTS[waypoint_ids[shipment["current_segment_index"]]]
                
                await self.event_bus.publish(Event(
                    type=EventType.SHIPMENT_MOVED,
                    shipment_id=shipment["id"],
                    actor="TELEMETRY_ORACLE",
                    severity=EventSeverity.INFO,
                    title="Waypoint Clearance",
                    message=f"{shipment['id']} crossed transit checkpoint: {passed_node['name']}.",
                    payload={"node": passed_node["name"], "progress": shipment["total_progress"]}
                ))

    async def trigger_crisis(self, crisis_type: str, shipment_id: Optional[str] = None):
        target_shipment = None
        for s in self.shipments:
            if shipment_id and s["id"] == shipment_id:
                target_shipment = s
                break
            elif not shipment_id and s["status"] == "IN_TRANSIT":
                target_shipment = s
                break
        
        if not target_shipment:
            target_shipment = self.shipments[0]

        template = CRISIS_TEMPLATES.get(crisis_type, CRISIS_TEMPLATES["RED_SEA"])
        crisis_id = f"CRS-{uuid.uuid4().hex[:6].upper()}"
        
        crisis_data = {
            "id": crisis_id,
            "type": template["type"],
            "title": template["title"],
            "severity": template["severity"],
            "location": template["location"],
            "affected_shipment_ids": [target_shipment["id"]],
            "affected_segment": template["affected_segment"],
            "coordinates": template["coordinates"],
            "probability": template["probability"],
            "expected_delay_days": template["expected_delay_days"],
            "cost_impact_usd": template["cost_impact_usd"],
            "human_impact": template["human_impact"],
            "description": template["description"],
            "status": "ACTIVE",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        self.active_crises.append(crisis_data)
        
        # Mutate target shipment state
        target_shipment["status"] = "CRITICAL" if template["severity"] == "CRITICAL" else "AT_RISK"
        target_shipment["risk"] = min(98, target_shipment["risk"] + template["probability"])
        target_shipment["eta_days"] += template["expected_delay_days"]
        target_shipment["active_disruption"] = crisis_data

        # Generate Rule-Based Alternative Strategies
        alternatives = self.route_planner.generate_alternatives(crisis_data, target_shipment)
        target_shipment["alternative_routes"] = alternatives

        # Record Crisis Detection Event
        await self.event_bus.publish(Event(
            type=EventType.CRISIS_DETECTED,
            shipment_id=target_shipment["id"],
            actor="DISRUPTION_MONITOR",
            severity=EventSeverity.CRITICAL if template["severity"] == "CRITICAL" else EventSeverity.WARNING,
            title=f"Disruption: {template['title']}",
            message=f"{template['description']} Expected delay: +{template['expected_delay_days']}d. Cost impact: +${template['cost_impact_usd']:,}.",
            payload=crisis_data
        ))

        # Record Route Blocked Event
        await self.event_bus.publish(Event(
            type=EventType.ROUTE_BLOCKED,
            shipment_id=target_shipment["id"],
            actor="CORRIDOR_AUTHORITY",
            severity=EventSeverity.CRITICAL,
            title="Maritime Corridor Impassable",
            message=f"Corridor segment {template['affected_segment']} declared high-risk/blocked. Forward vessel motion paused.",
            payload={"affected_segment": template["affected_segment"]}
        ))

        # Record Alternatives Generated Event
        await self.event_bus.publish(Event(
            type=EventType.ALTERNATIVES_GENERATED,
            shipment_id=target_shipment["id"],
            actor="STRATEGY_ENGINE",
            severity=EventSeverity.INFO,
            title="Alternative Contingency Routes Generated",
            message=f"Synthesized {len(alternatives)} recovery plans. Awaiting Carrier Node consensus approval.",
            payload={"alternatives": [a["name"] for a in alternatives]}
        ))

        # Record Blockchain Block for Crisis Signal
        self.blockchain.add_block(
            event_type="CRISIS_DETECTED",
            shipment_id=target_shipment["id"],
            actor="SENTINEL_DISRUPTION_ORACLE",
            data={
                "crisis_id": crisis_id,
                "type": template["type"],
                "severity": template["severity"],
                "affected_segment": template["affected_segment"],
                "probability": template["probability"]
            }
        )

        return crisis_data

    async def approve_route(self, shipment_id: str, option_id: str):
        target_shipment = next((s for s in self.shipments if s["id"] == shipment_id), None)
        if not target_shipment or not target_shipment.get("alternative_routes"):
            return {"success": False, "error": "No active alternative routes for shipment"}

        selected_option = next((opt for opt in target_shipment["alternative_routes"] if opt["id"] == option_id), None)
        if not selected_option:
            selected_option = target_shipment["alternative_routes"][0]

        # Update shipment routing
        old_route_desc = " -> ".join(target_shipment["waypoint_ids"])
        target_shipment["waypoint_ids"] = selected_option["waypoint_ids"]
        target_shipment["current_segment_index"] = 0
        target_shipment["segment_progress"] = 0.0
        target_shipment["status"] = "IN_TRANSIT"
        target_shipment["risk"] = selected_option["risk_score"]
        target_shipment["eta_days"] = round(target_shipment["eta_days"] - 2.0, 1)
        target_shipment["active_disruption"] = None
        target_shipment["alternative_routes"] = []
        new_route_desc = f"{selected_option['name']} ({selected_option['route_path']})"
        target_shipment["route_history"].append(new_route_desc)

        # Clear resolved crisis
        self.active_crises = [c for c in self.active_crises if shipment_id not in c.get("affected_shipment_ids", [])]
        self.successful_recoveries += 1

        # Publish Stakeholder Consensus Events
        await self.event_bus.publish(Event(
            type=EventType.STRATEGY_APPROVED,
            shipment_id=shipment_id,
            actor="CARRIER_OPERATIONS",
            severity=EventSeverity.SUCCESS,
            title="Reroute Strategy Approved",
            message=f"Carrier authorized {selected_option['name']}. Risk reduced to {selected_option['risk_score']}/100.",
            payload={"option": selected_option}
        ))

        await self.event_bus.publish(Event(
            type=EventType.ROUTE_UPDATED,
            shipment_id=shipment_id,
            actor="DISPATCH_NETWORK",
            severity=EventSeverity.SUCCESS,
            title="Global Route Morph Completed",
            message=f"New corridor activated: {selected_option['route_path']}. Telemetry synchronized to Customs and Hospital.",
            payload={"old_route": old_route_desc, "new_route": new_route_desc}
        ))

        # Append Blockchain Block
        block = self.blockchain.add_block(
            event_type="ROUTE_CHANGED",
            shipment_id=shipment_id,
            actor="CARRIER_CHIEF_DISPATCHER",
            data={
                "decision": selected_option["name"],
                "mode": selected_option["mode"],
                "cost_delta_usd": selected_option["cost_delta_usd"],
                "risk_score": selected_option["risk_score"],
                "new_waypoints": selected_option["waypoint_ids"]
            }
        )

        await self.event_bus.publish(Event(
            type=EventType.BLOCK_CREATED,
            shipment_id=shipment_id,
            actor="BLOCKCHAIN_ENGINE",
            severity=EventSeverity.INFO,
            title=f"Blockchain Block #{block.index} Mined",
            message=f"Cryptographic hash {block.hash[:16]}... immutably seals route modification.",
            payload={"block_index": block.index, "hash": block.hash}
        ))

        return {"success": True, "shipment": target_shipment, "block": block.model_dump()}

    async def accept_delivery(self, shipment_id: str):
        target_shipment = next((s for s in self.shipments if s["id"] == shipment_id), None)
        if not target_shipment:
            return {"success": False, "error": "Shipment not found"}

        is_valid, corruption_details = self.blockchain.validate_chain()

        if not is_valid:
            # Blockchain Tamper Detected -> Freeze Escrow & Reject
            target_shipment["status"] = "REJECTED"
            target_shipment["escrow_status"] = "FROZEN"
            target_shipment["verification_checklist"]["chain_valid"] = False

            await self.event_bus.publish(Event(
                type=EventType.SHIPMENT_REJECTED,
                shipment_id=shipment_id,
                actor="RECEIVER_HOSPITAL",
                severity=EventSeverity.CRITICAL,
                title="Delivery Rejected: Cryptographic Breach",
                message=f"Hospital custody audit failed on block #{corruption_details.get('corrupted_block_index')}. Smart-contract escrow ${target_shipment['escrow_usd']:,} FROZEN.",
                payload=corruption_details or {}
            ))
            return {"success": False, "reason": "CRYPTOGRAPHIC_INTEGRITY_BREACH", "details": corruption_details}

        # Valid acceptance -> Release Escrow
        target_shipment["status"] = "ACCEPTED"
        target_shipment["escrow_status"] = "RELEASED"
        target_shipment["verification_checklist"]["temp_compliant"] = True
        target_shipment["verification_checklist"]["seal_intact"] = True

        block = self.blockchain.add_block(
            event_type="SHIPMENT_ACCEPTED",
            shipment_id=shipment_id,
            actor="HOSPITAL_CHIEF_PHARMACIST",
            data={
                "status": "ACCEPTED",
                "escrow_released_usd": target_shipment["escrow_usd"],
                "cold_chain_final_temp": target_shipment["current_temp"],
                "verification_passed": True
            }
        )

        await self.event_bus.publish(Event(
            type=EventType.SHIPMENT_ACCEPTED,
            shipment_id=shipment_id,
            actor="RECEIVER_HOSPITAL",
            severity=EventSeverity.SUCCESS,
            title="Biomedical Custody Accepted",
            message=f"Hospital pharmacist verified cold-chain and container seal. Delivery confirmed.",
            payload={"escrow_released": target_shipment["escrow_usd"]}
        ))

        await self.event_bus.publish(Event(
            type=EventType.ESCROW_RELEASED,
            shipment_id=shipment_id,
            actor="SMART_CONTRACT_VAULT",
            severity=EventSeverity.SUCCESS,
            title="Smart Escrow Released",
            message=f"Multisig settlement of ${target_shipment['escrow_usd']:,} transferred to Carrier.",
            payload={"amount_usd": target_shipment["escrow_usd"]}
        ))

        return {"success": True, "shipment": target_shipment, "block": block.model_dump()}

    async def tamper_blockchain(self, block_index: int = 1, fake_data: Optional[Dict[str, Any]] = None):
        if not fake_data:
            fake_data = {
                "decision": "MALICIOUS_UNAUTHORIZED_DIVERSION",
                "cost_delta_usd": 0,
                "notes": "TAMPERED_RECORD_ATTACK"
            }

        tamper_result = self.blockchain.tamper_block(block_index, fake_data)

        # Mark all shipments with chain invalid
        for s in self.shipments:
            s["verification_checklist"]["chain_valid"] = False
            if s["status"] == "ARRIVED":
                s["escrow_status"] = "FROZEN"

        await self.event_bus.publish(Event(
            type=EventType.TAMPERING_DETECTED,
            shipment_id="ALL",
            actor="SECURITY_AUDITOR_ORACLE",
            severity=EventSeverity.CRITICAL,
            title="🚨 Cryptographic Ledger Breach Detected",
            message=f"Data alteration detected at Block #{tamper_result['tampered_block_index']}! Stored SHA-256 hash mismatch. Automatic lock engaged.",
            payload=tamper_result
        ))

        return tamper_result

    async def restore_blockchain(self):
        success = self.blockchain.restore_chain()
        if success:
            for s in self.shipments:
                s["verification_checklist"]["chain_valid"] = True
                if s["escrow_status"] == "FROZEN" and s["status"] != "REJECTED":
                    s["escrow_status"] = "ESCROWED"

            await self.event_bus.publish(Event(
                type=EventType.CHAIN_VALID,
                shipment_id="ALL",
                actor="SECURITY_AUDITOR_ORACLE",
                severity=EventSeverity.SUCCESS,
                title="✓ Cryptographic Chain Restored",
                message="Tampered state reverted to canonical hash-chain. Ledger validation: 100% VALID.",
                payload={}
            ))
        return {"success": success}

    async def run_demo_workflow(self):
        """
        17-Phase Automated Guided Scenario:
        1. Shipments started
        2. Approaching Dubai
        3. Red Sea Disruption occurs
        4. Current route blocked
        5. Carrier receives options
        6. Option A approved
        7. Blockchain block created
        8. Master Hub map changes route
        9. Shipment continues
        10. Customs receives updated route
        11. Hospital receives updated ETA
        12. Shipment arrives
        13. Hospital accepts
        14. Escrow releases
        15. Simulated tampering
        16. Blockchain detects breach
        17. Escrow frozen & audit flagged
        """
        self.demo_active = True
        self.speed = 2.0
        self.running = True

        try:
            # Phase 1: Shipments Started
            self.demo_phase = 1
            await asyncio.sleep(2.5)

            # Phase 2: Advancing to Dubai
            self.demo_phase = 2
            ord5415 = next(s for s in self.shipments if s["id"] == "ORD-5415")
            ord5415["current_segment_index"] = 2
            ord5415["segment_progress"] = 0.85
            ord5415["current_lat"] = 25.2048
            ord5415["current_lng"] = 55.2708
            await asyncio.sleep(2.0)

            # Phase 3 & 4: Red Sea Disruption & Route Blocked
            self.demo_phase = 3
            await self.trigger_crisis("RED_SEA", "ORD-5415")
            self.demo_phase = 4
            await asyncio.sleep(3.0)

            # Phase 5: Alternatives Generated & Carrier Notification
            self.demo_phase = 5
            await asyncio.sleep(2.5)

            # Phase 6 & 7 & 8: Carrier Approves Option A -> Block Mined -> Map Rerouted
            self.demo_phase = 6
            await self.approve_route("ORD-5415", "OPT-A")
            self.demo_phase = 7
            await asyncio.sleep(1.5)
            self.demo_phase = 8
            await asyncio.sleep(2.0)

            # Phase 9: Shipment Resumes
            self.demo_phase = 9
            await asyncio.sleep(2.5)

            # Phase 10 & 11: Customs & Hospital Synchronization
            self.demo_phase = 10
            await self.event_bus.publish(Event(
                type=EventType.CUSTOMS_VERIFIED,
                shipment_id="ORD-5415",
                actor="CUSTOMS_GATE",
                severity=EventSeverity.INFO,
                title="Customs Reroute Manifest Verified",
                message="Rotterdam Customs received amended flight charter manifest for ORD-5415.",
                payload={}
            ))
            self.demo_phase = 11
            await asyncio.sleep(2.0)

            # Phase 12: Shipment Arrives
            self.demo_phase = 12
            ord5415["current_segment_index"] = len(ord5415["waypoint_ids"]) - 1
            ord5415["segment_progress"] = 1.0
            ord5415["status"] = "ARRIVED"
            final_node = WAYPOINTS[ord5415["waypoint_ids"][-1]]
            ord5415["current_lat"] = final_node["lat"]
            ord5415["current_lng"] = final_node["lng"]
            await self.event_bus.publish(Event(
                type=EventType.SHIPMENT_ARRIVED,
                shipment_id="ORD-5415",
                actor="CARRIER",
                severity=EventSeverity.SUCCESS,
                title="Shipment Arrived at Hospital",
                message="ORD-5415 arrived at St. Jude Regional Hospital. Docked at cryogenic receiver bay.",
                payload={}
            ))
            await asyncio.sleep(2.5)

            # Phase 13 & 14: Hospital Accepts & Escrow Released
            self.demo_phase = 13
            await self.accept_delivery("ORD-5415")
            self.demo_phase = 14
            await asyncio.sleep(3.0)

            # Phase 15, 16, 17: Tamper Injection & Chain Invalidation Demonstration
            self.demo_phase = 15
            await self.tamper_blockchain(1)
            self.demo_phase = 16
            await asyncio.sleep(2.5)
            self.demo_phase = 17

        except asyncio.CancelledError:
            pass
        finally:
            self.demo_active = False

    def start_demo(self):
        if self.demo_task and not self.demo_task.done():
            self.demo_task.cancel()
        self.demo_task = asyncio.create_task(self.run_demo_workflow())
