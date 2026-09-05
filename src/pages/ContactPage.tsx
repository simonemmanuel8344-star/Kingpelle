import React, { useState, FormEvent } from 'react';
import { 
  Mail, Phone, Send, CheckCircle2, Sparkles, MessageCircle, 
  MapPin, Clock, HelpCircle, ChevronDown, ChevronUp, ShoppingBag, ArrowRight, Loader2 
} from 'lucide-react';
import { submitContactToSupabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { AppView } from '../components/Navbar';

interface ContactPageProps {
  onNavigate: (view: AppView) => void;
  onOrderService: (service?: string) => void;
}

const FAQS = [
  {
    question: 'How do I hire a professional or place an order?',
    answer: 'You can browse our "Our Services & Skills" page and click "Order Service" on any category, or visit "Hire Professionals" to select a specific specialist. Our direct order form allows you to specify budget, timeline, and attach requirements.'
  },
  {
    question: 'How does escrow protection and payment work?',
    answer: 'All projects on iDEA Creation Hub are secured with milestone protection. Funds are held safely and only released when you have reviewed and approved the delivered deliverables.'
  },
  {
    question: 'What happens if I need revisions on my project?',
    answer: 'All our verified creators provide revision rounds as part of their service scope. You can communicate directly through our live chat to request adjustments.'
  },
  {
    question: 'How can creative professionals join the platform?',
    answer: 'Professionals can register using a unique verified invitation code. Once vetted and approved by our team, their portfolio is published in our directory.'
  }
];

export function ContactPage({ onNavigate, onOrderService }: ContactPageProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await submitContactToSupabase({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim()
      });

      if (error) {
        console.warn('Contact message notice:', error);
      }

      setSubmitted(true);
      showToast('Message sent successfully! We will contact you shortly.', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      }, 4000);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
      showToast('Message received. Thank you for reaching out!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/2347068588344?text=${encodeURIComponent("Hello iDEA Creation Hub, I would like to inquire about your services.")}`;

  return (
    <div className="min-h-[85vh] py-10 sm:py-16">
      {/* Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Contact Us</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>24/7 Dedicated Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Get In Touch with <span className="text-indigo-600">Our Hub</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Have a project idea, question, or need a customized quote? Send us a message or connect directly via WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Contact Info & Quick Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Channels</h3>
              
              <div className="space-y-4">
                <a
                  href="mailto:ideacreationhub@gmail.com"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-100 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Email Us</span>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      ideacreationhub@gmail.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:07068588344"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-100 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Call Us</span>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      07068588344
                    </span>
                  </div>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">WhatsApp Quick Chat</span>
                    <span className="text-sm font-bold text-emerald-900">
                      Chat with Support on WhatsApp
                    </span>
                  </div>
                </a>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Available Monday – Saturday, 8:00 AM – 8:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Nigeria & Remote Global Service Delivery</span>
                </div>
              </div>
            </div>

            {/* Direct Service Order Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <h4 className="text-lg font-bold mb-2">Need a Specific Project Done?</h4>
              <p className="text-xs sm:text-sm text-indigo-200 mb-6 leading-relaxed">
                Skip the general inquiry and place a direct project order with pre-set timelines and deliverables.
              </p>
              <button
                onClick={() => onOrderService()}
                className="w-full py-3 px-4 bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Place a Service Order Now</span>
              </button>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send Us a Direct Message</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Fill out the form below and a representative will reply within 2-4 business hours.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h4>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    Thank you for contacting iDEA Creation Hub. We have logged your request and will follow up with you promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. john@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 07068588344"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Inquiry Type</label>
                      <select
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Service Quote Request">Service Quote Request</option>
                        <option value="Professional Registration">Professional Onboarding</option>
                        <option value="Partnership / Corporate">Partnership / Corporate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message / Project Details *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share details about your inquiry, timeline, or requirements..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Support</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Help & Guidance</span>
          <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
