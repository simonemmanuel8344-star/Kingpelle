#!/bin/bash
sed -i 's/import { Wallet as WalletIcon, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from '"'"'lucide-react'"'"';/import { Wallet as WalletIcon, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Clock } from '"'"'lucide-react'"'"';/g' src/components/escrow/ProfessionalWalletDashboard.tsx

cat << 'INNER_EOF' > replacement.txt
              <div className="flex-shrink-0">
                {project.status === 'pending_payment' && (
                  <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Awaiting Client Payment
                  </div>
                )}
                
                {(project.status === 'funded' || project.status === 'work_in_progress') && (
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/              <div className="flex-shrink-0">\n                \{\(project\.status === '"'"'funded'"'"' \|\| project\.status === '"'"'work_in_progress'"'"'\) && \(/`cat replacement.txt`/esg' src/components/escrow/ProfessionalWalletDashboard.tsx
