#!/bin/bash
cat << 'INNER_EOF' >> src/lib/supabase.ts

export async function fetchProfessionalOrders(profId: string): Promise<any[]> {
  try {
    let { data, error } = await supabase.from('client_requests').select('*').eq('professional_id', profId).order('created_at', { ascending: false });
    if (error || !data) {
       const fallback = await supabase.from('service_orders').select('*').eq('professional_id', profId).order('created_at', { ascending: false });
       return fallback.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}
INNER_EOF
