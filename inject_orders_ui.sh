#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
          </div>

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
            
            <div className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">No direct requests yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                    When clients order your services directly, the project details will appear here.
                  </p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-4 sm:p-6 hover:bg-white/60 transition-all flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{order.project_title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{order.project_description}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">
                        {order.budget_range}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {order.client_name}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {order.client_email}</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job Applications Submitted by this Professional */}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/          <\/div>\n\n          \{\/\* Job Applications Submitted by this Professional \*\/\}/`cat replacement.txt`/esg' src/components/ProfessionalDashboard.tsx
