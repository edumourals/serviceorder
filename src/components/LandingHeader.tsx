import React from 'react';
import { PenTool } from 'lucide-react';

export const LandingHeader: React.FC = () => {
  const scrollToLogin = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <PenTool size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ServiceOS</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Funcionalidades</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Planos</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contato</a>
        </nav>

        {/* CTA Button */}
        <button 
          onClick={scrollToLogin}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/10"
        >
          Acessar Sistema
        </button>
      </div>
    </header>
  );
};