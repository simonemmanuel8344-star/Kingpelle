#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      const escrowPayload = {
        service_order_id: res.data?.[0]?.id || null, 
        client_id: clientId,
        client_email: orderData.client_email,
        client_name: orderData.client_name,
        professional_id: orderData.professional_id,
        professional_name: orderData.professional_name || 'Professional',
        title: orderData.project_title,
        amount: parseInt(orderData.budget_range?.replace(/[^0-9]/g, '') || '100000'), 
        commission_rate: 0.10,
        status: 'pending_payment'
      };
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      const escrowPayload = \{\n        service_order_id: res.data\?\.\[0\]\?\.id \|\| null, \n        client_id: clientId,\n        client_name: orderData.client_name,\n        professional_id: orderData.professional_id,\n        professional_name: orderData.professional_name \|\| '"'"'Professional'"'"',\n        title: orderData.project_title,\n        amount: parseInt\(orderData.budget_range\?\.replace\(\/\[\^0-9\]\/g, '"'"''"'"'\) \|\| '"'"'100000'"'"'\), \n        commission_rate: 0.10,\n        status: '"'"'pending_payment'"'"'\n      \};/`cat replacement.txt`/esg' src/lib/supabase.ts
