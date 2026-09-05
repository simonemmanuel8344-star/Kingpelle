#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
export async function fetchProfessionalOrders(profId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('escrow_projects')
      .select('*')
      .eq('professional_id', profId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchProfessionalOrders error:", error);
      return [];
    }
    
    // Map escrow projects to the expected order format
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    console.error("fetchProfessionalOrders catch:", err);
    return [];
  }
}

export async function fetchClientOrders(clientId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('escrow_projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchClientOrders error:", error);
      return [];
    }
    
    // Map escrow projects to the expected order format
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    console.error("fetchClientOrders catch:", err);
    return [];
  }
}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/export async function fetchProfessionalOrders.*?\}\n\}/`cat replacement.txt`/esg' src/lib/supabase.ts
