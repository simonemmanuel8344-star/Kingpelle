#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const userDisplayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  return \(\n\n  const userDisplayName = currentUser\?\.user_metadata\?\.full_name \|\| currentUser\?\.email\?\.split\('"'"'@'"'"'\)\[0\] \|\| '"'"'User'"'"';\n\n  const handlePayNow = async \(orderId: string\) => \{.*?  return \(\n    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
