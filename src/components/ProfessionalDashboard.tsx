import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChatSession, Professional, Rating, PortfolioItem } from '../types';
import { MessageSquare, Star, ArrowRight, Award, Phone, Mail, Edit3, CheckCircle, Clock, Plus, Trash2, ExternalLink, Image as ImageIcon, MapPin, Eye } from 'lucide-react';
import { Chat } from './Chat';
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../lib/imageCompressor';

interface ProfessionalDashboardProps {
  onBackToHome?: () => void;
  onViewMyProfile?: (prof: Professional) => void;
}

export function ProfessionalDashboard({ onBackToHome, onViewMyProfile }: ProfessionalDashboardProps) {
  const { showToast } = useToast();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [proProfile, setProProfile] = useState<Professional | null>(null);
  
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

  // New portfolio item modal/form
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    projectUrl: ''
  });

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 1. Fetch / listen to this professional's public profile
    const unsubPro = onSnapshot(doc(db, 'professionals', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Professional;
        setProProfile(data);
        setEditForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          jobCategory: data.jobCategory || '',
          skills: data.skills ? data.skills.join(', ') : '',
          picture: data.picture || '',
          bio: data.bio || '',
          location: data.location || '',
          yearsOfExperience: data.yearsOfExperience ? String(data.yearsOfExperience) : '',
          portfolioItems: data.portfolioItems || []
        });
      }
    });

    // 2. Fetch / listen to conversations involving this professional
    const chatsRef = collection(db, 'chats');
    const qChats = query(chatsRef, where('participants', 'array-contains', currentUser.uid));
    
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      const chatsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ChatSession));
      // In-memory sort by most recent update
      chatsData.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading professional chats:", error);
      setLoading(false);
    });

    // 3. Fetch / listen to ratings for this professional
    const qRatings = query(collection(db, 'ratings'), where('profId', '==', currentUser.uid));
    const unsubRatings = onSnapshot(qRatings, (snapshot) => {
      const ratingsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Rating));
      setRatings(ratingsData);
    }, (error) => {
      console.error("Error loading pro ratings:", error);
    });

    return () => {
      unsubPro();
      unsubChats();
      unsubRatings();
    };
  }, [currentUser]);

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
      const updatedData = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        jobCategory: editForm.jobCategory.trim(),
        skills: parsedSkills,
        picture: editForm.picture || proProfile?.picture || '',
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        yearsOfExperience: editForm.yearsOfExperience.trim(),
        portfolioItems: editForm.portfolioItems
      };

      // Update professionals doc
      await updateDoc(doc(db, 'professionals', currentUser.uid), updatedData);

      // Update users doc
      await updateDoc(doc(db, 'users', currentUser.uid), {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        jobCategory: editForm.jobCategory.trim(),
        skills: parsedSkills,
        picture: editForm.picture || proProfile?.picture || '',
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        yearsOfExperience: editForm.yearsOfExperience.trim()
      });

      showToast('Profile & Portfolio updated successfully!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating pro profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400/15 via-white/5 to-transparent border border-amber-400/20 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-amber-400 shrink-0 shadow-lg">
            {proProfile?.picture || currentUser?.photoURL ? (
              <img 
                src={proProfile?.picture || currentUser?.photoURL || ''} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-2xl">
                {currentUser?.displayName?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-[#0A192F] rounded-full">
                Verified Talent
              </span>
              <span className="flex items-center text-xs text-green-400 font-medium gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Active & Listed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {proProfile?.fullName || currentUser?.displayName || 'Verified Professional'}
            </h1>
            <p className="text-sm text-gray-300">
              {proProfile?.jobCategory || 'Creative Professional'} • <span className="text-amber-400 font-semibold">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {proProfile && onViewMyProfile && (
            <button
              onClick={() => onViewMyProfile(proProfile)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View My Public Profile</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            {isEditing ? 'Close Editor' : 'Edit Profile & Portfolio'}
          </button>
        </div>
      </div>

      {/* Profile Edit Form if toggled */}
      {isEditing && (
        <form onSubmit={handleUpdateProfile} className="bg-[#0A192F] border border-amber-400/40 rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Edit Profile, Bio & Showcase Portfolio
            </h3>
            <span className="text-xs text-amber-400 font-medium">Changes appear immediately on your public profile</span>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name *</label>
              <input 
                type="text" 
                required 
                value={editForm.fullName}
                onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                required 
                value={editForm.phone}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Job Title / Category *</label>
              <input 
                type="text" 
                required 
                value={editForm.jobCategory}
                onChange={e => setEditForm({...editForm, jobCategory: e.target.value})}
                placeholder="e.g. Senior Graphic Designer"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Location / Availability</label>
              <input 
                type="text" 
                value={editForm.location}
                onChange={e => setEditForm({...editForm, location: e.target.value})}
                placeholder="e.g. Lagos & Remote"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Years of Experience</label>
              <input 
                type="text" 
                value={editForm.yearsOfExperience}
                onChange={e => setEditForm({...editForm, yearsOfExperience: e.target.value})}
                placeholder="e.g. 6+ Years"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Skills (comma separated)</label>
              <input 
                type="text" 
                value={editForm.skills}
                onChange={e => setEditForm({...editForm, skills: e.target.value})}
                placeholder="e.g. React, UI/UX, Node.js"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Profile Picture Upload & Preview */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Profile Picture</label>
            <div className="flex items-center gap-4">
              {editForm.picture && (
                <img src={editForm.picture} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-white/20" />
              )}
              <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/10 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
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
                onChange={e => setEditForm({...editForm, picture: e.target.value})}
                placeholder="Or paste image URL"
                className="flex-1 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Biography Narrative */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Full Biography / Background *</label>
            <textarea
              rows={4}
              value={editForm.bio}
              onChange={e => setEditForm({...editForm, bio: e.target.value})}
              placeholder="Describe your design or development methodology, background, key achievements, and what sets your work apart..."
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Portfolio Projects Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white">Portfolio Showcase Projects</h4>
                <p className="text-xs text-gray-400">Add project samples to feature on your public profile page.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="px-3.5 py-2 bg-amber-400/15 hover:bg-amber-400 text-amber-400 hover:text-[#0A192F] border border-amber-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProject ? 'Close Project Form' : 'Add Project'}</span>
              </button>
            </div>

            {/* Sub-form to add project */}
            {showAddProject && (
              <div className="bg-white/5 border border-amber-400/30 rounded-2xl p-4 sm:p-5 mb-4 space-y-3">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">New Portfolio Item</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Project Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      placeholder="e.g. Luxury Brand Identity"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                      placeholder="e.g. Branding, UI/UX, Web"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Project Description</label>
                    <input
                      type="text"
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Brief overview of problem solved, tools used, and results..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Image URL / Upload *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newProject.imageUrl}
                        onChange={e => setNewProject({...newProject, imageUrl: e.target.value})}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                      />
                      <label className="cursor-pointer px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1 shrink-0">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
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
                    <label className="block text-[11px] text-gray-400 mb-1">Live Project Link (optional)</label>
                    <input
                      type="url"
                      value={newProject.projectUrl}
                      onChange={e => setNewProject({...newProject, projectUrl: e.target.value})}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddPortfolioItem}
                    className="px-4 py-2 bg-amber-400 text-[#0A192F] font-bold rounded-lg text-xs hover:bg-amber-300 cursor-pointer"
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
                  <div key={item.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-white/5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                      <span className="text-[10px] text-amber-400 uppercase tracking-wider">{item.category}</span>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-white/10 text-gray-300 rounded-xl text-xs font-semibold hover:bg-white/15 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-amber-400 text-[#0A192F] font-bold rounded-xl text-xs sm:text-sm hover:bg-amber-300 shadow-lg transition-all cursor-pointer"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Public Profile & Portfolio'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Client Messages & Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Client Inquiries / Messages (Left 2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A192F] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Client Messages & Inquiries</h3>
                  <p className="text-xs text-gray-400">Reply directly to clients who contacted you via "Chat with Pro"</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-400 text-[#0A192F] rounded-full">
                {chats.length} {chats.length === 1 ? 'client' : 'clients'}
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">Loading client messages...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="font-semibold text-white mb-1">No client inquiries yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                    When clients discover your profile on the homepage and click "Chat with {proProfile?.fullName?.split(' ')[0] || 'you'}", their messages will appear here instantly for you to reply.
                  </p>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat)}
                    className="p-4 sm:p-6 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30 flex items-center justify-center shrink-0 text-lg">
                        {chat.clientName?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                            {chat.clientName || 'Client Inquiry'}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate max-w-md">
                          {chat.lastMessage || 'Sent you a message'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg group-hover:bg-amber-400 group-hover:text-[#0A192F] transition-all">
                        Reply
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rating & Stats Overview */}
        <div className="space-y-6">
          
          {/* Rating Badge Card */}
          <div className="bg-[#0A192F] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Client Rating Score
              </h3>
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="text-center py-4 bg-white/5 rounded-xl border border-white/5 mb-4">
              <div className="text-4xl font-extrabold text-white mb-1 flex items-center justify-center gap-2">
                <span>{averageRating}</span>
                <Star className="w-7 h-7 text-amber-400 fill-amber-400 inline" />
              </div>
              <p className="text-xs text-gray-400">
                {ratings.length === 0 ? 'No client reviews yet' : `Average rating based on ${ratings.length} client evaluations`}
              </p>
            </div>

            {/* List of Recent Reviews */}
            {ratings.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Feedback</p>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {ratings.map(r => (
                    <div key={r.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{r.userName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-gray-300 italic">"{r.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Contact & Verified Info */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              Verified Status
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your profile is publicly visible under <strong>"See Professionals"</strong>. Clients can view your full portfolio, read your bio, and contact you directly.
            </p>
            <div className="pt-2 border-t border-amber-400/20 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{proProfile?.phone || 'Phone configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{proProfile?.email || currentUser?.email}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

