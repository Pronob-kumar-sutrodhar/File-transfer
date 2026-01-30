import React from 'react';
import { LayoutDashboard, FileText, ShieldCheck, HelpCircle, LogOut, Code2, Smartphone } from 'lucide-react';
import { Tab } from '../types';

interface NavbarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  onShowGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onShowGuide }) => {
  const navItems = [
    { id: Tab.TRANSFER, label: 'Transfer Hub', icon: LayoutDashboard },
    { id: Tab.ANDROID_GEN, label: 'Get Android Code', icon: Smartphone },
    { id: Tab.SERVER_GEN, label: 'Get Server Code', icon: Code2 },
    { id: Tab.ARCHITECTURE, label: 'System Architecture', icon: FileText },
    { id: Tab.AI_AUDIT, label: 'AI Security Audit', icon: ShieldCheck },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col p-4 fixed left-0 top-0 z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          AeroSync
        </span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-lg shadow-indigo-900/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-2">
        <button 
          onClick={onShowGuide}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-indigo-400 rounded-xl transition-colors"
        >
          <HelpCircle size={20} />
          <span className="font-medium text-sm">How to use</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium text-sm">Disconnect</span>
        </button>
      </div>
    </div>
  );
};