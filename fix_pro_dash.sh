#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
import { supabase, uploadFileToSupabase, fetchChatSessions, saveRegisteredProfessional, fetchUserJobApplications, fetchProfessionalOrders, updateEscrowStatus } from '../lib/supabase';
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/import \{ supabase, uploadFileToSupabase, fetchChatSessions, saveRegisteredProfessional, fetchUserJobApplications, fetchProfessionalOrders \} from '"'"'\.\.\/lib\/supabase'"'"';/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
