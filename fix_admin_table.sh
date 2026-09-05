#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${['completed_awaiting_confirmation'].includes(project.status) ? 'bg-amber-100 text-amber-800' :
                          ['completed', 'released', 'escrow_released'].includes(project.status) ? 'bg-emerald-100 text-emerald-800' :
                          project.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          ['declined', 'cancelled'].includes(project.status) ? 'bg-gray-100 text-gray-800' :
                          'bg-indigo-100 text-indigo-800'
                        }
                      `}>
                        {['completed_awaiting_confirmation', 'disputed'].includes(project.status) && <AlertCircle className="w-3.5 h-3.5" />}
                        {['completed', 'released', 'escrow_released'].includes(project.status) && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {project.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {['completed_awaiting_confirmation', 'disputed'].includes(project.status) ? (
                        <button
                          onClick={() => handleRelease(project.id)}
                          disabled={processingId === project.id}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-70"
                        >
                          {processingId === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Force Release'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No Action</span>
                      )}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/                      <span className=\`inline-flex items-center gap-1\.5 px-3 py-1 rounded-full text-xs font-semibold.*?<\/button>\n                      \) : \(\n                        <span className="text-xs text-gray-400 font-medium">No Action<\/span>\n                      \)\}/`cat replacement.txt`/esg' src/components/escrow/AdminEscrowDashboard.tsx
