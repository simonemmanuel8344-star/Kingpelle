import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Sparkles, 
  Briefcase,
  Layers,
  MessageCircle,
  X
} from 'lucide-react';
import { Professional, Rating, Project, PortfolioItem } from '../types';
import { RatingModal } from './RatingModal';
import { auth } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface Props {
  professional: Professional;
  ratings?: Rating[];
  allProjects?: Project[];
  onBack: () => void;
  onChatClick?: (prof: Professional) => void;
  onLoginPrompt?: () => void;
}

export function ProfessionalProfileView({
  professional,
  ratings = [],
  allProjects = [],
  onBack,
  onChatClick,
  onLoginPrompt
}: Props) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'bio' | 'reviews'>('portfolio');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);

  // Scroll to top when view loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [professional.id]);

  // Compute rating metrics
  const profRatings = ratings.filter(r => r.profId === professional.id);
  const totalReviews = profRatings.length;
  const averageRating = totalReviews > 0
    ? Number((profRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Star breakdown calculation
  const starCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = profRatings.filter(r => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const currentUid = auth.currentUser?.uid;
  const userRating = currentUid ? profRatings.find(r => r.userId === currentUid) : undefined;

  // Determine portfolio items
  const portfolioList: PortfolioItem[] = professional.portfolioItems && professional.portfolioItems.length > 0
    ? professional.portfolioItems
    : allProjects
        .filter(p => p.category?.toLowerCase() === professional.jobCategory?.toLowerCase() || p.title)
        .slice(0, 4)
        .map(p => ({
          id: p.id,
          title: p.title,
          imageUrl: p.imageUrl,
          category: p.category,
          description: `Showcase project by ${professional.fullName} in ${p.category}.`
        }));

  const handleRateClick = () => {
    if (!auth.currentUser) {
      showToast('Please sign in to rate this professional', 'error');
      if (onLoginPrompt) onLoginPrompt();
      return;
    }
    setShowRatingModal(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${professional.fullName} - ${professional.jobCategory}`,
          text: `Check out ${professional.fullName}'s verified portfolio on iDEA Creation Hub!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Profile link copied to clipboard!', 'success');
      }
    } catch {
      // User cancelled share
    }
  };

  const directWhatsAppUrl = `https://wa.me/${professional.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${professional.fullName}, I saw your verified profile on iDEA Creation Hub and would like to discuss a project with you.`
  )}`;

  return (
    <div className="min-h-screen bg-[#0A192F] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-amber-400 font-semibold text-sm sm:text-base transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-400/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Back to All Professionals</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer"
            title="Share Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Profile</span>
          </button>
        </div>

        {/* Hero Profile Header Card */}
        <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden mb-10">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            
            {/* Professional Picture */}
            <div className="relative shrink-0 group">
              <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-400/30 bg-[#0A192F] shadow-2xl relative">
                <img
                  src={professional.picture}
                  alt={professional.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-[#0A192F] p-2 rounded-xl shadow-lg border-2 border-[#0A192F] flex items-center gap-1.5" title="Verified iDEA Talent">
                <CheckCircle2 className="w-5 h-5 fill-current text-[#0A192F]" />
                <span className="text-xs font-black tracking-wider uppercase pr-1 hidden sm:inline">Verified</span>
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/15 border border-amber-400/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Verified Talent
                  </span>
                  {professional.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {professional.location}
                    </span>
                  )}
                  {professional.yearsOfExperience && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {professional.yearsOfExperience}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
                  {professional.fullName}
                </h1>
                
                <p className="text-lg sm:text-xl text-amber-400 font-semibold flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Award className="w-5 h-5 shrink-0" />
                  <span>{professional.jobCategory}</span>
                </p>

                {/* Star Rating Overview Badge */}
                <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 mb-6">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            averageRating >= star
                              ? 'fill-amber-400 text-amber-400'
                              : averageRating >= star - 0.5
                              ? 'fill-amber-400/50 text-amber-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-base sm:text-lg font-black text-white ml-1">
                      {totalReviews > 0 ? averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400">
                      ({totalReviews} {totalReviews === 1 ? 'client review' : 'client reviews'})
                    </span>
                  </div>

                  <button
                    onClick={handleRateClick}
                    className="text-xs font-bold px-3 py-1.5 bg-amber-400 text-[#0A192F] hover:bg-amber-300 rounded-lg transition-all shadow cursor-pointer flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {userRating ? 'Edit Review' : 'Rate Pro'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                {onChatClick && (
                  <button
                    onClick={() => onChatClick(professional)}
                    className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-400/20 active:scale-98 flex items-center gap-2.5 cursor-pointer text-sm sm:text-base"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Chat with {professional.fullName.split(' ')[0]}</span>
                  </button>
                )}

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center gap-2 text-sm sm:text-base"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${professional.phone}`}
                  className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2 text-sm sm:text-base"
                  title="Call Phone Number"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">{professional.phone}</span>
                </a>

                <a
                  href={`mailto:${professional.email}`}
                  className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2 text-sm sm:text-base"
                  title="Send Direct Email"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Email</span>
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 mb-8 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 py-3 px-5 text-sm sm:text-base font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Portfolio & Works ({portfolioList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 py-3 px-5 text-sm sm:text-base font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bio'
                ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Bio & Skills</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 py-3 px-5 text-sm sm:text-base font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Client Ratings ({totalReviews})</span>
          </button>
        </div>

        {/* Tab Content */}
        
        {/* TAB 1: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Showcase Portfolio</h2>
                <p className="text-sm text-gray-400">Featured projects and client deliverables created by {professional.fullName}.</p>
              </div>
            </div>

            {portfolioList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0A192F] border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-300 flex flex-col group shadow-lg"
                  >
                    <div 
                      className="relative aspect-video overflow-hidden bg-white/5 cursor-pointer"
                      onClick={() => setSelectedPortfolioItem(item)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {item.category && (
                        <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-400 text-[#0A192F] rounded-md shadow">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 mb-4">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPortfolioItem(item)}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                        </button>
                        
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                          >
                            <span>Live Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <Layers className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Portfolio in Progress</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  {professional.fullName} has not added custom project items yet. You can chat or call directly to request samples.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BIO & SKILLS */}
        {activeTab === 'bio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Biography narrative */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span>About {professional.fullName}</span>
                </h2>
                
                <div className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {professional.bio || (
                    <p>
                      {professional.fullName} is a verified {professional.jobCategory} collaborating with iDEA Creation Hub. 
                      With demonstrated mastery in {professional.skills.join(', ')}, they deliver high-impact results for commercial and creative endeavors.
                    </p>
                  )}
                </div>
              </div>

              {/* Skills and technical expertise */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Core Skills & Specialties</h3>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {professional.skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3.5 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar quick info card */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 pb-2 border-b border-white/10">
                  Professional Details
                </h3>

                <ul className="space-y-3.5 text-xs sm:text-sm">
                  <li className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-semibold text-white">{professional.jobCategory}</span>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Experience:</span>
                    <span className="font-semibold text-white">{professional.yearsOfExperience || '5+ Years'}</span>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Location:</span>
                    <span className="font-semibold text-white">{professional.location || 'Nigeria & Remote'}</span>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Status:</span>
                    <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Available for hire
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Vetting:</span>
                    <span className="text-amber-400 font-semibold">iDEA Certified</span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => onChatClick && onChatClick(professional)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Direct Message</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CLIENT RATINGS & REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Rating Summary Breakdown Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* Score badge */}
                <div className="text-center md:border-r md:border-white/10 md:pr-8">
                  <div className="text-5xl sm:text-6xl font-black text-amber-400 mb-2">
                    {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex justify-center text-amber-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          averageRating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : averageRating >= star - 0.5
                            ? 'fill-amber-400/50 text-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-400">
                    Based on {totalReviews} client {totalReviews === 1 ? 'rating' : 'ratings'}
                  </p>
                  
                  <button
                    onClick={handleRateClick}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold rounded-xl transition-all shadow text-xs sm:text-sm cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>{userRating ? 'Edit Your Review' : 'Write a Review'}</span>
                  </button>
                </div>

                {/* Progress bars */}
                <div className="md:col-span-2 space-y-2.5">
                  {starCounts.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-3 text-xs sm:text-sm">
                      <span className="w-12 font-semibold text-gray-300 flex items-center gap-1 shrink-0">
                        <span>{stars}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                      
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <span className="w-12 text-right text-gray-400 font-mono text-xs shrink-0">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Individual Reviews List */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Client Feedback & Reviews</h3>

              {profRatings.length > 0 ? (
                <div className="space-y-4">
                  {profRatings.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 transition-all hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-400 font-bold flex items-center justify-center text-sm">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm sm:text-base">{review.userName}</h4>
                            <span className="text-[11px] text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex text-amber-400 shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                review.rating >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment ? (
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                          "{review.comment}"
                        </p>
                      ) : (
                        <p className="text-gray-500 italic text-xs">
                          Rated {review.rating} out of 5 stars with no written comment.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <Star className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-white mb-1">No Reviews Yet</h4>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-4">
                    Be the first client to work with {professional.fullName} and leave a rating!
                  </p>
                  <button
                    onClick={handleRateClick}
                    className="px-4 py-2 bg-amber-400 text-[#0A192F] font-bold rounded-xl text-xs hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    Rate {professional.fullName}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Portfolio Item Detail Lightbox / Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A192F] border border-white/20 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedPortfolioItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-black/40 overflow-hidden relative">
              <img
                src={selectedPortfolioItem.imageUrl}
                alt={selectedPortfolioItem.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6">
              {selectedPortfolioItem.category && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                  {selectedPortfolioItem.category}
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-3">
                {selectedPortfolioItem.title}
              </h3>
              {selectedPortfolioItem.description && (
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {selectedPortfolioItem.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400">Created by {professional.fullName}</span>
                {selectedPortfolioItem.projectUrl && (
                  <a
                    href={selectedPortfolioItem.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-[#0A192F] font-bold rounded-xl text-xs hover:bg-amber-300 transition-all"
                  >
                    <span>Visit Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          professional={professional}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}
