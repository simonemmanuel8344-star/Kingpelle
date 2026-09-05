#!/bin/bash
sed -i "1i import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';" src/components/ProfessionalDashboard.tsx

cat << 'INNER_EOF' > replacement.txt
          {/* Direct Service Orders */}
          <div className="bg-transparent border border-gray-200/60 rounded-2xl overflow-hidden shadow-xl mt-8">
            <div className="px-6 py-5 border-b border-gray-200/60 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Direct Service Requests</h3>
                  <p className="text-xs text-gray-500">Orders placed by clients for your services</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-600 text-white rounded-full">
                {orders.length} {orders.length === 1 ? 'request' : 'requests'}
              </span>
            </div>

            {orders.length > 0 && (
              <div className="p-6 border-b border-gray-200/60 bg-white/[0.01]">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Project Completion Progress</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orders.map(o => {
                        let progress = 10;
                        const s = o.status || '';
                        if (s.includes('released') || s.includes('completed')) progress = 100;
                        else if (s.includes('submitted') || s.includes('awaiting_admin_release')) progress = 90;
                        else if (s.includes('funded') || s.includes('progress')) progress = 50;
                        
                        return {
                          name: o.project_title.length > 15 ? o.project_title.substring(0, 15) + '...' : o.project_title,
                          fullTitle: o.project_title,
                          progress,
                          status: s.replace(/_/g, ' ') || 'Pending'
                        };
                      })}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6B7280'}} axisLine={false} tickLine={false} angle={-25} textAnchor="end" />
                      <YAxis tick={{fontSize: 10, fill: '#6B7280'}} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                      <RechartsTooltip 
                        cursor={{fill: '#F3F4F6'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs">
                                <p className="font-bold text-sm mb-1">{data.fullTitle}</p>
                                <p className="text-gray-300">Status: <span className="text-indigo-300 capitalize">{data.status}</span></p>
                                <p className="text-gray-300">Completion: <span className="font-bold text-white">{data.progress}%</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {orders.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#4F46E5" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="divide-y divide-white/5">
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          \{\/\* Direct Service Orders \*\/\}\n          <div className="bg-transparent border border-gray-200\/60 rounded-2xl overflow-hidden shadow-xl mt-8">\n            <div className="px-6 py-5 border-b border-gray-200\/60 flex items-center justify-between bg-white\/\[0\.02\]">\n              <div className="flex items-center gap-2\.5">\n                <div className="w-9 h-9 rounded-xl bg-indigo-600\/10 flex items-center justify-center text-indigo-600">\n                  <FileText className="w-5 h-5" \/>\n                <\/div>\n                <div>\n                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Direct Service Requests<\/h3>\n                  <p className="text-xs text-gray-500">Orders placed by clients for your services<\/p>\n                <\/div>\n              <\/div>\n              <span className="text-xs font-semibold px-2\.5 py-1 bg-indigo-600 text-white rounded-full">\n                \{orders.length\} \{orders.length === 1 \? '"'"'request'"'"' : '"'"'requests'"'"'\}\n              <\/span>\n            <\/div>\n            \n            <div className="divide-y divide-white\/5">/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
