import { ServiceOrder, OrderStatus, DashboardStats } from '../types';
import { SupabaseService } from './supabase';

const STORAGE_KEY = 'service_orders_db';

// Serviço Local (Offline / Navegador)
const LocalStorageService = {
  getAll: async (): Promise<ServiceOrder[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simula delay de rede
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  getById: async (id: number): Promise<ServiceOrder | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const orders = await LocalStorageService.getAll();
    return orders.find(o => o.id === id);
  },

  create: async (order: Omit<ServiceOrder, 'id'>): Promise<ServiceOrder> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orders = await LocalStorageService.getAll();
    const maxId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : 0;
    const newOrder = { ...order, id: maxId + 1 };
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return newOrder;
  },

  update: async (order: ServiceOrder): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orders = await LocalStorageService.getAll();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orders = await LocalStorageService.getAll();
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orders = await LocalStorageService.getAll();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalOpen = orders.filter(o => o.status === OrderStatus.OPEN).length;
    
    const completedOrdersThisMonth = orders.filter(o => {
      if (o.status !== OrderStatus.COMPLETED || !o.closeDate) return false;
      const d = new Date(o.closeDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const revenueThisMonth = completedOrdersThisMonth.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

    const byStatus = [
      OrderStatus.OPEN,
      OrderStatus.CREATION,
      OrderStatus.PRODUCTION,
      OrderStatus.AWAITING_INSTALLATION,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED
    ].map(status => ({
      name: status,
      value: orders.filter(o => o.status === status).length
    }));

    return {
      totalOpen,
      completedThisMonth: completedOrdersThisMonth.length,
      revenueThisMonth,
      byStatus
    };
  }
};

// ====================================================================
// 🔄 SELEÇÃO AUTOMÁTICA DE SERVIÇO
// ====================================================================
// Se o Supabase estiver configurado (chaves presentes), usa ele.
// Caso contrário, usa o LocalStorage automaticamente.
// Isso evita o erro "Supabase não configurado".

export const StorageService = SupabaseService.isConfigured() 
  ? SupabaseService 
  : LocalStorageService;