#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
    // Auto-create Escrow Project if a professional is assigned
    if (orderData.professional_id) {
      let clientId = 'client-guest';
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        clientId = authData.user.id;
      } else if (typeof window !== 'undefined') {
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
      
      const { error: escrowError } = await supabase.from('escrow_projects').insert([escrowPayload]);
      if (escrowError) console.error("Failed to create escrow project:", escrowError);
    }
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/    \/\/ Auto-create Escrow Project if a professional is assigned.*?    \}/`cat replacement.txt`/esg' src/lib/supabase.ts
