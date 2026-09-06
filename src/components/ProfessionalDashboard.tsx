import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { supabase, uploadFileToSupabase, fetchChatSessions, saveRegisteredProfessional, fetchUserJobApplications, fetchProfessionalOrders, updateEscrowStatus, fetchClientOrders } from '../lib/supabase';

import { ChatSession, Professional, Rating, PortfolioItem, JobApplication } from '../types';
import { MessageSquare, Star, ArrowRight, Award, Phone, Mail, Edit3, CheckCircle, Clock, Plus, Trash2, ExternalLink, Image as ImageIcon, MapPin, Eye, KeyRound, Lock, Shield, Briefcase, CheckCircle2, Clock3, Sparkles, FileText , User as UserIcon } from 'lucide-react';
import { Chat } from './Chat';
import { ProfessionalWalletDashboard } from './escrow/ProfessionalWalletDashboard';
import { extractUrl } from "../lib/urlUtils";
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../lib/imageCompressor';

interface ProfessionalDashboardProps {
  onBackToHome?: () => void;
  onViewMyProfile?: (prof: Professional) => void;
}

export function ProfessionalDashboard({ onBackToHome, onViewMyProfile }: ProfessionalDashboardProps) {
  const { showToast } = useToast();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [proProfile, setProProfile] = useState<Professional | null>(null);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    jobCategory: '',
    skills: '',
    picture: '',
    bio: '',
    location: '',
    yearsOfExperience: '',
    portfolioItems: [] as PortfolioItem[]
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Account security settings
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // New portfolio item modal/form
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    projectUrl: ''
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

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Fetch this professional's public profile
    supabase.from('professionals').select('*').eq('id', currentUser.id).single().then(({ data }) => {
      if (data) {
        setProProfile(data);
        setEditForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          jobCategory: data.jobCategory || '',
          skills: data.skills ? (Array.isArray(data.skills) ? data.skills.join(', ') : data.skills) : '',
          picture: data.picture || '',
          bio: data.bio || '',
          location: data.location || '',
          yearsOfExperience: data.yearsOfExperience ? String(data.yearsOfExperience) : '',
          portfolioItems: data.portfolioItems || []
        });
        setSecurityForm(prev => ({
          ...prev,
          newEmail: prev.newEmail || data.email || currentUser?.email || ''
        }));
      }
    });

    // 1b. Fetch Direct Service Orders
    fetchProfessionalOrders(currentUser.id, currentUser.email).then(data => {
      setOrders(data);
    });

    // 2. Fetch chats involving this professional
    const loadProChats = () => {

      fetchChatSessions({ professionalId: currentUser.id }).then(sessions => {
        setChats(sessions);
        setLoading(false);
      }).catch(err => {
        console.warn("Error loading pro chats:", err);
        setLoading(false);
      });
    };
    loadProChats();

    const handleChatUpdate = () => loadProChats();
    window.addEventListener('idea_hub_chat_sessions_updated', handleChatUpdate);
    window.addEventListener('idea_hub_chat_message_sent', handleChatUpdate);

    const orderSub = supabase.channel("pro-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "escrow_projects" }, () => {
        fetchProfessionalOrders(currentUser.id).then(setOrders);
      })
      .subscribe();

    // 3. Fetch ratings for this professional
    supabase.from('ratings').select('*').eq('profId', currentUser.id).then(({ data, error }) => {
      if (data) setRatings(data);
      if (error) console.error("Error loading ratings:", error);
    });

    // 4. Fetch job applications submitted by this user
    const loadApps = () => {
      setLoadingApps(true);
      fetchUserJobApplications(currentUser).then(apps => {
        setUserApplications(apps);
        setLoadingApps(false);
      }).catch(err => {
        console.warn("Error loading user applications in pro dashboard:", err);
        setLoadingApps(false);
      });
    };
    loadApps();

    const handleAppUpdated = (e: any) => {
      if (e.detail?.id) {
        setUserApplications(prev => prev.map(a => a.id === e.detail.id ? { ...a, ...e.detail } : a));
      } else {
        loadApps();
      }
    };
    const handleAppSubmitted = () => loadApps();

    window.addEventListener('idea_hub_job_application_updated', handleAppUpdated);
    window.addEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
    return () => {
      window.removeEventListener('idea_hub_chat_sessions_updated', handleChatUpdate);
      window.removeEventListener('idea_hub_chat_message_sent', handleChatUpdate);
      supabase.removeChannel(orderSub);
      window.removeEventListener('idea_hub_job_application_updated', handleAppUpdated);
      window.removeEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !securityForm.newEmail) {
      setSecurityForm(prev => ({
        ...prev,
        newEmail: currentUser.email || ''
      }));
    }
  }, [currentUser, securityForm.newEmail]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, target: 'picture' | 'project') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file, 600, 600, 0.75);
        if (target === 'picture') {
          setEditForm(prev => ({ ...prev, picture: compressedUrl }));
        } else {
          setNewProject(prev => ({ ...prev, imageUrl: compressedUrl }));
        }
      } catch (err) {
        console.error('Error compressing image:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (target === 'picture') {
            setEditForm(prev => ({ ...prev, picture: reader.result as string }));
          } else {
            setNewProject(prev => ({ ...prev, imageUrl: reader.result as string }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddPortfolioItem = () => {
    if (!newProject.title || !newProject.imageUrl) {
      showToast('Please provide a project title and image', 'error');
      return;
    }
    const item: PortfolioItem = {
      id: Date.now().toString(),
      title: newProject.title.trim(),
      category: newProject.category.trim() || editForm.jobCategory,
      description: newProject.description.trim(),
      imageUrl: newProject.imageUrl,
      projectUrl: newProject.projectUrl.trim()
    };
    setEditForm(prev => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, item]
    }));
    setNewProject({ title: '', category: '', description: '', imageUrl: '', projectUrl: '' });
    setShowAddProject(false);
    showToast('Project added to portfolio list! Remember to click "Save Public Profile".', 'success');
  };

  const handleRemovePortfolioItem = (id: string) => {
    setEditForm(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter(item => item.id !== id)
    }));
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);

    const parsedSkills = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const profToSave: Professional = {
        id: currentUser.id,
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: currentUser.email || '',
        jobCategory: editForm.jobCategory.trim() || 'Creative Specialist',
        skills: parsedSkills.length > 0 ? parsedSkills : ['Creative Design'],
        picture: editForm.picture || proProfile?.picture || '',
        bio: editForm.bio.trim() || 'Verified Professional at iDEA Creation Hub',
        location: editForm.location.trim() || 'Nigeria & Remote',
        yearsOfExperience: editForm.yearsOfExperience.trim() || '3+ Years',
        portfolioItems: editForm.portfolioItems || [],
        rating: proProfile?.rating ?? 5.0,
        ratingCount: proProfile?.ratingCount ?? 1,
        createdAt: proProfile?.createdAt || new Date().toISOString(),
        userId: currentUser.id
      };

      await saveRegisteredProfessional(profToSave);
      setProProfile(profToSave);

      showToast('Profile & Portfolio updated successfully!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating pro profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

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
      if (securityForm.newEmail && securityForm.newEmail !== currentUser.email) updates.email = securityForm.newEmail;
      if (securityForm.newPassword) updates.password = securityForm.newPassword;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        showToast("Security settings updated successfully", "success");
        setIsEditingSettings(false);
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

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : '5.0';

  if (activeChat) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Chat 
          chatId={activeChat.id} 
          professionalId={activeChat.professionalId}
          professionalName={activeChat.clientName || 'Client'} 
          professionalPicture=""
          onBack={() => setActiveChat(null)} 
        />
      </div>
    );
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'accepted_awaiting_payment');
      showToast('Order accepted. Awaiting client payment.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted_awaiting_payment' } : o));
    } catch (err) {
      showToast('Failed to accept order', 'error');
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'declined');
      showToast('Order declined.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'declined' } : o));
    } catch (err) {
      showToast('Failed to decline order', 'error');
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    try {
      await updateEscrowStatus(orderId, 'completed_awaiting_confirmation');
      showToast('Project marked as completed. Awaiting client confirmation.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed_awaiting_confirmation' } : o));
    } catch (err) {
      showToast('Failed to mark as completed', 'error');
    }
  };

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600/15 via-white/5 to-transparent border border-indigo-600/20 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100/80 border-2 border-indigo-600 shrink-0 shadow-lg">
            {proProfile?.picture || currentUser?.photoURL ? (
              <img 
                src={proProfile?.picture || currentUser?.photoURL || ''} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-2xl">
                {currentUser?.displayName?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full">
                Verified Talent
              </span>
              <span className="flex items-center text-xs text-green-400 font-medium gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Active & Listed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {proProfile?.fullName || currentUser?.displayName || 'Verified Professional'}
            </h1>
            <p className="text-sm text-gray-600">
              {proProfile?.jobCategory || 'Creative Professional'} • <span className="text-indigo-600 font-semibold">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {proProfile && onViewMyProfile && (
            <button
              onClick={() => onViewMyProfile(proProfile)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View My Public Profile</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setIsEditingSettings(false);
            }}
            className="px-4 py-2.5 bg-gray-100/80 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-gray-200/60 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-indigo-600" />
            {isEditing ? 'Close Editor' : 'Edit Profile & Portfolio'}
          </button>

          <button
            onClick={() => {
              setIsEditingSettings(!isEditingSettings);
              setIsEditing(false);
            }}
            className="px-4 py-2.5 bg-gray-100/80 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-gray-200/60 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            {isEditingSettings ? 'Close Security' : 'Account Security'}
          </button>
        </div>
      </div>

      {/* Profile Edit Form if toggled */}
      {isEditing && (
        <form onSubmit={handleUpdateProfile} className="bg-transparent border border-indigo-600/40 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              Edit Profile, Bio & Showcase Portfolio
            </h3>
            <span className="text-xs text-indigo-600 font-medium">Changes appear immediately on your public profile</span>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input 
                type="text" 
                required 
                value={editForm.fullName}
                onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                required 
                value={editForm.phone}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job Title / Category *</label>
              <input 
                type="text" 
                required 
                value={editForm.jobCategory}
                onChange={e => setEditForm({...editForm, jobCategory: e.target.value})}
                placeholder="e.g. Senior Graphic Designer"
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location / Availability</label>
              <input 
                type="text" 
                value={editForm.location}
                onChange={e => setEditForm({...editForm, location: e.target.value})}
                placeholder="e.g. Lagos & Remote"
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Years of Experience</label>
              <input 
                type="text" 
                value={editForm.yearsOfExperience}
                onChange={e => setEditForm({...editForm, yearsOfExperience: e.target.value})}
                placeholder="e.g. 6+ Years"
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Skills (comma separated)</label>
              <input 
                type="text" 
                value={editForm.skills}
                onChange={e => setEditForm({...editForm, skills: e.target.value})}
                placeholder="e.g. React, UI/UX, Node.js"
                className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Profile Picture Upload & Preview */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Profile Picture</label>
            <div className="flex items-center gap-4">
              {editForm.picture && (
                <img src={editForm.picture} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-gray-300" />
              )}
              <label className="cursor-pointer px-4 py-2 bg-gray-100/80 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-medium border border-gray-200/60 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Upload New Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => handleImageUpload(e, 'picture')} 
                  className="hidden" 
                />
              </label>
              <input
                type="text"
                value={editForm.picture}
                onChange={e => setEditForm({...editForm, picture: extractUrl(e.target.value)})}
                placeholder="Or paste image URL"
                className="flex-1 px-3.5 py-2 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-xs"
              />
            </div>
          </div>

          {/* Biography Narrative */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Biography / Background *</label>
            <textarea
              rows={4}
              value={editForm.bio}
              onChange={e => setEditForm({...editForm, bio: e.target.value})}
              placeholder="Describe your design or development methodology, background, key achievements, and what sets your work apart..."
              className="w-full px-3.5 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Portfolio Projects Section */}
          <div className="pt-4 border-t border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">Portfolio Showcase Projects</h4>
                <p className="text-xs text-gray-500">Add project samples to feature on your public profile page.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="px-3.5 py-2 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-600/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProject ? 'Close Project Form' : 'Add Project'}</span>
              </button>
            </div>

            {/* Sub-form to add project */}
            {showAddProject && (
              <div className="bg-white/60 border border-indigo-600/30 rounded-2xl p-4 sm:p-5 mb-4 space-y-3">
                <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">New Portfolio Item</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Project Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      placeholder="e.g. Luxury Brand Identity"
                      className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-gray-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                      placeholder="e.g. Branding, UI/UX, Web"
                      className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-gray-900 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-500 mb-1">Project Description</label>
                    <input
                      type="text"
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Brief overview of problem solved, tools used, and results..."
                      className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-gray-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Image URL / Upload *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newProject.imageUrl}
                        onChange={e => setNewProject({...newProject, imageUrl: extractUrl(e.target.value)})}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-gray-900 text-xs"
                      />
                      <label className="cursor-pointer px-2.5 py-2 bg-gray-100/80 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-medium border border-gray-200/60 flex items-center gap-1 shrink-0">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageUpload(e, 'project')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Live Project Link (optional)</label>
                    <input
                      type="url"
                      value={newProject.projectUrl}
                      onChange={e => setNewProject({...newProject, projectUrl: extractUrl(e.target.value)})}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-gray-900 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddPortfolioItem}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    Add to Portfolio List
                  </button>
                </div>
              </div>
            )}

            {/* Current Portfolio Items List */}
            {editForm.portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {editForm.portfolioItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white/60 border border-gray-200/60 rounded-xl flex items-center justify-between gap-3">
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-white/60 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-gray-900 truncate">{item.title}</h5>
                      <span className="text-[10px] text-indigo-600 uppercase tracking-wider">{item.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(item.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      title="Remove Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No showcase projects added yet.</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-gray-100/80 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100/90 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-indigo-700 shadow-lg transition-all cursor-pointer"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Public Profile & Portfolio'}
            </button>
          </div>
        </form>
      )}

      {/* Account Security Edit Form */}
      {isEditingSettings && (
        <form onSubmit={handleUpdateSecurity} className="bg-transparent border border-indigo-600/40 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Account Security & Login Credentials
            </h3>
            <span className="text-xs text-indigo-600 font-medium">Sensitive action: requires verification</span>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-4 text-sm text-gray-600 space-y-1.5">
            <p className="font-semibold text-indigo-600">🔒 Security Verification Required</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Updating your email or password requires verifying your current password first. This prevents unauthorized changes to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-indigo-600 mb-1.5">Current Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required 
                  value={securityForm.currentPassword}
                  onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                  placeholder="Enter current password to verify your identity"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required 
                  value={securityForm.newEmail}
                  onChange={e => setSecurityForm({...securityForm, newEmail: e.target.value})}
                  placeholder="new-email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password (optional)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  value={securityForm.newPassword}
                  onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {securityForm.newPassword && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    required={!!securityForm.newPassword}
                    value={securityForm.confirmNewPassword}
                    onChange={e => setSecurityForm({...securityForm, confirmNewPassword: e.target.value})}
                    placeholder="Verify new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={() => setIsEditingSettings(false)}
              className="px-5 py-2.5 bg-gray-100/80 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100/90 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-indigo-700 shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              {savingSettings ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Security Credentials'
              )}
            </button>
          </div>
        </form>
      )}

      {/* NEW ESCROW & WALLET SECTION */}
      <div className="mb-10">
         <ProfessionalWalletDashboard userId={currentUser?.id || ''} />
      </div>

      {/* Main Grid: Client Messages & Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        
        {/* Active Client Inquiries / Messages (Left 2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-transparent border border-gray-200/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-200/60 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Client Messages & Inquiries</h3>
                  <p className="text-xs text-gray-500">Reply directly to clients who contacted you via "Chat with Pro"</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-600 text-white rounded-full">
                {chats.length} {chats.length === 1 ? 'client' : 'clients'}
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">Loading client messages...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">No client inquiries yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                    When clients discover your profile on the homepage and click "Chat with {proProfile?.fullName?.split(' ')[0] || 'you'}", their messages will appear here instantly for you to reply.
                  </p>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat)}
                    className="p-4 sm:p-6 hover:bg-white/60 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-600 font-bold border border-indigo-600/30 flex items-center justify-center shrink-0 text-lg">
                        {chat.clientName?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {chat.clientName || 'Client Inquiry'}
                          </h4>
                          <span className="text-[10px] text-gray-500 shrink-0">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {chat.lastMessage || 'Sent you a message'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-semibold text-indigo-600 bg-indigo-600/10 px-3 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        Reply
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
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

            {orders.length > 0 && (
              <div className="p-6 border-b border-gray-200/60 bg-white/[0.01]">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Project Completion Progress</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orders.map(o => {
                        let progress = 10;
                        const s = o.status || '';
                        if (s.includes('released') || s.includes('completed')) progress = 100;
                        else if (s.includes('submitted') || s.includes('awaiting_admin_release')) progress = 90;
                        else if (s.includes('funded') || s.includes('progress')) progress = 50;
                        
                        return {
                          name: o.project_title.length > 15 ? o.project_title.substring(0, 15) + '...' : o.project_title,
                          fullTitle: o.project_title,
                          progress,
                          status: s.replace(/_/g, ' ') || 'Pending'
                        };
                      })}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6B7280'}} axisLine={false} tickLine={false} angle={-25} textAnchor="end" />
                      <YAxis tick={{fontSize: 10, fill: '#6B7280'}} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                      <RechartsTooltip 
                        cursor={{fill: '#F3F4F6'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (

                              <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs">
                                <p className="font-bold text-sm mb-1">{data.fullTitle}</p>
                                <p className="text-gray-300">Status: <span className="text-indigo-300 capitalize">{data.status}</span></p>
                                <p className="text-gray-300">Completion: <span className="font-bold text-white">{data.progress}%</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {orders.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#4F46E5" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
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
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg whitespace-nowrap">
                          {order.budget_range}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          order.status === 'funded' || order.status === 'work_in_progress' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'work_submitted' ? 'bg-amber-100 text-amber-700' :
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
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job Applications Submitted by this Professional */}

          <div className="bg-transparent border border-gray-200/60 rounded-2xl overflow-hidden shadow-xl mt-8">
            <div className="px-6 py-5 border-b border-gray-200/60 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                My Job & Partner Applications
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100/80 text-indigo-600 rounded-full">
                {userApplications.length} {userApplications.length === 1 ? 'application' : 'applications'}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingApps ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs">Loading application records...</p>
                </div>
              ) : userApplications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">No job applications submitted yet</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    When you apply for open positions or agency roles on our job board, track your real-time recruitment reviews and status right here.
                  </p>
                </div>
              ) : (
                userApplications.map(app => {
                  const status = app.status?.toLowerCase() || 'pending';
                  const isReviewed = status === 'reviewed';
                  const isContacted = status === 'contacted';
                  const isRejected = status === 'rejected';

                    return (

                    <div key={app.id} className="p-5 hover:bg-white/60 transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-gray-900">{app.jobTitle}</h4>
                            {app.company && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700">
                                {app.company}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isContacted && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Contacted for Next Steps
                            </span>
                          )}
                          {isReviewed && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              ● Application Reviewed
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              ✕ Position Closed / Archived
                            </span>
                          )}
                          {!isReviewed && !isContacted && !isRejected && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ⏳ Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recruiter Feedback Note */}
                      {app.adminFeedback && (
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                          <strong className="font-bold block mb-0.5">Recruiter Message:</strong>
                          <p className="italic">"{app.adminFeedback}"</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rating & Stats Overview */}
        <div className="space-y-6">
          
          {/* Rating Badge Card */}
          <div className="bg-transparent border border-gray-200/60 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-600 fill-amber-400" />
                Client Rating Score
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-600/10 px-2.5 py-1 rounded-full">
                {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="text-center py-4 bg-white/60 rounded-xl border border-gray-200/60 mb-4">
              <div className="text-4xl font-extrabold text-gray-900 mb-1 flex items-center justify-center gap-2">
                <span>{averageRating}</span>
                <Star className="w-7 h-7 text-indigo-600 fill-amber-400 inline" />
              </div>
              <p className="text-xs text-gray-500">
                {ratings.length === 0 ? 'No client reviews yet' : `Average rating based on ${ratings.length} client evaluations`}
              </p>
            </div>

            {/* List of Recent Reviews */}
            {ratings.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Feedback</p>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {ratings.map(r => (
                    <div key={r.id} className="p-3 bg-white/60 rounded-xl border border-gray-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{r.userName}</span>
                        <div className="flex text-indigo-600">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-gray-600 italic">"{r.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact & Verified Info */}
          <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              Verified Status
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your profile is publicly visible under <strong>"See Professionals"</strong>. Clients can view your full portfolio, read your bio, and contact you directly.
            </p>
            <div className="pt-2 border-t border-indigo-600/20 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>{proProfile?.phone || 'Phone configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>{proProfile?.email || currentUser?.email}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

