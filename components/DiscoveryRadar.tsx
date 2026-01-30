import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor, Lock, RefreshCw, Loader2, Wifi, WifiOff, Beaker } from 'lucide-react';
import { Peer } from '../types';

interface DiscoveryRadarProps {
  peers: Peer[];
  onConnect: (peerId: string) => void;
  onDisconnect: (peerId: string) => void;
  isScanning: boolean;
  onScan: () => void;
}

export const DiscoveryRadar: React.FC<DiscoveryRadarProps> = ({ peers, onConnect, onDisconnect, isScanning, onScan }) => {
  const [radarPulse, setRadarPulse] = useState(0);

  return (
    <div className="w-full bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-indigo-500 animate-ping' : 'bg-green-500'} `} />
          Network Radar
        </h3>
        <div className="flex items-center gap-2" title="Real hardware discovery requires native backend. Currently running in browser simulation.">
             <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                 <Beaker size={10} />
                 Simulation Mode
             </span>
        </div>
      </div>

      <div className="relative flex-1 w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[300px]">
        {/* Radar Rings */}
        {(isScanning || peers.length > 0) && (
          <>
             <div className="absolute w-96 h-96 border border-indigo-500/10 rounded-full animate-[ping_3s_linear_infinite]" />
             <div className="absolute w-64 h-64 border border-indigo-500/10 rounded-full" />
             <div className="absolute w-32 h-32 border border-indigo-500/10 rounded-full" />
          </>
        )}
        
        {/* Center Self */}
        <div className="relative z-10 w-16 h-16 bg-slate-800 rounded-full border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Monitor className="text-indigo-400" size={24} />
          <div className="absolute -bottom-6 text-[10px] text-indigo-400/70 font-mono">YOU</div>
        </div>

        {/* Scan Button (if empty) */}
        {peers.length === 0 && !isScanning && (
           <div className="absolute bottom-6 z-20 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center">
              <p className="text-xs text-slate-500 mb-3 text-center max-w-[200px]">
                  Browser environment detected.<br/>Scanning will simulate device discovery.
              </p>
              <button 
                onClick={onScan}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg transition-all active:scale-95"
              >
                 <RefreshCw size={16} />
                 Start Discovery
              </button>
           </div>
        )}

        {/* Peers */}
        {peers.map((peer, idx) => {
          // Dynamic Positioning
          const angle = (idx * (360 / (peers.length || 1)) + 45) * (Math.PI / 180);
          const distance = 110;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          const isConnected = peer.status === 'connected';
          const isConnecting = peer.status === 'connecting';

          return (
            <div
              key={peer.id}
              className={`absolute z-10 transition-all duration-700 ease-out`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <div 
                className="flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => {
                    if (isConnected) onDisconnect(peer.id);
                    else if (!isConnecting) onConnect(peer.id);
                }}
              >
                <div className={`
                  relative w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300
                  ${isConnected 
                    ? 'bg-slate-900 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                    : isConnecting
                    ? 'bg-slate-900 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-indigo-400 hover:text-indigo-300'
                  }
                `}>
                  {/* Connecting Spinner */}
                  {isConnecting && (
                    <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {peer.deviceType === 'android' ? <Smartphone size={24} /> : <Monitor size={24} />}
                </div>
                
                <div className="flex flex-col items-center">
                    <div className={`
                        text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors
                        ${isConnected 
                            ? 'text-green-400 border-green-500/30 bg-green-500/10' 
                            : isConnecting
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : 'text-slate-300 border-slate-700 bg-slate-900/80'}
                    `}>
                    {peer.name}
                    {peer.trusted && <Lock size={8} />}
                    </div>
                    
                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {isConnected ? 'Click to Disconnect' : isConnecting ? 'Handshaking...' : 'Click to Connect'}
                    </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-slate-500 px-2">
         <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-slate-600" />
             Idle
         </div>
         <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-green-500" />
             Connected
         </div>
         <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-amber-500" />
             Handshake
         </div>
      </div>
    </div>
  );
};