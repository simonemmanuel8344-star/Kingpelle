import { Facebook, Instagram, Music2, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer id="footer" className="bg-[#050C17] py-12 sm:py-16 border-t border-white/10 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8">
          {/* Left Side: Brand */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full lg:w-auto">
            <div>
              <span className="text-lg sm:text-2xl font-bold tracking-tight text-white block">
                iDEA <span className="text-amber-400">Creation Hub</span>
              </span>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Building solutions, Connecting possibilities</p>
            </div>
          </div>
          
          {/* Middle: Contact Info Prominently Displayed */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full lg:w-auto text-sm">
            <a 
              href="mailto:ideacreationhub@gmail.com" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-amber-400 transition-all font-medium"
            >
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ideacreationhub@gmail.com</span>
            </a>
            <a 
              href="tel:07068588344" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-amber-400 transition-all font-medium"
            >
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>07068588344</span>
            </a>
          </div>

          {/* Right Side: Social Media & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full lg:w-auto justify-between lg:justify-end text-center sm:text-left">
            <div className="flex items-center space-x-4">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-all">
                <Music2 className="w-5 h-5" />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
              © {new Date().getFullYear()} iDEA Creation Hub.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
