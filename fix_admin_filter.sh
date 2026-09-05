#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending_release') return p.status === 'completed_awaiting_confirmation';
    if (filter === 'in_escrow') return ['paid_in_escrow', 'in_progress', 'funded'].includes(p.status);
    if (filter === 'released') return ['completed', 'escrow_released', 'released'].includes(p.status);
    return p.status === filter;
  });
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  const filteredProjects = projects\.filter\(p => \{.*?  \}\);/`cat replacement.txt`/esg' src/components/escrow/AdminEscrowDashboard.tsx
