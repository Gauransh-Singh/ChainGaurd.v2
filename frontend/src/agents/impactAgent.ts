import { SentinelResult } from './sentinelAgent';
import { Shipment, TransportMode } from '../types/shipment';

export type ImpactRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ImpactBreakdown {
  fuelCostINR: number;
  demurrageCostINR: number;
  berthOrHandlingINR: number;
  insuranceRiskSurchargeINR: number;
}

export interface ImpactResult {
  eventId: string;
  shipmentId: string;

  crisisType: string;
  crisisTitle: string;

  affectedSegment: string;

  delayHours: number;
  delayDays: number;
  delayFormatted: string;

  additionalCostINR: number;
  costFormatted: string;
  costBreakdown: ImpactBreakdown;

  riskLevel: ImpactRiskLevel;

  cargoStatus: 'NORMAL' | 'AT_RISK' | 'CRITICAL';

  operationalStatus:
    | 'SPEED_HALTED'
    | 'ROUTE_BLOCKED'
    | 'PORT_CONGESTION'
    | 'AIRPORT_CLOSED';

  impactSummary: string;

  nextAgent: 'STRATEGY_AGENT';
  assessedAt: string;
}

/**
 * Impact Agent: Evaluates physical delay (Hours for Air, Days for Sea),
 * financial cost impact, and cargo integrity risks based on physical reality.
 */
