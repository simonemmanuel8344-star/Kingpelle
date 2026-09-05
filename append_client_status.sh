#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'funded' || order.status === 'work_in_progress' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'work_submitted' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status ? order.status.replace(/_/g, ' ') : 'Pending'}
                    </span>
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/                    <span className=\{`px-4 py-1\.5 rounded-full text-xs font-bold uppercase tracking-wider \$\{\n                      order.status === '"'"'completed'"'"' \? '"'"'bg-emerald-100 text-emerald-700'"'"' :\n                      order.status === '"'"'in_progress'"'"' \? '"'"'bg-indigo-100 text-indigo-700'"'"' :\n                      '"'"'bg-amber-100 text-amber-700'"'"'\n                    \}`\}>\n                      \{order\.status \|\| '"'"'Pending'"'"'\}\n                    <\/span>/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
