import { Palette, Code, MonitorPlay, Camera, PenTool, Share2, Building2, ShoppingBag, ArrowRight, Layers, Target, Cpu } from 'lucide-react';

const defaultServices = [
  { id: '1', title: 'Graphic Design', desc: 'Branding, logos, and visual identity that stand out.', icon: Palette },
  { id: '2', title: 'Video Editing', desc: 'Professional post-production and motion graphics.', icon: MonitorPlay },
  { id: '3', title: 'Development & IT', desc: 'Custom, responsive websites, custom web apps, and modern backend architectures.', icon: Code },
  { id: '4', title: 'Social Media Manager', desc: 'Strategic audience growth, premium post creation, and professional brand management.', icon: Share2 },
  { id: '5', title: 'Google Ads Expert', desc: 'High-performing Google Ads, pay-per-click search campaigns, and conversion optimization.', icon: Target },
  { id: '6', title: 'Content Writing', desc: 'SEO blog articles, professional copywriting, newsletter campaigns, and sales copy.', icon: PenTool },
  { id: '7', title: 'AI & Automation', desc: 'Custom AI integration, agentic workflow automation, and smart LLM integrations.', icon: Cpu },
  { id: '8', title: 'Architecture', desc: 'Creative architectural design, 2D planning, and photorealistic 3D modeling.', icon: Building2 },
];

export interface ServiceItem {
  id?: string;
  title: string;
  desc?: string;
  description?: string;
  category?: string;
  icon?: any;
}

interface ServicesProps {
  services?: ServiceItem[];
  onOpenOrderModal?: (serviceTitle?: string) => void;
}

export function Services({ services, onOpenOrderModal }: ServicesProps) {
  const displayServices = services && services.length > 0 ? services : defaultServices;

  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-indigo-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">What We Offer</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services & Skills</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Discover the wide range of professional skills available on our marketplace, and order directly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayServices.map((service, idx) => {
            const Icon = service.icon || Layers;
            const descriptionText = service.desc || service.description || 'Professional service provided by top verified specialists.';
            return (
              <div 
                key={service.id || idx} 
                className="bg-white/60 border border-gray-200/60 rounded-2xl p-6 sm:p-8 hover:bg-gray-100/80 hover:border-indigo-600/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 transition-colors">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{service.title}</h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">{descriptionText}</p>
                </div>

                {onOpenOrderModal && (
                  <div>
                    <button
                      onClick={() => onOpenOrderModal(service.title)}
                      className="w-full py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Service</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
