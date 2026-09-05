#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const loadOrders = async (userObj?: any) => {
    const u = userObj || currentUser;
    if (!u) return;
    try {
      if (u.id) {
        const userOrders = await fetchClientOrders(u.id);
        setOrders(userOrders);
      }
    } catch (err) {}
  };
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  const loadOrders = async \(userObj\?\: any\) => \{.*?    \} catch \(err\) \{\}\n  \};\n/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
