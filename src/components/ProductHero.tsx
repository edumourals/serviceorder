import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';

export const ProductHero: React.FC = () => {
  return (
    <div className="flex flex-col justify-center space-y-8 text-white p-4 md:p-0 animate-fade-in-up">
      
      {/* Badge / Selo */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
        <Star size={14} className="text-blue-400 fill-blue-400" />
        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
          Ideal para prestadores de serviços
        </span>
      </div>

      {/* Título Principal */}
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
        Controle suas <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Ordens de Serviço
        </span> <br />
        sem complicação.
      </h1>

      {/* Subtítulo */}
      <p className="text-lg text-slate-300 max-w-lg leading-relaxed font-light">
        Organize seu fluxo de trabalho, acompanhe o status de cada serviço em tempo real e 
        profissionalize o atendimento ao seu cliente com uma plataforma intuitiva e segura.
      </p>

      {/* Lista de Benefícios Modernizada */}
      <div className="space-y-4 mt-2">
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
          <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg">
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Gestão Financeira & Operacional</h3>
            <p className="text-sm text-slate-400">Dashboard completo com indicadores de faturamento.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
           <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
            <Zap className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Produtividade Máxima</h3>
            <p className="text-sm text-slate-400">Impressão de comprovantes (80mm) e filtros rápidos.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
           <div className="mt-1 bg-purple-500/20 p-2 rounded-lg">
            <ShieldCheck className="text-purple-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Segurança na Nuvem</h3>
            <p className="text-sm text-slate-400">Acesse seus dados de qualquer lugar, PC ou celular.</p>
          </div>
        </div>
      </div>

      {/* Botões CTA */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button 
          onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          Começar Agora
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button className="px-8 py-3.5 bg-transparent border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl font-semibold transition-all duration-200 hover:bg-white/5">
          Ver Demonstração
        </button>
      </div>
    </div>
  );
};