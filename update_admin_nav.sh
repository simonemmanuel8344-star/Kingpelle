#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
            { id: 'applications', icon: <FileCheck className="w-5 h-5" />, label: 'Applications', badge: applicationsList.length },
            { id: 'escrow', icon: <ShieldCheck className="w-5 h-5" />, label: 'Escrow & Payments' },
            { id: 'projects', icon: <Briefcase className="w-5 h-5" />, label: 'Portfolio Projects' },
            { id: 'professionals', icon: <Users className="w-5 h-5" />, label: 'Professionals' },
            { id: 'clients', icon: <UserIcon className="w-5 h-5" />, label: 'Clients' },
            { id: 'jobs', icon: <Briefcase className="w-5 h-5" />, label: 'Job Postings' },
            { id: 'chats', icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chats' },
            { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Platform Settings' },
          ].map(item => (
INNER_EOF

# Replace lines in src/components/AdminDashboard.tsx
perl -i -pe 'BEGIN{undef $/;} s/        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">.*?\]\.map\(item => \(/`cat replacement.txt`/esg' src/components/AdminDashboard.tsx
