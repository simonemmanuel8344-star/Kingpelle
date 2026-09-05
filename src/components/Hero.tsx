import { useState, useEffect } from 'react';
import { ArrowRight, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  heroImageUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  onOpenOrderModal?: () => void;
}

const BACKGROUND_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=1600&auto=format&fit=crop',
    alt: 'Creative Graphic and Digital UI Design Studio'
  },
  {
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop',
    alt: 'High Performance Software Engineering and Coding'
  },
  {
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop',
    alt: 'Video Production, Filmmaking, and Media Editing'
  },
  {
    url: 'https://images.unsplash.com/photo-1503387762-592dec58ef4e?q=80&w=1600&auto=format&fit=crop',
    alt: '3D CAD Architectural Modeling and Rendering'
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    alt: 'Product Innovation, Growth, and Collaboration'
  }
];

export function Hero({ heroImageUrl, heroTitle, heroSubtitle, heroBadge, onOpenOrderModal }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-32 overflow-hidden">
      {/* 5-Slice Auto-sliding Background Banner */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={BACKGROUND_SLIDES[currentSlide].url}
              alt={BACKGROUND_SLIDES[currentSlide].alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Soft elegant gradient and blur mask overlays to guarantee maximum text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/10 z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-white/20 z-[2]" />

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <div className="max-w-3xl lg:max-w-2xl">
            {/* Animated Welcome Note */}
            <div className="mb-4 select-none overflow-visible py-2">
              <div className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                {[
                  { text: 'Welcome', style: 'bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false },
                  { text: 'to', style: 'bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false },
                  { text: 'iDEA', style: 'text-black text-[1.45em] font-black tracking-tight select-all cursor-pointer inline-block drop-shadow-sm', animated: true, isBrand: true },
                  { text: 'Creation', style: 'bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: true },
                  { text: 'HUB', style: 'bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl', animated: false }
                ].map((item, index) => (
                  <motion.span
                    key={index}
                    className={`inline-block origin-bottom ${item.animated ? 'cursor-pointer' : 'cursor-default'}`}
                    animate={item.animated ? {
                      y: [0, -12, 0],
                      scale: [1, 1.05, 1],
                      rotateZ: [0, item.isBrand ? -3 : 3, 0]
                    } : {}}
                    transition={item.animated ? {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: item.isBrand ? 0 : 0.3
                    } : {}}
                    whileHover={{
                      scale: 1.08,
                      rotate: item.isBrand ? 4 : (index % 2 === 0 ? 3 : -3),
                      y: -4,
                      transition: { duration: 0.4, type: "spring", bounce: 0.6 }
                    }}
                  >
                    <span className={item.style}>{item.text}</span>
                  </motion.span>
                ))}
              </div>

            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-medium mb-6">
              <span>{heroBadge || '✨ Building solutions, Connecting possibilities'}</span>
            </div>
  
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.15] sm:leading-tight tracking-tight mb-6 sm:mb-8">
              {heroTitle ? heroTitle : (
                <>Bring Your Dreams to Life with <span className="text-indigo-600">Top Professionals</span></>
              )}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              {heroSubtitle || 'iDEA Creation Hub connects business owners and individuals with elite freelance talent, employers to employees. Find the perfect expert for your next project.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
              <a 
                href="#professionals" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-98 transition-all shadow-lg shadow-indigo-600/10 text-center cursor-pointer"
              >
                <ShoppingBag className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Hire a Professional
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
  
              <a 
                href="#footer" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 border border-gray-300 rounded-xl hover:border-indigo-600 hover:text-indigo-600 active:scale-98 transition-all text-center cursor-pointer"
              >
                Contact Us
              </a>
            </div>
          </div>
          
          {/* Profile Box 300x300 */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end shrink-0 mt-8 lg:mt-0">
            <div className="w-[300px] h-[300px] bg-white/60 border border-gray-200/60 rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center shrink-0">
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
      <div className="absolute top-1/4 right-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-indigo-600/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-blue-500/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
    </section>
  );
}
