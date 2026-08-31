import { useState, MouseEvent } from 'react';
import { Phone, Mail, Award, MessageSquare, Star, ArrowRight, User } from 'lucide-react';
import { Professional, Rating } from '../types';
import { RatingModal } from './RatingModal';
import { auth } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface Props {
  professionals: Professional[];
  ratings?: Rating[];
  onSelectProfessional?: (prof: Professional) => void;
  onChatClick?: (prof: Professional) => void;
  onLoginPrompt?: () => void;
}

export function ProfessionalsList({ 
  professionals, 
  ratings = [], 
  onSelectProfessional,
  onChatClick, 
  onLoginPrompt 
}: Props) {
  const { showToast } = useToast();
  const [selectedProfForRating, setSelectedProfForRating] = useState<Professional | null>(null);

  // Compute rating metrics for each professional
  const getProfRatingStats = (profId: string) => {
    const profRatings = ratings.filter(r => r.profId === profId);
    if (profRatings.length === 0) {
      return { average: 0, count: 0, userRating: undefined };
    }
    const sum = profRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / profRatings.length;
    const currentUid = auth.currentUser?.uid;
    const userRating = currentUid ? profRatings.find(r => r.userId === currentUid) : undefined;
    return {
      average: Number(avg.toFixed(1)),
      count: profRatings.length,
      userRating
    };
  };

  const handleRateClick = (e: MouseEvent, prof: Professional) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      showToast('Please sign in to rate this professional', 'error');
      if (onLoginPrompt) onLoginPrompt();
      return;
    }
    setSelectedProfForRating(prof);
  };

  return (
    <section id="professionals" className="py-16 sm:py-24 bg-white/5 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-amber-400 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Verified Talent</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">See Professionals</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Click on any professional to inspect their full portfolio showcase, background bio, and verified client ratings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {professionals.map((prof) => {
            const { average, count, userRating } = getProfRatingStats(prof.id);

            return (
              <div 
                key={prof.id} 
                onClick={() => onSelectProfessional && onSelectProfessional(prof)}
                className="bg-[#0A192F] border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/60 hover:shadow-amber-400/10 transition-all duration-300 flex flex-col shadow-lg cursor-pointer group"
              >
                <div className="w-full flex justify-center pt-6 sm:pt-8 px-4">
                  <div className="w-[300px] h-[300px] max-w-full aspect-square overflow-hidden bg-white/5 relative rounded-2xl border border-white/10 shadow-md shrink-0 group-hover:scale-[1.02] transition-transform duration-300">
                    <img 
                      src={prof.picture} 
                      alt={prof.fullName} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="px-3 py-1.5 bg-amber-400 text-[#0A192F] text-xs font-bold rounded-lg shadow flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        View Full Profile
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 sm:p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    {prof.fullName}
                  </h3>
                  <p className="text-amber-400 font-medium text-sm sm:text-base mb-3 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{prof.jobCategory}</span>
                  </p>
                  
                  {/* Rating Badge / Section under Profile */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 text-left">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${
                              average >= star 
                                ? 'fill-amber-400 text-amber-400' 
                                : average >= star - 0.5 
                                ? 'fill-amber-400/50 text-amber-400' 
                                : 'text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {count > 0 ? average : 'New'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        ({count} {count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleRateClick(e, prof)}
                      className="text-xs font-semibold px-2.5 py-1.5 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-[#0A192F] border border-amber-400/30 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Rate this professional"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {userRating ? 'Edit Rating' : 'Rate Pro'}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
                    {prof.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="text-xs font-medium px-2.5 py-1 bg-white/10 text-gray-300 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {prof.skills.length > 4 && (
                      <span className="text-xs font-medium px-2 py-1 bg-white/5 text-amber-400/80 rounded-full">
                        +{prof.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Dedicated View Full Profile Link Button */}
                  <button
                    onClick={() => onSelectProfessional && onSelectProfessional(prof)}
                    className="w-full mb-4 py-2.5 px-3 bg-amber-400/10 group-hover:bg-amber-400 text-amber-400 group-hover:text-[#0A192F] border border-amber-400/30 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>View Profile, Portfolio & Reviews</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="mt-auto w-full pt-4 border-t border-white/10 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={`tel:${prof.phone}`} 
                        className="flex items-center justify-center text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                        title="Call Phone"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                        <span className="truncate">Call</span>
                      </a>
                      <a 
                        href={`mailto:${prof.email}`} 
                        className="flex items-center justify-center text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                        <span className="truncate">Email</span>
                      </a>
                    </div>
                    
                    {onChatClick && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatClick(prof);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-amber-400 text-[#0A192F] hover:bg-amber-300 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-98 text-xs sm:text-sm cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat with {prof.fullName.split(' ')[0]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProfForRating && (
        <RatingModal 
          professional={selectedProfForRating}
          existingRating={getProfRatingStats(selectedProfForRating.id).userRating}
          onClose={() => setSelectedProfForRating(null)}
        />
      )}
    </section>
  );
}

