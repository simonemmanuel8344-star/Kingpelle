#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <span className="text-sm font-semibold text-gray-500 mb-2">Direct Service Requests</span>
          <span className="text-4xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending_acceptance').length}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <span className="text-sm font-semibold text-gray-500 mb-2">Requested Services & Direct Orders</span>
          <span className="text-4xl font-bold text-gray-900">{orders.length}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <span className="text-sm font-semibold text-gray-500 mb-2">Active Escrow Projects</span>
          <span className="text-4xl font-bold text-indigo-600">{orders.filter(o => ['paid_in_escrow', 'in_progress', 'completed_awaiting_confirmation'].includes(o.status)).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      <\/div>\n\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
