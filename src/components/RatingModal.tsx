import { useState, FormEvent, useEffect } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { supabase, getStoredUser, getActiveUser } from '../lib/supabase';
import { Professional, Rating } from '../types';
import { useToast } from '../contexts/ToastContext';

interface RatingModalProps {
  professional: Professional;
  existingRating?: Rating;
  currentUser?: any;
  onClose: () => void;
  onSubmitted?: (ratingData?: Rating) => void;
}

export function RatingModal({ professional, existingRating, currentUser: propUser, onClose, onSubmitted }: RatingModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(existingRating?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [loading, setLoading] = useState(false);
  
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
    };
    window.addEventListener('idea_hub_auth_changed', handleAuthChange);
    return () => window.removeEventListener('idea_hub_auth_changed', handleAuthChange);
  }, [propUser]);

  const labels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Quality',
    4: 'Very Good Service',
    5: 'Outstanding & Highly Recommended'
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const activeUser = currentUser || propUser || getStoredUser();
    if (!activeUser) {
      showToast('Please sign in or register to submit a rating', 'error');
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('Please select a star rating between 1 and 5', 'error');
      return;
    }

    setLoading(true);

    const now = new Date().toISOString();
    const userId = activeUser.id || 'usr_' + Date.now();
    const userName = activeUser.user_metadata?.full_name || activeUser.fullName || activeUser.email?.split('@')[0] || 'Client';
    const ratingRecord: Rating = {
      id: existingRating?.id || `${professional.id}_${userId}`,
      profId: professional.id,
      userId,
      userName,
      rating,
      comment: comment.trim(),
      createdAt: now
    };

    try {
      // 1. Save to Supabase ratings table
      const payload = {
        prof_id: professional.id,
        user_id: userId,
        user_name: userName,
        rating,
        comment: comment.trim(),
        created_at: now
      };
      
      try {
        await supabase.from('ratings').upsert(payload, { onConflict: 'prof_id,user_id' });
      } catch (sbErr) {
        console.warn('Supabase rating upsert warning:', sbErr);
      }

      // 2. Cache locally to guarantee instant persistence
      try {
        const rawLocal = localStorage.getItem('idea_hub_local_ratings');
        const list: Rating[] = rawLocal ? JSON.parse(rawLocal) : [];
        const filtered = list.filter(r => !(r.profId === professional.id && r.userId === userId));
        filtered.push(ratingRecord);
        localStorage.setItem('idea_hub_local_ratings', JSON.stringify(filtered));
      } catch (storageErr) {
        console.warn('Local ratings caching error:', storageErr);
      }

      // 3. Dispatch event to update all active views
      window.dispatchEvent(new CustomEvent('idea_hub_rating_submitted', { detail: ratingRecord }));

      showToast(`Thank you! You rated ${professional.fullName} ${rating} stars.`, 'success');
      if (onSubmitted) onSubmitted(ratingRecord);
      onClose();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      showToast(error.message || 'Failed to submit rating', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {professional.picture ? (
              <img src={professional.picture || undefined} alt={professional.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {professional.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">Rate Professional</span>
            <h3 className="text-xl font-bold text-gray-900">{professional.fullName}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{professional.jobCategory}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <p className="text-xs text-gray-700 font-medium mb-3">How was your experience working with {professional.fullName.split(' ')[0]}?</p>
            
            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const active = (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                    aria-label={`Rate ${starValue} stars`}
                  >
                    <Star 
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                        active 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-md' 
                          : 'text-gray-300 hover:text-gray-400'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-bold text-indigo-600">
              {labels[hoverRating || rating] || 'Select your rating'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              Review / Feedback <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience, work quality, timely delivery, or communication..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting...' : (existingRating ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

