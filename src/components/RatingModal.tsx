import { useState, FormEvent } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Professional, Rating } from '../types';
import { useToast } from '../contexts/ToastContext';

interface RatingModalProps {
  professional: Professional;
  existingRating?: Rating;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function RatingModal({ professional, existingRating, onClose, onSubmitted }: RatingModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(existingRating?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  const labels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Quality',
    4: 'Very Good Service',
    5: 'Outstanding & Highly Recommended'
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please log in to submit a rating', 'error');
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('Please select a star rating between 1 and 5', 'error');
      return;
    }

    setLoading(true);
    const ratingId = `${professional.id}_${currentUser.uid}`;
    const now = new Date().toISOString();

    try {
      await setDoc(doc(db, 'ratings', ratingId), {
        id: ratingId,
        profId: professional.id,
        profName: professional.fullName,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Client',
        rating,
        comment: comment.trim(),
        createdAt: now
      });

      showToast(`Thank you! You rated ${professional.fullName} ${rating} stars.`, 'success');
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      showToast(error.message || 'Failed to submit rating', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0A192F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
            {professional.picture ? (
              <img src={professional.picture} alt={professional.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xl">
                {professional.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">Rate Professional</span>
            <h3 className="text-xl font-bold text-white">{professional.fullName}</h3>
            <p className="text-xs sm:text-sm text-gray-400">{professional.jobCategory}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-xs text-gray-300 font-medium mb-3">How was your experience working with {professional.fullName.split(' ')[0]}?</p>
            
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
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    aria-label={`Rate ${starValue} stars`}
                  >
                    <Star 
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                        active 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                          : 'text-gray-600 hover:text-gray-400'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-semibold text-amber-300">
              {labels[hoverRating || rating] || 'Select your rating'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Review / Feedback <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience, work quality, timely delivery, or communication..."
              className="w-full px-4 py-3 bg-[#0A192F] border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#0A192F] text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : (existingRating ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
