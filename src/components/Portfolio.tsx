import { Project } from '../types';

interface Props {
  projects: Project[];
}

export function Portfolio({ projects }: Props) {
  return (
    <section id="portfolio" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-indigo-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Our Track Record</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Projects</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            A showcase of creativity, software engineering, and excellence delivered by our verified professionals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-white/60 border border-gray-200/60 shadow-lg">
              <img 
                src={project.imageUrl} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90 sm:opacity-80" />
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                <span className="text-indigo-600 text-xs sm:text-sm font-semibold mb-1.5">{project.category}</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
