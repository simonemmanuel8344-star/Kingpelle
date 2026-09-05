#!/bin/bash
cat << 'INNER_EOF' > replacement.txt
  const stats = {
    directServiceRequests: projects.filter(p => p.status === 'pending_acceptance').length,
    requestedServices: projects.length,
    directOrders: projects.length, // Can be the same as requested services or based on another metric if available
    activeEscrow: projects.filter(p => ['paid_in_escrow', 'in_progress', 'funded', 'completed_awaiting_confirmation'].includes(p.status)).length,
    completedProjects: projects.filter(p => ['completed', 'released', 'escrow_released'].includes(p.status)).length,
    releasedEscrowAmount: projects.filter(p => ['completed', 'released', 'escrow_released'].includes(p.status)).reduce((sum, p) => sum + Number(p.amount || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Applications / Orders / Escrow Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Total overview of the platform's order flow and finances.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Transactions</option>
            <option value="in_escrow">Active Escrow</option>
            <option value="pending_acceptance">Pending Acceptance</option>
            <option value="pending_release">Awaiting Release</option>
            <option value="released">Released / Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          <button onClick={loadData} className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Direct Service Requests</span>
          <span className="text-3xl font-black text-gray-900">{stats.directServiceRequests}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Requested Services</span>
          <span className="text-3xl font-black text-gray-900">{stats.requestedServices}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Direct Orders</span>
          <span className="text-3xl font-black text-gray-900">{stats.directOrders}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5 flex flex-col bg-indigo-50/30">
          <span className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">Active Escrow Projects</span>
          <span className="text-3xl font-black text-indigo-700">{stats.activeEscrow}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 flex flex-col bg-emerald-50/30">
          <span className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">Completed Projects</span>
          <span className="text-3xl font-black text-emerald-700">{stats.completedProjects}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 flex flex-col bg-emerald-50/50">
          <span className="text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wider">Released Escrow Payments</span>
          <span className="text-3xl font-black text-emerald-800">₦{stats.releasedEscrowAmount.toLocaleString()}</span>
        </div>
      </div>
INNER_EOF

perl -i -pe 'BEGIN{undef $/;} s/  return \(\n    <div className="space-y-6">\n      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">.*?<\/div>\n      <\/div>/`cat replacement.txt`/esg' src/components/escrow/AdminEscrowDashboard.tsx
