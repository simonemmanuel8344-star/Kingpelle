#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
export async function fetchProfessionalOrders(profId: string): Promise<any[]> {
  try {
    let { data, error } = await supabase.from('client_requests').select('*').eq('professional_id', profId).order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
       const fallback = await supabase.from('service_orders').select('*').eq('professional_id', profId).order('created_at', { ascending: false });
       return fallback.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchClientOrders(email: string): Promise<any[]> {
  try {
    let { data, error } = await supabase.from('client_requests').select('*').eq('client_email', email).order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
       const fallback = await supabase.from('service_orders').select('*').eq('client_email', email).order('created_at', { ascending: false });
       return fallback.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/export async function fetchProfessionalOrders.*?\}\n\}/`cat replacement.txt`/esg' src/lib/supabase.ts
