import { extractUrl } from "../lib/urlUtils";
import { fileToBase64 } from '../lib/fileUtils';
import React, { useState, useEffect, useRef } from 'react';
import { supabase, fetchChatSessions, fetchChatMessages, saveChatMessage, saveChatSession, getActiveUser, getStoredUser, fetchJobApplications, deleteJobApplication, updateJobApplicationStatus, updateJobApplicationInternalStatus, generateUUID } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit, Trash2, LayoutDashboard, Shield, Lock, Send, X, Image as ImageIcon,
  Eye, EyeOff, ArrowLeft, Mail, FileText, Download, ExternalLink, Phone, Calendar,
  CheckCircle2, ShieldCheck, Clock, AlertCircle, Filter, Search, Copy, Save, RefreshCw, Check,
  Users, User as UserIcon, Briefcase, FileCheck, MessageSquare, Settings, LogOut
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Professional, PortfolioItem, JobPosting as Job, JobApplication, ChatSession, ChatMessage } from '../types';
import { AdminEscrowDashboard } from './escrow/AdminEscrowDashboard';

interface AdminDashboardProps {
  clients?: any[];
  onDeleteClient?: (id: string) => Promise<void>;
  professionals: Professional[];
  projects: PortfolioItem[];
  jobs: Job[];
  applications: JobApplication[];
  onDeleteApplication?: (id: string) => Promise<void>;
  onUpdateApplicationStatus?: (id: string, status: 'pending' | 'reviewed' | 'contacted' | 'rejected', feedback?: string) => Promise<void>;
  onAddProfessional: (prof: any) => Promise<void>;
  onUpdateProfessional: (id: string, updates: any) => Promise<void>;
  onDeleteProfessional: (id: string) => Promise<void>;
  onAddProject: (project: any) => Promise<void>;
  onUpdateProject: (id: string, updates: any) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAddJob: (job: any) => Promise<void>;
  onUpdateJob: (id: string, updates: any) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  logoUrl: string;
  onUpdateLogo: (url: string) => Promise<void>;
  heroImageUrl: string;
  onUpdateHeroImage: (url: string) => Promise<void>;
  professionalInviteCode: string;
  onUpdateInviteCode: (code: string) => Promise<void>;
  onLogout: () => void;
  onViewProfessionalProfile?: (prof: any) => void;
}

