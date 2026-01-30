import React from 'react';
import { ARCHITECTURE_DOCS } from '../constants';
import { Terminal, Shield, Cpu, Network, Code, Server } from 'lucide-react';

export const ArchitectureDoc: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">System Architecture Reference</h2>
        <p className="text-slate-400">Detailed design specifications and real implementation code for AeroSync.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {ARCHITECTURE_DOCS.map((doc, index) => (
          <div key={index} className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden shadow-sm hover:border-slate-600 transition-colors">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {index === 0 && <Network size={18} />}
                    {index === 1 && <Cpu size={18} />}
                    {index === 2 && <Server size={18} />}
                    {index > 2 && <Terminal size={18} />}
                 </div>
                 <h3 className="text-lg font-semibold text-slate-200">{doc.title}</h3>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
                {doc.content.split('\n').map((line, i) => {
                    if (line.startsWith('**')) {
                        return <p key={i} className="font-bold text-slate-100 mb-2 mt-4">{line.replace(/\*\*/g, '')}</p>
                    }
                    if (line.match(/^\d\./)) {
                         return <div key={i} className="ml-4 mb-1 pl-2 border-l-2 border-slate-600">{line}</div>
                    }
                    return <p key={i} className="mb-2">{line}</p>
                })}
              </div>

              {doc.codeSnippet && (
                <div className="mt-6 relative group">
                  <div className="flex items-center justify-between bg-slate-900 border-x border-t border-slate-800 rounded-t-xl px-4 py-2">
                     <span className="text-xs font-mono text-slate-400 uppercase">{doc.language || 'text'}</span>
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                     </div>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-b-xl border border-slate-800 overflow-x-auto text-xs font-mono text-indigo-300 leading-relaxed shadow-inner">
                    <code>{doc.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};