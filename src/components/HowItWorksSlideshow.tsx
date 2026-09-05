import React, { useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksSlideshowProps {
  onOpenOrderModal?: (serviceTitle?: string) => void;
}

export function HowItWorksSlideshow({ onOpenOrderModal }: HowItWorksSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState([
    {
      id: 1,
      step: 'Step 01',
      title: 'Post Your Project or Service Request',
      description: 'Detail your creative or technical requirements, timeline, and budget. Our smart matching algorithm identifies the best specialists instantly.',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400',
      category: 'Project Initiation'
    },
    {
      id: 2,
      step: 'Step 02',
      title: 'Browse & Review Vetted Professionals',
      description: 'Compare top-tier verified creators, developers, and architects. Review verified portfolios, past client ratings, and expert skills.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
      category: 'Talent Selection'
    },
    {
      id: 3,
      step: 'Step 03',
      title: 'Secure Escrow & Milestone Funding',
      description: 'Fund your project safely into escrow. Funds are locked securely and only released to the professional upon your verified approval.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      category: 'Secure Escrow'
    },
    {
      id: 4,
      step: 'Step 04',
      title: 'Collaborate Live & Track Progress',
      description: 'Use our real-time built-in messaging, file sharing, and milestone dashboard to review drafts and guide the professional effortlessly.',
      imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=400',
      category: 'Live Collaboration'
    },
    {
      id: 5,
      step: 'Step 05',
      title: 'Approve Work & Launch Success',
      description: 'Receive final production-ready deliverables, approve the milestone, leave a star rating, and bring your vision to life.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      category: 'Project Delivery'
    }
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempUrl, setTempUrl] = useState('');

  const handleImageChange = (index: number, newUrl: string) => {
    const updated = [...slides];
    updated[index].imageUrl = newUrl;
    setSlides(updated);
    setEditingIndex(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> 5-Step Marketplace Guide
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            How <span className="text-indigo-600">iDEA Creation Hub</span> Works
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            The best freelance marketplace where skills meet talent; Your ideas, Our skills, One result
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-2xl border border-gray-200/80 rounded-3xl p-6 sm:p-12 shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: 200x200 Image Space with Upload / URL option */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden border-2 border-indigo-600/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-white/95 relative flex items-center justify-center">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay upload button */}
                  <button
                    onClick={() => {
                      setEditingIndex(currentSlide);
                      setTempUrl(slide.imageUrl);
                    }}
                    className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-gray-900 gap-2 p-2 text-xs font-semibold"
                  >
                    <Upload className="w-6 h-6 text-indigo-600" />
                    <span>Change Image (200x200)</span>
                  </button>
                </div>
                
                <span className="absolute -top-3 -right-3 bg-indigo-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                  {slide.step}
                </span>
              </div>

              {/* Inline URL edit modal prompt */}
              {editingIndex === currentSlide && (
                <div className="mt-4 w-full bg-white border border-indigo-600/40 p-4 rounded-xl space-y-3 z-20">
                  <p className="text-xs font-bold text-indigo-600">Image URL or File Upload:</p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="url"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/60 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-xs outline-none focus:border-indigo-600"
                    />
                    <label className="w-full bg-gray-100/80 hover:bg-gray-200 text-gray-900 text-center py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold">
                      Upload from Device
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) setTempUrl(event.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }} 
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImageChange(currentSlide, tempUrl)}
                      className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                    >
                      Save Image
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1.5 bg-gray-100/80 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Slide Content & Click to Hire */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 block mb-1">
                  {slide.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {slide.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {slide.description}
                </p>
              </div>

              <div className="pt-2">
                {onOpenOrderModal && (
                  <button
                    onClick={() => onOpenOrderModal(slide.title)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-gray-900 font-extrabold text-sm tracking-wide shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Click to Hire Expert <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200/60">
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-indigo-600' : 'w-2.5 bg-gray-200 hover:bg-white/40'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-xl bg-white/60 hover:bg-gray-100/90 border border-gray-200/80 text-gray-900 flex items-center justify-center transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-xl bg-white/60 hover:bg-gray-100/90 border border-gray-200/80 text-gray-900 flex items-center justify-center transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
