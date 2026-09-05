#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">
                          {order.budget_range}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          order.status === 'funded' || order.status === 'work_in_progress' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'work_submitted' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status ? order.status.replace(/_/g, ' ') : 'Pending'}
                        </span>
                      </div>
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">\n                        \{order.budget_range\}\n                      <\/span>/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
