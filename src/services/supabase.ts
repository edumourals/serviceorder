import { createClient } from '@supabase/supabase-js';
import { ServiceOrder, OrderStatus, DashboardStats } from '../types';

// ==============================================================================
// ⚠️ ÁREA DE CONFIGURAÇÃO - COLE SUAS CHAVES AQUI
// ==============================================================================
const SUPABASE_URL = 'https://yoxxxynkhzefkooywvqw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_1wUGxlogH5gOPFulEL1hMA_bv8d9vvd';
// ==============================================================================

// Cria o cliente apenas se as chaves estiverem preenchidas
const supabase = SUPABASE_URL.includes('COLE_SUA') 
  ? null 
  : createClient(SUPABASE_URL, SUPABASE_KEY);

export const SupabaseService = {
  
  async getAll(): Promise<ServiceOrder[]> {
    if (!supabase) return [];
    
    // Mapeia os campos do banco (snake_case) para o app (camelCase)
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens:', error);
      throw error;
    }

    return data.map((item: any) => ({
      id: item.id,
      clientName: item.client_name,
      clientPhone: item.client_phone,
      description: item.description,
      openDate: item.open_date,
      closeDate: item.close_date,
      value: Number(item.value),
      status: item.status as OrderStatus,
      paymentMethod: item.payment_method,
      observations: item.observations
    }));
  },

  async getById(id: number): Promise<ServiceOrder | undefined> {
    if (!supabase) return undefined;

    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      description: data.description,
      openDate: data.open_date,
      closeDate: data.close_date,
      value: Number(data.value),
      status: data.status as OrderStatus,
      paymentMethod: data.payment_method,
      observations: data.observations
    };
  },

  async create(order: Omit<ServiceOrder, 'id'>): Promise<ServiceOrder> {
    if (!supabase) throw new Error("Supabase não configurado");

    const dbOrder = {
      client_name: order.clientName,
      client_phone: order.clientPhone,
      description: order.description,
      open_date: order.openDate,
      close_date: order.closeDate || null,
      value: order.value,
      status: order.status,
      payment_method: order.paymentMethod,
      observations: order.observations
    };

    const { data, error } = await supabase
      .from('service_orders')
      .insert([dbOrder])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar:', error);
      throw error;
    }

    return { ...order, id: data.id };
  },

  async update(order: ServiceOrder): Promise<void> {
    if (!supabase) return;

    const dbOrder = {
      client_name: order.clientName,
      client_phone: order.clientPhone,
      description: order.description,
      open_date: order.openDate,
      close_date: order.closeDate || null,
      value: order.value,
      status: order.status,
      payment_method: order.paymentMethod,
      observations: order.observations
    };

    const { error } = await supabase
      .from('service_orders')
      .update(dbOrder)
      .eq('id', order.id);

    if (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  },

  async getStats(): Promise<DashboardStats> {
    // Para simplificar, buscamos tudo e calculamos no front.
    // Em apps gigantes, faríamos queries SQL específicas (RPC ou Views).
    const orders = await this.getAll();
    
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