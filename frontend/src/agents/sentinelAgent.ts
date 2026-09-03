import { TransportMode, Shipment, ActiveCrisis } from '../types/shipment';

export interface CrisisEvent {
  id: string;
  type: string;
  title: string;
  location: string;
  affectedSegment?: string;
  affectedRouteId?: string;
  transportMode: TransportMode | 'both';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface SentinelCheckItem {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  details: string;
}

export interface SentinelResult {
  eventId: string;
  shipmentId: string;
  detected: boolean;
  verified: boolean;
  crisisType: string;
  title: string;
  location: string;
  affectedSegment: string;
  severity: string;
  confidence: number;
  confidenceTier: 'HIGH CONFIDENCE' | 'MODERATE' | 'UNVERIFIED';
  reason: string;
  reasons: string[];
  checks: SentinelCheckItem[];
  eventHash: string;
  nextAgent: 'IMPACT_AGENT' | 'NONE';
  detectedAt: string;
  status: 'ANALYZING' | 'VERIFIED' | 'IGNORED';
}

/**
 * Sentinel Agent: First intelligent layer between simulation and other agents.
 * Monitors shipments -> detects disruption -> validates relevance -> calculates confidence -> passes structured alert to Impact Agent.
 */
export function sentinelAgent(
  shipment: Shipment,
  crisis: ActiveCrisis | CrisisEvent
): SentinelResult {
  let confidence = 0;
  const reasons: string[] = [];
  const checks: SentinelCheckItem[] = [];

  const segIdx = Math.min(shipment.segments.length - 1, shipment.currentSegmentIndex);
  const activeSeg = shipment.segments[segIdx];
  const currentSegmentStr = activeSeg ? `${activeSeg.from}-${activeSeg.to}` : `${shipment.from}-${shipment.to}`;
  const currentNode = activeSeg?.from || shipment.from;

  // -------------------------------------------------------------------------
  // 1. Check Transport Mode (Sea / Air / Road)
  // -------------------------------------------------------------------------
  let crisisMode: TransportMode | 'both' = 'both';
  if ('transportMode' in crisis && crisis.transportMode) {
    crisisMode = crisis.transportMode;
  } else if ('affectedSegment' in crisis && crisis.affectedSegment && typeof crisis.affectedSegment === 'object' && 'mode' in crisis.affectedSegment) {
    crisisMode = crisis.affectedSegment.mode as TransportMode;
  }

  const modeMatches = crisisMode === 'both' || crisisMode === shipment.mode;

  if (modeMatches) {
    confidence += 30;
    reasons.push('Transport mode matches');
    checks.push({
      id: 'mode',
      label: 'Transport Mode Verified',
      passed: true,
      score: 30,
      details: `Carrier is ${shipment.mode.toUpperCase()}, disruption impacts ${crisisMode.toUpperCase()}`,
    });
  } else {
    checks.push({
      id: 'mode',
      label: 'Transport Mode Mismatch',
      passed: false,
      score: 0,
      details: `Shipment is ${shipment.mode.toUpperCase()} but crisis impacts ${crisisMode.toUpperCase()}`,
    });
  }

  // -------------------------------------------------------------------------
  // 2. Check Affected Segment / Corridor
  // -------------------------------------------------------------------------
  const crisisSeg = ('affectedSegment' in crisis && typeof crisis.affectedSegment === 'string')
    ? crisis.affectedSegment
    : ('affectedSegment' in crisis && crisis.affectedSegment && typeof crisis.affectedSegment === 'object')
    ? `${crisis.affectedSegment.from}-${crisis.affectedSegment.to}`
    : '';

  const segmentMatches = Boolean(
    (crisisSeg && (crisisSeg === currentSegmentStr || crisisSeg === `${activeSeg?.to}-${activeSeg?.from}`)) ||
    (crisis.affectedRouteId && activeSeg?.routeId === crisis.affectedRouteId)
  );

  if (segmentMatches) {
    confidence += 35;
    reasons.push('Current shipment segment is affected');
    checks.push({
      id: 'segment',
      label: 'Active Route Segment Impacted',
      passed: true,
      score: 35,
      details: `Active corridor ${currentSegmentStr} directly intersects crisis zone`,
    });
  } else {
    const pathIntersects = Boolean(
      crisis.affectedRouteId && shipment.segments.some((s) => s.routeId === crisis.affectedRouteId)
    );
    if (pathIntersects) {
      confidence += 20;
      reasons.push('Upcoming itinerary segment impacted');
      checks.push({
        id: 'segment',
        label: 'Upcoming Segment in Path',
        passed: true,
        score: 20,
        details: `Corridor in downstream route itinerary`,
      });
    } else {
      checks.push({
        id: 'segment',
        label: 'Route Segment Bypass',
        passed: false,
        score: 0,
        details: `Active corridor is ${currentSegmentStr}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Check Geographic Location Proximity
  // -------------------------------------------------------------------------
  const crisisLoc = ('locationName' in crisis ? crisis.locationName : '') || ('location' in crisis ? (crisis as any).location : '') || '';
  const crisisNodeId = 'locationNodeId' in crisis ? crisis.locationNodeId : '';

  const locationMatches = Boolean(
    (crisisLoc && (
      crisisLoc.toLowerCase().includes(currentNode.toLowerCase()) ||
      currentSegmentStr.toLowerCase().includes(crisisLoc.toLowerCase()) ||
      shipment.pathNodes.some((n) => crisisLoc.toLowerCase().includes(n.toLowerCase()))
    )) ||
    (crisisNodeId && (crisisNodeId === currentNode || shipment.pathNodes.includes(crisisNodeId)))
  );

  if (locationMatches) {
    confidence += 20;
    reasons.push('Crisis location matches shipment route');
    checks.push({
      id: 'location',
      label: 'Geographic Proximity Confirmed',
      passed: true,
      score: 20,
      details: `Waypoint in active proximity to ${crisisLoc || crisisNodeId || 'incident zone'}`,
    });
  } else {
    checks.push({
      id: 'location',
      label: 'Location Clear',
      passed: false,
      score: 0,
      details: `Incident is outside active node perimeter`,
    });
  }

  // -------------------------------------------------------------------------
  // 4. Check Severity Rating & IoT Telemetry
  // -------------------------------------------------------------------------
  const severityStr = ('severity' in crisis && typeof crisis.severity === 'string')
    ? crisis.severity.toUpperCase()
    : ('riskScore' in crisis && crisis.riskScore >= 75)
    ? 'HIGH'
    : 'MEDIUM';

  if (severityStr === 'HIGH' || severityStr === 'CRITICAL' || ('riskScore' in crisis && crisis.riskScore >= 75)) {
    confidence += 15;
    reasons.push('High-severity disruption');
    checks.push({
      id: 'severity',
      label: 'High-Severity Impact Rating',
      passed: true,
      score: 15,
      details: `Disruption rated ${severityStr} with operational stoppage risk`,
    });
  } else {
    confidence += 5;
    checks.push({
      id: 'severity',
      label: 'Standard Severity Rating',
      passed: true,
      score: 5,
      details: `Disruption rated ${severityStr}`,
    });
  }

  // -------------------------------------------------------------------------
  // 5. Final Verification & Confidence Bounds
  // -------------------------------------------------------------------------
  const verified = modeMatches && (segmentMatches || locationMatches);

  if (!verified) {
    confidence = Math.min(confidence, 45);
  } else if (modeMatches && segmentMatches && locationMatches) {
    confidence = Math.max(confidence, 91);
  }

  const confidenceTier: 'HIGH CONFIDENCE' | 'MODERATE' | 'UNVERIFIED' =
    confidence >= 80 ? 'HIGH CONFIDENCE' : confidence >= 50 ? 'MODERATE' : 'UNVERIFIED';

  // Generate deterministic SHA-like event hash for blockchain logging
  const pseudoHash = '0x' + Array.from(crisis.id + shipment.id + Date.now().toString(16))
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40);

  return {
    eventId: crisis.id,
    shipmentId: shipment.id,
    detected: true,
    verified,
    crisisType: crisis.type,
    title: crisis.title,
    location: crisisLoc || currentSegmentStr,
    affectedSegment: crisisSeg || currentSegmentStr,
    severity: severityStr,
    confidence: Math.min(100, confidence),
    confidenceTier,
    reason: verified ? reasons.join(' • ') : 'Crisis does not sufficiently match the shipment',
    reasons,
    checks,
    eventHash: pseudoHash,
    nextAgent: verified ? 'IMPACT_AGENT' : 'NONE',
    detectedAt: new Date().toISOString(),
    status: verified ? 'VERIFIED' : 'IGNORED',
  };
}
