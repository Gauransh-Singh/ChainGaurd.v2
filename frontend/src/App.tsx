import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SimulationProvider } from './context/SimulationContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './pages/DashboardView';
import { ShipmentsView } from './pages/ShipmentsView';
import { AgentsView } from './pages/AgentsView';
import { SimulationView } from './pages/SimulationView';
import { AlertsView } from './pages/AlertsView';
import { BlockchainLedger } from './pages/BlockchainLedger';
import { TamperModal } from './components/TamperModal';
import { CarrierNode } from './pages/CarrierNode';
import { ReceiverHospital } from './pages/ReceiverHospital';

export const App: React.FC = () => {
  const getInitialNode = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/carrier')) return 'carrier';
    if (path.includes('/receiver') || path.includes('/hospital')) return 'hospital';
    return 'master';
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentNode, setCurrentNode] = useState<string>(getInitialNode());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState<boolean>(false);

  // Sync node changes with browser URL and listen to popstate
  const handleSelectNode = (node: string) => {
    setCurrentNode(node);
    const newPath = node === 'master' ? '/' : `/${node}`;
    window.history.pushState({ node }, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentNode(getInitialNode());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ErrorBoundary fallbackTitle="ChainGuard System Recovery">
      <SimulationProvider>
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-black">
          {/* If on Master Hub, display the Sidebar */}
          {currentNode === 'master' && (
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          )}

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
            <main className="flex-1 flex flex-col w-full max-w-[1780px] mx-auto p-3 sm:p-4 lg:p-5">
              {/* Top Node Switcher Header (Visible on Carrier & Hospital nodes as well) */}
              {currentNode !== 'master' && (
                <TopHeader
                  currentNode={currentNode}
                  onSelectNode={handleSelectNode}
                  liveMode={true}
                />
              )}

              {/* MASTER HUB ROUTING */}
              {currentNode === 'master' && (
                <>
                  {activeTab === 'dashboard' && <DashboardView state={null} onNavigate={handleSelectNode} />}
                  {activeTab === 'shipments' && <ShipmentsView />}
                  {activeTab === 'agents' && <AgentsView />}
                  {activeTab === 'simulation' && <SimulationView />}
                  {activeTab === 'alerts' && <AlertsView />}
                  {activeTab === 'ledger' && (
                    <BlockchainLedger
                      state={null}
                      onTamperClick={() => setIsTamperModalOpen(true)}
                    />
                  )}
                </>
              )}

              {/* CARRIER NODE ROUTING */}
              {currentNode === 'carrier' && (
                <CarrierNode onNavigate={handleSelectNode} />
              )}

              {/* RECEIVER HOSPITAL NODE ROUTING */}
              {currentNode === 'hospital' && (
                <ReceiverHospital onNavigate={handleSelectNode} />
              )}
            </main>
          </div>

          {/* Blockchain Tamper Simulation Modal */}
          <TamperModal
            isOpen={isTamperModalOpen}
            onClose={() => setIsTamperModalOpen(false)}
          />
        </div>
      </SimulationProvider>
    </ErrorBoundary>
  );
};

export default App;
