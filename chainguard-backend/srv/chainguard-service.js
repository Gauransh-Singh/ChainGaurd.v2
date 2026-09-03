const cds = require('@sap/cds');

module.exports = class ChainGuardService extends cds.ApplicationService {
  init() {
    const { Shipments, Crises, RecoveryPlans, AgentEvents } = this.entities;

    // Before creating a crisis, assign auto-timestamp
    this.before('CREATE', 'Crises', (req) => {
      if (!req.data.timestamp) {
        req.data.timestamp = new Date().toLocaleTimeString();
      }
    });

    // Custom Action: approveRecoveryPlan
    this.on('approveRecoveryPlan', async (req) => {
      const { shipmentID, planID } = req.data;
      if (!shipmentID) return req.error(400, 'shipmentID is required');

      await UPDATE(Shipments)
        .set({
          status: 'REROUTING',
          riskLevel: 'LOW',
          speed: 840.0
        })
        .where({ ID: shipmentID });

      await UPDATE(Crises)
        .set({ status: 'RESOLVED' })
        .where({ shipmentID: shipmentID });

      await INSERT.into(AgentEvents).entries({
        agentName: 'STRATEGY_AGENT',
        shipmentID: shipmentID,
        eventType: 'PLAN_APPROVED',
        summary: `Plan ${planID} authorized on-chain. Resumed via optimized corridor.`,
        confidenceScore: 0.98,
        createdAt: new Date().toISOString()
      });

      return await SELECT.one.from(Shipments).where({ ID: shipmentID });
    });

    // Custom Action: tamperTelemetry
    this.on('tamperTelemetry', async (req) => {
      const { shipmentID, fakedTemp, fakedSeal } = req.data;
      await UPDATE(Shipments)
        .set({
          reportedTemp: fakedTemp,
          reportedSealStatus: fakedSeal || 'INTACT',
          isTemperatureManipulated: true
        })
        .where({ ID: shipmentID });

      return await SELECT.one.from(Shipments).where({ ID: shipmentID });
    });

    // Custom Action: verifyAndReleaseEscrow
    this.on('verifyAndReleaseEscrow', async (req) => {
      const { shipmentID } = req.data;
      const shipment = await SELECT.one.from(Shipments).where({ ID: shipmentID });
      if (!shipment) return req.error(404, 'Shipment not found');

      const tempDiff = Math.abs(shipment.actualSensorTemp - shipment.reportedTemp);
      const isClean = tempDiff <= 0.5 && shipment.sealStatus === 'INTACT' && !shipment.isTemperatureManipulated;

      if (isClean) {
        await UPDATE(Shipments)
          .set({ status: 'DELIVERED', escrowStatus: 'RELEASED' })
          .where({ ID: shipmentID });

        return {
          success: true,
          escrowReleasedUSD: shipment.escrowAmountUSD,
          message: `Zero-Trust Audit Passed. Released $${shipment.escrowAmountUSD.toLocaleString()} USD to carrier.`
        };
      } else {
        await UPDATE(Shipments)
          .set({ status: 'RECOVERED', escrowStatus: 'FROZEN' })
          .where({ ID: shipmentID });

        return {
          success: false,
          escrowReleasedUSD: 0,
          message: `Zero-Trust Audit Failed: Fraud Detected. Escrow frozen on-chain.`
        };
      }
    });

    return super.init();
  }
};
