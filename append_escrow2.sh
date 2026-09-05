#!/bin/bash
cat << 'INNER_EOF' >> src/lib/supabase.ts

// --- Escrow & Wallet Functions ---

export async function fetchEscrowProjects(userId?: string, role?: 'client' | 'professional' | 'admin'): Promise<any[]> {
  try {
    let query = supabase.from('escrow_projects').select('*').order('created_at', { ascending: false });
    
    if (role === 'client' && userId) {
      query = query.eq('client_id', userId);
    } else if (role === 'professional' && userId) {
      query = query.eq('professional_id', userId);
    }
    
    const { data, error } = await query;
    if (error) {
       console.error("fetchEscrowProjects error:", error);
       return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchEscrowProjects catch:", err);
    return [];
  }
}

export async function fetchWallet(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (error) {
       return { pending_escrow: 0, available_balance: 0, withdrawn: 0 };
    }
    return data;
  } catch (err) {
    return { pending_escrow: 0, available_balance: 0, withdrawn: 0 };
  }
}

export async function createEscrowProject(payload: any): Promise<{data: any, error: any}> {
  return await supabase.from('escrow_projects').insert([payload]).select();
}

export async function updateEscrowStatus(projectId: string, status: string): Promise<{error: any}> {
  return await supabase.from('escrow_projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId);
}

// 🔒 SECURE BACKEND ACTIONS 🔒

export async function fundEscrowBackend(projectId: string, amount: number, referenceId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('fund_escrow', {
    p_project_id: projectId,
    p_amount: amount,
    p_ref_id: referenceId
  });
  return { error };
}

export async function releaseEscrowBackend(projectId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('release_escrow', {
    p_project_id: projectId
  });
  return { error };
}

export async function clientApproveEscrowBackend(projectId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('client_approve_escrow', {
    p_project_id: projectId
  });
  return { error };
}
INNER_EOF