export function impactAgent(
  sentinel: SentinelResult,
  shipment: Shipment
): ImpactResult {
  if (!sentinel.verified) {
    throw new Error('Impact Agent cannot process an unverified crisis.');
  }

  let delayHours = 0;
  let additionalCostINR = 0;
  let breakdown: ImpactBreakdown = {
    fuelCostINR: 60000,
    demurrageCostINR: 30000,
    berthOrHandlingINR: 30000,
    insuranceRiskSurchargeINR: 20000,
  };

  let operationalStatus:
    | 'SPEED_HALTED'
    | 'ROUTE_BLOCKED'
    | 'PORT_CONGESTION'
    | 'AIRPORT_CLOSED' = 'ROUTE_BLOCKED';

  const typeUpper = sentinel.crisisType.toUpperCase();
  const titleUpper = sentinel.title.toUpperCase();
  const isAviation = shipment.mode === 'air';

  // -------------------------------------------------------------------------
  // 1. Aviation Disruption Calculations (Measured in HOURS)
  // -------------------------------------------------------------------------
  if (isAviation) {
    if (typeUpper.includes('MECHANICAL') || titleUpper.includes('AVIONICS') || titleUpper.includes('ENGINE')) {
      delayHours = 7.5; // 7.5 hours ground diagnostics, cargo unload & replacement aircraft
      additionalCostINR = 140000;
      breakdown = { fuelCostINR: 40000, demurrageCostINR: 20000, berthOrHandlingINR: 60000, insuranceRiskSurchargeINR: 20000 };
      operationalStatus = 'SPEED_HALTED';
    } else if (typeUpper.includes('AIRSPACE') || titleUpper.includes('AIRSPACE') || titleUpper.includes('RESTRICTION')) {
      delayHours = 8.5; // 8.5 hours airway corridor detour
      additionalCostINR = 180000;
      breakdown = { fuelCostINR: 110000, demurrageCostINR: 30000, berthOrHandlingINR: 20000, insuranceRiskSurchargeINR: 20000 };
      operationalStatus = 'ROUTE_BLOCKED';
    } else if (typeUpper.includes('AIRPORT') || titleUpper.includes('GROUND STOP') || titleUpper.includes('AIRPORT CLOSURE')) {
      delayHours = 11.0;
      additionalCostINR = 60000;
      breakdown = { fuelCostINR: 20000, demurrageCostINR: 20000, berthOrHandlingINR: 15000, insuranceRiskSurchargeINR: 5000 };
      operationalStatus = 'AIRPORT_CLOSED';
    } else if (typeUpper.includes('UPPER_AIR') || titleUpper.includes('JETSTREAM') || titleUpper.includes('WINDSHEAR') || titleUpper.includes('STORM')) {
      delayHours = 6.5;
      additionalCostINR = 120000;
      breakdown = { fuelCostINR: 80000, demurrageCostINR: 20000, berthOrHandlingINR: 10000, insuranceRiskSurchargeINR: 10000 };
      operationalStatus = 'SPEED_HALTED';
    } else {
      delayHours = 6.0;
      additionalCostINR = 100000;
      breakdown = { fuelCostINR: 50000, demurrageCostINR: 20000, berthOrHandlingINR: 15000, insuranceRiskSurchargeINR: 15000 };
      operationalStatus = 'SPEED_HALTED';
    }
  }
  // -------------------------------------------------------------------------
  // 2. Maritime Disruption Calculations (Measured in DAYS)
  // -------------------------------------------------------------------------
  else {
    if (typeUpper.includes('SUEZ') || titleUpper.includes('SUEZ') || titleUpper.includes('RED SEA')) {
      delayHours = 8.2 * 24;
      additionalCostINR = 480000;
      breakdown = { fuelCostINR: 240000, demurrageCostINR: 140000, berthOrHandlingINR: 60000, insuranceRiskSurchargeINR: 40000 };
      operationalStatus = 'ROUTE_BLOCKED';
    } else if (typeUpper.includes('BAB_EL_MANDEB') || titleUpper.includes('BAB-EL-MANDEB')) {
      delayHours = 6.5 * 24;
      additionalCostINR = 390000;
      breakdown = { fuelCostINR: 200000, demurrageCostINR: 110000, berthOrHandlingINR: 50000, insuranceRiskSurchargeINR: 30000 };
      operationalStatus = 'ROUTE_BLOCKED';
    } else if (typeUpper.includes('PANAMA') || titleUpper.includes('PANAMA')) {
      delayHours = 5.0 * 24;
      additionalCostINR = 320000;
      breakdown = { fuelCostINR: 150000, demurrageCostINR: 90000, berthOrHandlingINR: 50000, insuranceRiskSurchargeINR: 30000 };
      operationalStatus = 'ROUTE_BLOCKED';
    } else if (typeUpper.includes('PORT_CONGESTION') || titleUpper.includes('CONGESTION') || titleUpper.includes('STRIKE')) {
      delayHours = 4.8 * 24;
      additionalCostINR = 280000;
      breakdown = { fuelCostINR: 60000, demurrageCostINR: 140000, berthOrHandlingINR: 60000, insuranceRiskSurchargeINR: 20000 };
      operationalStatus = 'PORT_CONGESTION';
    } else if (typeUpper.includes('MECHANICAL') || titleUpper.includes('ENGINE') || titleUpper.includes('PROPULSION')) {
      delayHours = 4.2 * 24;
      additionalCostINR = 350000;
      breakdown = { fuelCostINR: 40000, demurrageCostINR: 160000, berthOrHandlingINR: 120000, insuranceRiskSurchargeINR: 30000 };
      operationalStatus = 'SPEED_HALTED';
    } else if (typeUpper.includes('SEVERE_WEATHER') || titleUpper.includes('TYPHOON') || titleUpper.includes('CYCLONE') || titleUpper.includes('GALE') || titleUpper.includes('STORM')) {
      delayHours = 2.6 * 24;
      additionalCostINR = 180000;
      breakdown = { fuelCostINR: 90000, demurrageCostINR: 50000, berthOrHandlingINR: 20000, insuranceRiskSurchargeINR: 20000 };
      operationalStatus = 'SPEED_HALTED';
    } else if (typeUpper.includes('TEMP') || typeUpper.includes('EXCURSION') || titleUpper.includes('TEMPERATURE') || titleUpper.includes('REFRIGERATION')) {
      delayHours = 1.5 * 24;
      additionalCostINR = 420000;
      breakdown = { fuelCostINR: 50000, demurrageCostINR: 70000, berthOrHandlingINR: 180000, insuranceRiskSurchargeINR: 120000 };
      operationalStatus = 'SPEED_HALTED';
    } else {
      delayHours = 4.0 * 24;
      additionalCostINR = 150000;
      breakdown = { fuelCostINR: 70000, demurrageCostINR: 40000, berthOrHandlingINR: 20000, insuranceRiskSurchargeINR: 20000 };
      operationalStatus = 'SPEED_HALTED';
    }
  }

  // -------------------------------------------------------------------------
  // 3. Risk Level Assessment
  // -------------------------------------------------------------------------
  let riskScore = sentinel.confidence;

  if (sentinel.severity === 'CRITICAL') {
    riskScore += 15;
  } else if (sentinel.severity === 'HIGH') {
    riskScore += 10;
  } else if (sentinel.severity === 'MEDIUM') {
    riskScore += 5;
  }

  const isTempSensitive =
    shipment.cargoType === 'biologics' ||
    shipment.cargoType === 'pharmaceutical' ||
    shipment.cargo.toLowerCase().includes('vaccine') ||
    shipment.cargo.toLowerCase().includes('temperature');

  if (isTempSensitive) {
    riskScore += 10;
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel: ImpactRiskLevel;
  if (riskScore >= 88) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 68) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 40) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // -------------------------------------------------------------------------
  // 4. Cargo Integrity Status
  // -------------------------------------------------------------------------
  let cargoStatus: 'NORMAL' | 'AT_RISK' | 'CRITICAL' = 'NORMAL';

  if (isTempSensitive) {
    if (shipment.temperature !== undefined && shipment.temperature > 4.0) {
      cargoStatus = 'CRITICAL';
    } else {
      cargoStatus = 'AT_RISK';
    }
  } else if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    cargoStatus = 'AT_RISK';
  }

  // -------------------------------------------------------------------------
  // 5. Clean Formatting (Hours for Air, Days for Sea)
  // -------------------------------------------------------------------------
  const delayDays = Number((delayHours / 24).toFixed(1));
  const delayFormatted = isAviation
    ? `+${delayHours.toFixed(1)} Hours`
    : `+${delayDays} Days`;
  const costFormatted = `+₹${(additionalCostINR / 100000).toFixed(1)}L`;

  // -------------------------------------------------------------------------
  // 6. Human-Readable Operational Summary
  // -------------------------------------------------------------------------
  const impactSummary = isAviation
    ? `${shipment.id} (${shipment.cargo}) is grounded at ${shipment.from} due to ${sentinel.title}. Expected delay is ${delayFormatted} with an estimated operational cost of ${costFormatted}. Risk: ${riskLevel}.`
    : `${shipment.id} (${shipment.cargo}) is disrupted by ${sentinel.title}. Expected maritime delay is ${delayFormatted} with estimated cost of ${costFormatted}. Risk: ${riskLevel}.`;

  return {
    eventId: sentinel.eventId,
    shipmentId: shipment.id,

    crisisType: sentinel.crisisType,
    crisisTitle: sentinel.title,

    affectedSegment: sentinel.affectedSegment,

    delayHours,
    delayDays,
    delayFormatted,

    additionalCostINR,
    costFormatted,
    costBreakdown: breakdown,

    riskLevel,

    cargoStatus,

    operationalStatus,

    impactSummary,

    nextAgent: 'STRATEGY_AGENT',
    assessedAt: new Date().toISOString(),
  };
}
