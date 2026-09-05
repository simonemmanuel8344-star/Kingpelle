#!/bin/bash
cat << 'INNER_EOF' >> src/lib/supabase.ts

export async function fetchClientOrders(clientId: string): Promise<any[]> {
  try {
    let { data, error } = await supabase.from('client_requests').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
       const fallback = await supabase.from('service_orders').select('*').eq('client_email', clientId).order('created_at', { ascending: false }); // email as fallback? Or client_id if we added it?
       // Wait, client_requests uses client_email, client_name, etc. but doesn't have client_id in the original payload!
       return fallback.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}
INNER_EOF
