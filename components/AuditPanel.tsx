import React, { useState } from 'react';
import { auditArchitecture } from '../services/geminiService';
import { ARCHITECTURE_DOCS } from '../constants';
import { ShieldAlert, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export const AuditPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    const analysis = await auditArchitecture(ARCHITECTURE_DOCS);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800/50 p-8 rounded-2xl border border-indigo-500/20 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Security Architect</h2>
            <p className="text-indigo-200 text-sm">Powered by Gemini 1.5 Pro</p>
          </div>
        </div>
        
        <p className="text-slate-300 mb-6 leading-relaxed">
          Analyze the current system architecture for potential vulnerabilities, 
          bottlenecks, or compliance issues using Google's generative AI.
        </p>

        <button 
          onClick={handleAudit}
          disabled={loading}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-lg transition-all
            ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'}
          `}
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <ShieldAlert size={20} />
          )}
          {loading ? 'Auditing System...' : 'Run Security Audit'}
        </button>
      </div>

      {result && (
        <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Audit Report
          </h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};