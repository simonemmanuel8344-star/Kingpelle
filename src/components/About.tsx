export function About() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white/5 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
          <div>
            <span className="text-amber-400 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Our Story</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              About <span className="text-amber-400">iDEA Creation Hub</span>
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-5">
              We focus on building solutions and connecting possibilities, dedicated to rendering top-tier services to our clients. Whether you are a small business owner looking to scale, or an individual with a creative vision, our platform bridges the gap between your ideas and reality.
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Beyond connecting clients with professionals, we also actively advertise remote job opportunities for skilled individuals seeking their next big break. Trust, quality, and creativity are at the core of everything we do.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-video md:aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
                alt="Team collaborating" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 sm:w-48 h-40 sm:h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
