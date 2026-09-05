import { useState } from 'react';
import { 
  Palette, MonitorPlay, Code, Camera, Share2, PenTool, 
  Building2, Layers, ShoppingBag, ArrowRight, CheckCircle2, 
  Clock, Sparkles, Filter, ShieldCheck, Star, Target, Cpu
} from 'lucide-react';
import { AppView } from '../components/Navbar';

export interface ServiceDetail {
  id: string;
  title: string;
  category: string;
  desc: string;
  icon: any;
  deliverables: string[];
  timeline: string;
  startingPrice: string;
  popular?: boolean;
}

export const detailedServices: ServiceDetail[] = [
  {
    id: 'graphic-design',
    title: 'Graphic Design & Brand Identity',
    category: 'Branding & Design',
    desc: 'Distinctive visual identities, logos, brand style guidelines, marketing banners, and print collateral tailored to your unique audience.',
    icon: Palette,
    deliverables: ['Vector Logo Files (AI, SVG, PNG)', 'Brand Guidelines & Typography', 'Social Media Branding Kit', 'Print-Ready Formats'],
    timeline: '2 - 4 Days',
    startingPrice: 'From ₦25,000 / $35',
    popular: true
  },
  {
    id: 'video-editing',
    title: 'Video Editing & Motion Graphics',
    category: 'Media Production',
    desc: 'High-impact video post-production, TikTok/Reels viral cuts, YouTube editing, color grading, sound mixing, and animated motion titles.',
    icon: MonitorPlay,
    deliverables: ['Full HD & 4K Master Exports', 'Platform Aspect Ratios (9:16, 16:9)', 'Subtitles & Dynamic Captions', 'Licensed Music & SFX'],
    timeline: '2 - 5 Days',
    startingPrice: 'From ₦30,000 / $45',
    popular: true
  },
  {
    id: 'development-it',
    title: 'Development & IT',
    category: 'Development & IT',
    desc: 'Custom, blazing-fast responsive websites, API architectures, custom software portals, and robust cloud/hosting deployments.',
    icon: Code,
    deliverables: ['Responsive Web App / Portal', 'Robust Backend & API Setup', 'Database & Auth Systems', 'Free Deployment & Domain Linkage'],
    timeline: '5 - 14 Days',
    startingPrice: 'From ₦80,000 / $120',
    popular: true
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    category: 'Marketing',
    desc: 'Strategic social calendar management, premium content generation, audience engagement campaigns, and growth tracking across platforms.',
    icon: Share2,
    deliverables: ['Monthly Strategy & Content Calendar', 'Original Premium Graphic & Video Posts', 'Community Engagement & Outreach', 'Growth Performance Reports'],
    timeline: 'Ongoing / Monthly',
    startingPrice: 'From ₦50,000 / $75',
    popular: true
  },
  {
    id: 'google-ads-expert',
    title: 'Google Ads Expert',
    category: 'Marketing',
    desc: 'High-performing pay-per-click (PPC) search engine marketing, target display ads, retargeting campaigns, and high-ROI conversion setup.',
    icon: Target,
    deliverables: ['Custom PPC Ad Strategy', 'Keyword Research & Competitor Audit', 'Ad Copywriting & Asset Setup', 'A/B Performance Testing & Reports'],
    timeline: '3 - 7 Days Setup',
    startingPrice: 'From ₦45,000 / $65'
  },
  {
    id: 'content-writing',
    title: 'Content Writing',
    category: 'Content & Writing',
    desc: 'Compelling SEO blog articles, newsletter sequences, website copy, professional pitches, and sales content to engage and convert readers.',
    icon: PenTool,
    deliverables: ['High-Converting Sales/Blog Copy', 'SEO Keyword Optimization', 'Email Campaigns & Newsletters', 'Revisions & Tone Matching'],
    timeline: '2 - 4 Days',
    startingPrice: 'From ₦20,000 / $30'
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    category: 'AI & Automation',
    desc: 'Seamless AI integrations, customized OpenAI/Gemini agents, auto-responder bots, and smart workflow automations to 10x business productivity.',
    icon: Cpu,
    deliverables: ['AI Chatbot or API Integration', 'Workflow Automation (Zapier/Make)', 'Prompt Engineering & System Tuning', 'Integration Documentation & Hand-off'],
    timeline: '4 - 10 Days',
    startingPrice: 'From ₦75,000 / $110',
    popular: true
  },
  {
    id: 'architecture',
    title: 'Architectural Design & 3D Modeling',
    category: 'Engineering & 3D',
    desc: 'Creative architectural planning, 2D floor plans, 3D photorealistic exterior & interior rendering, and structural visualizations.',
    icon: Building2,
    deliverables: ['2D AutoCAD / PDF Plans', '3D Photorealistic Renders', 'Walkthrough Animation Options', 'Interior & Exterior Models'],
    timeline: '7 - 21 Days',
    startingPrice: 'From ₦100,000 / $150'
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Product Design',
    category: 'Branding & Design',
    desc: 'Intuitive user experiences, wireframing, high-fidelity Figma prototypes, design systems, and user testing for apps and platforms.',
    icon: Layers,
    deliverables: ['Interactive Figma Prototype', 'Design Component System', 'User Flow & Wireframes', 'Developer Hand-off Specs'],
    timeline: '5 - 12 Days',
    startingPrice: 'From ₦65,000 / $95'
  }
];

interface ServicesPageProps {
  onNavigate: (view: AppView) => void;
  onSelectOrderService: (serviceTitle: string) => void;
}

export function ServicesPage({ onNavigate, onSelectOrderService }: ServicesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Branding & Design', 'Media Production', 'Development & IT', 'Marketing', 'Content & Writing', 'AI & Automation', 'Engineering & 3D'];

  const filteredServices = selectedCategory === 'All' 
    ? detailedServices 
    : detailedServices.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(s.category.toLowerCase()));

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
          <span className="text-indigo-600 font-semibold">Services & Skills</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Verified Professional Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Our Services & <span className="text-indigo-600">Specialized Skills</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
            Select any service below to view deliverables, turnaround times, and immediately place an order with our verified specialists.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mt-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-white/80 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-600/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="bg-white/90 border border-gray-200/80 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-indigo-600/40 transition-all duration-300 relative group"
              >
                {service.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-600 text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                    <Icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>

                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1 block">
                    {service.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    {service.desc}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What's Included</div>
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mb-6">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{service.timeline}</span>
                    </div>
                    <div className="font-bold text-gray-900">
                      {service.startingPrice}
                    </div>
                  </div>
                </div>

                {/* Prominent Order Service Button redirecting to dedicated Order Page */}
                <div>
                  <button
                    onClick={() => onSelectOrderService(service.title)}
                    className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer group/btn"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Service</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-100 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">100% Satisfaction Guarantee</h4>
                <p className="text-xs sm:text-sm text-gray-600">Every project includes revision milestones until expectations are met.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Guaranteed Deadlines</h4>
                <p className="text-xs sm:text-sm text-gray-600">Our creators adhere to agreed timelines with proactive progress reports.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Direct Communication</h4>
                <p className="text-xs sm:text-sm text-gray-600">Chat and collaborate directly with your assigned creative specialist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
