#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'escrow'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Escrow Payments
          </button>
          <button
            onClick={() => setActiveTab('chats')}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          <\/button>\n          <button\n            onClick=\{\(\) => setActiveTab\('"'"'chats'"'"'\)\}/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
