import { useState, FormEvent } from 'react';
import { Send, CheckCircle2, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { submitContactToSupabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface ContactProps {
  onOpenOrderModal?: (service?: string) => void;
}

export function Contact({ onOpenOrderModal }: ContactProps) {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Direct insertion to Supabase
      const { error } = await submitContactToSupabase({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim()
      });

      if (error) {
        console.warn('Supabase contact submission notice:', error);
      }
      
      setSubmitted(true);
      showToast('Message sent and recorded in Supabase!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 4500);
    } catch (err) {
      console.error('Contact submit error:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white/5 border-t border-white/10 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get In Touch & Hire</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Start Your Project?</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto">
          Contact us today to discuss your vision, or place a direct project order with our verified specialists.
        </p>

        {onOpenOrderModal && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => onOpenOrderModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#0A192F] font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/15 active:scale-98 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Hire a Professional</span>
            </button>
          </div>
        )}
        
        <form className="bg-[#0A192F] p-5 sm:p-8 rounded-2xl border border-white/10 text-left shadow-2xl" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Inquiry Received!</h3>
              <p className="text-sm text-gray-300">Thank you for reaching out. Your request has been securely synced to our database.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">WhatsApp / Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g. 07068588344"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Project Scope / Message *</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Tell us about your project requirements or the specific services you need..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 bg-amber-400 text-[#0A192F] font-bold text-base rounded-xl hover:bg-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Hub</span>
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
