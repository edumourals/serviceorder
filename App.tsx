import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import { ProductHero } from './components/ProductHero';
import { AuthCard } from './components/AuthCard';
import { supabase, SupabaseService } from './services/supabase';
import { Loader2 } from 'lucide-react';

type ViewState = 'dashboard' | 'list' | 'form';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // 1. Checa sessão inicial
    SupabaseService.auth.getSession().then((sess) => {
      setSession(sess);
      setAuthLoading(false);
    });

    // 2. Escuta mudanças (login/logout)
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tela de Carregamento Inicial
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="animate-spin mr-3" size={32} />
        <span>Carregando sistema...</span>
      </div>
    );
  }

  // ====================================================================
  // MODO DESLOGADO: LANDING PAGE
  // ====================================================================
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Esquerda: Produto */}
          <div className="order-2 lg:order-1">
            <ProductHero />
          </div>
          
          {/* Direita: Login */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <AuthCard />
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // MODO LOGADO: SISTEMA
  // ====================================================================

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'form') {
      setEditingId(null);
    }
  };

  const handleEditOrder = (id: number) => {
    setEditingId(id);
    setCurrentView('form');
  };

  const handleCreateOrder = () => {
    setEditingId(null);
    setCurrentView('form');
  };

  const handleSave = () => {
    setCurrentView('list');
    setEditingId(null);
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'dashboard' && <Dashboard />}
      
      {currentView === 'list' && (
        <OrderList 
          onEdit={handleEditOrder} 
          onCreate={handleCreateOrder} 
        />
      )}
      
      {currentView === 'form' && (
        <OrderForm 
          editId={editingId} 
          onClose={() => setCurrentView('list')} 
          onSave={handleSave} 
        />
      )}
    </Layout>
  );
};

export default App;