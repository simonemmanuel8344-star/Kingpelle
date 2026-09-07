import { useState, useMemo } from 'react';
import { Project } from '../types';
import { Sparkles, ShoppingBag, ExternalLink, Filter, Layers, ArrowRight } from 'lucide-react';
import { AppView } from '../components/Navbar';

interface ProjectsPageProps {
  projects: Project[];
  onNavigate: (view: AppView) => void;
  onOrderService: (service?: string) => void;
}

export function ProjectsPage({ projects, onNavigate, onOrderService }: ProjectsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    projects.forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [projects, selectedCategory]);

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
          <span className="text-indigo-600 font-semibold">Our Projects</span>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Proven Track Record & Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Our Work & <span className="text-indigo-600">Client Projects</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Explore standout deliverables created by our verified specialists across UI/UX, software engineering, branding, architecture, and video media.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-600/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl max-w-md mx-auto">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No projects found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-600/40 transition-all duration-300 flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={project.imageUrl || undefined}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="px-2.5 py-1 bg-indigo-600/90 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider mb-1.5 inline-block">
                      {project.category}
                    </span>
                    <h3 className="text-lg font-bold leading-tight">{project.title}</h3>
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between mt-auto bg-white border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Delivered by Verified Talent</span>
                  <button
                    onClick={() => onOrderService(project.category)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Similar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to Build Your Next Big Project?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-lg mx-auto">
            Place an order with our verified specialists and turn your concept into reality with complete escrow protection.
          </p>
          <button
            onClick={() => onOrderService()}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order a Custom Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
