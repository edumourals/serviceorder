import React from 'react';
import { LayoutDashboard, List, PlusCircle, PenTool, LogOut } from 'lucide-react';
import { SupabaseService } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'list' | 'form';
  onNavigate: (view: 'dashboard' | 'list' | 'form') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const handleLogout = async () => {
    if (window.confirm('Deseja sair do sistema?')) {
      await SupabaseService.auth.signOut();
      // O App.tsx detectará e atualizará a tela
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <PenTool size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ServiceOS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'dashboard' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'list' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <List size={20} />
            <span className="font-medium">Ordens de Serviço</span>
          </button>

          <button
            onClick={() => onNavigate('form')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === 'form' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Nova Ordem</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">Service Manager v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};