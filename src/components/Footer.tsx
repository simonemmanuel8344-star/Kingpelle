import { Facebook, Instagram, Music2, Mail, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';
import { AppView } from './Navbar';

interface FooterProps {
  logoUrl?: string;
  onNavigate?: (view: AppView) => void;
  onOrderService?: (service?: string) => void;
}

export function Footer({ logoUrl, onNavigate, onOrderService }: FooterProps) {
  return (
    <footer id="footer" className="bg-white border-t border-gray-200/80 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl || undefined} alt="iDEA Creation Hub Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                  i
                </div>
              )}
              <span className="text-xl font-bold tracking-tight text-gray-900">
                iDEA <span className="text-indigo-600">Creation Hub</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Nigeria & global freelance marketplace connecting visionary businesses with elite verified creative talent.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Pages</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              <li>
                <button onClick={() => onNavigate?.('home')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('about')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('services')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Our Services & Skills
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('professionals')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Hire Verified Talent
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('portfolio')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Client Projects
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('jobs')} className="hover:text-indigo-600 transition-colors cursor-pointer">
                  Find Jobs & Gigs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Services */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Order Services</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              <li>
                <button onClick={() => onOrderService?.('Graphic Design & Brand Identity')} className="hover:text-indigo-600 transition-colors cursor-pointer text-left">
                  Graphic Design & Logos
                </button>
              </li>
              <li>
                <button onClick={() => onOrderService?.('Video Editing & Motion Graphics')} className="hover:text-indigo-600 transition-colors cursor-pointer text-left">
                  Video Editing & Motion
                </button>
              </li>
              <li>
                <button onClick={() => onOrderService?.('Web & Mobile Development')} className="hover:text-indigo-600 transition-colors cursor-pointer text-left">
                  Web & App Development
                </button>
              </li>
              <li>
                <button onClick={() => onOrderService?.('Photography & Commercial Media')} className="hover:text-indigo-600 transition-colors cursor-pointer text-left">
                  Commercial Photography
                </button>
              </li>
              <li>
                <button onClick={() => onOrderService?.('Architectural Design & 3D Modeling')} className="hover:text-indigo-600 transition-colors cursor-pointer text-left">
                  Architecture & 3D Modeling
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Get in Touch</h4>
            <a 
              href="mailto:ideacreationhub@gmail.com" 
              className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>ideacreationhub@gmail.com</span>
            </a>
            <a 
              href="tel:07068588344" 
              className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>07068588344</span>
            </a>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate?.('contact')}
                className="w-full py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 transition-colors cursor-pointer"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} iDEA Creation Hub. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Escrow & Satisfaction Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

