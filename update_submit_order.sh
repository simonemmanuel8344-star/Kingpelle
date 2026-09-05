#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
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
    
    // First insert into service_orders
    let res = await supabase.from('client_requests').insert([payload]).select();
    if (res.error) {
       res = await supabase.from('service_orders').insert([payload]).select();
    }
    
    // Auto-create Escrow Project if a professional is assigned
    if (orderData.professional_id) {
      // Try to get local user if available
      let clientId = 'client-guest';
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('idea_hub_local_user');
        if (localUser) {
          try {
             clientId = JSON.parse(localUser).id || 'client-guest';
          } catch(e) {}
        }
      }
      
      const escrowPayload = {
        service_order_id: res.data?.[0]?.id || null,
        client_id: clientId,
        client_name: orderData.client_name,
        professional_id: orderData.professional_id,
        professional_name: orderData.professional_name || 'Professional',
        title: orderData.project_title,
        amount: parseInt(orderData.budget_range?.replace(/[^0-9]/g, '') || '100000'), // Fallback amount
        commission_rate: 0.10,
        status: 'pending_payment'
      };
      
      await supabase.from('escrow_projects').insert([escrowPayload]);
    }

    return { data: res.data, error: null };
  } catch (err: any) {
    console.error('Supabase submitOrder error:', err);
    return { data: null, error: err };
  }
}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/export async function submitOrderToSupabase.*?\}\n\}/`cat replacement.txt`/esg' src/lib/supabase.ts
