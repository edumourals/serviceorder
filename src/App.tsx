import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';

type ViewState = 'dashboard' | 'list' | 'form';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [editingId, setEditingId] = useState<number | null>(null);

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
    // Return to list after saving
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