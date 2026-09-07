import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const ads = [
  {
    id: 1,
    title: "Boost Your Creative Workflow",
    description: "Get 50% off professional tools and assets for your next big project.",
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1200",
    linkText: "Claim Offer",
    badge: "Sponsored"
  },
  {
    id: 2,
    title: "Hire Top-Tier Talent Today",
    description: "Join thousands of successful founders who built their MVP with us.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
    linkText: "Learn More",
    badge: "Promoted"
  },
  {
    id: 3,
    title: "Premium Website Hosting",
    description: "Lightning-fast, secure, and reliable hosting for your new digital business.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    linkText: "View Plans",
    badge: "Ad"
  }
];

export function AdBanner() {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextAd = () => setCurrentAd((prev) => (prev + 1) % ads.length);
  const prevAd = () => setCurrentAd((prev) => (prev - 1 + ads.length) % ads.length);

  const ad = ads[currentAd];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        <div className="absolute inset-0 bg-gray-900">
          <img 
            src={ad.imageUrl || undefined} 
            alt={ad.title} 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
          />
        </div>
        
        <div className="relative p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between min-h-[220px]">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-4 shadow-sm">
              {ad.badge}
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {ad.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-200 font-medium max-w-md">
              {ad.description}
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 shrink-0">
            <button className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-50 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
              {ad.linkText} <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={prevAd}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextAd}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAd(idx)}
              className={`h-1.5 rounded-full transition-all ${currentAd === idx ? 'w-6 bg-indigo-600' : 'w-2 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