export function AdminDashboard(props: AdminDashboardProps) {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('simonemmanuel8344@gmail.com');
  const [adminPassword, setAdminPassword] = useState('223344556677##');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'professional' | 'job' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Applications management state
  const [applicationsList, setApplicationsList] = useState<JobApplication[]>(props.applications || []);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'reviewed' | 'contacted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [modalSelectedStatus, setModalSelectedStatus] = useState<'pending' | 'reviewed' | 'contacted' | 'rejected'>('pending');
  const [appFeedbackNote, setAppFeedbackNote] = useState('');
  const [appInternalNote, setAppInternalNote] = useState('');
  const [isSavingAppAction, setIsSavingAppAction] = useState(false);
  const [tableDraftStatuses, setTableDraftStatuses] = useState<{ [appId: string]: 'pending' | 'reviewed' | 'contacted' | 'rejected' }>({});
  const [tableDraftFeedback, setTableDraftFeedback] = useState<{ [appId: string]: string }>({});
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [isSyncingAllApps, setIsSyncingAllApps] = useState(false);

  useEffect(() => {
    if (selectedApplication) {
      setModalSelectedStatus((selectedApplication.status as any) || 'pending');
      setAppFeedbackNote(selectedApplication.adminFeedback || '');
      setAppInternalNote(selectedApplication.internalNotes || '');
    } else {
      setModalSelectedStatus('pending');
      setAppFeedbackNote('');
      setAppInternalNote('');
    }
  }, [selectedApplication?.id]);

  useEffect(() => {
    if (props.applications) {
      setApplicationsList(props.applications);
    }
  }, [props.applications]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await fetchJobApplications();
        if (apps && apps.length > 0) {
          setApplicationsList(apps);
        }
      } catch (err) {
        console.warn('Failed to load apps in admin dashboard:', err);
      }
    };
    loadApps();

    const handleSubmitted = (e: any) => {
      if (e.detail?.id) {
        setApplicationsList(prev => [e.detail, ...prev.filter(a => a.id !== e.detail.id)]);
      }
    };
    const handleDeleted = (e: any) => {
      if (e.detail?.id) {
        setApplicationsList(prev => prev.filter(a => a.id !== e.detail.id));
      }
    };
    const handleUpdated = (e: any) => {
      if (e.detail?.id) {
        setApplicationsList(prev => prev.map(a => a.id === e.detail.id ? { ...a, ...e.detail } : a));
      }
    };

    window.addEventListener('idea_hub_job_application_submitted', handleSubmitted);
    window.addEventListener('idea_hub_job_application_deleted', handleDeleted);
    window.addEventListener('idea_hub_job_application_updated', handleUpdated);

    return () => {
      window.removeEventListener('idea_hub_job_application_submitted', handleSubmitted);
      window.removeEventListener('idea_hub_job_application_deleted', handleDeleted);
      window.removeEventListener('idea_hub_job_application_updated', handleUpdated);
    };
  }, [isAuthenticated]);

  const filteredApplications = applicationsList.filter(app => {
    const matchesFilter = applicationFilter === 'all' || (app.status || 'pending') === applicationFilter;
    const query = applicationSearch.toLowerCase().trim();
    if (!query) return matchesFilter;
    const matchesQuery = 
      Boolean(app.fullName && app.fullName.toLowerCase().includes(query)) ||
      Boolean(app.phone && app.phone.toLowerCase().includes(query)) ||
      Boolean(app.jobTitle && app.jobTitle.toLowerCase().includes(query)) ||
      Boolean(app.resumeText && app.resumeText.toLowerCase().includes(query)) ||
      Boolean(app.cvName && app.cvName.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  });
  
  // Chats
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const selectedChatRef = useRef<ChatSession | null>(null);
  selectedChatRef.current = selectedChat;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local settings state
  const [settingsForm, setSettingsForm] = useState({
    professionalInviteCode: props.professionalInviteCode || 'PRO-IDEA-2026',
    logoUrl: props.logoUrl || '',
    heroImageUrl: props.heroImageUrl || ''
  });

  useEffect(() => {
    setSettingsForm({
      professionalInviteCode: props.professionalInviteCode || 'PRO-IDEA-2026',
      logoUrl: props.logoUrl || '',
      heroImageUrl: props.heroImageUrl || ''
    });
  }, [props.professionalInviteCode, props.logoUrl, props.heroImageUrl]);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    await Promise.all([
      props.onUpdateInviteCode(settingsForm.professionalInviteCode),
      props.onUpdateLogo(settingsForm.logoUrl),
      props.onUpdateHeroImage(settingsForm.heroImageUrl)
    ]);
    setIsSubmitting(false);
    showToast("Settings saved successfully", "success");
  };

  const handleDeleteSettingsInfo = async () => {
    if (!window.confirm("Are you sure you want to delete and reset all platform settings?")) return;
    setIsSubmitting(true);
    const cleared = {
      professionalInviteCode: 'PRO-IDEA-2026',
      logoUrl: '',
      heroImageUrl: ''
    };
    setSettingsForm(cleared);
    await Promise.all([
      props.onUpdateInviteCode(cleared.professionalInviteCode),
      props.onUpdateLogo(cleared.logoUrl),
      props.onUpdateHeroImage(cleared.heroImageUrl)
    ]);
    setIsSubmitting(false);
    showToast("Settings deleted and reset to defaults", "info");
  };

  const isAdminEmail = (email?: string) => email?.trim().toLowerCase() === 'simonemmanuel8344@gmail.com';

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isAdminEmail(user.email)) {
          setIsAuthenticated(true);
        } else {
          const stored = getStoredUser();
          if (stored && isAdminEmail(stored.email)) {
            setIsAuthenticated(true);
            return;
          }
          setIsAuthenticated(false);
          if (user) {
            setLoginError(`Current account (${user.email}) does not have administrator privileges.`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      if (user && isAdminEmail(user.email)) {
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        const stored = getStoredUser();
        if (stored && isAdminEmail(stored.email)) {
          setIsAuthenticated(true);
          setLoginError('');
          return;
        }
        setIsAuthenticated(false);
        if (user) {
          setLoginError(`Current account (${user.email}) does not have administrator privileges.`);
        }
      }
      setIsAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const loadChats = async () => {
      try {
        const data = await fetchChatSessions();
        if (isMounted) {
          setChats(data);
          if (selectedChatRef.current) {
            const currentInList = data.find(c => c.id === selectedChatRef.current?.id);
            if (currentInList) {
              setSelectedChat(currentInList);
            }
          }
        }
      } catch (err) {
        console.warn('Admin loadChats warning:', err);
      }
    };
    loadChats();

    // Listen for chat session updates
    const handleSessionsUpdate = (e: any) => {
      if (!isMounted || !e.detail) return;
      const updated: ChatSession = e.detail;
      setChats(prev => {
        const filtered = prev.filter(c => c.id !== updated.id);
        return [updated, ...filtered];
      });
      if (selectedChatRef.current && selectedChatRef.current.id === updated.id) {
        setSelectedChat(updated);
      }
    };

    // Listen for live sent messages across all components
    const handleMessageSent = (e: any) => {
      if (!isMounted || !e.detail) return;
      const msg: ChatMessage = e.detail;

      // Update sidebar session item
      setChats(prev => {
        const idx = prev.findIndex(c => c.id === msg.chatId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            lastMessage: msg.text,
            updatedAt: msg.timestamp
          };
          const item = copy.splice(idx, 1)[0];
          return [item, ...copy];
        } else {
          loadChats();
          return prev;
        }
      });

      // If viewing this chat session, immediately append message to current view
      if (selectedChatRef.current && selectedChatRef.current.id === msg.chatId) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          const next = [...prev, msg];
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          return next;
        });
      }
    };

    // Listen for multi-tab localStorage events
    const handleStorage = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === 'idea_hub_chat_sessions' || e.key?.startsWith('idea_hub_chat_msgs_')) {
        loadChats();
        if (selectedChatRef.current && e.key === `idea_hub_chat_msgs_${selectedChatRef.current.id}`) {
          fetchChatMessages(selectedChatRef.current.id).then(msgs => {
            if (isMounted) {
              setChatMessages(msgs);
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }
          });
        }
      }
    };

    window.addEventListener('idea_hub_chat_sessions_updated', handleSessionsUpdate);
    window.addEventListener('idea_hub_chat_message_sent', handleMessageSent);
    window.addEventListener('storage', handleStorage);

    // Polling fallback every 2.5 seconds
    const interval = setInterval(loadChats, 2500);

    return () => {
      isMounted = false;
      window.removeEventListener('idea_hub_chat_sessions_updated', handleSessionsUpdate);
      window.removeEventListener('idea_hub_chat_message_sent', handleMessageSent);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedChat) {
      setChatMessages([]);
      return;
    }
    let isMounted = true;

    const loadMsgs = async () => {
      try {
        const msgs = await fetchChatMessages(selectedChat.id);
        if (isMounted) {
          setChatMessages(msgs);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.warn('Admin loadMsgs warning:', err);
      }
    };
    loadMsgs();

    const interval = setInterval(async () => {
      if (!isMounted || !selectedChatRef.current) return;
      const msgs = await fetchChatMessages(selectedChatRef.current.id);
      if (isMounted) {
        setChatMessages(prev => {
          if (prev.length !== msgs.length || (msgs.length > 0 && prev[prev.length - 1]?.id !== msgs[msgs.length - 1]?.id)) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            return msgs;
          }
          return prev;
        });
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedChat?.id]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const cleanEmail = adminEmail.trim().toLowerCase();

    if (cleanEmail !== 'simonemmanuel8344@gmail.com') {
      setLoginError('Admin access is strictly restricted to simonemmanuel8344@gmail.com.');
      setIsSubmitting(false);
      return;
    }

    if (adminPassword !== '223344556677##') {
      setLoginError('Incorrect admin password. Please enter the master password for this account.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Try Supabase auth sign-in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: adminPassword,
      });

      if (signInErr) {
        // Auto-register in Supabase Auth if not created yet
        const { error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: adminPassword,
        });
        if (!signUpErr) {
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: adminPassword,
          }).catch(() => {});
        }
      }

      const adminUser = {
        id: 'admin_simon_emmanuel',
        email: cleanEmail,
        role: 'admin',
        user_metadata: {
          full_name: 'Admin Simon Emmanuel',
          role: 'admin'
        }
      };
      localStorage.setItem('idea_hub_local_user', JSON.stringify(adminUser));
      window.dispatchEvent(new CustomEvent('idea_hub_auth_changed', { detail: adminUser }));

      setIsAuthenticated(true);
      showToast('Welcome back, Admin!', 'success');
    } catch (err: any) {
      const adminUser = {
        id: 'admin_simon_emmanuel',
        email: cleanEmail,
        role: 'admin',
        user_metadata: {
          full_name: 'Admin Simon Emmanuel',
          role: 'admin'
        }
      };
      localStorage.setItem('idea_hub_local_user', JSON.stringify(adminUser));
      window.dispatchEvent(new CustomEvent('idea_hub_auth_changed', { detail: adminUser }));

      setIsAuthenticated(true);
      showToast('Welcome back, Admin!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('idea_hub_local_user');
      props.onLogout();
    }
  };

  const openModal = (type: 'project' | 'professional' | 'job', item?: any) => {
    setModalType(type);
    setEditingId(item?.id || null);
    if (type === 'project') {
      setFormData(item ? { ...item } : { title: '', description: '', imageUrl: '', category: '' });
    } else if (type === 'job') {
      setFormData(item ? { ...item } : { title: '', type: 'Remote', location: '', salary: '', description: '', requirements: [], status: 'Open' });
    } else if (type === 'professional') {
      setFormData(item ? { ...item } : { fullName: '', email: '', phone: '', jobCategory: '', bio: '', skills: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingId(null);
    setFormData({});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Str = await fileToBase64(file);
      setFormData({ ...formData, [fieldName]: base64Str });
      showToast('Image uploaded & attached', 'success');
    } catch (err) {
      showToast('Failed to process image', 'error');
    }
  };

  const handleSettingsUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Str = await fileToBase64(file);
      if (type === 'hero') setSettingsForm(prev => ({ ...prev, heroImageUrl: base64Str }));
      if (type === 'logo') setSettingsForm(prev => ({ ...prev, logoUrl: base64Str }));
      showToast('Image uploaded (Click Save to apply)', 'info');
    } catch (err) {
      showToast('Failed to process image', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    try {
      if (modalType === 'project') {
        if (editingId) {
          await props.onUpdateProject(editingId, formData);
          showToast('Project updated successfully', 'success');
        } else {
          await props.onAddProject({ ...formData, id: generateUUID() });
          showToast('Project added successfully', 'success');
        }
      } else if (modalType === 'job') {
        const payload = { ...formData };
        if (typeof payload.requirements === 'string') {
          payload.requirements = payload.requirements.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (editingId) {
          await props.onUpdateJob(editingId, payload);
          showToast('Job updated successfully', 'success');
        } else {
          await props.onAddJob({ ...payload, id: generateUUID(), postedAt: new Date().toISOString() });
          showToast('Job added successfully', 'success');
        }
      } else if (modalType === 'professional') {
        const payload = { ...formData };
        if (typeof payload.skills === 'string') {
          payload.skills = payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (editingId) {
          await props.onUpdateProfessional(editingId, payload);
          showToast('Professional updated successfully', 'success');
        } else {
          await props.onAddProfessional({ ...payload, id: generateUUID(), joinedAt: new Date().toISOString() });
          showToast('Professional added successfully', 'success');
        }
      }
      closeModal();
    } catch (error) {
      showToast('Error saving data', 'error');
      console.error(error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'project') await props.onDeleteProject(id);
      if (type === 'job') await props.onDeleteJob(id);
      if (type === 'professional') await props.onDeleteProfessional(id);
      if (type === 'client' && props.onDeleteClient) await props.onDeleteClient(id);
      if (type === 'application') {
        if (props.onDeleteApplication) {
          await props.onDeleteApplication(id);
        } else {
          await deleteJobApplication(id);
        }
        setApplicationsList(prev => prev.filter(a => a.id !== id));
        if (selectedApplication && selectedApplication.id === id) {
          setSelectedApplication(null);
        }
      }
      showToast('Item deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleInternalStatusChange = async (
    id: string, 
    newInternalStatus: string,
    customInternalNotes?: string
  ) => {
    try {
      const notesToSave = customInternalNotes !== undefined ? customInternalNotes : (applicationsList.find(a => a.id === id)?.internalNotes || '');
      await updateJobApplicationInternalStatus(id, newInternalStatus, notesToSave);
      
      setApplicationsList(prev => prev.map(a => a.id === id ? { ...a, internalStatus: newInternalStatus, internalNotes: notesToSave } : a));
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, internalStatus: newInternalStatus, internalNotes: notesToSave } : null);
      }
      showToast(`Internal status marked as ${newInternalStatus}`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update internal status', 'error');
    }
  };

  const handleStatusChange = async (
    id: string, 
    newStatus: 'pending' | 'reviewed' | 'contacted' | 'rejected',
    customFeedback?: string
  ) => {
    try {
      const feedbackToSave = customFeedback !== undefined ? customFeedback : appFeedbackNote;
      if (props.onUpdateApplicationStatus) {
        await props.onUpdateApplicationStatus(id, newStatus, feedbackToSave);
      } else {
        await updateJobApplicationStatus(id, newStatus, feedbackToSave);
      }
      setApplicationsList(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, adminFeedback: feedbackToSave } : a));
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus, adminFeedback: feedbackToSave } : null);
      }
      showToast(`Application marked as ${newStatus} & synced with candidate`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update application status', 'error');
    }
  };

  const handleSaveModalApplicationAction = async () => {
    if (!selectedApplication) return;
    setIsSavingAppAction(true);
    await handleStatusChange(selectedApplication.id, modalSelectedStatus, appFeedbackNote.trim());
    setIsSavingAppAction(false);
    setSelectedApplication(null);
  };

  const handleSaveAllRowActions = async () => {
    const idsToSave = Object.keys(tableDraftStatuses);
    if (idsToSave.length === 0) return;
    setIsSyncingAllApps(true);
    try {
      for (const id of idsToSave) {
        const status = tableDraftStatuses[id];
        const feedback = tableDraftFeedback[id] !== undefined 
          ? tableDraftFeedback[id] 
          : (applicationsList.find(a => a.id === id)?.adminFeedback || '');
        
        if (props.onUpdateApplicationStatus) {
          await props.onUpdateApplicationStatus(id, status, feedback);
        } else {
          await updateJobApplicationStatus(id, status, feedback);
        }
      }
      
      setApplicationsList(prev => prev.map(a => {
        if (tableDraftStatuses[a.id]) {
          return {
            ...a,
            status: tableDraftStatuses[a.id],
            adminFeedback: tableDraftFeedback[a.id] !== undefined ? tableDraftFeedback[a.id] : a.adminFeedback
          };
        }
        return a;
      }));
      
      setTableDraftStatuses({});
      setTableDraftFeedback({});
      showToast(`All application status changes saved & synchronized with candidate profiles!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save status changes', 'error');
    } finally {
      setIsSyncingAllApps(false);
    }
  };

  const handleSyncAllPortals = async () => {
    setIsSyncingAllApps(true);
    try {
      const apps = await fetchJobApplications();
      setApplicationsList(apps);
      window.dispatchEvent(new CustomEvent('idea_hub_job_application_submitted'));
      showToast('Candidate portals synchronized with all latest application actions.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Synchronization completed', 'info');
    } finally {
      setIsSyncingAllApps(false);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim() || !selectedChat) return;
    const text = adminMessage.trim();
    setAdminMessage('');
    const now = new Date().toISOString();
    const activeUser = await getActiveUser();
    const adminId = activeUser?.id || 'admin_user';
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newMsg: ChatMessage = {
      id: msgId,
      chatId: selectedChat.id,
      senderId: adminId,
      senderName: 'iDEA Admin',
      text: text,
      timestamp: now
    };

    const updatedSession: ChatSession = {
      ...selectedChat,
      lastMessage: text,
      updatedAt: now
    };

    // Optimistically update UI
    setChatMessages(prev => [...prev, newMsg]);
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === selectedChat.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedSession;
        const item = copy.splice(idx, 1)[0];
        return [item, ...copy];
      }
      return [updatedSession, ...prev];
    });
    setSelectedChat(updatedSession);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      await Promise.all([
        saveChatMessage(newMsg),
        saveChatSession(updatedSession)
      ]);
    } catch (err) {
      console.error("Error sending admin message:", err);
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-gray-50 p-4 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
        />

        {/* Back to main website button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={props.onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-gray-100/80 border border-gray-200/60 rounded-xl text-gray-600 hover:text-indigo-600 text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </button>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin} 
          className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-gray-200/60 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] rotate-3 hover:rotate-0 transition-transform"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 text-center tracking-tight mb-2">Admin Dashboard</h2>
          <p className="text-xs text-gray-500 text-center mb-6">Sign in with your master credentials</p>

          {loginError && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-6 leading-relaxed">
              {loginError}
            </motion.div>
          )}

          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={adminEmail} 
                  onChange={e => setAdminEmail(e.target.value)} 
                  required 
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white/90 border border-gray-200/60 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all text-sm font-medium" 
                  placeholder="simonemmanuel8344@gmail.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Admin Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={adminPassword} 
                  onChange={e => setAdminPassword(e.target.value)} 
                  required 
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/90 border border-gray-200/60 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all text-sm font-medium" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white font-bold text-base rounded-xl flex items-center justify-center gap-3 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              <>
                <Lock className="w-5 h-5" /> Sign In to Admin Portal
              </>
            )}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-3/4 h-3/4 bg-blue-900/40 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-amber-900/40 blur-[120px] rounded-full"
        />
      </div>

      {/* Sidebar */}
      <div className="w-72 bg-white/60 backdrop-blur-xl border-r border-gray-200/60 flex flex-col z-10 relative shadow-2xl">
        <div className="p-8 border-b border-gray-200/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">iDEA <span className="text-indigo-600">Admin</span></h2>
          </div>
          <p className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-4">Command Center</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
            { id: 'applications', icon: <FileCheck className="w-5 h-5" />, label: 'Applications', badge: applicationsList.length },
            { id: 'escrow', icon: <ShieldCheck className="w-5 h-5" />, label: 'Escrow & Payments' },
            { id: 'projects', icon: <Briefcase className="w-5 h-5" />, label: 'Portfolio Projects' },
            { id: 'professionals', icon: <Users className="w-5 h-5" />, label: 'Professionals' },
            { id: 'clients', icon: <UserIcon className="w-5 h-5" />, label: 'Clients' },
            { id: 'jobs', icon: <Briefcase className="w-5 h-5" />, label: 'Job Postings' },
            { id: 'chats', icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chats' },
            { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Platform Settings' },
          ].map(item => (

            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-indigo-600 hover:bg-white/60 font-medium'}`}
            >
              <div className="flex items-center gap-4">
                {item.icon} {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-white text-indigo-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-200/60">
          <button onClick={handleAdminLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 bg-red-400/10 hover:bg-red-400/20 font-semibold rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10 z-10 relative scroll-smooth">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black mb-2">Dashboard Overview</h1>
                  <p className="text-gray-500">Welcome back, Simon. Here is the current platform status.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { id: 'professionals', label: 'Professionals', value: props.professionals.length, icon: <Users className="w-8 h-8 text-blue-400" />, color: 'from-blue-500/20 to-blue-500/0', border: 'border-blue-500/20' },
                  { id: 'clients', label: 'Clients', value: props.clients?.length || 0, icon: <UserIcon className="w-8 h-8 text-cyan-400" />, color: 'from-cyan-500/20 to-cyan-500/0', border: 'border-cyan-500/20' },
                  { id: 'projects', label: 'Live Projects', value: props.projects.length, icon: <Briefcase className="w-8 h-8 text-indigo-600" />, color: 'from-amber-500/20 to-indigo-700/0', border: 'border-amber-500/20' },
                  { id: 'jobs', label: 'Job Listings', value: props.jobs.length, icon: <Briefcase className="w-8 h-8 text-purple-400" />, color: 'from-purple-500/20 to-purple-500/0', border: 'border-purple-500/20' },
                  { id: 'applications', label: 'Applications', value: applicationsList.length, icon: <FileCheck className="w-8 h-8 text-emerald-400" />, color: 'from-emerald-500/20 to-emerald-500/0', border: 'border-emerald-500/20' }
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    key={stat.label} 
                    onClick={() => setActiveTab(stat.id)}
                    className={`bg-gradient-to-br ${stat.color} bg-white/90 backdrop-blur-md border ${stat.border} rounded-3xl p-8 relative overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                    title={`View ${stat.label}`}
                  >
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div>
                        <p className="text-5xl font-black text-gray-900 mb-2">{stat.value}</p>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</h3>
                      </div>
                      <div className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Live Motion Gallery of Projects */}
              <div>
                <h3 className="text-xl font-bold mb-6">Recent Portfolio Showcases</h3>
                {props.projects.length > 0 ? (
                  <div className="relative w-full overflow-hidden h-64 rounded-3xl bg-gray-50 border border-gray-200/60 backdrop-blur-sm flex items-center">
                    {/* Gradient Masks for smooth scrolling edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
                    
                    <motion.div 
                      animate={{ x: [0, -1000] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="flex gap-6 px-10 absolute left-0"
                    >
                      {[...props.projects, ...props.projects, ...props.projects].map((proj, idx) => (
                        <div key={`${proj.id}-${idx}`} className="w-80 h-48 shrink-0 rounded-2xl overflow-hidden relative group">
                          <img src={proj.imageUrl || undefined} alt={proj.title} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 p-6 flex flex-col justify-end">
                            <h4 className="font-bold text-lg text-gray-900">{proj.title}</h4>
                            <p className="text-xs text-indigo-600">{proj.category}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <div className="h-64 rounded-3xl bg-white/60 border border-gray-200/60 flex items-center justify-center text-gray-500">
                    No projects available to display in motion gallery.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {['projects', 'professionals', 'jobs', 'clients'].includes(activeTab) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black capitalize mb-2">{activeTab} Management</h1>
                  <p className="text-gray-500">View, manage, or update {activeTab} across the platform.</p>
                </div>
                {activeTab !== 'clients' && (
                  <button 
                    onClick={() => openModal(activeTab.slice(0, -1) as any)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="w-5 h-5" /> Add New {activeTab.slice(0, -1)}
                  </button>
                )}
              </div>

              <div className="bg-white/60 border border-gray-200/60 rounded-3xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left">
                  <thead className="bg-white/90 border-b border-gray-200/60 text-xs uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-6 py-5 font-semibold">Details</th>
                      <th className="px-6 py-5 font-semibold">Info</th>
                      <th className="px-6 py-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {activeTab === 'projects' && props.projects.map(p => (
                      <tr key={p.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-4">
                          <img src={p.imageUrl || undefined} alt={p.title} className="w-16 h-12 object-cover rounded-lg border border-gray-200/60" />
                          <div>
                            <p className="font-bold text-gray-900">{p.title}</p>
                            <p className="text-xs text-indigo-600">{p.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{p.description}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal('project', p)} className="p-2 hover:bg-gray-100/80 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('project', p.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    
                    {activeTab === 'clients' && (
                      <>
                        {props.clients && props.clients.length > 0 ? (
                          props.clients.map(c => (
                            <tr key={c.id} className="hover:bg-white/60 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                                  <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{c.fullName || c.full_name || 'Client'}</p>
                                  <p className="text-xs text-indigo-600">Registered Client</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-700">{c.email || 'No email provided'}</div>
                                {c.phone && <div className="text-xs text-gray-400 mt-0.5">{c.phone}</div>}
                                {c.createdAt && <div className="text-[11px] text-gray-400 mt-0.5">Joined: {new Date(c.createdAt).toLocaleDateString()}</div>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete('client', c.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors" title="Delete Client"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                              <UserIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                              <p className="font-medium">No registered clients found yet.</p>
                              <p className="text-xs text-gray-400 mt-1">When clients register their accounts, they will be listed here.</p>
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {activeTab === 'professionals' && (
                      <>
                        {props.professionals && props.professionals.length > 0 ? (
                          props.professionals.map(p => (
                            <tr key={p.id} className="hover:bg-white/60 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-4">
                                {p.picture ? (
                                  <img src={p.picture || undefined} alt={p.fullName} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                                    <Users className="w-6 h-6" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-900">{p.fullName}</p>
                                  <p className="text-xs text-indigo-600 font-medium">{p.jobCategory}</p>
                                  {p.yearsOfExperience && <span className="text-[10px] text-gray-400">{p.yearsOfExperience} Exp</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-700">{p.email || 'No email provided'}</div>
                                {p.phone && <div className="text-xs text-gray-400 mt-0.5">{p.phone}</div>}
                                {p.location && <div className="text-[11px] text-gray-400 mt-0.5">{p.location}</div>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {props.onViewProfessionalProfile && (
                                  <button onClick={() => props.onViewProfessionalProfile?.(p)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors mr-2" title="View Full Profile"><Eye className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => openModal('professional', p)} className="p-2 hover:bg-gray-100/80 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors mr-2" title="Edit Professional"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete('professional', p.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors" title="Delete Professional"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                              <p className="font-medium">No registered professionals found yet.</p>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                    {activeTab === 'jobs' && props.jobs.map(j => (
                      <tr key={j.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{j.title}</p>
                          <p className="text-xs text-indigo-600">{j.type} • {j.location}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${j.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{j.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal('job', j)} className="p-2 hover:bg-gray-100/80 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('job', j.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto space-y-6">
              {/* Header with Title and Quick Counts */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight mb-1 text-gray-900 flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-emerald-600" />
                    Candidate Job Applications
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Review submitted applications, inspect attached resumes and cloud portfolios, reach out via WhatsApp/phone, and track hiring stages.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveAllRowActions}
                    disabled={isSyncingAllApps || Object.keys(tableDraftStatuses).length === 0}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md ${
                      Object.keys(tableDraftStatuses).length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer animate-pulse ring-2 ring-emerald-400'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    }`}
                    title="Commit all draft statuses and synchronize with candidate profiles"
                  >
                    {isSyncingAllApps ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save & Sync Statuses ({Object.keys(tableDraftStatuses).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncAllPortals}
                    disabled={isSyncingAllApps}
                    className="px-3.5 py-2 bg-white/90 hover:bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Broadcast and synchronize all candidate portals"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncingAllApps ? 'animate-spin' : ''}`} />
                    <span>Sync Portals</span>
                  </button>
                  <div className="px-3.5 py-2 bg-white/90 border border-gray-200/60 rounded-xl text-xs font-semibold text-gray-600 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Total: <strong className="text-gray-900">{applicationsList.length}</strong>
                  </div>
                  <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Pending Review: <strong className="text-amber-900">{applicationsList.filter(a => (a.status || 'pending') === 'pending').length}</strong>
                  </div>
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Contacted: <strong className="text-emerald-900">{applicationsList.filter(a => a.status === 'contacted').length}</strong>
                  </div>
                </div>
              </div>

              {/* Filters & Search Control Bar */}
              <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    placeholder="Search candidate, job, phone..."
                    className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                  {applicationSearch && (
                    <button
                      onClick={() => setApplicationSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'All', count: applicationsList.length },
                    { id: 'pending', label: 'Pending Review', count: applicationsList.filter(a => (a.status || 'pending') === 'pending').length },
                    { id: 'reviewed', label: 'Application Reviewed', count: applicationsList.filter(a => a.status === 'reviewed').length },
                    { id: 'contacted', label: 'Contacted for Next Steps', count: applicationsList.filter(a => a.status === 'contacted').length },
                    { id: 'rejected', label: 'Position Closed / Archived', count: applicationsList.filter(a => a.status === 'rejected').length },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setApplicationFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                        applicationFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                      }`}
                    >
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        applicationFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / List Container */}
              <div className="bg-white/80 border border-gray-200/60 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/90 border-b border-gray-200/60 text-xs uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Applicant</th>
                        <th className="px-6 py-4 font-semibold">Position</th>
                        <th className="px-6 py-4 font-semibold">Contact & Reach Out</th>
                        <th className="px-6 py-4 font-semibold">Resume / Portfolio</th>
                        <th className="px-6 py-4 font-semibold">Internal Admin Status</th>
                        <th className="px-6 py-4 font-semibold">Public (Applicant) Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map(app => {
                          const cleanPhone = (app.phone || '').replace(/[^0-9+]/g, '');
                          const waPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
                          const currentStatus = app.status || 'pending';
                          const currentInternalStatus = app.internalStatus || 'pending';

                          return (
                            <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors group">
                              {/* Candidate Info */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3.5">
                                  {app.photoUrl ? (
                                    <img
                                      src={app.photoUrl || undefined}
                                      alt={app.fullName}
                                      className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                      {app.fullName ? app.fullName.slice(0, 2).toUpperCase() : 'AP'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                      {app.fullName}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Calendar className="w-3 h-3" />
                                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Position */}
                              <td className="px-6 py-4">
                                <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                                  {app.jobTitle || 'Role Application'}
                                </span>
                              </td>

                              {/* Contact */}
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  <div className="text-xs font-semibold text-gray-700 font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {app.phone}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {cleanPhone && (
                                      <a
                                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${app.fullName}, this is Simon from iDEA Platform regarding your application for the ${app.jobTitle || 'open'} position.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors"
                                        title="Chat on WhatsApp"
                                      >
                                        <MessageSquare className="w-3 h-3" /> WhatsApp
                                      </a>
                                    )}
                                    <a
                                      href={`tel:${app.phone}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[11px] font-semibold transition-colors"
                                      title="Call Phone"
                                    >
                                      Call
                                    </a>
                                  </div>
                                </div>
                              </td>

                              {/* Resume & Materials */}
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                  {app.cvUrl ? (
                                    <a
                                      href={app.cvUrl}
                                      download={app.cvName || `${app.fullName.replace(/\s+/g, '_')}_Resume`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-lg text-xs font-semibold transition-colors group/cv"
                                      title="Download CV Document"
                                    >
                                      <Download className="w-3.5 h-3.5 text-indigo-500 group-hover/cv:translate-y-0.5 transition-transform" />
                                      <span className="truncate max-w-[140px]">
                                        {app.cvName || 'Download CV'}
                                      </span>
                                    </a>
                                  ) : null}

                                  {app.cvLink ? (
                                    <a
                                      href={app.cvLink.startsWith('http') ? app.cvLink : `https://${app.cvLink}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-md text-[11px] font-medium transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Cloud Portfolio
                                    </a>
                                  ) : null}

                                  {!app.cvUrl && !app.cvLink && app.resumeText ? (
                                    <button
                                      onClick={() => setSelectedApplication(app)}
                                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3" /> View Written Statement
                                    </button>
                                  ) : null}

                                  {!app.cvUrl && !app.cvLink && !app.resumeText && (
                                    <span className="text-xs text-gray-400 italic">No files attached</span>
                                  )}
                                </div>
                              </td>

                              {/* Status Selector */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={currentInternalStatus}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value as any;
                                      await handleInternalStatusChange(app.id, newStatus);
                                    }}
                                    className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                                      currentInternalStatus === 'pending'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        : currentInternalStatus === 'reviewed'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                        : currentInternalStatus === 'contacted'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pending Review</option>
                                    <option value="reviewed">● Internal Review</option>
                                    <option value="contacted">✓ Contacted</option>
                                    <option value="rejected">✕ Archived / Closed</option>
                                  </select>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border ${
                                      currentStatus === 'pending'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : currentStatus === 'reviewed'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : currentStatus === 'contacted'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}>
                                    {currentStatus === 'pending' && '⏳ Pending Review'}
                                    {currentStatus === 'reviewed' && '● Application Reviewed'}
                                    {currentStatus === 'contacted' && '✓ Contacted for Next Steps'}
                                    {currentStatus === 'rejected' && '✕ Position Closed'}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedApplication(app)}
                                    className="p-2 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors"
                                    title="View Full Application Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete('application', app.id)}
                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Delete Application"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                              <FileCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">
                              {applicationSearch || applicationFilter !== 'all' ? 'No applications match your filter' : 'No job applications received yet'}
                            </h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                              {applicationSearch || applicationFilter !== 'all'
                                ? 'Try clearing your search terms or selecting a different status filter.'
                                : 'When candidates apply through the open job postings on the Careers & Jobs board, their applications and attached resumes will appear here instantly.'}
                            </p>
                            {(applicationSearch || applicationFilter !== 'all') && (
                              <button
                                onClick={() => { setApplicationSearch(''); setApplicationFilter('all'); }}
                                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                              >
                                Reset Search & Filters
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'escrow' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <AdminEscrowDashboard />
            </motion.div>
          )}

          {activeTab === 'chats' && (

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex h-[calc(100vh-8rem)] gap-6 max-w-7xl mx-auto">
              <div className="w-1/3 bg-white/60 backdrop-blur-xl border border-gray-200/60 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-200/60 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-900">Live Monitoring</h3>
                  <p className="text-xs text-indigo-600 mt-1">Intervene in active discussions</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {chats.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No active chats found.</div>
                  ) : (
                    chats.map(chat => (
                      <div key={chat.id} onClick={() => setSelectedChat(chat)} className={`p-5 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-indigo-600/10 border-l-4 border-indigo-600' : 'hover:bg-white/60 border-l-4 border-transparent'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-sm text-gray-900 truncate">{chat.clientName} & {chat.professionalName}</div>
                          {chat.updatedAt && (
                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                              {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-xl border border-gray-200/60 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                {selectedChat ? (
                  <>
                    <div className="p-6 border-b border-gray-200/60 bg-gray-50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Chat Session</h3>
                        <p className="text-xs text-gray-500">{selectedChat.clientName} ↔ {selectedChat.professionalName}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-600/20 text-indigo-600 text-xs font-bold rounded-full animate-pulse">LIVE</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.map(msg => {
                        const isAdmin = msg.senderName === 'iDEA Admin';
                        return (
                          <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3 rounded-2xl max-w-[80%] shadow-lg ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm border border-gray-200'}`}>
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? 'text-indigo-200' : 'text-indigo-600'}`}>{msg.senderName}</span>
                                {msg.timestamp && (
                                  <span className={`text-[10px] ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendAdminMessage} className="p-4 border-t border-gray-200/60 bg-gray-50 flex gap-3">
                      <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="Type intervention message as Admin..." className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all" />
                      <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg"><Send className="w-4 h-4" /> Send</button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                    <p>Select a chat session from the list to monitor or intervene.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black mb-2">Platform & Website Content Configuration</h1>
                  <p className="text-gray-500">Edit every item on your website directly. Save your changes manually below.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteSettingsInfo}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-200"
                  >
                    Delete/Clear All
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8 shadow-2xl space-y-8">
                {/* Verification Code */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" /> Professional Verification Code
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Share this code with professionals to allow them to register on the platform.</p>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={settingsForm.professionalInviteCode} 
                      onChange={(e) => setSettingsForm({...settingsForm, professionalInviteCode: e.target.value})}
                      className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-indigo-600 font-mono text-lg font-bold tracking-widest outline-none focus:border-indigo-600" 
                    />
                    <button 
                      onClick={() => { navigator.clipboard.writeText(settingsForm.professionalInviteCode); showToast('Code copied to clipboard', 'success'); }} 
                      className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                <hr className="border-gray-200/60" />

                {/* Website Branding & Media */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" /> Branding & Visual Assets
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Update the main website logo and hero banner image.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Website Logo (URL or Upload)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={settingsForm.logoUrl} 
                          onChange={(e) => setSettingsForm({...settingsForm, logoUrl: extractUrl(e.target.value)})}
                          placeholder="https://example.com/logo.png"
                          className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-indigo-600 outline-none" 
                        />
                        <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap text-sm font-semibold">
                          Upload
                          <input type="file" accept="image/*" onChange={(e) => handleSettingsUpload(e, 'logo')} className="hidden" />
                        </label>
                      </div>
                      {settingsForm.logoUrl && (
                        <div className="mt-3 p-3 bg-white/80 rounded-xl border border-gray-200/60 flex items-center gap-3">
                          <img src={settingsForm.logoUrl || undefined} alt="Logo preview" className="w-10 h-10 object-contain rounded" />
                          <span className="text-xs text-gray-500">Current Logo Preview</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Hero Showcase Image (URL or Upload)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={settingsForm.heroImageUrl} 
                          onChange={(e) => setSettingsForm({...settingsForm, heroImageUrl: extractUrl(e.target.value)})}
                          placeholder="https://example.com/hero.jpg"
                          className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-indigo-600 outline-none" 
                        />
                        <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap text-sm font-semibold">
                          Upload
                          <input type="file" accept="image/*" onChange={(e) => handleSettingsUpload(e, 'hero')} className="hidden" />
                        </label>
                      </div>
                      {settingsForm.heroImageUrl && (
                        <div className="mt-3 p-3 bg-white/80 rounded-xl border border-gray-200/60 flex items-center gap-3">
                          <img src={settingsForm.heroImageUrl || undefined} alt="Hero preview" className="w-12 h-12 object-cover rounded-lg" />
                          <span className="text-xs text-gray-500">Current Hero Image Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200/60" />

                {/* System Status */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Supabase Infrastructure Status</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Professional Bio</label>
                        <textarea value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" placeholder="Short biography..."></textarea>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Core Skills & Specialties (Comma separated)</label>
                        <input type="text" value={Array.isArray(formData.skills) ? formData.skills.join(", ") : (formData.skills || "")} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. Graphic Design, Branding, UI/UX" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 flex items-center gap-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Supabase PostgreSQL</p>
                        <p className="text-xs text-emerald-400 font-mono">Synced & Active</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 flex items-center gap-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Supabase Auth Session</p>
                        <p className="text-xs text-emerald-400 font-mono">Secured (simonemmanuel8344@gmail.com)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-transparent border border-gray-200/60 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-200/60 flex items-center justify-between bg-gray-50">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">{editingId ? 'Edit' : 'Add'} {modalType}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100/80 rounded-full text-gray-500 hover:text-indigo-600 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                <form id="crud-form" onSubmit={handleFormSubmit} className="space-y-6">
                  {modalType === 'project' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Project Title</label>
                        <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Category</label>
                        <input type="text" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Image URL or Upload</label>
                        <div className="flex items-center gap-3">
                          <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: extractUrl(e.target.value)})} placeholder="https://..." className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                          <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                            Upload File
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none resize-none" />
                      </div>
                    </>
                  )}

                  {modalType === 'job' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Job Title</label>
                        <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location / Type</label>
                          <input type="text" required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote, New York" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Salary Range</label>
                          <input type="text" required value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                        <select value={formData.status || 'Open'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none">
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Requirements (comma separated)</label>
                        <input type="text" required value={Array.isArray(formData.requirements) ? formData.requirements.join(', ') : (formData.requirements || '')} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none resize-none" />
                      </div>
                    </>
                  )}

                  {modalType === 'professional' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
                          <input type="text" required value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                          <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                          <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Job Category</label>
                          <input type="text" required value={formData.jobCategory || ''} onChange={e => setFormData({...formData, jobCategory: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Years of Experience</label>
                          <input type="text" value={formData.yearsOfExperience || ''} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Location</label>
                          <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Lagos, Nigeria" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Profile Picture (URL or Upload)</label>
                        <div className="flex items-center gap-3">
                          <input type="text" value={formData.picture || ''} onChange={e => setFormData({...formData, picture: extractUrl(e.target.value)})} placeholder="https://..." className="flex-1 bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                          <label className="bg-gray-100/80 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                            Upload
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'picture')} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Professional Bio</label>
                        <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" placeholder="Short biography..."></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Core Skills & Specialties (Comma separated)</label>
                        <input type="text" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. Graphic Design, Branding, UI/UX" className="w-full bg-white/90 border border-gray-200/60 rounded-xl px-5 py-3 text-gray-900 focus:border-indigo-600 outline-none" />
                      </div>

                      <div className="border-t border-gray-200/60 pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-900">Showcase Portfolio</label>
                          <button type="button" onClick={() => setFormData({...formData, portfolioItems: [...(formData.portfolioItems || []), { id: generateUUID(), title: '', imageUrl: '' }]})} className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                            + Add Portfolio Item
                          </button>
                        </div>
                        {(!formData.portfolioItems || formData.portfolioItems.length === 0) && (
                          <p className="text-xs text-gray-400 italic">No portfolio items added yet.</p>
                        )}
                        <div className="space-y-3">
                          {formData.portfolioItems?.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 relative group">
                              <button type="button" onClick={() => setFormData({...formData, portfolioItems: formData.portfolioItems.filter((_: any, i: number) => i !== idx)})} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-md shadow-sm border border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 gap-3 mb-2">
                                <input type="text" placeholder="Project Title (e.g. E-Commerce Redesign)" value={item.title || ''} onChange={(e) => {
                                  const newItems = [...formData.portfolioItems];
                                  newItems[idx].title = e.target.value;
                                  setFormData({...formData, portfolioItems: newItems});
                                }} className="w-full bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none" />
                              </div>
                              <div className="flex gap-2">
                                <input type="text" placeholder="Image URL (e.g. https://...)" value={item.imageUrl || ''} onChange={(e) => {
                                  const newItems = [...formData.portfolioItems];
                                  newItems[idx].imageUrl = extractUrl(e.target.value);
                                  setFormData({...formData, portfolioItems: newItems});
                                }} className="flex-1 bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none" />
                                <label className="bg-white border border-gray-200/60 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm font-medium">
                                  Upload
                                  <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newItems = [...formData.portfolioItems];
                                        newItems[idx].imageUrl = reader.result as string;
                                        setFormData({...formData, portfolioItems: newItems});
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} className="hidden" />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </div>
              <div className="p-6 border-t border-gray-200/60 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-indigo-600 hover:bg-gray-100/80 transition-colors">Cancel</button>
                <button type="submit" form="crud-form" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                    <p className="text-xs text-gray-500">Submitted for: <span className="font-semibold text-indigo-600">{selectedApplication.jobTitle || 'Job Opening'}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                {/* Candidate Profile Header Card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-200/60">
                  {selectedApplication.photoUrl ? (
                    <img
                      src={selectedApplication.photoUrl || undefined}
                      alt={selectedApplication.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                      {selectedApplication.fullName ? selectedApplication.fullName.slice(0, 2).toUpperCase() : 'AP'}
                    </div>
                  )}
                  <div className="text-center sm:text-left space-y-1 flex-1">
                    <h4 className="text-2xl font-black text-gray-900">{selectedApplication.fullName}</h4>
                    <p className="text-sm font-semibold text-indigo-600">{selectedApplication.jobTitle || 'Open Position'}</p>
                    <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Applied on {selectedApplication.appliedAt ? new Date(selectedApplication.appliedAt).toLocaleString() : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Direct Contact & Action Bar */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Candidate Phone & Communication</label>
                  <div className="p-4 bg-white border border-gray-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 font-mono text-base">{selectedApplication.phone}</div>
                        <div className="text-xs text-gray-400">Direct candidate contact number</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedApplication.phone && (
                        <a
                          href={`https://wa.me/${selectedApplication.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedApplication.fullName}, this is Simon from iDEA Platform regarding your application for ${selectedApplication.jobTitle || 'our position'}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message on WhatsApp
                        </a>
                      )}
                      <a
                        href={`tel:${selectedApplication.phone}`}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                </div>

                {/* Attached CV & External Materials */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Attached Resume & Materials</label>
                  
                  {selectedApplication.cvUrl && (
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {selectedApplication.cvName || 'Resume_Document.pdf'}
                          </p>
                          <p className="text-xs text-gray-500">Applicant CV File</p>
                        </div>
                      </div>
                      <a
                        href={selectedApplication.cvUrl}
                        download={selectedApplication.cvName || `${selectedApplication.fullName.replace(/\s+/g, '_')}_CV`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  )}

                  {selectedApplication.cvLink && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm text-gray-900 truncate">Cloud Portfolio / Link</p>
                          <p className="text-xs text-blue-600 truncate">{selectedApplication.cvLink}</p>
                        </div>
                      </div>
                      <a
                        href={selectedApplication.cvLink.startsWith('http') ? selectedApplication.cvLink : `https://${selectedApplication.cvLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Open Link
                      </a>
                    </div>
                  )}

                  {selectedApplication.resumeText && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-600">Cover Note & Qualifications Statement</p>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.resumeText}
                      </div>
                    </div>
                  )}

                  {!selectedApplication.cvUrl && !selectedApplication.cvLink && !selectedApplication.resumeText && (
                    <p className="text-xs text-gray-400 italic">The applicant did not provide additional uploaded attachments.</p>
                  )}
                </div>

                {/* 1. Internal Admin Management */}
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider block">
                      Internal Admin Notes
                    </label>
                    <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Private (Not visible to applicant)
                    </span>
                  </div>
                  <textarea
                    value={appInternalNote}
                    onChange={(e) => setAppInternalNote(e.target.value)}
                    placeholder="e.g., Follow up with engineering team about their portfolio. Schedule a technical screen next week."
                    rows={3}
                    className="w-full p-4 bg-amber-50/30 border border-amber-200/60 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-amber-400 focus:bg-amber-50/50 resize-none transition-all"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={async () => {
                        await handleInternalStatusChange(selectedApplication.id, selectedApplication.internalStatus || 'pending', appInternalNote);
                      }}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-colors"
                    >
                      Save Internal Notes
                    </button>
                  </div>
                </div>

                {/* 2. Applicant-Facing Communication */}
                <div className="space-y-4 pt-5 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider block">
                      Send Update to Applicant
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      Notifies & Syncs to Dashboard
                    </span>
                  </div>
                  
                  <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-2xl space-y-4">
                    <textarea
                      value={appFeedbackNote}
                      onChange={(e) => setAppFeedbackNote(e.target.value)}
                      placeholder="Feedback to send to applicant (e.g., Application shortlisted for interview; We'd like to schedule a call...)"
                      rows={2}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-600 resize-none transition-all"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'pending', label: 'Pending Review', sub: 'In Queue', activeBorder: 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50/40 hover:border-amber-200' },
                        { id: 'reviewed', label: 'Reviewed', sub: 'Shortlisted', activeBorder: 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50/40 hover:border-blue-200' },
                        { id: 'contacted', label: 'Contacted', sub: 'Interviewing', activeBorder: 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50/40 hover:border-emerald-200' },
                        { id: 'rejected', label: 'Closed', sub: 'Declined', activeBorder: 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400', inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-rose-50/40 hover:border-rose-200' }
                      ].map(st => {
                        const isSelected = modalSelectedStatus === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setModalSelectedStatus(st.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${isSelected ? st.activeBorder + ' shadow-sm' : st.inactive}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">{st.label}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block leading-tight">{st.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}

              <div className="p-5 border-t border-gray-100 bg-gray-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete('application', selectedApplication.id)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Application
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModalApplicationAction}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send Update to Applicant</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
