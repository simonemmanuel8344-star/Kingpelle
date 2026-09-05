#!/bin/bash
sed -i 's/import { Professional, PortfolioItem, JobPosting as Job, JobApplication, ChatSession, ChatMessage } from '"'"'..\/types'"'"';/import { Professional, PortfolioItem, JobPosting as Job, JobApplication, ChatSession, ChatMessage } from '"'"'..\/types'"'"';\nimport { AdminEscrowDashboard } from '"'"'.\/escrow\/AdminEscrowDashboard'"'"';/g' src/components/AdminDashboard.tsx

cat << 'INNER_EOF' > replacement.txt
          )}

          {activeTab === 'escrow' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <AdminEscrowDashboard />
            </motion.div>
          )}

          {activeTab === 'chats' && (
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          \)}\n\n          \{activeTab === '"'"'chats'"'"' && \(/`cat replacement.txt`/esg' src/components/AdminDashboard.tsx
