import React, { useState, ChangeEvent } from 'react';
import { X, CheckCircle2, ShoppingBag, Send, AlertCircle, Loader2, Sparkles, Link as LinkIcon, DollarSign, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { ServiceOrder } from '../types';
import { submitOrderToSupabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompressor';
import { useToast } from '../contexts/ToastContext';

interface OrderServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  professionalName?: string;
  professionalId?: string;
}

const SERVICE_OPTIONS = [
  'Graphic Design & Branding',
  'Web & Mobile Development',
  'Video Editing & Motion Graphics',
  'Photography & Commercial Media',
  'Social Media Management',
  'Copywriting & Content Creation',
  'Architectural Design & 3D Modeling',
  'UI/UX Product Design',
  'Custom Special Project'
];

const BUDGET_OPTIONS = [
  'Under ₦50,000 / $50',
  '₦50,000 - ₦150,000 / $100 - $200',
  '₦150,000 - ₦500,000 / $200 - $500',
  '₦500,000+ / $500+',
  'Custom / Negotiable'
];

const TIMELINE_OPTIONS = [
  'Urgent (1 - 3 days)',
  'Standard (1 - 2 weeks)',
  'Flexible (1 month+)',
  'Ongoing / Retainer'
];

export function OrderServiceModal({
  isOpen,
  onClose,
  initialService = '',
  professionalName,
  professionalId
}: OrderServiceModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ServiceOrder>({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_category: initialService || SERVICE_OPTIONS[0],
    project_title: '',
    project_description: '',
    budget_range: BUDGET_OPTIONS[1],
    timeline: TIMELINE_OPTIONS[1],
    professional_name: professionalName || '',
    professional_id: professionalId || '',
    cloud_link: '',
    attachment_url: '',
    status: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderRefId, setOrderRefId] = useState('');

  // Update default service if initialService prop changes
  React.useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, service_category: initialService }));
    }
    if (professionalName) {
      setFormData(prev => ({ ...prev, professional_name: professionalName, professional_id: professionalId || '' }));
    }
  }, [initialService, professionalName, professionalId]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 600, 600, 0.75);
        setFormData(prev => ({ ...prev, attachment_url: compressed }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, attachment_url: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error attaching file:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { data, error } = await submitOrderToSupabase(formData);

      if (error) {
        console.error('Supabase submission error:', error);
        setErrorMessage(error.message || 'Failed to submit order to Supabase. Please verify table permissions.');
        showToast('Supabase submission issue: ' + (error.message || 'Check database'), 'error');
      } else {
        const refId = data?.[0]?.id || `ORD-${Date.now().toString().slice(-6)}`;
        setOrderRefId(refId);
        setSubmitted(true);
        showToast('🎉 Order submitted to Supabase successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Submission catch error:', err);
      setErrorMessage(err.message || 'Failed to send order.');
      showToast('Error connecting to Supabase database', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      service_category: SERVICE_OPTIONS[0],
      project_title: '',
      project_description: '',
      budget_range: BUDGET_OPTIONS[1],
      timeline: TIMELINE_OPTIONS[1],
      cloud_link: '',
      attachment_url: '',
      status: 'pending'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0A192F] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0A192F]/95 backdrop-blur-md border-b border-white/10 p-5 sm:p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Hire a Professional</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Supabase Live
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {professionalName ? `Hiring ${professionalName}` : 'Hire top creators & verified professionals'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1">
          {submitted ? (
            <div className="text-center py-10 sm:py-14 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-white">Order Placed Successfully!</h4>
              <p className="text-sm sm:text-base text-gray-300 max-w-md mx-auto">
                Your order has been recorded into the Supabase database. Our team & professional will review the details and contact you via WhatsApp / Email promptly.
              </p>
              {orderRefId && (
                <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-amber-400">
                  Reference ID: {orderRefId}
                </div>
              )}
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-amber-400 text-[#0A192F] font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {errorMessage && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Submission Notice</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Service Category *
                </label>
                <select
                  required
                  value={formData.service_category}
                  onChange={e => setFormData({ ...formData, service_category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                >
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-[#0A192F] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Project Title / Summary *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Modern E-commerce Website Design, 3D Brand Logo"
                  value={formData.project_title}
                  onChange={e => setFormData({ ...formData, project_title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Contact Info (2-Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" />
                    Your Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Simon Emmanuel"
                    value={formData.client_name}
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" />
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={formData.client_email}
                    onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" />
                    WhatsApp / Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 07068588344"
                    value={formData.client_phone}
                    onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Budget and Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    Estimated Budget Range
                  </label>
                  <select
                    value={formData.budget_range}
                    onChange={e => setFormData({ ...formData, budget_range: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  >
                    {BUDGET_OPTIONS.map(b => (
                      <option key={b} value={b} className="bg-[#0A192F] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Target Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  >
                    {TIMELINE_OPTIONS.map(t => (
                      <option key={t} value={t} className="bg-[#0A192F] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                  Project Description & Specifications *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail your goals, branding guidelines, target audience, specific deliverable requirements..."
                  value={formData.project_description}
                  onChange={e => setFormData({ ...formData, project_description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Optional Reference or Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-amber-400" />
                    Reference Link / Google Drive / Figma
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.cloud_link}
                    onChange={e => setFormData({ ...formData, cloud_link: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sample / Mockup Image File (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-amber-400 file:text-[#0A192F]"
                  />
                  {isCompressing && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Optimizing image...
                    </span>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full py-3.5 sm:py-4 bg-amber-400 text-[#0A192F] font-bold text-base rounded-xl hover:bg-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
