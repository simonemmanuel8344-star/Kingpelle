#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
      {/* TAB 1: SERVICE REQUESTS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                    <div>
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
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: MY APPLICATIONS */}
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/      \{\/\* TAB 1: MY APPLICATIONS \*\/\}/`cat replacement.txt`/esg' src/components/ClientDashboard.tsx
