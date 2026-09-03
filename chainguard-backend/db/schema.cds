namespace chainguard;

using { cuid, managed } from '@sap/cds/common';

entity Shipments {
    key ID                      : String(20);
    cargo                       : String(100);
    cargoType                   : String(50);
    origin                      : String(20);
    destination                 : String(20);
    mode                        : String(20);
    currentNode                 : String(20);
    currentCoordX               : Decimal(10,4);
    currentCoordY               : Decimal(10,4);
    progress                    : Decimal(5,2);
    speed                       : Decimal(10,2);
    status                      : String(30);
    riskLevel                   : String(20);
    eta                         : String(50);
    batchInfo                   : String(100);
    clinicalPriority            : String(100);
    reeferBatteryHours          : Integer;
    impactShockG                : Decimal(5,2);
    actualSensorTemp            : Decimal(5,2);
    reportedTemp                : Decimal(5,2);
    isTemperatureManipulated    : Boolean default false;
    tempPolicyText              : String(100);
    sealStatus                  : String(20);
    reportedSealStatus          : String(20);
    isSealManipulated           : Boolean default false;
    escrowAmountUSD             : Decimal(15,2);
    escrowStatus                : String(30);
    blockchainSensorHash        : String(100);
}

entity Nodes {
    key ID                      : String(20);
    name                        : String(100);
    country                     : String(100);
    sea                         : Boolean;
    air                         : Boolean;
    xPct                        : Decimal(10,4);
    yPct                        : Decimal(10,4);
    latitude                    : Decimal(10,6);
    longitude                   : Decimal(10,6);
}

entity Routes {
    key ID                      : String(50);
    fromNode                    : String(20);
    toNode                      : String(20);
    mode                        : String(20);
    distanceKm                  : Decimal(12,2);
    isTranspacific              : Boolean default false;
    corridorName                : String(100);
}

entity Crises {
    key ID                      : String(30);
    shipmentID                  : String(20);
    type                        : String(100);
    title                       : String(200);
    severity                    : String(30);
    status                      : String(30);
    locationNodeId              : String(50);
    locationName                : String(100);
    etaImpact                   : String(50);
    riskScore                   : Integer;
    description                 : String(500);
    timestamp                   : String(50);
}

entity RecoveryPlans {
    key ID                      : String(30);
    shipmentID                  : String(20);
    title                       : String(200);
    type                        : String(50);
    mode                        : String(30);
    modeBadge                   : String(50);
    routeCorridor               : String(500);
    etaValue                    : String(50);
    costFormatted               : String(50);
    riskLevel                   : String(30);
    description                 : String(500);
    recommended                 : Boolean default false;
    approvalStatus              : String(30);
}

entity AgentEvents {
    key ID                      : UUID;
    agentName                   : String(50);
    shipmentID                  : String(20);
    eventType                   : String(50);
    summary                     : String(500);
    confidenceScore             : Decimal(5,2);
    createdAt                   : Timestamp;
}
