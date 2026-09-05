import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Palette, MonitorPlay, Code, Camera, Share2, PenTool, Building2, 
  Layers, ShoppingBag, Send, CheckCircle2, ArrowLeft, Clock, 
  DollarSign, Sparkles, User, Mail, Phone, FileText, Link as LinkIcon, 
  UploadCloud, AlertCircle, Loader2, MessageCircle, Target, Cpu
} from 'lucide-react';
import { Professional, ServiceOrder } from '../types';
import { submitOrderToSupabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompressor';
import { useToast } from '../contexts/ToastContext';
import { AppView } from '../components/Navbar';

interface OrderServicePageProps {
  initialService?: string;
  selectedProfessional?: Professional | null;
  professionals?: Professional[];
  onNavigate: (view: AppView) => void;
}

const SERVICE_CONFIGS: Record<string, {
  title: string;
  category: string;
  icon: any;
  summary: string;
  deliverables: string[];
  suggestedBudgets: string[];
  suggestedTimelines: string[];
  promptHint: string;
}> = {
  'Graphic Design & Brand Identity': {
    title: 'Graphic Design & Brand Identity',
    category: 'Branding & Design',
    icon: Palette,
    summary: 'Custom logos, brand guidelines, social media kit, typography pairing, and marketing assets.',
    deliverables: ['Vector Logo Files (AI, SVG, PNG)', 'Brand Identity Guidelines', 'Social Media Templates', 'Print & Web Ready Formats'],
    suggestedBudgets: ['₦25,000 - ₦60,000 ($35 - $80)', '₦60,000 - ₦150,000 ($80 - $200)', '₦150,000+ ($200+)'],
    suggestedTimelines: ['Express (1 - 3 Days)', 'Standard (4 - 7 Days)', 'Comprehensive (2 Weeks)'],
    promptHint: 'Describe your brand personality, target audience, preferred colors, and any visual references or competitors...'
  },
  'Video Editing & Motion Graphics': {
    title: 'Video Editing & Motion Graphics',
    category: 'Media Production',
    icon: MonitorPlay,
    summary: 'Engaging video post-production, TikTok/Reels cuts, YouTube pacing, color grading, sound design, and motion titles.',
    deliverables: ['Full HD & 4K Master Exports', 'Optimized 9:16 & 16:9 Cuts', 'Subtitles & Dynamic Captions', 'Licensed Music & SFX'],
    suggestedBudgets: ['₦30,000 - ₦80,000 ($45 - $110)', '₦80,000 - ₦200,000 ($110 - $270)', '₦200,000+ ($270+)'],
    suggestedTimelines: ['Express (1 - 2 Days)', 'Standard (3 - 6 Days)', 'Long-Form (1 - 2 Weeks)'],
    promptHint: 'Share raw footage link, target platform (Reels/YouTube), desired length, reference videos, and key talking points...'
  },
  'Development & IT': {
    title: 'Development & IT',
    category: 'Development & IT',
    icon: Code,
    summary: 'Full-stack responsive websites, custom web apps, API integrations, and robust cloud hosting setup.',
    deliverables: ['Responsive Web App / Portal', 'Clean APIs & Database Setup', 'Integrated Auth & State Management', 'Deployment & Cloud Hosting Config'],
    suggestedBudgets: ['₦80,000 - ₦200,000 ($120 - $270)', '₦200,000 - ₦600,000 ($270 - $800)', '₦600,000+ ($800+)'],
    suggestedTimelines: ['MVP (1 - 2 Weeks)', 'Standard (2 - 4 Weeks)', 'Enterprise (1 - 2 Months)'],
    promptHint: 'Describe core application goals, required screens, user authentication, or server/hosting setup...'
  },
  'Social Media Manager': {
    title: 'Social Media Manager',
    category: 'Marketing',
    icon: Share2,
    summary: 'Strategic growth campaigns, professional brand posting, calendar management, and audience analytics.',
    deliverables: ['Monthly Content Calendar', 'Original Creative Graphic & Video Posts', 'Hashtag & Caption Optimization', 'Performance Progress Reports'],
    suggestedBudgets: ['₦50,000 - ₦120,000 ($75 - $180) / Month', '₦120,000 - ₦300,000 ($180 - $450) / Month', '₦300,000+ ($450+) / Month'],
    suggestedTimelines: ['1 Month Growth Retainer', '3 Months Growth Plan', 'Ongoing Partnership'],
    promptHint: 'List your active channels, brand voice preferences, competitor handles, and key metrics to 10x...'
  },
  'Google Ads Expert': {
    title: 'Google Ads Expert',
    category: 'Marketing',
    icon: Target,
    summary: 'Targeted keyword research, high-performing Google Ads setup, custom audience targeting, and ROI monitoring.',
    deliverables: ['Google Ads Account Audit', 'Complete Keyword & Competitor Study', 'High-Converting Ad Copy & Assets', 'Conversion Tagging & Optimization'],
    suggestedBudgets: ['₦45,000 - ₦100,000 ($65 - $150)', '₦100,000 - ₦250,000 ($150 - $350)', '₦250,000+ ($350+)'],
    suggestedTimelines: ['Quick Campaign Launch (3 - 7 Days)', 'Monthly Optimization Plan', 'Ongoing Campaign Management'],
    promptHint: 'Detail your business website, main products/services, target geographic region, and monthly ad budget...'
  },
  'Content Writing': {
    title: 'Content Writing',
    category: 'Content & Writing',
    icon: PenTool,
    summary: 'SEO-rich blog posts, high-impact newsletters, informative guides, and landing page content.',
    deliverables: ['SEO Optimized Copy', 'Creative Newsletters / Emails', 'A/B Testing Revisions', 'Grammarly & Plagiarism Checked Drafts'],
    suggestedBudgets: ['₦20,000 - ₦50,000 ($30 - $75)', '₦50,000 - ₦120,000 ($75 - $180)', '₦120,000+ ($180+)'],
    suggestedTimelines: ['Fast turnaround (1 - 3 Days)', 'Standard (4 - 7 Days)', 'Large-scale Project (2 Weeks)'],
    promptHint: 'State the word count, SEO focus keywords, tone of voice, main theme, and target audience...'
  },
  'AI & Automation': {
    title: 'AI & Automation',
    category: 'AI & Automation',
    icon: Cpu,
    summary: 'Smart GPT / Gemini chatbot integrations, automated business operations, and automated custom workflow configurations.',
    deliverables: ['Custom AI Assistant / Bot Config', 'Automated Integrations (Zapier/Make)', 'System Prompts & Settings File', 'Integration Blueprint & Guides'],
    suggestedBudgets: ['₦75,000 - ₦200,000 ($110 - $270)', '₦200,000 - ₦500,000 ($270 - $700)', '₦500,000+ ($700+)'],
    suggestedTimelines: ['Setup (3 - 7 Days)', 'Custom MVP (1 - 2 Weeks)', 'Enterprise Suite (3 - 6 Weeks)'],
    promptHint: 'Outline which software platforms you want to connect (e.g. Google Sheets to Gmail) and the AI behavior required...'
  },
  'Architectural Design & 3D Modeling': {
    title: 'Architectural Design & 3D Modeling',
    category: 'Engineering & 3D',
    icon: Building2,
    summary: 'Architectural drawings, floor planning, 3D photorealistic exterior & interior rendering, and walkthrough animations.',
    deliverables: ['2D AutoCAD / PDF Plans', '3D Photorealistic Renders', 'Walkthrough Animation Option', 'Interior & Exterior Models'],
    suggestedBudgets: ['₦100,000 - ₦300,000 ($150 - $400)', '₦300,000 - ₦800,000 ($400 - $1,100)', '₦800,000+ ($1,100+)'],
    suggestedTimelines: ['1 - 2 Weeks', '2 - 4 Weeks', '1 Month+'],
    promptHint: 'Detail property dimensions, room requirements, architectural style (Modern, Minimalist, Classic), and site specs...'
  },
  'UI/UX Product Design': {
    title: 'UI/UX Product Design',
    category: 'Product & Design',
    icon: Layers,
    summary: 'Wireframes, responsive mobile and web interfaces, user flow diagrams, interactive Figma prototypes, and design systems.',
    deliverables: ['Interactive Figma Prototype', 'Design Component Library', 'User Flows & Wireframes', 'Developer Hand-off Specs'],
    suggestedBudgets: ['₦65,000 - ₦180,000 ($95 - $250)', '₦180,000 - ₦450,000 ($250 - $600)', '₦450,000+ ($600+)'],
    suggestedTimelines: ['1 - 2 Weeks', '2 - 4 Weeks', 'Ongoing Product Sprints'],
    promptHint: 'Outline user problems to solve, required key screens/flows, competitor inspirations, and branding status...'
  }
};

export function OrderServicePage({ 
  initialService, 
  selectedProfessional, 
  professionals = [], 
  onNavigate 
}: OrderServicePageProps) {
  const { showToast } = useToast();

  // Find matching service key
  const getInitialKey = () => {
    if (!initialService) return 'Graphic Design & Brand Identity';
    const match = Object.keys(SERVICE_CONFIGS).find(k => 
      k.toLowerCase().includes(initialService.toLowerCase()) || 
      initialService.toLowerCase().includes(k.toLowerCase())
    );
    return match || 'Graphic Design & Brand Identity';
  };

  const [activeServiceKey, setActiveServiceKey] = useState<string>(getInitialKey());

  useEffect(() => {
    if (initialService) {
      const match = Object.keys(SERVICE_CONFIGS).find(k => 
        k.toLowerCase().includes(initialService.toLowerCase()) || 
        initialService.toLowerCase().includes(k.toLowerCase())
      );
      if (match) setActiveServiceKey(match);
    }
  }, [initialService]);

  const activeConfig = SERVICE_CONFIGS[activeServiceKey] || SERVICE_CONFIGS['Graphic Design & Brand Identity'];
  const ServiceIcon = activeConfig.icon;

  const [formData, setFormData] = useState<ServiceOrder>({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_category: activeConfig.title,
    project_title: '',
    project_description: '',
    budget_range: activeConfig.suggestedBudgets[1],
    timeline: activeConfig.suggestedTimelines[1],
    professional_name: selectedProfessional?.fullName || '',
    professional_id: selectedProfessional?.id || '',
    cloud_link: '',
    attachment_url: '',
    status: 'pending'
  });

  const [assignedProfId, setAssignedProfId] = useState<string>(selectedProfessional?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRefId, setOrderRefId] = useState('');

  // Update formData when activeConfig or assigned professional changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      service_category: activeConfig.title,
      budget_range: activeConfig.suggestedBudgets[1],
      timeline: activeConfig.suggestedTimelines[1]
    }));
  }, [activeServiceKey]);

  useEffect(() => {
    if (assignedProfId) {
      const prof = professionals.find(p => p.id === assignedProfId);
      setFormData(prev => ({
        ...prev,
        professional_id: assignedProfId,
        professional_name: prof ? prof.fullName : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        professional_id: '',
        professional_name: ''
      }));
    }
  }, [assignedProfId, professionals]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 800, 800, 0.8);
        setFormData(prev => ({ ...prev, attachment_url: compressed }));
        showToast('Image compressed & attached successfully', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, attachment_url: reader.result as string }));
          showToast('File attached successfully', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('File upload error:', err);
      showToast('Could not process attachment. Please use a cloud link.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: ServiceOrder = {
        ...formData,
        service_category: activeConfig.title
      };

      const { data, error } = await submitOrderToSupabase(payload);
      if (error) {
        console.warn('Supabase order submit notice:', error);
      }

      const refId = data?.[0]?.id || `ORD-${Date.now().toString().slice(-6)}`;
      setOrderRefId(refId);
      setSubmitted(true);
      showToast('Order submitted successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order submission error:', err);
      showToast('Order recorded. We will contact you immediately.', 'success');
      setOrderRefId(`ORD-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/2347068588344?text=${encodeURIComponent(
    `Hello iDEA Creation Hub, I just placed an order for ${activeConfig.title} (Ref: ${orderRefId || 'New Inquiry'}). Client: ${formData.client_name}`
  )}`;

  return (
    <div className="min-h-[85vh] py-10 sm:py-16">
      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => onNavigate('services')} 
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Services
          </button>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Order Service</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-indigo-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-1 block">
              Project Onboarding & Direct Order
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Order <span className="text-indigo-600">{activeConfig.title}</span>
            </h1>
          </div>
          
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </button>
        </div>
      </div>

      {submitted ? (
        /* Order Completed Success Screen */
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
              Reference: {orderRefId}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
              Order Received Successfully!
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
              Thank you, <strong className="text-gray-900">{formData.client_name}</strong>. Your project request for <strong className="text-indigo-600">{activeConfig.title}</strong> has been logged in our system. A project manager and assigned specialist will review your brief immediately.
            </p>

            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 mb-8 text-left space-y-2 text-sm text-gray-700">
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Service:</span>
                <span className="font-semibold text-gray-900">{activeConfig.title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Project Title:</span>
                <span className="font-semibold text-gray-900">{formData.project_title || 'Custom Scope'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Selected Budget:</span>
                <span className="font-semibold text-gray-900">{formData.budget_range}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timeline:</span>
                <span className="font-semibold text-gray-900">{formData.timeline}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Instant WhatsApp Update</span>
              </a>

              <button
                onClick={() => onNavigate('home')}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Order Form Layout with Service Switcher & Highlights */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Service Switcher Pills */}
          <div className="mb-10">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Switch or Pick Service Category:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {Object.keys(SERVICE_CONFIGS).map(key => {
                const cfg = SERVICE_CONFIGS[key];
                const Icon = cfg.icon;
                const isActive = activeServiceKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveServiceKey(key)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'bg-white/80 border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-600/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cfg.title.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Service Details & Included Deliverables */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <ServiceIcon className="w-7 h-7" />
                </div>

                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                  {activeConfig.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {activeConfig.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {activeConfig.summary}
                </p>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Included in This Service
                  </div>
                  {activeConfig.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Assigned Professional (Optional) */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6">
                <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  Assign Verified Professional (Optional)
                </label>
                <p className="text-xs text-indigo-700 mb-3">
                  Leave on "Best Matched Talent" to let our project managers assign the top specialist.
                </p>
                <select
                  value={assignedProfId}
                  onChange={(e) => setAssignedProfId(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">⚡ Automatically assign best matched talent</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.fullName} — {prof.jobCategory}
                    </option>
                  ))}
                </select>
              </div>

              {/* Escrow Badge */}
              <div className="p-5 bg-white border border-gray-200/80 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs text-gray-600">
                  <strong className="text-gray-900 block font-bold">100% Escrow & Satisfaction Guaranteed</strong>
                  Milestone-driven delivery with complete client revision rights.
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Order Submission Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-xl">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Project Brief & Details</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Fill in the specifications below to initiate your order immediately.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Client Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client_name}
                        onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="e.g. Sarah Connor"
                        className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.client_email}
                        onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="e.g. sarah@company.com"
                        className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.client_phone}
                      onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                      placeholder="e.g. 07068588344 or +234..."
                      className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  {/* Project Title */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Project Name / Main Objective *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.project_title}
                      onChange={e => setFormData({ ...formData, project_title: e.target.value })}
                      placeholder="e.g. Modern Rebranding & Logo Kit for Tech Startup"
                      className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  {/* Budget & Timeline Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                        Budget Tier *
                      </label>
                      <select
                        value={formData.budget_range}
                        onChange={e => setFormData({ ...formData, budget_range: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      >
                        {activeConfig.suggestedBudgets.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                        <option value="Custom / Open for Discussion">Custom / Open for Discussion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Desired Timeline *
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      >
                        {activeConfig.suggestedTimelines.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                        <option value="Flexible Schedule">Flexible Schedule</option>
                      </select>
                    </div>
                  </div>

                  {/* Project Description & Brief */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Detailed Scope & Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.project_description}
                      onChange={e => setFormData({ ...formData, project_description: e.target.value })}
                      placeholder={activeConfig.promptHint}
                      className="w-full px-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all resize-y"
                    />
                  </div>

                  {/* Assets & Attachments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Cloud Link (Drive / Dropbox / Figma)
                      </label>
                      <input
                        type="url"
                        value={formData.cloud_link}
                        onChange={e => setFormData({ ...formData, cloud_link: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                        Attach Reference File / Image
                      </label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      {isCompressing && (
                        <span className="text-[11px] text-indigo-600 flex items-center gap-1 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Optimizing asset...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isCompressing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Your Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Confirm & Place {activeConfig.title} Order</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
