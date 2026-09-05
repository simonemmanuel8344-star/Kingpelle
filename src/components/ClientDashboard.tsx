import React, { useState, useEffect, FormEvent } from 'react';
import { 
  supabase, 
  fetchChatSessions, 
  fetchUserJobApplications, fetchUserNotifications, fetchClientOrders, markNotificationAsRead, markAllNotificationsAsRead 
} from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { 
  MessageSquare, ArrowRight, Settings, Lock, Mail, Clock, 
  ShieldCheck, Briefcase, CheckCircle2, Clock3, AlertCircle, 
  FileText, ExternalLink, Phone, User, Calendar, Sparkles, 
  ArrowUpRight, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';
import { Chat } from './Chat';
import { ClientEscrowDashboard } from './escrow/ClientEscrowDashboard';
import { JobApplication, ChatSession, AppNotification } from '../types';
import { Bell } from 'lucide-react';

interface ClientDashboardProps {
  onNavigateToJobs?: () => void;
}

export function ClientDashboard({ onNavigateToJobs }: ClientDashboardProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'applications' | 'orders' | 'chats' | 'settings' | 'notifications' | 'escrow'>('applications');
  
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [selectedAppModal, setSelectedAppModal] = useState<JobApplication | null>(null);
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          const cached = localStorage.getItem('idea_hub_local_user');
          if (cached) {
            try { setCurrentUser(JSON.parse(cached)); } catch {}
          }
        }
      }
    };
    fetchUser();
  }, []);

  // Load Job Applications for this user
  const loadUserApplications = async (userObj?: any) => {
    setLoadingApps(true);
    try {
      const userToQuery = userObj || currentUser;
      const userApps = await fetchUserJobApplications(userToQuery);
      setApplications(userApps);
    } catch (err) {
      console.warn('Error loading user applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  // Load Chats for this user
  const loadChats = async (userObj?: any) => {
    const u = userObj || currentUser;
    if (!u) {
      setLoadingChats(false);
      return;
    }
    try {
      const sessions = await fetchChatSessions({ clientId: u.id });
      setChats(sessions);
    } catch (err) {
      console.warn('Error loading client chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadNotifications = async (userObj?: any) => {
    const u = userObj || currentUser;
    if (!u) return;
    try {
      const notifs = await fetchUserNotifications(u.id);
      setNotifications(notifs);
    } catch (err) {}
  };

  const loadOrders = async (userObj?: any) => {
    const u = userObj || currentUser;
    if (!u) return;
    try {
      if (u.id) {
        const userOrders = await fetchClientOrders(u.id);
        setOrders(userOrders);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadUserApplications(currentUser);
    loadChats(currentUser);
    loadNotifications(currentUser);
    loadOrders(currentUser);


    const handleAppUpdated = (e: any) => {
      if (e.detail) {
        setApplications(prev => {
          const exists = prev.some(a => a.id === e.detail.id);
          if (exists) {
            return prev.map(a => a.id === e.detail.id ? { ...a, ...e.detail } : a);
          }
          return prev;
        });
        if (selectedAppModal && selectedAppModal.id === e.detail.id) {
          setSelectedAppModal(e.detail);
        }
        showToast(`Application status updated: ${e.detail.status?.toUpperCase() || 'UPDATED'}`, 'info');
      } else {
        loadUserApplications();
      }
    };

    const handleAppSubmitted = (e: any) => {
      if (e.detail) {
        setApplications(prev => [e.detail, ...prev.filter(a => a.id !== e.detail.id)]);
      } else {
        loadUserApplications();
      }
    };

    const handleChatUpdate = () => {
      loadChats();
    };

    const handleNotificationsUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('idea_hub_job_application_updated', handleAppUpdated);
    window.addEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
    window.addEventListener('idea_hub_chat_sessions_updated', handleChatUpdate);
    window.addEventListener('idea_hub_chat_message_sent', handleChatUpdate);
    window.addEventListener('idea_hub_notifications_updated', handleNotificationsUpdate);

    return () => {
      window.removeEventListener('idea_hub_job_application_updated', handleAppUpdated);
      window.removeEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
      window.removeEventListener('idea_hub_chat_sessions_updated', handleChatUpdate);
      window.removeEventListener('idea_hub_chat_message_sent', handleChatUpdate);
      window.removeEventListener('idea_hub_notifications_updated', handleNotificationsUpdate);
    };
  }, [currentUser]);

  const handleUpdateSecurity = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmNewPassword) {
      showToast("New passwords don't match", "error");
      return;
    }

    setSavingSettings(true);
    try {
      const updates: any = {};
      if (securityForm.newEmail && securityForm.newEmail !== currentUser.email) {
        updates.email = securityForm.newEmail;
      }
      if (securityForm.newPassword) {
        updates.password = securityForm.newPassword;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        showToast("Security settings updated successfully", "success");
        setActiveTab('applications');
        setSecurityForm({
          currentPassword: '',
          newEmail: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update security settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'reviewed':
        return {
          label: 'Application Reviewed',
          desc: 'Application Reviewed by Hiring Team',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          step: 2
        };
      case 'contacted':
        return {
          label: 'Contacted for Next Steps',
          desc: 'Interview & Next Steps Outreach',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          step: 3
        };
      case 'rejected':
        return {
          label: 'Position Closed / Archived',
          desc: 'Position Closed & Retained in Talent DB',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          step: 3
        };
      case 'pending':
      default:
        return {
          label: 'Pending Review',
          desc: 'Received & In Recruitment Queue',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          step: 1
        };
    }
  };

  if (activeChat) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-200">
        <Chat 
          chatId={activeChat.id}
          professionalId={activeChat.professionalId}
          professionalName={activeChat.professionalName}
          professionalPicture={activeChat.professionalPicture}
          onBack={() => setActiveChat(null)}
        />
      </div>
    );
  }

  const userDisplayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Profile & Navigation Banner */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shrink-0">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  {userDisplayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Client / Candidate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                {currentUser?.email && <span>{currentUser.email}</span>}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span className="text-indigo-600 font-medium">iDEA Creation Hub Portal</span>
              </p>
            </div>
          </div>

          {/* Refresh Action */}
          <button 
            onClick={() => {
              loadUserApplications();
              loadChats();
              showToast("Refreshed latest statuses", "info");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
            title="Refresh application statuses and conversations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Status</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Applications</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Service Requests</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {orders.length}
            </span>
          </button>


          <button
            onClick={() => {
              setActiveTab('notifications');
              if (currentUser) {
                markAllNotificationsAsRead(currentUser.id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
              }`}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Active Conversations</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'chats' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {chats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Security & Login</span>
          </button>
        </div>
      </div>

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
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'funded' || order.status === 'work_in_progress' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'work_submitted' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status ? order.status.replace(/_/g, ' ') : 'Pending'}
                    </span>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: MY APPLICATIONS */}

      {activeTab === 'applications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                Job Applications & Progress Tracker
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Real-time tracking of candidate submissions, recruitment reviews, and hiring decisions.
              </p>
            </div>
            
            {onNavigateToJobs && (
              <button
                onClick={onNavigateToJobs}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/60 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Browse More Openings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingApps ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500">
              <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold">Loading your application records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 sm:p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">No Job Applications Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                You haven't submitted an application for any open positions. Explore our job board to apply for partner and tech roles.
              </p>
              {onNavigateToJobs && (
                <button
                  onClick={onNavigateToJobs}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Explore Open Positions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {applications.map((app) => {
                const badge = getStatusBadge(app.status);
                const isRejected = (app.status || 'pending') === 'rejected';

                return (
                  <div 
                    key={app.id} 
                    className="bg-white border border-gray-200/90 hover:border-indigo-300 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Top Row: Title + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <h3 className="text-lg sm:text-xl font-black text-gray-900">
                            {app.jobTitle || 'Role Application'}
                          </h3>
                          {app.company && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700">
                              {app.company}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Applied: {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {app.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col sm:items-end gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {badge.desc}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 mb-5">
                      <div className="grid grid-cols-3 gap-2 relative">
                        {/* Step 1: Received */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 z-10">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900">1. Received</span>
                          <span className="text-[10px] text-gray-500 hidden sm:block">Logged in system</span>
                        </div>

                        {/* Step 2: Under Review */}
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 z-10 ${
                            badge.step >= 2 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {badge.step >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
                          </div>
                          <span className={`text-xs font-bold ${badge.step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                            2. Reviewing
                          </span>
                          <span className="text-[10px] text-gray-500 hidden sm:block">Recruiter screening</span>
                        </div>

                        {/* Step 3: Decision / Contact */}
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 z-10 ${
                            isRejected
                              ? 'bg-slate-400 text-white'
                              : badge.step >= 3
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {badge.step >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
                          </div>
                          <span className={`text-xs font-bold ${
                            isRejected ? 'text-slate-700' : badge.step >= 3 ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {isRejected ? '3. Closed' : '3. Outreach / Next'}
                          </span>
                          <span className="text-[10px] text-gray-500 hidden sm:block">
                            {isRejected ? 'Archived' : 'Interview scheduling'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Banner based on Status */}
                    <div className="text-xs p-3.5 rounded-xl border mb-4 flex items-start gap-2.5 leading-relaxed bg-white">
                      {app.status === 'reviewed' && (
                        <div className="text-blue-800 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 w-full">
                          <strong className="font-bold block mb-0.5">Status: Application Reviewed</strong>
                          Our recruiting managers have reviewed your submitted credentials and resume. Your profile is shortlisted for consideration.
                        </div>
                      )}
                      {app.status === 'contacted' && (
                        <div className="text-emerald-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 w-full">
                          <strong className="font-bold block mb-0.5">Status: Contacted for Next Steps</strong>
                          The hiring team has initiated contact via Phone / WhatsApp regarding interview schedules and project onboarding.
                        </div>
                      )}
                      {app.status === 'rejected' && (
                        <div className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 w-full">
                          <strong className="font-bold block mb-0.5">Status: Position Closed / Archived</strong>
                          Thank you for applying. Although we chose to proceed with other candidates for this specific opening, your profile is retained in our talent database for upcoming vacancies.
                        </div>
                      )}
                      {(!app.status || app.status === 'pending') && (
                        <div className="text-amber-800 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 w-full">
                          <strong className="font-bold block mb-0.5">Status: Pending Review</strong>
                          Your application has been received and queued in our talent portal. Our team will review your CV and update your status here.
                        </div>
                      )}
                    </div>

                    {/* Admin Feedback note (if present) */}
                    {app.adminFeedback && (
                      <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-3.5 mb-4">
                        <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Note from Hiring Team:
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed italic">
                          "{app.adminFeedback}"
                        </p>
                      </div>
                    )}

                    {/* Footer Actions / Attached Materials */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            download={app.cvName || 'My_CV'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Download CV ({app.cvName || 'Document'})</span>
                          </a>
                        )}
                        {app.cvLink && (
                          <a
                            href={app.cvLink.startsWith('http') ? app.cvLink : `https://${app.cvLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>External Portfolio Link</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <span>Full Submission Summary</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: ESCROW PAYMENTS */}
      {activeTab === 'escrow' && (
        <ClientEscrowDashboard userId={user?.id || ''} />
      )}

      {/* TAB 2: ACTIVE CONVERSATIONS */}
      {activeTab === 'chats' && (

        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              Active Conversations
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Chat directly with verified creative professionals, engineers, and project leads.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Inbox</span>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/50">
                {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loadingChats ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-900 mb-1">No conversations started yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-4">
                    Explore our vetted professionals and click "Chat" on their profile to start a discussion.
                  </p>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat)}
                    className="p-4 sm:p-6 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 shrink-0 overflow-hidden border border-indigo-200 flex items-center justify-center">
                        {chat.professionalPicture ? (
                          <img src={chat.professionalPicture} alt={chat.professionalName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-bold text-lg">
                            {chat.professionalName?.charAt(0) || 'P'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {chat.professionalName}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 hidden sm:inline">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate max-w-md">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">Stay updated on your application statuses</p>
            </div>
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll alert you here when your application status changes.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-2xl border ${!notif.read ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-gray-100'} transition-all`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${!notif.read ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${!notif.read ? 'text-gray-800' : 'text-gray-500'}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleUpdateSecurity} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">Security & Login Credentials</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage your account email and password credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  value={securityForm.newEmail}
                  onChange={e => setSecurityForm({...securityForm, newEmail: e.target.value})}
                  placeholder={currentUser?.email || "new-email@example.com"}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password (optional)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  value={securityForm.newPassword}
                  onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  disabled={!securityForm.newPassword}
                  required={!!securityForm.newPassword}
                  value={securityForm.confirmNewPassword}
                  onChange={e => setSecurityForm({...securityForm, confirmNewPassword: e.target.value})}
                  placeholder="Verify new password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-indigo-700 shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Detail Modal for an Application */}
      {selectedAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Application Detail</span>
                <h3 className="text-xl font-black text-gray-900 truncate max-w-xs sm:max-w-md">
                  {selectedAppModal.jobTitle || 'Role Application'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Header */}
              {(() => {
                const b = getStatusBadge(selectedAppModal.status);
                return (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${b.bg}`}>
                    <div>
                      <span className="text-xs font-bold block opacity-75">Current Hiring Stage</span>
                      <span className="text-base font-black">{b.label}</span>
                      <p className="text-xs mt-0.5">{b.desc}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-xs shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                );
              })()}

              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Applicant Name</span>
                  <span className="font-black text-gray-900 text-sm">{selectedAppModal.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Contact Phone</span>
                  <span className="font-black text-gray-900 text-sm">{selectedAppModal.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Submission Date</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(selectedAppModal.appliedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Application ID</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate block">
                    {selectedAppModal.id}
                  </span>
                </div>
              </div>

              {/* Cover statement / Introduction */}
              {selectedAppModal.resumeText && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Cover Statement / Intro</label>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedAppModal.resumeText}
                  </div>
                </div>
              )}

              {/* Attached documents */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Attached Materials</label>
                <div className="space-y-2">
                  {selectedAppModal.cvUrl ? (
                    <a
                      href={selectedAppModal.cvUrl}
                      download={selectedAppModal.cvName || 'Resume_Document'}
                      className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50/50 rounded-xl border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {selectedAppModal.cvName || 'Attached_CV.pdf'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 shrink-0">Download</span>
                    </a>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No direct file upload attached.</div>
                  )}

                  {selectedAppModal.cvLink && (
                    <a
                      href={selectedAppModal.cvLink.startsWith('http') ? selectedAppModal.cvLink : `https://${selectedAppModal.cvLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ExternalLink className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-blue-900 truncate">
                          {selectedAppModal.cvLink}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-700 shrink-0">Open Link</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedAppModal(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
