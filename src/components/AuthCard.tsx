import React, { useState } from 'react';
import { SupabaseService } from '../services/supabase';
import { Loader2, Mail, Lock, ArrowRight, LogIn, KeyRound, UserPlus } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await SupabaseService.auth.signIn(email, password);
        if (error) throw error;
      } else if (mode === 'register') {
        const { error } = await SupabaseService.auth.signUp(email, password);
        if (error) throw error;
        setMessage('Conta criada! Verifique seu e-mail ou faça login.');
        setMode('login');
      } else if (mode === 'forgot') {
        const { error } = await SupabaseService.auth.resetPassword(email);
        if (error) throw error;
        setMessage('Link de recuperação enviado para seu e-mail.');
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login')) {
        setError('E-mail ou senha incorretos.');
      } else if (err.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-section" className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-400"></div>

      <div className="mb-8 text-center space-y-2">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          {mode === 'login' && 'Acesse o ServiceOS'}
          {mode === 'register' && 'Crie sua conta'}
          {mode === 'forgot' && 'Recuperar Acesso'}
        </h3>
        <p className="text-slate-500 text-sm font-medium">
          {mode === 'login' && 'Use seu e-mail e senha para gerenciar suas ordens.'}
          {mode === 'register' && 'Preencha os dados abaixo para começar.'}
          {mode === 'forgot' && 'Informe seu e-mail para receber o link.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2 animate-pulse">
          <span className="font-bold">Erro:</span> {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-6 border border-green-100 flex items-center gap-2">
          <span className="font-bold">Sucesso:</span> {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">E-mail</label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="exemplo@empresa.com"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="••••••"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {mode === 'login' && (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
              {mode === 'register' && (
                <>
                  <UserPlus size={18} />
                  <span>Criar Conta Grátis</span>
                </>
              )}
              {mode === 'forgot' && (
                <>
                  <KeyRound size={18} />
                  <span>Enviar Link</span>
                </>
              )}
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-3 text-sm text-center border-t border-slate-100 pt-6">
        {mode === 'login' && (
          <>
            <p className="text-slate-500">
              Não tem uma conta?{' '}
              <button onClick={() => setMode('register')} className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                Cadastre-se
              </button>
            </p>
            <button onClick={() => setMode('forgot')} className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">
              Esqueci minha senha
            </button>
          </>
        )}

        {(mode === 'register' || mode === 'forgot') && (
          <button onClick={() => setMode('login')} className="text-slate-500 hover:text-blue-600 font-bold flex items-center justify-center gap-1 transition-colors">
            <ArrowRight size={14} className="rotate-180" /> Voltar para o Login
          </button>
        )}
      </div>
    </div>
  );
};