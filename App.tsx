import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DiscoveryRadar } from './components/DiscoveryRadar';
import { TransferManager } from './components/TransferManager';
import { ArchitectureDoc } from './components/ArchitectureDoc';
import { AuditPanel } from './components/AuditPanel';
import { UserGuide } from './components/UserGuide';
import { Tab, Peer } from './types';
import { MOCK_PEER_POOL } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TRANSFER);
  const [peers, setPeers] = useState<Peer[]>([]); 
  const [isScanning, setIsScanning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Connection Logic: Simulates TLS Handshake & Authentication
  const handleConnect = (peerId: string) => {
    // 1. Set state to connecting
    setPeers(prev => prev.map(p => 
      p.id === peerId ? { ...p, status: 'connecting' } : { ...p, status: 'idle' } // Disconnect others for now (1:1 model)
    ));

    // 2. Simulate Network Latency / Key Exchange (1.5s)
    setTimeout(() => {
        setPeers(prev => prev.map(p => 
          p.id === peerId ? { ...p, status: 'connected' } : p
        ));
    }, 1500);
  };

  const handleDisconnect = (peerId: string) => {
    setPeers(prev => prev.map(p => 
        p.id === peerId ? { ...p, status: 'idle' } : p
    ));
  };

  const handleScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setPeers([]); // Clear previous results
    
    // Simulate Realistic Network Scan
    const scanDuration = 2000 + Math.random() * 2000; // 2-4 seconds
    
    setTimeout(() => {
        // Randomly find 0, 1, or 2 peers from the pool to simulate real life
        const shuffled = [...MOCK_PEER_POOL].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * 3); // 0, 1, or 2 peers
        const foundPeers: Peer[] = shuffled.slice(0, count).map(p => ({
            ...p,
            status: 'idle',
            lastSeen: new Date()
        }));
        
        setPeers(foundPeers);
        setIsScanning(false);
    }, scanDuration);
  };

  const connectedPeer = peers.find(p => p.status === 'connected');

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      <Navbar 
        currentTab={activeTab} 
        onTabChange={setActiveTab} 
        onShowGuide={() => setShowGuide(true)}
      />
      
      {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        {/* Background Gradients */}
        <div className="fixed top-0 left-64 right-0 h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {activeTab === Tab.TRANSFER && 'Transfer Hub'}
                {activeTab === Tab.ARCHITECTURE && 'Architecture & Design'}
                {activeTab === Tab.AI_AUDIT && 'Security Audit'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {activeTab === Tab.TRANSFER && 'Manage local connections and file transfers'}
                {activeTab === Tab.ARCHITECTURE && 'Technical specifications and implementation details'}
                {activeTab === Tab.AI_AUDIT && 'AI-driven vulnerability assessment'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                 <span className="text-sm font-medium text-slate-200">Local Station</span>
                 <span className="text-xs text-green-400 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                   Online • 127.0.0.1
                 </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                LS
              </div>
            </div>
          </header>

          <div className="flex-1">
            {activeTab === Tab.TRANSFER && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                <div className="lg:col-span-2 h-full">
                  <TransferManager connectedPeer={connectedPeer} />
                </div>
                <div className="h-full">
                  <DiscoveryRadar 
                    peers={peers} 
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    isScanning={isScanning}
                    onScan={handleScan}
                  />
                </div>
              </div>
            )}
            
            {activeTab === Tab.ARCHITECTURE && (
              <ArchitectureDoc />
            )}

            {activeTab === Tab.AI_AUDIT && (
              <AuditPanel />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;