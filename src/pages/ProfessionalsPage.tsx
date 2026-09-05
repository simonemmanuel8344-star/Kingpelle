import { useState, useMemo, useEffect } from 'react';
import { 
  Award, Star, User, Search, Filter, MessageSquare, 
  ShoppingBag, Sparkles, CheckCircle2, ChevronRight, Briefcase 
} from 'lucide-react';
import { Professional, Rating } from '../types';
import { RatingModal } from '../components/RatingModal';
import { AppView } from '../components/Navbar';
import { getStoredUser, getActiveUser } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface ProfessionalsPageProps {
  professionals: Professional[];
  ratings?: Rating[];
  currentUser?: any;
  onSelectProfessional: (prof: Professional) => void;
  onChatClick: (prof: Professional) => void;
  onLoginPrompt: () => void;
  onNavigate: (view: AppView) => void;
  onOrderService: (service?: string) => void;
}

export function ProfessionalsPage({
  professionals,
  ratings = [],
  currentUser: propUser,
  onSelectProfessional,
  onChatClick,
  onLoginPrompt,
  onNavigate,
  onOrderService
}: ProfessionalsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProfForRating, setSelectedProfForRating] = useState<Professional | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(() => propUser || getStoredUser());

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
      return;
    }
    getActiveUser().then(user => {
      if (user) setCurrentUser(user);
    });

    const handleAuthChange = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
      else setCurrentUser(getStoredUser());
    };
    window.addEventListener('idea_hub_auth_changed', handleAuthChange);
    return () => window.removeEventListener('idea_hub_auth_changed', handleAuthChange);
  }, [propUser]);

  const activeUser = currentUser || propUser || getStoredUser();

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    professionals.forEach(p => {
      if (p.jobCategory) set.add(p.jobCategory.trim());
    });
    return Array.from(set);
  }, [professionals]);

  // Compute rating metrics
  const getProfRatingStats = (profId: string) => {
    const profRatings = ratings.filter(r => r.profId === profId);
    if (profRatings.length === 0) {
      return { average: 0, count: 0, userRating: undefined };
    }
    const sum = profRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / profRatings.length;
    const currentUid = activeUser?.id;
    const userRating = currentUid ? profRatings.find(r => r.userId === currentUid) : undefined;
    return {
      average: Number(avg.toFixed(1)),
      count: profRatings.length,
      userRating
    };
  };

  const handleRateClick = (e: any, prof: Professional) => {
    e.stopPropagation();
    const user = activeUser;
    if (!user) {
      showToast('Please sign in or register to rate this professional', 'error');
      if (onLoginPrompt) onLoginPrompt();
      return;
    }
    setSelectedProfForRating(prof);
  };


  const filteredProfessionals = useMemo(() => {
    return professionals.filter(prof => {
      const matchesSearch = 
        prof.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.jobCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prof.skills && prof.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCat = selectedCategory === 'All' || prof.jobCategory.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [professionals, searchTerm, selectedCategory]);

  return (
    <div className="min-h-[85vh] py-10 sm:py-16">
      {/* Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Hire Professionals</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Verified Elite Freelancers & Studios</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Hire <span className="text-indigo-600">Top Verified Creators</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Browse our curated roster of talented professionals across design, development, videography, and architecture.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, or skill (e.g. React, UI/UX, Video)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-indigo-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Professionals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {filteredProfessionals.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No professionals match your query</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your keywords or clearing category filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProfessionals.map((prof) => {
              const { average, count } = getProfRatingStats(prof.id);

              return (
                <div
                  key={prof.id}
                  onClick={() => onSelectProfessional(prof)}
                  className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-indigo-600/50 hover:shadow-xl transition-all duration-300 flex flex-col shadow-sm cursor-pointer group"
                >
                  <div className="w-full flex justify-center pt-7 px-5">
                    <div className="w-[280px] h-[280px] max-w-full aspect-square overflow-hidden bg-gray-50 relative rounded-2xl border border-gray-200 shadow-sm shrink-0 group-hover:scale-[1.02] transition-transform duration-300">
                      <img 
                        src={prof.picture} 
                        alt={prof.fullName} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          View Portfolio & Bio
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col items-center text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {prof.fullName}
                    </h3>
                    <p className="text-indigo-600 font-semibold text-sm mb-3 flex items-center justify-center gap-1.5">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>{prof.jobCategory}</span>
                    </p>

                    {/* Rating display */}
                    <div className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl p-3 mb-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-left">
                        <div className="flex text-indigo-600">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${
                                average >= star 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900 ml-1">
                          {count > 0 ? average : 'New'}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          ({count})
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleRateClick(e, prof)}
                        className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-indigo-600 text-gray-700 hover:text-white border border-gray-200 rounded-lg transition-all cursor-pointer"
                      >
                        Rate Pro
                      </button>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                      {prof.skills && prof.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                          {skill}
                        </span>
                      ))}
                      {prof.skills && prof.skills.length > 4 && (
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                          +{prof.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatClick(prof);
                        }}
                        className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderService(prof.jobCategory);
                        }}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Hire Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating modal if clicked */}
      {selectedProfForRating && (
        <RatingModal
          professional={selectedProfForRating}
          currentUser={activeUser}
          existingRating={getProfRatingStats(selectedProfForRating.id).userRating}
          onClose={() => setSelectedProfForRating(null)}
          onSubmitted={() => {
            setSelectedProfForRating(null);
            showToast('Rating submitted successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}
