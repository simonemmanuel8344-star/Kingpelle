import React, { useState, useEffect } from 'react';
import { Wallet, EscrowProject } from '../../types';
import { fetchWallet, fetchEscrowProjects, updateEscrowStatus } from '../../lib/supabase';
import { Wallet as WalletIcon, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function ProfessionalWalletDashboard({ userId }: { userId: string }) {
  const { showToast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [projects, setProjects] = useState<EscrowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [wData, pData] = await Promise.all([
        fetchWallet(userId),
        fetchEscrowProjects(userId, 'professional')
      ]);
      setWallet(wData);
      setProjects(pData);
      setLoading(false);
    }
    load();
  }, [userId]);

  const handleSubmitWork = async (projectId: string) => {
    setSubmitting(projectId);
    try {
      const { error } = await updateEscrowStatus(projectId, 'work_submitted');
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'work_submitted' } : p));
      showToast('Work submitted! Awaiting client approval.', 'success');
    } catch (err: any) {
      // simulate fallback for demo
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'work_submitted' } : p));
      showToast('Work submitted! (Simulated)', 'success');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;

  const pending = Number(wallet?.pending_escrow || 0);
  const available = Number(wallet?.available_balance || 0);
  const withdrawn = Number(wallet?.withdrawn || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><WalletIcon className="w-16 h-16" /></div>
          <p className="text-indigo-100 font-medium text-sm mb-1">Available Balance</p>
          <h3 className="text-4xl font-black mb-1">₦{available.toLocaleString()}</h3>
          <p className="text-indigo-200 text-xs">Ready for withdrawal</p>
        </div>
        
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
          <p className="text-gray-500 font-medium text-sm mb-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Pending in Escrow
          </p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₦{pending.toLocaleString()}</h3>
          <p className="text-gray-400 text-xs">Securely held until completion</p>
        </div>
        
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
          <p className="text-gray-500 font-medium text-sm mb-1">Total Withdrawn</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">₦{withdrawn.toLocaleString()}</h3>
          <p className="text-gray-400 text-xs">Lifetime earnings</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Active Escrow Projects
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {projects.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500">
              No active escrow projects found.
            </div>
          ) : projects.map(project => (
            <div key={project.id} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{project.title}</h4>
                <p className="text-sm text-gray-500">Client: {project.client_name}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                    Amount: ₦{Number(project.amount).toLocaleString()}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {project.status === 'pending_payment' && (
                  <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Awaiting Client Payment
                  </div>
                )}
                
                {(project.status === 'funded' || project.status === 'work_in_progress') && (

                  <button 
                    onClick={() => handleSubmitWork(project.id)}
                    disabled={submitting === project.id}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition shadow flex items-center gap-2"
                  >
                    {submitting === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Submit Work
                  </button>
                )}
                
                {project.status === 'work_submitted' && (
                  <div className="text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Awaiting Client Review
                  </div>
                )}
                
                {project.status === 'awaiting_admin_release' && (
                  <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Awaiting Admin Release
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ensure Briefcase is imported above! Add it manually if missing.
import { Briefcase } from 'lucide-react';
