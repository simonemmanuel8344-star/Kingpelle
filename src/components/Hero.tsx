import { ArrowRight, Image as ImageIcon, ShoppingBag } from 'lucide-react';

interface HeroProps {
  heroImageUrl?: string;
  onOpenOrderModal?: () => void;
}

export function Hero({ heroImageUrl, onOpenOrderModal }: HeroProps) {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <div className="max-w-3xl lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs sm:text-sm font-medium mb-6">
              <span>✨ Building solutions, Connecting possibilities</span>
            </div>
  
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] sm:leading-tight tracking-tight mb-6 sm:mb-8">
              Bring Your Dreams to Life with <span className="text-amber-400">Top Professionals</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              iDEA Creation Hub connects small business owners and individuals with elite freelance talent. From graphic design to web development, find the perfect expert for your next project.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
              {onOpenOrderModal ? (
                <button 
                  onClick={onOpenOrderModal}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#0A192F] bg-amber-400 rounded-xl hover:bg-amber-300 active:scale-98 transition-all shadow-lg shadow-amber-400/10 text-center cursor-pointer"
                >
                  <ShoppingBag className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Hire a Professional
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <a 
                  href="#professionals" 
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#0A192F] bg-amber-400 rounded-xl hover:bg-amber-300 active:scale-98 transition-all shadow-lg shadow-amber-400/10 text-center"
                >
                  Hire a Professional
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
  
              <a 
                href="#footer" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-gray-200 border border-white/20 rounded-xl hover:border-amber-400 hover:text-amber-400 active:scale-98 transition-all text-center cursor-pointer"
              >
                Contact Us
              </a>
            </div>
          </div>
          
          {/* Profile Box 300x300 */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end shrink-0 mt-8 lg:mt-0">
            <div className="w-[300px] h-[300px] bg-white/5 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center shrink-0">
              {heroImageUrl ? (
                <img src={heroImageUrl} alt="Top Professional" className="w-full h-full object-cover bg-white" loading="lazy" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-500/50" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 right-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-amber-400/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-blue-500/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
    </section>
  );
}
