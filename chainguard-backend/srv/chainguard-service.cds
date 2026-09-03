using chainguard from '../db/schema';

service ChainGuardService @(path: '/chain-guard') {

    @readonly
    entity Nodes as projection on chainguard.Nodes;

    @readonly
    entity Routes as projection on chainguard.Routes;

    entity Shipments as projection on chainguard.Shipments;
    entity Crises as projection on chainguard.Crises;
    entity RecoveryPlans as projection on chainguard.RecoveryPlans;
    entity AgentEvents as projection on chainguard.AgentEvents;

    // Custom domain actions
    action triggerCrisis(shipmentID: String, crisisType: String, location: String) returns Crises;
    action approveRecoveryPlan(shipmentID: String, planID: String) returns Shipments;
    action tamperTelemetry(shipmentID: String, fakedTemp: Decimal(5,2), fakedSeal: String) returns Shipments;
    action verifyAndReleaseEscrow(shipmentID: String) returns { success: Boolean; escrowReleasedUSD: Decimal(15,2); message: String };
}
