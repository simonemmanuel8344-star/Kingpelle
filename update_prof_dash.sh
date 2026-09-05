#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      )}

      {/* NEW ESCROW & WALLET SECTION */}
      <div className="mb-10">
         <ProfessionalWalletDashboard userId={currentUser?.id || ''} />
      </div>

      {/* Main Grid: Client Messages & Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      \)}\n\n      \{\/\* Main Grid: Client Messages & Rating Summary \*\/\}\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
