import React, { useState } from 'react';
import { Download, Smartphone, Copy, Check, FileCode, Layers } from 'lucide-react';
import { ANDROID_KOTLIN_CODE, ANDROID_MANIFEST_CODE } from '../constants';

export const AndroidGenerator: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Android Client Implementation</h2>
        <p className="text-slate-400">
            Native Kotlin code for Service Discovery (NSD) and Encrypted TLS Sockets.
            Add these files to your Android Studio project.
        </p>
      </div>

      {/* Manifest Section */}
      <div className="mb-8">
         <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <Layers size={18} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">1. AndroidManifest.xml</h3>
         </div>
         <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
             <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-500">Permissions Setup</span>
                <button 
                    onClick={() => handleCopy(ANDROID_MANIFEST_CODE, 'manifest')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                    {copied === 'manifest' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'manifest' ? 'Copied' : 'Copy'}
                </button>
             </div>
             <pre className="p-4 overflow-x-auto text-xs font-mono text-amber-200/90 leading-relaxed custom-scrollbar">
                {ANDROID_MANIFEST_CODE}
             </pre>
         </div>
      </div>

      {/* Kotlin Code Section */}
      <div>
         <div className="flex items-center gap-2 mb-3 text-indigo-400">
            <Smartphone size={18} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">2. AeroClient.kt</h3>
         </div>
         <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg h-[600px] flex flex-col">
             <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-500">src/main/java/.../network/AeroClient.kt</span>
                <button 
                    onClick={() => handleCopy(ANDROID_KOTLIN_CODE, 'kotlin')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors"
                >
                    {copied === 'kotlin' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'kotlin' ? 'Copied' : 'Copy Source'}
                </button>
             </div>
             <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="text-xs font-mono text-cyan-300/90 leading-relaxed">
                    {ANDROID_KOTLIN_CODE}
                </pre>
             </div>
         </div>
      </div>
    </div>
  );
};