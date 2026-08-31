import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { Professional, Project, JobPosting, JobApplication, ChatSession, ChatMessage, PortfolioItem, ServiceOrder, ContactMessage } from '../types';
import { 
  LogOut, Plus, Image as ImageIcon, Briefcase, FileText, Settings, Lock, Edit2, Trash2, 
  KeyRound, Copy, Check, MessageSquare, Send, User, ExternalLink, MapPin, Clock, Eye, 
  Sparkles, Phone, Mail, Search, MessageCircle, RefreshCw, X, ChevronRight, CheckCircle2,
  ShoppingBag, DollarSign, Database
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../lib/imageCompressor';
import { fetchSupabaseOrders, fetchSupabaseContacts } from '../lib/supabase';

interface Props {
  professionals: Professional[];
  projects: Project[];
  jobs: JobPosting[];
  onAddProfessional: (prof: Professional) => void;
  onUpdateProfessional: (id: string, prof: Professional) => void;
  onDeleteProfessional: (id: string) => void;
  onAddProject: (proj: Project) => void;
  onUpdateProject: (id: string, proj: Project) => void;
  onDeleteProject: (id: string) => void;
  onAddJob: (job: JobPosting) => void;
  onUpdateJob: (id: string, job: JobPosting) => void;
  onDeleteJob: (id: string) => void;
  applications: JobApplication[];
  logoUrl?: string;
  onUpdateLogo: (url: string) => void;
  heroImageUrl?: string;
  onUpdateHeroImage: (url: string) => void;
  professionalInviteCode?: string;
  onUpdateInviteCode?: (code: string) => void;
  onViewProfessionalProfile?: (prof: Professional) => void;
  onLogout: () => void;
}

export function AdminDashboard({ 
  professionals, projects, jobs,
  onAddProfessional, onUpdateProfessional, onDeleteProfessional, 
  onAddProject, onUpdateProject, onDeleteProject, 
  onAddJob, onUpdateJob, onDeleteJob,
  applications, logoUrl, onUpdateLogo, heroImageUrl, onUpdateHeroImage, 
  professionalInviteCode = 'PRO-IDEA-2026', onUpdateInviteCode,
  onViewProfessionalProfile,
  onLogout 
}: Props) {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [customCode, setCustomCode] = useState(professionalInviteCode);
  const [copiedCode, setCopiedCode] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'professionals' | 'orders' | 'messages' | 'project' | 'job' | 'applications' | 'settings'>('professionals');
  
  // Supabase Orders & Contact Submissions State
  const [supabaseOrders, setSupabaseOrders] = useState<ServiceOrder[]>([]);
  const [supabaseContacts, setSupabaseContacts] = useState<ContactMessage[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Real-time Chat state for Admin Messages Hub
  const [allChats, setAllChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Professional form & portfolio items management state
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [profSearchQuery, setProfSearchQuery] = useState('');
  const [profForm, setProfForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    jobCategory: '',
    skills: '',
    location: '',
    yearsOfExperience: '',
    bio: '',
    picture: '',
    portfolioItems: [] as PortfolioItem[]
  });

  // Sub-modal/form for adding/editing a project inside a professional profile
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [projectItemForm, setProjectItemForm] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    projectUrl: ''
  });

  // Global Project Form state
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState({
    title: '', category: '', imageUrl: ''
  });

  // Job Form state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', company: '', jobType: 'Remote', logoUrl: ''
  });

  useEffect(() => {
    setCustomCode(professionalInviteCode);
  }, [professionalInviteCode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'simonemmanuel8344@gmail.com') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (user) {
          setError('Unauthorized email. You must be the admin (simonemmanuel8344@gmail.com) to access this dashboard.');
          signOut(auth).catch(console.error);
        }
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for all Chats across the platform (client to any professional)
  useEffect(() => {
    if (!isAuthenticated) return;

    const chatsQuery = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ChatSession));
      setAllChats(chatsData);

      // Auto-select first chat or refresh selected chat metadata
      if (selectedChat) {
        const updatedSelected = chatsData.find(c => c.id === selectedChat.id);
        if (updatedSelected) {
          setSelectedChat(updatedSelected);
        }
      }
    }, (err) => {
      console.error('Error fetching admin chats:', err);
    });

    return () => unsubscribe();
  }, [isAuthenticated, selectedChat?.id]);

  // Real-time listener for messages in the selected chat
  useEffect(() => {
    if (!isAuthenticated || !selectedChat) {
      setChatMessages([]);
      return;
    }

    setLoadingChatMessages(true);
    const msgsQuery = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(msgsQuery, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ChatMessage));
      setChatMessages(msgs);
      setLoadingChatMessages(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      console.error('Error fetching messages for chat:', err);
      setLoadingChatMessages(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, selectedChat?.id]);

  // Load Supabase Orders & Contacts
  const loadSupabaseData = async () => {
    setLoadingOrders(true);
    try {
      const [orders, contacts] = await Promise.all([
        fetchSupabaseOrders(),
        fetchSupabaseContacts()
      ]);
      setSupabaseOrders(orders);
      setSupabaseContacts(contacts);
    } catch (err) {
      console.error('Error loading Supabase data in admin:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSupabaseData();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error(err);
    }
  };

  // Image Upload helper with auto client-side compression
  const handleImageFile = async (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file, 600, 600, 0.75);
        callback(compressedUrl);
      } catch (err) {
        console.error('Error compressing image:', err);
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // Professional form submission
  const submitProf = (e: FormEvent) => {
    e.preventDefault();
    const skillsArray = profForm.skills.split(',').map(s => s.trim()).filter(Boolean);

    const profData: Professional = {
      id: editingProfId || Date.now().toString(),
      fullName: profForm.fullName.trim(),
      phone: profForm.phone.trim(),
      email: profForm.email.trim(),
      jobCategory: profForm.jobCategory.trim(),
      skills: skillsArray,
      location: profForm.location.trim() || 'Lagos, Nigeria & Remote',
      yearsOfExperience: profForm.yearsOfExperience.trim() || '5+ Years',
      bio: profForm.bio.trim(),
      picture: profForm.picture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=300',
      portfolioItems: profForm.portfolioItems
    };

    if (editingProfId) {
      onUpdateProfessional(editingProfId, profData);
      setEditingProfId(null);
      showToast(`Professional "${profData.fullName}" & Portfolio updated!`, 'success');
    } else {
      onAddProfessional(profData);
      showToast(`Professional "${profData.fullName}" created with ${profData.portfolioItems?.length || 0} showcase projects!`, 'success');
    }

    // Reset Form
    setProfForm({
      fullName: '', phone: '', email: '', jobCategory: '', skills: '',
      location: '', yearsOfExperience: '', bio: '', picture: '', portfolioItems: []
    });
  };

  const editProf = (prof: Professional) => {
    setEditingProfId(prof.id);
    setProfForm({
      fullName: prof.fullName || '',
      phone: prof.phone || '',
      email: prof.email || '',
      jobCategory: prof.jobCategory || '',
      skills: prof.skills ? prof.skills.join(', ') : '',
      location: prof.location || 'Lagos, Nigeria & Remote',
      yearsOfExperience: prof.yearsOfExperience ? String(prof.yearsOfExperience) : '5+ Years',
      bio: prof.bio || '',
      picture: prof.picture || '',
      portfolioItems: prof.portfolioItems || []
    });
    // Scroll to form
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Add/Edit Project Item for current professional
  const handleSaveProjectItem = () => {
    if (!projectItemForm.title.trim()) {
      showToast('Please enter a project title', 'error');
      return;
    }
    if (!projectItemForm.imageUrl) {
      showToast('Please provide or upload a project image', 'error');
      return;
    }

    const newItem: PortfolioItem = {
      id: editingProjectIndex !== null ? profForm.portfolioItems[editingProjectIndex]?.id || Date.now().toString() : Date.now().toString(),
      title: projectItemForm.title.trim(),
      category: projectItemForm.category.trim() || profForm.jobCategory || 'Client Project',
      description: projectItemForm.description.trim(),
      imageUrl: projectItemForm.imageUrl,
      projectUrl: projectItemForm.projectUrl.trim()
    };

    if (editingProjectIndex !== null) {
      const updatedList = [...profForm.portfolioItems];
      updatedList[editingProjectIndex] = newItem;
      setProfForm(prev => ({ ...prev, portfolioItems: updatedList }));
      showToast('Project updated in showcase list', 'success');
    } else {
      setProfForm(prev => ({ ...prev, portfolioItems: [...prev.portfolioItems, newItem] }));
      showToast('Project added to showcase list', 'success');
    }

    setProjectItemForm({ title: '', category: '', description: '', imageUrl: '', projectUrl: '' });
    setEditingProjectIndex(null);
    setShowAddProjectModal(false);
  };

  const handleEditProjectItem = (index: number) => {
    const item = profForm.portfolioItems[index];
    if (item) {
      setProjectItemForm({
        title: item.title,
        category: item.category || '',
        description: item.description || '',
        imageUrl: item.imageUrl,
        projectUrl: item.projectUrl || ''
      });
      setEditingProjectIndex(index);
      setShowAddProjectModal(true);
    }
  };

  const handleRemoveProjectItem = (index: number) => {
    setProfForm(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((_, i) => i !== index)
    }));
    showToast('Project removed from list', 'info');
  };

  // Admin Reply submission in Chat Hub
  const handleSendAdminReply = async (e?: FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (presetText || adminReplyText).trim();
    if (!textToSend || !selectedChat || !auth.currentUser) return;

    setSendingReply(true);
    const now = new Date().toISOString();

    try {
      const chatRef = doc(db, 'chats', selectedChat.id);
      
      // Update parent chat doc
      await setDoc(chatRef, {
        lastMessage: `Admin: ${textToSend}`,
        updatedAt: now
      }, { merge: true });

      // Add message into subcollection
      await addDoc(collection(db, `chats/${selectedChat.id}/messages`), {
        chatId: selectedChat.id,
        senderId: auth.currentUser.uid,
        senderName: 'Admin (Idea Creation Hub)',
        text: textToSend,
        timestamp: now
      });

      setAdminReplyText('');
      showToast('Reply sent to client successfully!', 'success');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      console.error('Error sending admin reply:', err);
      showToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  // Global Project Submit
  const submitProj = (e: React.FormEvent) => {
    e.preventDefault();
    const projData = {
      id: editingProjId || Date.now().toString(),
      title: projForm.title,
      category: projForm.category,
      imageUrl: projForm.imageUrl || 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600'
    };

    if (editingProjId) {
      onUpdateProject(editingProjId, projData);
      setEditingProjId(null);
      showToast('Project updated successfully!', 'success');
    } else {
      onAddProject(projData);
      showToast('Project added successfully!', 'success');
    }
    setProjForm({ title: '', category: '', imageUrl: '' });
  };

  const editProj = (proj: Project) => {
    setEditingProjId(proj.id);
    setProjForm({
      title: proj.title,
      category: proj.category,
      imageUrl: proj.imageUrl
    });
  };

  // Job Submit
  const submitJob = (e: React.FormEvent) => {
    e.preventDefault();
    const jobData = {
      id: editingJobId || Date.now().toString(),
      title: jobForm.title,
      description: jobForm.description,
      company: jobForm.company || '',
      jobType: jobForm.jobType || 'Remote',
      logoUrl: jobForm.logoUrl || ''
    };

    if (editingJobId) {
      onUpdateJob(editingJobId, jobData);
      setEditingJobId(null);
      showToast('Job updated successfully!', 'success');
    } else {
      onAddJob(jobData);
      showToast('Job posted successfully!', 'success');
    }
    setJobForm({ title: '', description: '', company: '', jobType: 'Remote', logoUrl: '' });
  };

  const editJob = (job: JobPosting) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      description: job.description,
      company: job.company || '',
      jobType: job.jobType || 'Remote',
      logoUrl: job.logoUrl || ''
    });
  };

  // Filtered chats
  const filteredChats = allChats.filter(chat => {
    const q = chatSearchQuery.toLowerCase();
    const client = (chat.clientName || 'Client').toLowerCase();
    const prof = (chat.professionalName || '').toLowerCase();
    const lastMsg = (chat.lastMessage || '').toLowerCase();
    return client.includes(q) || prof.includes(q) || lastMsg.includes(q);
  });

  // Filtered professionals
  const filteredProfessionals = professionals.filter(p => {
    const q = profSearchQuery.toLowerCase();
    return p.fullName.toLowerCase().includes(q) ||
           p.jobCategory.toLowerCase().includes(q) ||
           p.skills?.some(s => s.toLowerCase().includes(q));
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">Admin Portal</h2>
          <p className="text-xs sm:text-sm text-gray-400 text-center mb-6">Sign in with your admin Google account (simonemmanuel8344@gmail.com)</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            <button type="submit" className="w-full py-3.5 bg-amber-400 text-[#0A192F] font-bold text-sm sm:text-base rounded-xl hover:bg-amber-300 active:scale-98 transition-all shadow-md cursor-pointer">
              Sign In with Google
            </button>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full py-3.5 bg-white/5 text-gray-300 font-semibold text-sm sm:text-base rounded-xl hover:bg-white/10 hover:text-white active:scale-98 transition-all shadow-md cursor-pointer"
            >
              Return to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[80vh]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">Super Administrator</span>
            <span className="text-xs text-gray-400">simonemmanuel8344@gmail.com</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Management & Live Inquiries Hub</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage professional portfolios & works, answer client inquiries, post jobs, and review applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAdminLogout}
            className="inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2 text-red-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 sm:gap-3 mb-8 no-scrollbar">
        <button 
          onClick={() => setActiveTab('professionals')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'professionals' 
              ? 'bg-amber-400 text-[#0A192F] shadow-lg shadow-amber-400/20 scale-102' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Professionals & Portfolios</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${activeTab === 'professionals' ? 'bg-[#0A192F]/20 text-[#0A192F] font-black' : 'bg-white/10 text-gray-300'}`}>
            {professionals.length}
          </span>
        </button>

        <button 
          onClick={() => { setActiveTab('orders'); loadSupabaseData(); }}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' 
              ? 'bg-amber-400 text-[#0A192F] shadow-lg shadow-amber-400/20 scale-102' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Supabase Orders & Inquiries</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === 'orders' ? 'bg-[#0A192F] text-amber-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {supabaseOrders.length + supabaseContacts.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'messages' 
              ? 'bg-amber-400 text-[#0A192F] shadow-lg shadow-amber-400/20 scale-102' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Client Inquiries & Live Chat</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === 'messages' ? 'bg-[#0A192F] text-amber-400' : 'bg-amber-400 text-[#0A192F]'}`}>
            {allChats.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('project')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'project' 
              ? 'bg-amber-400 text-[#0A192F] font-bold shadow-md' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hub Portfolio ({projects.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('job')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'job' 
              ? 'bg-amber-400 text-[#0A192F] font-bold shadow-md' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs Board ({jobs.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('applications')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications' 
              ? 'bg-amber-400 text-[#0A192F] font-bold shadow-md' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Applications ({applications.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-amber-400 text-[#0A192F] font-bold shadow-md' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFESSIONALS & PORTFOLIO / WORKS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'professionals' && (
        <div className="space-y-8">
          {/* Professional Create / Edit Form */}
          <div className="bg-[#0A192F] border-2 border-amber-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                    <User className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {editingProfId ? 'Edit Professional & Portfolio Showcase' : 'Add New Verified Professional Profile'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Configure professional background, location, skills, bio, and individual completed project works to build trust with clients.
                </p>
              </div>

              {editingProfId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfId(null);
                    setProfForm({
                      fullName: '', phone: '', email: '', jobCategory: '', skills: '',
                      location: '', yearsOfExperience: '', bio: '', picture: '', portfolioItems: []
                    });
                  }}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Editing</span>
                </button>
              )}
            </div>

            <form onSubmit={submitProf} className="space-y-6">
              {/* Primary Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={profForm.fullName} 
                    onChange={e => setProfForm({...profForm, fullName: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. Emmanuel Simon" 
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Job Title / Category *</label>
                  <input 
                    required 
                    type="text" 
                    value={profForm.jobCategory} 
                    onChange={e => setProfForm({...profForm, jobCategory: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. Senior Graphic & Brand Designer" 
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    value={profForm.email} 
                    onChange={e => setProfForm({...profForm, email: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. emmanuel@example.com" 
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Phone / WhatsApp Number *</label>
                  <input 
                    required 
                    type="tel" 
                    value={profForm.phone} 
                    onChange={e => setProfForm({...profForm, phone: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. +2347068588344" 
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Location / Availability</label>
                  <input 
                    type="text" 
                    value={profForm.location} 
                    onChange={e => setProfForm({...profForm, location: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. Lagos, Nigeria & Worldwide Remote" 
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Years of Experience</label>
                  <input 
                    type="text" 
                    value={profForm.yearsOfExperience} 
                    onChange={e => setProfForm({...profForm, yearsOfExperience: e.target.value})} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                    placeholder="e.g. 6+ Years" 
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Skills & Specializations (comma separated) *</label>
                <input 
                  required 
                  type="text" 
                  value={profForm.skills} 
                  onChange={e => setProfForm({...profForm, skills: e.target.value})} 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-amber-400" 
                  placeholder="e.g. Brand Identity, Adobe Photoshop, Figma, Typography, Motion Graphics, UI/UX" 
                />
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">Profile Picture</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {profForm.picture ? (
                      <img src={profForm.picture} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Photo File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleImageFile(e, url => setProfForm(prev => ({ ...prev, picture: url })))}
                          className="hidden" 
                        />
                      </label>
                      <input 
                        type="text" 
                        value={profForm.picture} 
                        onChange={e => setProfForm({...profForm, picture: e.target.value})} 
                        placeholder="Or paste high-res image URL" 
                        className="flex-1 px-3.5 py-2 bg-black/30 border border-white/10 rounded-xl text-white text-xs sm:text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">Directly upload photo from your device. Displays on public cards and profile view.</p>
                  </div>
                </div>
              </div>

              {/* Biography Narrative */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">
                  Professional Biography & Background Narrative
                </label>
                <textarea 
                  rows={4} 
                  value={profForm.bio} 
                  onChange={e => setProfForm({...profForm, bio: e.target.value})} 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400" 
                  placeholder="Describe this professional's background, design philosophy, client achievements, software tools mastered, and what sets them apart..."
                />
              </div>

              {/* =================================================================== */}
              {/* SUBSECTION: PORTFOLIO & COMPLETED WORKS SHOWCASE */}
              {/* =================================================================== */}
              <div className="pt-6 border-t border-white/10 bg-white/[0.02] p-5 sm:p-6 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Personal Portfolio & Works Done ({profForm.portfolioItems.length} Projects)
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add specific projects this professional has completed so prospective clients can review real case studies and trust their expertise.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProjectItemForm({ title: '', category: profForm.jobCategory || '', description: '', imageUrl: '', projectUrl: '' });
                      setEditingProjectIndex(null);
                      setShowAddProjectModal(true);
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Showcase Project</span>
                  </button>
                </div>

                {/* Sub-form Modal / Box when adding or editing a project */}
                {showAddProjectModal && (
                  <div className="mb-6 p-5 bg-[#0A192F] border-2 border-amber-400/40 rounded-2xl shadow-2xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                        {editingProjectIndex !== null ? 'Edit Showcase Project' : 'Add New Showcase Project'}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setShowAddProjectModal(false)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Project Title *</label>
                        <input
                          type="text"
                          value={projectItemForm.title}
                          onChange={e => setProjectItemForm({...projectItemForm, title: e.target.value})}
                          placeholder="e.g. Luxury Brand Identity & Package Design"
                          className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Category / Tag</label>
                        <input
                          type="text"
                          value={projectItemForm.category}
                          onChange={e => setProjectItemForm({...projectItemForm, category: e.target.value})}
                          placeholder="e.g. Branding, UI/UX, 3D Render"
                          className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1">Project Overview / Description</label>
                        <textarea
                          rows={2}
                          value={projectItemForm.description}
                          onChange={e => setProjectItemForm({...projectItemForm, description: e.target.value})}
                          placeholder="Describe the challenge, tools used (Figma, Blender, Illustrator), and outcome delivered..."
                          className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Project Image *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={projectItemForm.imageUrl}
                            onChange={e => setProjectItemForm({...projectItemForm, imageUrl: e.target.value})}
                            placeholder="Image URL or upload..."
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
                          />
                          <label className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 flex items-center gap-1 shrink-0">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleImageFile(e, url => setProjectItemForm(prev => ({ ...prev, imageUrl: url })))}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Live Project / Case Study Link (Optional)</label>
                        <input
                          type="url"
                          value={projectItemForm.projectUrl}
                          onChange={e => setProjectItemForm({...projectItemForm, projectUrl: e.target.value})}
                          placeholder="https://behance.net/..."
                          className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddProjectModal(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProjectItem}
                        className="px-5 py-2 bg-amber-400 text-[#0A192F] font-bold rounded-xl text-xs hover:bg-amber-300 cursor-pointer"
                      >
                        {editingProjectIndex !== null ? 'Save Changes' : 'Add to Portfolio List'}
                      </button>
                    </div>
                  </div>
                )}

                {/* List of current projects in this professional's portfolio */}
                {profForm.portfolioItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p className="text-xs">No projects added yet for this professional. Click "+ Add Showcase Project" to attach completed works.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {profForm.portfolioItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-3.5 bg-[#0A192F] border border-white/10 rounded-xl flex items-start gap-3 relative group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{item.category}</span>
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          {item.description && <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>}
                          {item.projectUrl && (
                            <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1">
                              <span>Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditProjectItem(idx)}
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProjectItem(idx)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                            title="Remove project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                <button 
                  type="submit" 
                  className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-98 text-[#0A192F] font-bold text-sm sm:text-base rounded-xl inline-flex items-center justify-center transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {editingProfId ? 'Save & Update Public Profile' : 'Publish New Verified Professional'}
                </button>

                {editingProfId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProfId(null);
                      setProfForm({
                        fullName: '', phone: '', email: '', jobCategory: '', skills: '',
                        location: '', yearsOfExperience: '', bio: '', picture: '', portfolioItems: []
                      });
                    }} 
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Professionals Directory */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Existing Verified Professionals ({professionals.length})</h3>
                <p className="text-xs text-gray-400">Click "Edit Profile & Works" to update bio and showcase projects, or "Preview Public Profile" to see how clients view them.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profSearchQuery}
                  onChange={e => setProfSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, title..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#0A192F] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {filteredProfessionals.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No professionals matched your search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProfessionals.map(prof => {
                  const projectCount = prof.portfolioItems?.length || 0;
                  return (
                    <div 
                      key={prof.id} 
                      className="p-5 bg-[#0A192F] border border-white/10 hover:border-amber-400/40 rounded-2xl transition-all shadow-md flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          src={prof.picture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200'} 
                          alt={prof.fullName} 
                          className="w-16 h-16 rounded-xl object-cover border border-amber-400/30 shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base truncate">{prof.fullName}</h4>
                            <span className="p-1 rounded-full bg-amber-400/20 text-amber-400" title="Verified Professional">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-amber-400">{prof.jobCategory}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-300">
                            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {prof.location || 'Lagos & Remote'}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {prof.yearsOfExperience || '5+ Years'}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3" />
                              {projectCount} Portfolio Works
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      {prof.bio && (
                        <p className="text-xs text-gray-400 line-clamp-2 bg-white/5 p-2.5 rounded-xl">
                          {prof.bio}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                        {onViewProfessionalProfile && (
                          <button
                            type="button"
                            onClick={() => onViewProfessionalProfile(prof)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Preview Profile</span>
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <button 
                            type="button" 
                            onClick={() => editProf(prof)} 
                            className="px-3.5 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Profile & Works</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { 
                              if (window.confirm(`Are you sure you want to delete ${prof.fullName}?`)) {
                                onDeleteProfessional(prof.id);
                              }
                            }} 
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors cursor-pointer"
                            title="Delete professional"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLIENT INQUIRIES & LIVE MESSAGES HUB */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="bg-[#0A192F] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-6 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Client Direct Messages & Inquiries</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Receive and reply directly to all client inquiries sent to professionals (Emmanuel, Kaodilinye, or any specialist) in real-time.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={e => setChatSearchQuery(e.target.value)}
                placeholder="Filter inquiries..."
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] max-h-[780px]">
            {/* Conversations Sidebar (Left) */}
            <div className="lg:col-span-5 border-r border-white/10 overflow-y-auto max-h-[780px] divide-y divide-white/5 bg-black/20">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p className="text-sm font-semibold text-white mb-1">No Inquiries Found</p>
                  <p className="text-xs text-gray-400">When clients click "Send Direct Message" to any professional, the conversation will appear here in real-time.</p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isSelected = selectedChat?.id === chat.id;
                  const targetProfName = chat.professionalName || 'Professional';
                  const clientName = chat.clientName || 'Client User';

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-4 sm:p-5 transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-400/10 border-l-4 border-amber-400' 
                          : 'hover:bg-white/5 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {chat.professionalPicture ? (
                          <img src={chat.professionalPicture} alt={targetProfName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400 font-bold">{targetProfName.charAt(0)}</span>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-[#0A192F] rounded-full"></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-white text-sm truncate">{clientName}</h4>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-medium truncate mb-1">
                          Inquiry regarding: {targetProfName}
                        </p>
                        <p className="text-xs text-gray-300 line-clamp-1">
                          {chat.lastMessage || 'Conversation initiated...'}
                        </p>
                      </div>

                      <ChevronRight className={`w-4 h-4 mt-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-gray-600'}`} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Live Chat & Reply Console (Right) */}
            <div className="lg:col-span-7 flex flex-col h-full bg-[#0A192F]/60">
              {selectedChat ? (
                <>
                  {/* Chat Console Header */}
                  <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                        {selectedChat.professionalPicture ? (
                          <img src={selectedChat.professionalPicture} alt={selectedChat.professionalName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400 font-bold text-sm">{selectedChat.clientName?.charAt(0) || 'C'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{selectedChat.clientName || 'Client'}</h3>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-md">Live Connected</span>
                        </div>
                        <p className="text-xs text-amber-400">
                          Inquiry for: <strong>{selectedChat.professionalName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 hidden sm:block text-right">
                      <span className="block font-mono text-[11px]">Chat ID: {selectedChat.id.slice(0, 12)}...</span>
                      <span className="text-gray-400">Admin Mode Active</span>
                    </div>
                  </div>

                  {/* Message History Feed */}
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] min-h-[300px]">
                    {loadingChatMessages ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm py-10">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading message history...</span>
                        </div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">No messages exchanged yet in this thread.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isAdminMessage = msg.senderId === auth.currentUser?.uid || msg.senderName?.includes('Admin');
                        const isClientMessage = !isAdminMessage && msg.senderId !== selectedChat.professionalId;

                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isAdminMessage ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[11px] font-semibold text-gray-400">
                                {isAdminMessage ? '👑 Admin (Idea Creation Hub)' : (msg.senderName || (isClientMessage ? selectedChat.clientName : selectedChat.professionalName))}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            <div 
                              className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                isAdminMessage
                                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-[#0A192F] font-medium rounded-tr-none shadow-md'
                                  : 'bg-white/10 border border-white/10 text-white rounded-tl-none shadow-md'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Reply Chips */}
                  <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex flex-wrap items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-gray-400 font-semibold mr-1">Quick Replies:</span>
                    {[
                      "Hello! I am responding from the Idea Creation Hub management regarding your inquiry.",
                      "Thank you for reaching out! What is your project timeline and requirements?",
                      "Our verified specialist is available. Let's schedule a brief consultation."
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendAdminReply(undefined, chip)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-amber-400/20 text-gray-300 hover:text-amber-400 border border-white/10 rounded-lg text-[11px] transition-all cursor-pointer truncate max-w-[240px]"
                        title={chip}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <form onSubmit={e => handleSendAdminReply(e)} className="p-4 bg-white/5 border-t border-white/10 shrink-0">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          rows={2}
                          value={adminReplyText}
                          onChange={e => setAdminReplyText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendAdminReply();
                            }
                          }}
                          placeholder={`Type direct reply to ${selectedChat.clientName || 'Client'} (Press Enter to send)...`}
                          className="w-full px-4 py-3 bg-black/40 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingReply || !adminReplyText.trim()}
                        className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#0A192F] font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
                      >
                        {sendingReply ? (
                          <div className="w-4 h-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Reply to Client</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Select an Inquiry Conversation</h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md">
                    Choose any client chat from the left panel to inspect the message log and respond directly to the client as an administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERAL HUB PORTFOLIO PROJECTS */}
      {/* ========================================================================= */}
      {activeTab === 'project' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
          <form onSubmit={submitProj}>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 pb-3 border-b border-white/10">Add New General Hub Portfolio Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Project Title</label>
                <input required type="text" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400" placeholder="e.g. Modern Brand Identity" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <input required type="text" value={projForm.category} onChange={e => setProjForm({...projForm, category: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400" placeholder="e.g. Graphic Design, Web Development" />
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Project Image (Direct Upload)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => handleImageFile(e, url => setProjForm(prev => ({ ...prev, imageUrl: url })))}
                className="w-full px-3 py-2 bg-[#0A192F] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#0A192F] hover:file:bg-amber-300" 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 text-[#0A192F] font-bold text-sm sm:text-base rounded-xl hover:bg-amber-300 active:scale-98 inline-flex items-center justify-center transition-all shadow-md cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                {editingProjId ? 'Update Project' : 'Save Project'}
              </button>
              {editingProjId && (
                <button type="button" onClick={() => { setEditingProjId(null); setProjForm({ title: '', category: '', imageUrl: '' }); }} className="w-full sm:w-auto px-6 py-3.5 bg-white/10 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-white/20 active:scale-98 inline-flex items-center justify-center transition-all shadow-md cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List of Projects */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold text-white mb-4">Existing Hub Showcase Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-400 text-sm">No projects found.</p>
            ) : (
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0A192F] border border-white/10 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <img src={proj.imageUrl} alt={proj.title} className="w-16 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                        <p className="text-xs text-amber-400">{proj.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button type="button" onClick={() => editProj(proj)} className="flex-1 sm:flex-none px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg flex items-center justify-center transition-colors text-sm font-medium cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                      </button>
                      <button type="button" onClick={() => { if(window.confirm('Delete project?')) onDeleteProject(proj.id) }} className="flex-1 sm:flex-none px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors text-sm font-medium cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: JOB ADVERTS */}
      {/* ========================================================================= */}
      {activeTab === 'job' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
          <form onSubmit={submitJob}>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 pb-3 border-b border-white/10">Post New Job Advert</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
                <input required type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400" placeholder="e.g. Senior Copywriter" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Company Name</label>
                <input required type="text" value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400" placeholder="e.g. Acme Corp" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Job Type</label>
                <select required value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400">
                  <option value="Remote">Remote</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Company Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  {jobForm.logoUrl && (
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 shrink-0 overflow-hidden">
                      <img src={jobForm.logoUrl} alt="Logo" className="w-full h-full object-cover bg-white" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageFile(e, url => setJobForm(prev => ({ ...prev, logoUrl: url })))}
                    className="w-full px-3 py-2 bg-[#0A192F] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#0A192F] hover:file:bg-amber-300 cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Job Description & Responsibilities</label>
              <textarea required rows={5} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400" placeholder="Describe the job requirements, experience needed, salary and perks..." />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 text-[#0A192F] font-bold text-sm sm:text-base rounded-xl hover:bg-amber-300 active:scale-98 inline-flex items-center justify-center transition-all shadow-md cursor-pointer">
                <Briefcase className="w-4 h-4 mr-2" />
                {editingJobId ? 'Update Job Advert' : 'Post Job Advert'}
              </button>
              {editingJobId && (
                <button type="button" onClick={() => { setEditingJobId(null); setJobForm({ title: '', description: '', company: '', jobType: 'Remote', logoUrl: '' }); }} className="w-full sm:w-auto px-6 py-3.5 bg-white/10 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-white/20 active:scale-98 inline-flex items-center justify-center transition-all shadow-md cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List of Jobs */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold text-white mb-4">Existing Job Postings</h3>
            {jobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs found.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0A192F] border border-white/10 rounded-xl gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1">{job.description}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                      <button type="button" onClick={() => editJob(job)} className="flex-1 sm:flex-none px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg flex items-center justify-center transition-colors text-sm font-medium cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                      </button>
                      <button type="button" onClick={() => { if(window.confirm('Delete job posting?')) onDeleteJob(job.id) }} className="flex-1 sm:flex-none px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors text-sm font-medium cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: APPLICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">Received Job Applications</h2>
            <span className="text-xs sm:text-sm font-medium text-amber-400">{applications.length} Total</span>
          </div>
          
          {applications.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No job applications received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-[#0A192F] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-md">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      {app.photoUrl ? (
                        <img src={app.photoUrl} alt={app.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Photo</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white">{app.fullName}</h3>
                          <p className="text-amber-400 text-xs sm:text-sm font-medium">Applied for: {app.jobTitle}</p>
                        </div>
                        <span className="text-[11px] sm:text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-300 mb-3 space-y-1 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-6">
                        <p><strong className="text-gray-400 font-medium">Phone:</strong> {app.phone}</p>
                        <p>
                          <strong className="text-gray-400 font-medium">CV Document:</strong>{' '}
                          {app.cvUrl ? (
                            <a href={app.cvUrl} download={app.cvName || `CV_${app.fullName.replace(/\s+/g, '_')}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{app.cvName || 'Download File'}</span>
                            </a>
                          ) : (
                            <span className="text-gray-500">No file attachment</span>
                          )}
                        </p>
                        {app.cvLink && (
                          <p>
                            <strong className="text-gray-400 font-medium">Portfolio / Cloud Link:</strong>{' '}
                            <a href={app.cvLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium break-all">
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Cloud Link</span>
                            </a>
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Resume / Cover Letter</p>
                        <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap bg-white/5 p-3 rounded-xl border border-white/5">{app.resumeText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SUPABASE ORDERS & INQUIRIES */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Supabase Client Orders & Inquiries</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" /> Connected
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Direct project orders submitted through the website order form, synced to Supabase.
              </p>
            </div>

            <button
              onClick={loadSupabaseData}
              disabled={loadingOrders}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, email, service, or project title..."
              value={orderSearchQuery}
              onChange={e => setOrderSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {loadingOrders ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-300">Fetching live orders from Supabase...</p>
            </div>
          ) : supabaseOrders.length === 0 && supabaseContacts.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
              <h3 className="text-base font-bold text-white mb-1">No Orders Yet in Supabase</h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-4">
                Orders submitted via the "Place a Service Order" modal or website contact form will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orders Section */}
              {supabaseOrders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Project Orders ({supabaseOrders.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {supabaseOrders
                      .filter(o => {
                        const q = orderSearchQuery.toLowerCase();
                        return (
                          !q ||
                          o.client_name?.toLowerCase().includes(q) ||
                          o.client_email?.toLowerCase().includes(q) ||
                          o.service_category?.toLowerCase().includes(q) ||
                          o.project_title?.toLowerCase().includes(q)
                        );
                      })
                      .map((order, idx) => {
                        const cleanPhone = (order.client_phone || '').replace(/\D/g, '');
                        const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}` : null;

                        return (
                          <div 
                            key={order.id || idx}
                            className="bg-[#0A192F] border border-white/10 hover:border-amber-400/30 rounded-2xl p-5 sm:p-6 transition-all shadow-xl"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-white/10">
                              <div>
                                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full mr-2">
                                  {order.service_category}
                                </span>
                                <span className="text-xs font-semibold text-gray-400">
                                  {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl capitalize">
                                  {order.status || 'Pending'}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-base sm:text-lg font-bold text-white mb-2">{order.project_title}</h4>
                            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 bg-white/5 p-3.5 rounded-xl border border-white/5 whitespace-pre-wrap">
                              {order.project_description}
                            </p>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 block mb-0.5 font-medium">Client Name</span>
                                <span className="text-white font-bold">{order.client_name}</span>
                              </div>

                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 block mb-0.5 font-medium">Contact Phone</span>
                                <span className="text-white font-semibold">{order.client_phone}</span>
                              </div>

                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 block mb-0.5 font-medium">Budget Range</span>
                                <span className="text-amber-400 font-bold">{order.budget_range || 'Flexible'}</span>
                              </div>

                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-gray-400 block mb-0.5 font-medium">Timeline</span>
                                <span className="text-white font-semibold">{order.timeline || 'Flexible'}</span>
                              </div>
                            </div>

                            {/* Assigned Pro or Links */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                {order.client_email && (
                                  <a href={`mailto:${order.client_email}`} className="text-gray-300 hover:text-amber-400 flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{order.client_email}</span>
                                  </a>
                                )}

                                {order.cloud_link && (
                                  <a href={order.cloud_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Cloud Link</span>
                                  </a>
                                )}

                                {order.attachment_url && (
                                  <a href={order.attachment_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Attached File</span>
                                  </a>
                                )}
                              </div>

                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer ml-auto"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  <span>Chat on WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Contact Inquiries from Supabase */}
              {supabaseContacts.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>General Website Inquiries ({supabaseContacts.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supabaseContacts.map((c, i) => (
                      <div key={c.id || i} className="bg-[#0A192F] border border-white/10 rounded-2xl p-5 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-sm">{c.name}</h4>
                          <span className="text-[11px] text-gray-500">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 mb-1">{c.email} {c.phone ? `• ${c.phone}` : ''}</p>
                        <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">{c.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-5 pb-3 border-b border-white/10">Site Settings & Access Control</h2>
          
          {/* Professional Access Code Management */}
          <div className="mb-8 p-5 sm:p-6 bg-[#0A192F] border border-amber-400/30 rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Professional Registration Verification Code</h3>
                  <p className="text-xs text-gray-300">
                    Vetted talent must enter this unique code when creating a verified professional account.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-amber-400"
                  placeholder="e.g. PRO-IDEA-2026"
                />
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (onUpdateInviteCode && customCode.trim()) {
                    onUpdateInviteCode(customCode.trim().toUpperCase());
                    showToast('Professional verification code updated!', 'success');
                  }
                }}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#0A192F] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                Save Code
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(customCode.trim() || professionalInviteCode);
                  setCopiedCode(true);
                  showToast('Access code copied to clipboard!', 'success');
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2.5">
              Share this code directly with vetted professionals via WhatsApp, SMS, or Email so they can self-register their verified profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3">Update Header Logo</label>
              
              {logoUrl ? (
                <div className="mb-4 p-4 bg-[#0A192F] border border-white/10 rounded-xl inline-block">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Current Header Logo:</p>
                  <img src={logoUrl} alt="Current Logo" className="w-16 h-16 object-cover rounded-lg border border-amber-400/30 shadow-md" />
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-3">Using default briefcase icon badge.</p>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                onChange={e => handleImageFile(e, url => {
                  onUpdateLogo(url);
                  showToast('Header logo updated successfully!', 'success');
                })}
                className="w-full px-3 py-2 bg-[#0A192F] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#0A192F] hover:file:bg-amber-300" 
              />
              <p className="text-xs text-gray-400 mt-2">Upload directly from your phone or computer. The logo updates in the header navigation instantly.</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-3">Update Hero Profile Box</label>
              
              {heroImageUrl ? (
                <div className="mb-4 p-4 bg-[#0A192F] border border-white/10 rounded-xl inline-block">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Current Hero Image:</p>
                  <img src={heroImageUrl} alt="Current Hero Image" className="w-24 h-24 object-cover rounded-lg border border-amber-400/30 shadow-md" />
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-3">Using default placeholder icon.</p>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                onChange={e => handleImageFile(e, url => {
                  onUpdateHeroImage(url);
                  showToast('Hero image updated successfully!', 'success');
                })}
                className="w-full px-3 py-2 bg-[#0A192F] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#0A192F] hover:file:bg-amber-300" 
              />
              <p className="text-xs text-gray-400 mt-2">Upload a picture to display next to the "Bring Your Dreams to Life..." text. Recommends a 1:1 square image.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
