import { ShieldCheck, Award, Sparkles, Target, Users, Zap, CheckCircle2, ArrowRight, HeartHandshake, Globe, ShoppingBag } from 'lucide-react';
import { AppView } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (view: AppView) => void;
  onOpenOrder: (service?: string) => void;
}

export function AboutPage({ onNavigate, onOpenOrder }: AboutPageProps) {
  return (
    <div className="min-h-[85vh] py-10 sm:py-16">
      {/* Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">About Us</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Building Solutions • Connecting Possibilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Empowering Visionaries & <span className="text-indigo-600">Top Creative Talent</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
            iDEA Creation Hub is a premier freelance and project execution marketplace dedicated to bridging the gap between innovative ideas and world-class digital craftsmanship.
          </p>
        </div>
      </div>

      {/* Main Story & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Our Mission
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Transforming Creative Potential into Real-World Impact
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Founded on the belief that talent is universal but opportunity is not, iDEA Creation Hub was engineered to provide businesses and individuals seamless access to verified professionals across graphic design, software engineering, video production, and architectural modeling.
            </p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Whether you are an entrepreneur launching your first venture or a growing enterprise scaling your marketing pipeline, our platform guarantees frictionless collaboration, milestone-driven quality, and guaranteed peace of mind.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('services')}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('professionals')}
                className="px-6 py-3.5 bg-white border border-gray-300 hover:border-indigo-600 text-gray-800 hover:text-indigo-600 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Meet Our Talents</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
                alt="iDEA Creation Hub Team Collaboration" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating highlight card */}
            <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md border border-gray-200 p-5 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">100% Verified</div>
                  <div className="text-xs text-gray-500">Every specialist is pre-screened for excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values / Pillars */}
      <div className="bg-white/60 border-y border-gray-200/60 py-16 sm:py-24 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-indigo-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Our Foundation</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Why iDEA Creation Hub Stands Apart</h2>
            <p className="text-base sm:text-lg text-gray-500">
              Built on transparency, rigorous talent curation, and customer-first execution standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Curated Expertise</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We accept only top-tier creative talents with proven project experience and verifiable portfolios.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Escrow Protection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Funds and deliverables remain secure throughout the project cycle until client satisfaction is verified.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rapid Turnaround</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Direct client-to-creator communication eliminates bureaucracy and accelerates time-to-market.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Global & Local Reach</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connecting clients with regional leaders and global digital nomads ready to deliver outstanding outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stats / Impact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-gray-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">500+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Completed Projects</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">150+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Verified Creators</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">99.4%</div>
              <div className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">24/7</div>
              <div className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to collaborate Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Have an Idea Ready to Launch?</h2>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            Place an order with our verified specialists today, or reach out directly to discuss custom enterprise requirements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenOrder()}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Order a Service Now</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all cursor-pointer"
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
