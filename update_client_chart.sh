#!/bin/bash
sed -i "1i import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';" src/components/ClientDashboard.tsx

cat << 'INNER_EOF' > replacement.txt
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-indigo-600" />
                Requested Services & Direct Orders
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Track the services you requested directly from professionals on the platform.
              </p>
            </div>
          </div>

          {orders.length > 0 && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
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
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">\n            <div>\n              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">\n                <FileText className="w-6 h-6 text-indigo-600" \/>\n                Requested Services & Direct Orders\n              <\/h2>\n              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">\n                Track the services you requested directly from professionals on the platform.\n              <\/p>\n            <\/div>\n          <\/div>/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
