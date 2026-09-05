import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Star, CheckCircle2, DollarSign, Clock, UserCheck } from 'lucide-react';

interface GigMatchmakerProps {
  onOpenOrderModal?: (serviceTitle?: string) => void;
}

export function GigMatchmaker({ onOpenOrderModal }: GigMatchmakerProps) {
  const [selectedCategory, setSelectedCategory] = useState('Web Development');
  const [budgetTier, setBudgetTier] = useState('Medium ($500 - $2,500)');
  const [projectTimeline, setProjectTimeline] = useState('1 - 2 Weeks');
  const [matched, setMatched] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    setMatched(false);
    setTimeout(() => {
      setIsMatching(false);
      setMatched(true);
    }, 900);
  };

  return (
    <section className="py-16 sm:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-gray-200/80 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative glowing orb */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 animate-spin" /> AI Instant Gig Matchmaker
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Find Your Ideal Verified Expert in Seconds
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Tell us what you need built or designed. Our smart freelance algorithm instantly connects you with pre-vetted professionals matching your exact scope and budget with 100% Escrow Protection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/80 border border-gray-200/60 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-indigo-600 text-sm font-bold mb-1">
                    <ShieldCheck className="w-4 h-4" /> Escrow Safe
                  </div>
                  <p className="text-xs text-gray-500">Funds released only upon complete satisfaction.</p>
                </div>
                <div className="bg-white/80 border border-gray-200/60 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold mb-1">
                    <Star className="w-4 h-4 fill-emerald-400" /> Top 1% Talent
                  </div>
                  <p className="text-xs text-gray-500">Rigorously vetted creators and developers.</p>
                </div>
                <div className="bg-white/80 border border-gray-200/60 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-blue-400 text-sm font-bold mb-1">
                    <Clock className="w-4 h-4" /> Fast Turnaround
                  </div>
                  <p className="text-xs text-gray-500">Direct communication & milestone tracking.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
                <form onSubmit={handleMatch} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">1. Select Service Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white/60/50 border border-gray-200/80 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-indigo-600 outline-none transition-all"
                    >
                      <option value="Web Development">Web Development & Apps</option>
                      <option value="Graphic Design">Graphic Design & Branding</option>
                      <option value="Video Editing">Video Editing & Motion Graphics</option>
                      <option value="Photography">Commercial Photography</option>
                      <option value="Social Media">Social Media Management</option>
                      <option value="Copywriting">Professional Copywriting</option>
                      <option value="Architecture">Creative Architecture & 3D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">2. Select Budget Tier</label>
                    <select
                      value={budgetTier}
                      onChange={(e) => setBudgetTier(e.target.value)}
                      className="w-full bg-white/60/50 border border-gray-200/80 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-indigo-600 outline-none transition-all"
                    >
                      <option value="Starter ($200 - $500)">Starter ($200 - $500)</option>
                      <option value="Medium ($500 - $2,500)">Medium ($500 - $2,500)</option>
                      <option value="Enterprise ($2,500 - $10,000+)">Enterprise ($2,500 - $10,000+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">3. Desired Timeline</label>
                    <select
                      value={projectTimeline}
                      onChange={(e) => setProjectTimeline(e.target.value)}
                      className="w-full bg-white/60/50 border border-gray-200/80 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-indigo-600 outline-none transition-all"
                    >
                      <option value="Under 1 Week">Under 1 Week (Express)</option>
                      <option value="1 - 2 Weeks">1 - 2 Weeks (Standard)</option>
                      <option value="1 Month+">1 Month+ (Comprehensive)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isMatching}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-gray-900 font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isMatching ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" /> Matching Best Experts...
                      </>
                    ) : (
                      <>
                        Instant Match Professional <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {matched && (
                  <div className="mt-6 pt-6 border-t border-gray-200/60 animate-fade-in space-y-4">
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Top Expert Found for {selectedCategory}!</p>
                        <p className="text-xs text-emerald-300">Available for immediate hire under {budgetTier} ({projectTimeline}).</p>
                      </div>
                    </div>
                    
                    {onOpenOrderModal && (
                      <button
                        onClick={() => onOpenOrderModal(selectedCategory)}
                        className="w-full py-3 bg-gray-100/80 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                      >
                        Book {selectedCategory} Project Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
