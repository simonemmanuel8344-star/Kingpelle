#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">
                          {order.budget_range}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          ['in_progress', 'paid_in_escrow', 'funded', 'work_in_progress'].includes(order.status) ? 'bg-indigo-100 text-indigo-700' :
                          ['completed', 'escrow_released', 'released'].includes(order.status) ? 'bg-emerald-100 text-emerald-700' :
                          ['completed_awaiting_confirmation', 'work_submitted'].includes(order.status) ? 'bg-amber-100 text-amber-700' :
                          order.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status ? order.status.replace(/_/g, ' ') : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {order.client_name}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {order.client_email}</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Actions and Status Helpers */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      {order.status === 'pending_acceptance' && (
                        <div className="flex items-center gap-2 w-full justify-end">
                          <button onClick={() => handleDeclineOrder(order.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-xs transition-colors">
                            Decline
                          </button>
                          <button onClick={() => handleAcceptOrder(order.id)} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl text-xs transition-colors">
                            Accept Order
                          </button>
                        </div>
                      )}
                      {order.status === 'accepted_awaiting_payment' && (
                        <p className="text-xs font-medium text-amber-600 w-full text-right">
                          Awaiting client payment...
                        </p>
                      )}
                      {['paid_in_escrow', 'in_progress', 'funded'].includes(order.status) && (
                        <>
                          <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <Shield className="w-4 h-4" />
                            Payment Secured in Escrow
                          </div>
                          <button onClick={() => handleMarkCompleted(order.id)} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors shadow-sm">
                            Mark Project as Completed
                          </button>
                        </>
                      )}
                      {order.status === 'completed_awaiting_confirmation' && (
                        <p className="text-xs font-medium text-amber-600 w-full text-right">
                          Awaiting client confirmation to release escrow...
                        </p>
                      )}
                      {['completed', 'escrow_released'].includes(order.status) && (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold w-full justify-end">
                          <CheckCircle className="w-4 h-4" />
                          Payment Released - Available in Wallet
                        </div>
                      )}
                    </div>
                  </div>
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/                      <div className="flex flex-col items-end gap-2">\n                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">\n                          \{order\.budget_range\}\n                        <\/span>\n                        <span className=\`px-2\.5 py-1 rounded-md text-\[10px\] font-bold uppercase tracking-wider whitespace-nowrap \$\{\n                          order\.status === '"'"'funded'"'"' \|\| order\.status === '"'"'work_in_progress'"'"' \? '"'"'bg-indigo-100 text-indigo-700'"'"' :\n                          order\.status === '"'"'released'"'"' \? '"'"'bg-emerald-100 text-emerald-700'"'"' :\n                          order\.status === '"'"'work_submitted'"'"' \? '"'"'bg-amber-100 text-amber-700'"'"' :\n                          '"'"'bg-gray-100 text-gray-600'"'"'\n                        \}\`>\n                          \{order\.status \? order\.status\.replace\(\/_\/g, '"'"' '"'"'\) : '"'"'Pending'"'"'\}\n                        <\/span>\n                      <\/div>\n\n                    <\/div>\n                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">\n                      <span className="flex items-center gap-1\.5"><UserIcon className="w-3\.5 h-3\.5" \/> \{order\.client_name\}<\/span>\n                      <span className="flex items-center gap-1\.5"><Mail className="w-3\.5 h-3\.5" \/> \{order\.client_email\}<\/span>\n                      <span className="flex items-center gap-1\.5"><Clock3 className="w-3\.5 h-3\.5" \/> \{new Date\(order\.created_at\)\.toLocaleDateString\(\)\}<\/span>\n                    <\/div>\n                  <\/div>/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
