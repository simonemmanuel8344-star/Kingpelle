#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-indigo-600" />
                Service Requests & Direct Orders
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage all your professional service requests.
              </p>
            </div>
          </div>

          {/* DASHBOARD STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <span className="text-sm font-semibold text-gray-500 mb-2">Requested Services & Direct Orders</span>
              <span className="text-4xl font-bold text-gray-900">{orders.length}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <span className="text-sm font-semibold text-gray-500 mb-2">Active Escrow Projects</span>
              <span className="text-4xl font-bold text-indigo-600">{orders.filter(o => ['paid_in_escrow', 'in_progress', 'completed_awaiting_confirmation'].includes(o.status)).length}</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 sm:p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">No Service Requests Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                You haven't requested any services from professionals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="w-full">
                      <h3 className="font-bold text-gray-900 text-lg">{order.project_title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{order.project_description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                          <User className="w-4 h-4" /> Professional: {order.professional_name || 'Pending'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                          <Briefcase className="w-4 h-4" /> Category: {order.service_category}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                          <Clock3 className="w-4 h-4" /> {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg whitespace-nowrap">
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
                  
                  {/* Actions and Status Helpers */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    {order.status === 'pending_acceptance' && (
                      <p className="text-xs font-medium text-amber-600 w-full text-right">
                        Awaiting Professional Acceptance...
                      </p>
                    )}
                    {order.status === 'accepted_awaiting_payment' && (
                      <div className="flex items-center gap-3 w-full justify-between">
                        <p className="text-xs font-medium text-indigo-600 flex-1">
                          Professional accepted. Payment will be held securely in escrow until completion.
                        </p>
                        <button onClick={() => handlePayNow(order.id)} className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl text-sm transition-colors shadow-sm">
                          Pay Now
                        </button>
                      </div>
                    )}
                    {['paid_in_escrow', 'in_progress', 'funded'].includes(order.status) && (
                      <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold w-full justify-end">
                        <Shield className="w-4 h-4" />
                        Payment Secured in Escrow
                      </div>
                    )}
                    {order.status === 'completed_awaiting_confirmation' && (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <p className="text-xs font-medium text-amber-600 flex-1">
                          Professional has marked this project as completed.
                        </p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleRaiseDispute(order.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-xs transition-colors shadow-sm">
                            Raise Dispute
                          </button>
                          <button onClick={() => handleConfirmCompletion(order.id)} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors shadow-sm">
                            Confirm Completion
                          </button>
                        </div>
                      </div>
                    )}
                    {['completed', 'escrow_released'].includes(order.status) && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold w-full justify-end">
                        <CheckCircle2 className="w-4 h-4" />
                        Escrow Released
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      \{activeTab === '"'"'orders'"'"' && \(\n        <div className="space-y-6 animate-in fade-in duration-200">.*?<\/div>\n      \)\}/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
