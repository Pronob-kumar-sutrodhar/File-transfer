import React from 'react';
import { X, Scan, Network, UploadCloud, ShieldCheck, ArrowRight } from 'lucide-react';

interface UserGuideProps {
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  const steps = [
    {
      icon: Scan,
      title: "1. Discover Devices",
      desc: "Click 'Start Discovery' on the Network Radar. The app uses mDNS to find other devices on your local Wi-Fi network without cloud servers.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      icon: Network,
      title: "2. Secure Handshake",
      desc: "Click on a discovered device to connect. A TLS 1.3 encrypted tunnel is established. You must be 'Connected' before sending files.",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      icon: UploadCloud,
      title: "3. Transfer Files",
      desc: "Once connected, drag and drop files into the drop zone. Transfers are streamed directly peer-to-peer for maximum speed.",
      color: "text-green-400",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-indigo-500" />
              How to use AeroSync
            </h2>
            <p className="text-slate-400 text-sm mt-1">Secure Local File Transfer Protocol</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-4 border border-slate-700 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={32} />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
             <div className="p-1 bg-indigo-500/20 rounded-full text-indigo-400 mt-0.5">
                <ShieldCheck size={16} />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-slate-200">Security Note</h4>
                <p className="text-xs text-slate-400 mt-1">
                  All transfers are end-to-end encrypted. Devices must be on the same Wi-Fi network. 
                  No data ever leaves your local network.
                </p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};