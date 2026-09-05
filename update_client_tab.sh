#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      )}

      {/* TAB: ESCROW PAYMENTS */}
      {activeTab === 'escrow' && (
        <ClientEscrowDashboard userId={user?.id || ''} />
      )}

      {/* TAB 2: ACTIVE CONVERSATIONS */}
      {activeTab === 'chats' && (
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      \)}\n\n      \{\/\* TAB 2: ACTIVE CONVERSATIONS \*\/\}\n      \{activeTab === '"'"'chats'"'"' && \(/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
