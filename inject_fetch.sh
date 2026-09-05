#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
    // 1b. Fetch Direct Service Orders
    fetchProfessionalOrders(currentUser.id).then(data => {
      setOrders(data);
    });

    // 2. Fetch chats involving this professional
    const loadProChats = () => {
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/    \/\/ 2\. Fetch chats involving this professional\n    const loadProChats = \(\) => \{/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
