#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
export async function fetchProfessionalOrders(profId: string, email?: string): Promise<any[]> {
  try {
    let query = supabase.from('escrow_projects').select('*');
    
    if (email) {
      query = query.or(`professional_id.eq.${profId},professional_email.eq.${email}`);
    } else {
      query = query.eq('professional_id', profId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchProfessionalOrders error:", error);
      return [];
    }
    
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: p.client_email || 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    return [];
  }
}

export async function fetchClientOrders(clientId: string, email?: string): Promise<any[]> {
  try {
    let query = supabase.from('escrow_projects').select('*');
    
    if (email) {
      query = query.or(`client_id.eq.${clientId},client_email.eq.${email}`);
    } else {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchClientOrders error:", error);
      return [];
    }
    
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: p.client_email || 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    return [];
  }
}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/export async function fetchProfessionalOrders.*?\}\n\}/`cat replacement.txt`/esg' src/lib/supabase.ts
