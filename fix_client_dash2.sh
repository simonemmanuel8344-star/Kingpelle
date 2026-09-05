#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const loadOrders = async (userObj?: any) => {
    const u = userObj || currentUser;
    if (!u) return;
    try {
      const email = u.email;
      if (email) {
        const userOrders = await fetchClientOrders(email);
        setOrders(userOrders);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadUserApplications(currentUser);
    loadChats(currentUser);
    loadNotifications(currentUser);
    loadOrders(currentUser);
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  useEffect\(\(\) => \{\n    loadUserApplications\(currentUser\);\n    loadChats\(currentUser\);\n    loadNotifications\(currentUser\);/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
