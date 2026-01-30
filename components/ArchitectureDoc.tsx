import React from 'react';
import { ARCHITECTURE_DOCS } from '../constants';
import { Terminal, Shield, Cpu, Network } from 'lucide-react';

export const ArchitectureDoc: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">System Architecture Reference</h2>
        <p className="text-slate-400">Detailed design specifications for the AeroSync local file transfer protocol.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {ARCHITECTURE_DOCS.map((doc, index) => (
          <div key={index} className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {index === 0 && <Network size={18} />}
                    {index === 1 && <Shield size={18} />}
                    {index === 2 && <Cpu size={18} />}
                    {index === 3 && <Terminal size={18} />}
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
                  <div className="absolute top-0 right-0 px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-bl-lg border-b border-l border-slate-700">
                    {index === 2 ? 'Kotlin' : 'Python'}
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-indigo-300">
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