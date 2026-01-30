import React, { useState } from 'react';
import { Download, Terminal, Copy, Check, AlertTriangle, Command } from 'lucide-react';
import { PYTHON_SERVER_CODE } from '../constants';

export const ServerGenerator: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SERVER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCmd = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCmdCopied(id);
    setTimeout(() => setCmdCopied(null), 2000);
  }

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([PYTHON_SERVER_CODE], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "server.py";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Windows Receiver Backend</h2>
        <p className="text-slate-400">
            Download this Python script to run the actual receiver on your Windows machine.
            It uses `asyncio` for high-performance chunked streaming and `zeroconf` for discovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1: Dependencies</span>
                <button 
                    onClick={() => handleCopyCmd('pip install zeroconf', 'pip')}
                    className="text-slate-400 hover:text-white"
                >
                    {cmdCopied === 'pip' ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                </button>
            </div>
            <code className="bg-black/30 p-2 rounded text-sm font-mono text-slate-300">pip install zeroconf</code>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 2: Generate Certs</span>
                <button 
                    onClick={() => handleCopyCmd('openssl req -new -x509 -days 365 -nodes -out cert.pem -keyout key.pem', 'ssl')}
                    className="text-slate-400 hover:text-white"
                >
                    {cmdCopied === 'ssl' ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                </button>
            </div>
            <code className="bg-black/30 p-2 rounded text-sm font-mono text-slate-300 whitespace-nowrap overflow-x-auto custom-scrollbar">
                openssl req -new -x509...
            </code>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
         <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Terminal size={16} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-400">server.py</span>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Code'}
                </button>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors"
                >
                    <Download size={14} />
                    Download
                </button>
            </div>
         </div>
         
         <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            <pre className="font-mono text-sm text-green-400/90 leading-relaxed">
                {PYTHON_SERVER_CODE}
            </pre>
         </div>
      </div>
    </div>
  );
};