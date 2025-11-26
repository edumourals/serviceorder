import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ServiceOrder, OrderStatus } from '../types';
import { Search, Filter, Pencil, Trash2, Plus, Loader2, Printer } from 'lucide-react';

interface OrderListProps {
  onEdit: (id: number) => void;
  onCreate: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({ onEdit, onCreate }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar ordens", error);
      alert("Erro ao carregar ordens. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      await StorageService.delete(id);
      loadOrders();
    }
  };

  const handlePrint = (order: ServiceOrder) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      const date = new Date(order.openDate).toLocaleDateString('pt-BR');
      const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>OS #${order.id}</title>
            <style>
              @page { margin: 0; size: auto; }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Courier New', Courier, monospace; 
                font-size: 12px; 
                color: #000;
              }
              .ticket {
                width: 78mm; /* Levemente menor que 80mm para margem de segurança */
                max-width: 78mm;
                padding: 10px;
                margin: 0 auto;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider { 
                border-top: 1px dashed #000; 
                margin: 8px 0; 
                width: 100%;
              }
              .row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 4px;
              }
              .label { font-weight: bold; margin-right: 5px; }
              .section-title {
                margin-top: 10px;
                font-weight: bold;
                text-decoration: underline;
                font-size: 13px;
              }
              .obs { font-size: 11px; font-style: italic; }
              .signature-area {
                margin-top: 30px;
                text-align: center;
                border-top: 1px solid #000;
                padding-top: 5px;
              }
              h1 { font-size: 16px; margin: 5px 0; }
              h2 { font-size: 14px; margin: 0; }
              
              @media print {
                .no-print { display: none; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="center">
                <h1>SERVICE OS</h1>
                <h2>ORDEM DE SERVIÇO</h2>
                <div class="divider"></div>
                <div style="font-size: 18px; font-weight: bold;">OS Nº ${order.id}</div>
                <div>${new Date().toLocaleString('pt-BR')}</div>
              </div>
              
              <div class="divider"></div>

              <div>
                <span class="label">CLIENTE:</span> ${order.clientName}
              </div>
              <div>
                <span class="label">FONE:</span> ${order.clientPhone || '-'}
              </div>
              
              <div class="row" style="margin-top: 5px;">
                <div><span class="label">DATA ABER.:</span> ${date}</div>
              </div>
              
              <div class="row">
                <div><span class="label">STATUS:</span> ${order.status}</div>
              </div>

              <div class="divider"></div>

              <div class="section-title">DESCRIÇÃO DO SERVIÇO</div>
              <div style="margin-top: 5px; line-height: 1.2;">
                ${order.description}
              </div>

              ${order.observations ? `
                <div class="section-title">OBSERVAÇÕES</div>
                <div class="obs">${order.observations}</div>
              ` : ''}

              <div class="divider"></div>

              <div class="row">
                <span class="label">FORMA PAGTO:</span>
                <span>${order.paymentMethod || '-'}</span>
              </div>

              <div class="row" style="font-size: 16px; margin-top: 10px;">
                <span class="bold">TOTAL:</span>
                <span class="bold">${value}</span>
              </div>

              <div class="signature-area">
                Assinatura do Cliente
              </div>
              
              <div class="center" style="margin-top: 15px; font-size: 10px;">
                Obrigado pela preferência!
              </div>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OPEN: return 'bg-blue-100 text-blue-700';
      case OrderStatus.CREATION: return 'bg-purple-100 text-purple-700';
      case OrderStatus.PRODUCTION: return 'bg-amber-100 text-amber-700';
      case OrderStatus.AWAITING_INSTALLATION: return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case OrderStatus.CANCELLED: return 'bg-slate-100 text-slate-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Ordens de Serviço</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nova Ordem
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white transition-all cursor-pointer"
          >
            <option value="all">Todos os status</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Abertura</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Loader2 className="animate-spin" size={24} />
                       <span>Buscando ordens...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{order.clientName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.openDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Imprimir Cupom 80mm"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(order.id)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};