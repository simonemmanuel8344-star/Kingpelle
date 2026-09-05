#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Applications</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Service Requests</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {orders.length}
            </span>
          </button>
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          <button\n            onClick=\{\(\) => setActiveTab\('"'"'applications'"'"'\)\}.*?          <\/button>/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
