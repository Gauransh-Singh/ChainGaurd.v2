import { RecoveryPlansPanel } from '../components/RecoveryPlansPanel';
import React from 'react';
import { SimulationState } from '../types';
import { TopHeader } from '../components/TopHeader';
import { KpiCardsRow } from '../components/KpiCardsRow';
import { GlobalSupplyChainMonitor } from '../components/GlobalSupplyChainMonitor';
import { AiAgentPipeline } from '../components/AiAgentPipeline';
import { CriticalAlertCard, ActiveSimulationCard } from '../components/RightSidebarCards';
import {
  ActiveShipmentsCard,
  RecentAlertsCard,
  BlockchainDecisionsCard,
} from '../components/BottomSectionCards';

interface DashboardViewProps {
  state: SimulationState | null;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ state, onNavigate }) => {
  const shipments = state?.shipments || [];
  const waypoints = state?.waypoints || {};
  const crises = state?.active_crises || [];
  const activeCrisis = crises[0] || null;

  return (
    <div className="space-y-4 max-w-[1780px] mx-auto pb-6">
      {/* 1. Top Header */}
      <TopHeader
        currentNode="master"
        onSelectNode={(node) => onNavigate(node)}
        liveMode={true}
      />

      {/* 2. KPI Cards Row (5 Stat Cards) */}
      <KpiCardsRow />

      {/* 3. Middle Section: Map + AI Agents (9 cols) with Recovery Plans Panel below | Right Sidebar (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left & Center: Map + Agents + Recovery Plans below (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Map (8 cols of 9) */}
            <div className="lg:col-span-8">
              <GlobalSupplyChainMonitor />
            </div>

            {/* AI Agent Pipeline (4 cols of 9) */}
            <div className="lg:col-span-4">
              <AiAgentPipeline onViewDetails={() => onNavigate('agents')} />
            </div>
          </div>

          {/* Dedicated Recovery Plans Comparison Panel (Renders directly under the map & agent pipeline) */}
          <RecoveryPlansPanel />
        </div>

        {/* Right Sidebar: Critical Alert & Active Simulation (3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-start">
          <CriticalAlertCard
            onViewDisruption={() => onNavigate('carrier')}
          />
          <ActiveSimulationCard
            onViewSimulation={() => onNavigate('simulation')}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Active Shipments | Recent Alerts | Recent Decisions (Blockchain) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
        <ActiveShipmentsCard
          onViewAll={() => onNavigate('shipments')}
        />
        <RecentAlertsCard onViewAll={() => onNavigate('alerts')} />
        <BlockchainDecisionsCard onViewLedger={() => onNavigate('ledger')} />
      </div>
    </div>
  );
};
