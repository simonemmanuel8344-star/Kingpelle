#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
        commission_rate: 0.10,
        status: 'pending_acceptance'
INNER_EOF
perl -i -pe 'BEGIN{undef $/;} s/        commission_rate: 0\.10,\n        status: '"'"'pending_payment'"'"'/`cat replacement.txt`/esg' src/lib/supabase.ts
