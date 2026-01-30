import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertTriangle, RefreshCw, Loader2, WifiOff } from 'lucide-react';
import { TransferFile, Peer } from '../types';

interface TransferManagerProps {
  connectedPeer?: Peer;
}

export const TransferManager: React.FC<TransferManagerProps> = ({ connectedPeer }) => {
  const [transfers, setTransfers] = useState<TransferFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const connectedPeerRef = useRef(connectedPeer);
  const lastTimeRef = useRef(Date.now());
  const requestRef = useRef<number>(0);

  // Keep ref in sync
  useEffect(() => {
    connectedPeerRef.current = connectedPeer;

    // Auto-resume pending transfers when a peer connects
    if (connectedPeer) {
        setTransfers(prev => prev.map(t => {
            if (t.status === 'pending') {
                return { ...t, status: 'uploading', peerId: connectedPeer.id };
            }
            return t;
        }));
    } else {
        // Pause active transfers if peer disconnects
        setTransfers(prev => prev.map(t => {
            if (t.status === 'uploading' || t.status === 'downloading') {
                return { ...t, status: 'pending' };
            }
            return t;
        }));
    }
  }, [connectedPeer]);

  // Physics-based Transfer Simulation Loop
  const animate = () => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000; 
    lastTimeRef.current = now;

    setTransfers(prev => {
      const hasActive = prev.some(t => t.status === 'uploading' || t.status === 'downloading');
      if (!hasActive) return prev;

      return prev.map(t => {
        if (t.status !== 'uploading' && t.status !== 'downloading') return t;

        // CRITICAL: Stop physics if connection drops
        if (!connectedPeerRef.current) {
            return { ...t, status: 'pending', speed: 0 };
        }

        // Realistic Network Simulation
        // Base Speed: 30MB/s (Typical 5GHz Wi-Fi real-world)
        // Fluctuation: +/- 5MB/s
        const baseSpeed = 30;
        const noise = (Math.random() - 0.5) * 10;
        const speedMBps = Math.max(0.1, baseSpeed + noise);
        const bytesPerSecond = speedMBps * 1024 * 1024;

        const currentBytes = (t.progress / 100) * t.size;
        const newBytes = Math.min(currentBytes + (bytesPerSecond * dt), t.size);
        const newProgress = (newBytes / t.size) * 100;

        return {
          ...t,
          progress: newProgress,
          speed: newProgress >= 100 ? 0 : speedMBps,
          status: newProgress >= 99.9 ? 'completed' : t.status,
        };
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    lastTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      const newTransfer: TransferFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop() || 'file',
        progress: 0,
        speed: 0,
        status: connectedPeer ? 'uploading' : 'pending',
        peerId: connectedPeer?.id || '',
        direction: 'outgoing'
      };
      setTransfers(prev => [newTransfer, ...prev]);
    }
  };

  const handleCancel = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Drop Zone */}
      <div 
        className={`
          flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all duration-300 relative overflow-hidden
          ${dragActive ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-lg border border-slate-700 relative z-10">
          <UploadCloud className={`text-indigo-400 transition-transform ${dragActive ? 'scale-110' : ''}`} size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 relative z-10">
            {connectedPeer ? `Send to ${connectedPeer.name}` : "Queue Files"}
        </h3>
        <p className="text-slate-500 mt-2 text-sm relative z-10 max-w-xs text-center">
            {connectedPeer 
                ? "Secure P2P tunnel active. Drag files here." 
                : "Connect to a device on the radar to start transferring."}
        </p>

        {!connectedPeer && (
            <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20 flex items-center gap-2">
                <WifiOff size={12} />
                Disconnected
            </div>
        )}

        <input 
            type="file" 
            className="hidden" 
            id="file-upload" 
            onChange={(e) => {
                if (e.target.files?.[0]) {
                     const file = e.target.files[0];
                     const newTransfer: TransferFile = {
                        id: Date.now().toString(),
                        name: file.name,
                        size: file.size,
                        type: file.name.split('.').pop() || 'file',
                        progress: 0,
                        speed: 0,
                        status: connectedPeer ? 'uploading' : 'pending',
                        peerId: connectedPeer?.id || '',
                        direction: 'outgoing'
                      };
                      setTransfers(prev => [newTransfer, ...prev]);
                }
            }} 
        />
        <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-10">
          Select Files
        </label>
      </div>

      {/* Transfer List */}
      <div className="flex-1 bg-slate-800/50 rounded-2xl border border-slate-700 p-6 overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          Transfers
          {transfers.length > 0 && (
             <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
               {transfers.length}
             </span>
          )}
        </h3>

        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
             <File size={48} className="mb-2" />
             <p>No active transfers</p>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-3 pr-2">
            {transfers.map(transfer => (
              <div 
                key={transfer.id} 
                className={`
                  bg-slate-900/80 rounded-xl p-4 border transition-colors
                  ${transfer.status === 'failed' ? 'border-red-500/30' : 
                    transfer.status === 'pending' ? 'border-amber-500/30' :
                    'border-slate-800'}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                      ${transfer.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                        transfer.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                        transfer.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-indigo-500/10 text-indigo-500'}`}>
                      {transfer.status === 'completed' ? <CheckCircle size={20} /> :
                       transfer.status === 'failed' ? <AlertTriangle size={20} /> : 
                       transfer.status === 'pending' ? <Loader2 size={20} className="animate-spin" /> :
                       <File size={20} />}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-200">
                        {transfer.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{(transfer.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                           {transfer.status === 'pending' ? 'Waiting for connection...' : 
                            transfer.status === 'completed' ? 'Sent' : 'Sending...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Speed or Status */}
                    {transfer.status === 'uploading' && (
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                            {transfer.speed.toFixed(1)} MB/s
                        </span>
                    )}

                    {/* Actions */}
                    <button 
                        onClick={() => handleCancel(transfer.id)} 
                        className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                        title={transfer.status === 'completed' ? 'Clear' : 'Cancel'}
                    >
                        <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 
                      ${transfer.status === 'completed' ? 'bg-green-500' : 
                        transfer.status === 'failed' ? 'bg-red-500' : 
                        transfer.status === 'pending' ? 'bg-amber-500 w-full animate-pulse opacity-50' :
                        'bg-indigo-500'}`}
                    style={{ width: transfer.status === 'pending' ? '100%' : `${transfer.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};