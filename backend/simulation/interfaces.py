from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class DisruptionDetector(ABC):
    """
    Interface for crisis signal detection.
    Current implementation: RuleBasedDisruptionDetector.
    Future pluggable replacement: Sentinel Agent (AI).
    """
    @abstractmethod
    def detect(self, shipment_state: Dict[str, Any], telemetry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pass

class ImpactCalculator(ABC):
    """
    Interface for assessing operational and human impact of disruptions.
    Current implementation: RuleBasedImpactCalculator.
    Future pluggable replacement: Impact Agent (AI).
    """
    @abstractmethod
    def assess_impact(self, crisis: Dict[str, Any], shipment: Dict[str, Any]) -> Dict[str, Any]:
        pass

class RoutePlanner(ABC):
    """
    Interface for dynamic multi-criteria route optimization.
    Current implementation: RuleBasedRoutePlanner.
    Future pluggable replacement: Strategy Agent (AI).
    """
    @abstractmethod
    def generate_alternatives(self, crisis: Dict[str, Any], shipment: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass

class RecoveryPlanner(ABC):
    """
    Interface for secondary contingency and execution failure recovery.
    Current implementation: RuleBasedRecoveryPlanner.
    Future pluggable replacement: Recovery Agent (AI).
    """
    @abstractmethod
    def plan_secondary_recovery(self, failed_strategy: Dict[str, Any], shipment: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
