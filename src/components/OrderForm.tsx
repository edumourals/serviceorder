import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ServiceOrder, OrderStatus, PaymentMethod } from '../types';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';

interface OrderFormProps {
  editId?: number | null;
  onClose: () => void;
  onSave: () => void;
}

const emptyOrder: Omit<ServiceOrder, 'id'> = {
  clientName: '',
  clientPhone: '',
  description: '',
  openDate: new Date().toISOString().split('T')[0],
  closeDate: '',
  value: 0,
  status: OrderStatus.OPEN,
  paymentMethod: PaymentMethod.CASH,
  observations: '',
};

export const OrderForm: React.FC<OrderFormProps> = ({ editId, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<ServiceOrder, 'id'>>({ ...emptyOrder });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      StorageService.getById(editId).then(existing => {
        if (existing) {
          setFormData({
              ...existing,
              openDate: existing.openDate ? existing.openDate.split('T')[0] : '',
              closeDate: existing.closeDate ? existing.closeDate.split('T')[0] : '',
          });
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.description) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await StorageService.update({ ...formData, id: editId });
      } else {
        await StorageService.create(formData);
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar ordem. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Carregando dados...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold text-slate-800">
          {editId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nome do Cliente *</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Telefone</label>
            <input
              type="text"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Descrição do Serviço *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            required
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Data de Abertura *</label>
            <input
              type="date"
              name="openDate"
              value={formData.openDate}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
           <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Data de Conclusão</label>
            <input
              type="date"
              name="closeDate"
              value={formData.closeDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Valor (R$)</label>
            <input
              type="number"
              name="value"
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
           <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.values(OrderStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Pagamento</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Selecione...</option>
              {Object.values(PaymentMethod).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Observações</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </form>
    </div>
  );
};