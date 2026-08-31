import { createClient } from '@supabase/supabase-js';
import { ServiceOrder, ContactMessage } from '../types';

// Supabase project credentials for simonemmanuel Project
const env = (import.meta as any).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || 'https://cndijjjhyczocmphedmp.supabase.co/rest/v1/').replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Submit an order to Supabase
 * Attempts insertion into `orders` table (with fallback to `service_orders`)
 */
export async function submitOrderToSupabase(orderData: ServiceOrder): Promise<{ data: any; error: any }> {
  try {
    const payload = {
      client_name: orderData.client_name,
      client_email: orderData.client_email,
      client_phone: orderData.client_phone,
      service_category: orderData.service_category,
      project_title: orderData.project_title,
      project_description: orderData.project_description,
      budget_range: orderData.budget_range || 'Flexible',
      timeline: orderData.timeline || 'Flexible',
      professional_id: orderData.professional_id || null,
      professional_name: orderData.professional_name || null,
      attachment_url: orderData.attachment_url || null,
      cloud_link: orderData.cloud_link || null,
      status: orderData.status || 'pending',
      created_at: new Date().toISOString()
    };

    // Try 'orders' table first
    const { data, error } = await supabase.from('orders').insert([payload]).select();
    
    if (error) {
      // If table name is 'service_orders', retry with that
      if (error.code === '42P01' || error.message?.toLowerCase().includes('relation') || error.message?.toLowerCase().includes('not found')) {
        console.warn("Retrying order insertion in 'service_orders' table...");
        const fallbackRes = await supabase.from('service_orders').insert([payload]).select();
        return fallbackRes;
      }
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Supabase submitOrder error:', err);
    return { data: null, error: err };
  }
}

/**
 * Submit contact message to Supabase
 */
export async function submitContactToSupabase(msg: ContactMessage): Promise<{ data: any; error: any }> {
  try {
    const payload = {
      name: msg.name,
      email: msg.email,
      phone: msg.phone || null,
      subject: msg.subject || 'Website Inquiry',
      message: msg.message,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('contact_messages').insert([payload]).select();
    if (error) {
      // Also try contacts table
      if (error.code === '42P01') {
        return await supabase.from('contacts').insert([payload]).select();
      }
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err: any) {
    console.error('Supabase submitContact error:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch all orders from Supabase (for Admin)
 */
export async function fetchSupabaseOrders(): Promise<ServiceOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Try 'service_orders'
      const fallback = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });
      return (fallback.data as ServiceOrder[]) || [];
    }

    return (data as ServiceOrder[]) || [];
  } catch (err) {
    console.error('Error fetching Supabase orders:', err);
    return [];
  }
}

/**
 * Fetch all contact submissions from Supabase
 */
export async function fetchSupabaseContacts(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      return (fallback.data as ContactMessage[]) || [];
    }

    return (data as ContactMessage[]) || [];
  } catch (err) {
    console.error('Error fetching Supabase contacts:', err);
    return [];
  }
}
