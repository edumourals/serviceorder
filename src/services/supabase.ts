import { createClient } from '@supabase/supabase-js';
import { ServiceOrder, OrderStatus, DashboardStats } from '../types';

// ==============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ==============================================================================

const getEnvVar = (key: string, defaultValue: string) => {
  try {
    // @ts-ignore
    const env = import.meta.env;
    return env && env[key] ? env[key] : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://yoxxxynkhzefkooywvqw.supabase.co');
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_1wUGxlogH5gOPFulEL1hMA_bv8d9vvd');

// Verifica se as chaves foram configuradas corretamente
const isConfigured = 
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('COLE_SUA') && 
  !SUPABASE_KEY.includes('COLE_SUA');

// Cria o cliente apenas se configurado
export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export const SupabaseService = {
  // Propriedade para checar externamente se está ativo
  isConfigured: () => isConfigured,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  
  auth: {
    async getSession() {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session;
    },

    async signIn(email: string, password: string) {
      if (!supabase) throw new Error("Supabase não configurado");
      return supabase.auth.signInWithPassword({ email, password });
    },

    async signUp(email: string, password: string) {
      if (!supabase) throw new Error("Supabase não configurado");
      return supabase.auth.signUp({ email, password });
    },

    async signOut() {
      if (!supabase) return;
      return supabase.auth.signOut();
    },

    async resetPassword(email: string) {
      if (!supabase) throw new Error("Supabase não configurado");
      // Redireciona para a URL atual após o reset
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
    }
  },

  // ============================================================================
  // DATA (CRUD)
  // ============================================================================

  async getAll(): Promise<ServiceOrder[]> {
    if (!supabase) return [];
    
    // O RLS do banco garante que só venham as ordens do usuário logado
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

    // Pegamos o usuário atual para garantir (embora o default auth.uid() no SQL já resolva)
    const { data: { user } } = await supabase.auth.getUser();

    const dbOrder = {
      client_name: order.clientName,
      client_phone: order.clientPhone,
      description: order.description,
      open_date: order.openDate,
      close_date: order.closeDate || null,
      value: order.value,
      status: order.status,
      payment_method: order.paymentMethod,
      observations: order.observations,
      user_id: user?.id // Associa explicitamente ao usuário logado
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