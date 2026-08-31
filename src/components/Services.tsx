import { Palette, Code, MonitorPlay, Camera, PenTool, Share2, Building2, ShoppingBag, ArrowRight } from 'lucide-react';

const services = [
  { icon: Palette, title: 'Graphic Design', desc: 'Branding, logos, and visual identity that stand out.' },
  { icon: MonitorPlay, title: 'Video Editing', desc: 'Professional post-production and motion graphics.' },
  { icon: Code, title: 'Web Development', desc: 'Custom, responsive websites and web applications.' },
  { icon: Camera, title: 'Photography', desc: 'High-quality commercial and portrait photography.' },
  { icon: Share2, title: 'Social Media', desc: 'Strategic management and content creation.' },
  { icon: PenTool, title: 'Copywriting', desc: 'Compelling copy that converts and engages.' },
  { icon: Building2, title: 'Architecture', desc: 'Creative architectural design and planning.' },
];

interface ServicesProps {
  onOpenOrderModal?: (serviceTitle?: string) => void;
}

export function Services({ onOpenOrderModal }: ServicesProps) {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-amber-400 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">What We Offer</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Our Services & Skills</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the wide range of professional skills available on our marketplace, and order directly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-400/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-400 transition-colors">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 group-hover:text-[#0A192F]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{service.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-6">{service.desc}</p>
                </div>

                {onOpenOrderModal && (
                  <div>
                    <button
                      onClick={() => onOpenOrderModal(service.title)}
                      className="w-full py-2.5 px-4 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-[#0A192F] font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Hire me</span>
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
