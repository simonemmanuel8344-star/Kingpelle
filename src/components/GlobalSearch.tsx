import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, User, Briefcase, Layers, ArrowRight, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GlobalSearchProps {
  onSelectProfessional?: (prof: any) => void;
  onOpenOrderModal?: (serviceTitle?: string) => void;
}

export function GlobalSearch({ onSelectProfessional, onOpenOrderModal }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'professionals' | 'projects' | 'services'>('all');
  const [results, setResults] = useState<{
    professionals: any[];
    projects: any[];
    services: any[];
  }>({ professionals: [], projects: [], services: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Default fallback services for search when offline or no custom services table
  const defaultServices = [
    { id: '1', title: 'Graphic Design', description: 'Branding, logos, and visual identity that stand out.' },
    { id: '2', title: 'Video Editing', description: 'Professional post-production and motion graphics.' },
    { id: '3', title: 'Web Development', description: 'Custom, responsive websites and web applications.' },
    { id: '4', title: 'Photography', description: 'High-quality commercial and portrait photography.' },
    { id: '5', title: 'Social Media', description: 'Strategic management and content creation.' },
    { id: '6', title: 'Copywriting', description: 'Compelling copy that converts and engages.' },
    { id: '7', title: 'Architecture', description: 'Creative architectural design and planning.' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanQuery = query.trim();
      if (!cleanQuery) {
        setResults({ professionals: [], projects: [], services: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Query professionals table with ILIKE
        const profPromise = supabase
          .from('professionals')
          .select('*')
          .or(`full_name.ilike.%${cleanQuery}%,job_category.ilike.%${cleanQuery}%,bio.ilike.%${cleanQuery}%`)
          .limit(5);

        // Query portfolio projects table with ILIKE
        const projPromise = supabase
          .from('portfolio_projects')
          .select('*')
          .or(`title.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
          .limit(5);

        // Query services table or filter default services
        let servicesData = defaultServices.filter(s => 
          s.title.toLowerCase().includes(cleanQuery.toLowerCase()) || 
          s.description.toLowerCase().includes(cleanQuery.toLowerCase())
        );

        const [profRes, projRes] = await Promise.all([profPromise, projPromise]);

        setResults({
          professionals: profRes.data || [],
          projects: projRes.data || [],
          services: servicesData
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResultsCount = results.professionals.length + results.projects.length + results.services.length;

  return (
    <div ref={searchRef} className="relative max-w-3xl mx-auto w-full z-30 px-4 mb-10">
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-indigo-600">
          <Search className="w-5 h-5 animate-pulse" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Search verified professionals, web development, branding, portfolio projects..."
          className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30 focus:outline-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all font-medium"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results Modal */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute left-4 right-4 mt-3 bg-transparent/95 backdrop-blur-2xl border border-gray-300 rounded-3xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[70vh] flex flex-col">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200/60 bg-white/80 overflow-x-auto text-xs font-semibold">
            <span className="text-gray-500 px-2">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100/80'}`}
            >
              All ({totalResultsCount})
            </button>
            <button
              onClick={() => setFilterType('professionals')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'professionals' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100/80'}`}
            >
              Professionals ({results.professionals.length})
            </button>
            <button
              onClick={() => setFilterType('projects')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'projects' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100/80'}`}
            >
              Projects ({results.projects.length})
            </button>
            <button
              onClick={() => setFilterType('services')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'services' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-100/80'}`}
            >
              Services ({results.services.length})
            </button>
          </div>

          <div className="overflow-y-auto p-4 space-y-6 divide-y divide-white/10">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-indigo-600 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs text-gray-500">Querying Supabase database with ILIKE filters...</p>
              </div>
            ) : totalResultsCount === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No matching results found in Supabase for "{query}". Try searching for "Developer", "Design", or "Video".
              </div>
            ) : (
              <>
                {/* Professionals Section */}
                {(filterType === 'all' || filterType === 'professionals') && results.professionals.length > 0 && (
                  <div className="pt-2 first:pt-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                      <User className="w-4 h-4" /> Verified Professionals ({results.professionals.length})
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {results.professionals.map((prof) => (
                        <div
                          key={prof.id}
                          onClick={() => {
                            if (onSelectProfessional) onSelectProfessional(prof);
                            setIsFocused(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-gray-100/80 border border-gray-200/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prof.picture || prof.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={prof.full_name}
                              className="w-10 h-10 rounded-full object-cover border border-indigo-600/30"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{prof.full_name}</p>
                              <p className="text-xs text-gray-500">{prof.job_category || 'Specialist'} • {prof.location || 'Remote'}</p>
                            </div>
                          </div>
                          <span className="text-xs text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View Profile <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {(filterType === 'all' || filterType === 'projects') && results.projects.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                      <Briefcase className="w-4 h-4" /> Portfolio Projects ({results.projects.length})
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {results.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-gray-100/80 border border-gray-200/60 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {proj.image_url ? (
                              <img src={proj.image_url} alt={proj.title} className="w-12 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Briefcase className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-gray-900">{proj.title}</p>
                              <p className="text-xs text-gray-500">{proj.category} • {proj.client || 'Featured Project'}</p>
                            </div>
                          </div>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"
                            >
                              Live Demo <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                {(filterType === 'all' || filterType === 'services') && results.services.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                      <Layers className="w-4 h-4" /> Services & Categories ({results.services.length})
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {results.services.map((srv) => (
                        <div
                          key={srv.id}
                          onClick={() => {
                            if (onOpenOrderModal) onOpenOrderModal(srv.title);
                            setIsFocused(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-gray-100/80 border border-gray-200/60 transition-all cursor-pointer group"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-400 transition-colors">{srv.title}</p>
                            <p className="text-xs text-gray-500">{srv.description}</p>
                          </div>
                          <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-all">
                            Book Service
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
