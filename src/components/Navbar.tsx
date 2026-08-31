import { useState } from 'react';
import { Briefcase, Menu, X, LogIn, LogOut, User, Award } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '../contexts/ToastContext';

export type AppView = 'home' | 'admin' | 'client' | 'professional' | 'chat' | 'professional-profile';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  logoUrl?: string;
  onLoginClick: () => void;
  currentUser: any;
  userRole?: 'admin' | 'professional' | 'client';
}

export function Navbar({ currentView, setView, logoUrl, onLoginClick, currentUser, userRole }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  const handleNavClick = (view?: AppView, anchorId?: string) => {
    setIsMobileMenuOpen(false);
    if (view) {
      setView(view);
    }
    if (anchorId && currentView !== 'home') {
      setView('home');
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'success');
      setView('home');
    } catch (error) {
      showToast('Failed to log out', 'error');
    }
  };

  const getDashboardTarget = (): 'admin' | 'professional' | 'client' => {
    if (currentUser?.email === 'simonemmanuel8344@gmail.com' || userRole === 'admin') {
      return 'admin';
    }
    if (userRole === 'professional') {
      return 'professional';
    }
    return 'client';
  };

  const getDashboardLabel = (): string => {
    if (currentUser?.email === 'simonemmanuel8344@gmail.com' || userRole === 'admin') {
      return 'Admin Dashboard';
    }
    if (userRole === 'professional') {
      return 'Pro Dashboard';
    }
    return 'Client Dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
            onClick={() => handleNavClick('home')}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="iDEA Creation Hub Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-400 flex items-center justify-center text-[#0A192F] shadow-sm shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
            )}
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate">
              iDEA <span className="text-amber-400">Creation Hub</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#about" onClick={() => handleNavClick('home', 'about')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors">About</a>
            <a href="#services" onClick={() => handleNavClick('home', 'services')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors">Services</a>
            <a href="#professionals" onClick={() => handleNavClick('home', 'professionals')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors">Professionals</a>
            <a href="#portfolio" onClick={() => handleNavClick('home', 'portfolio')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors font-medium">Our projects</a>
            <a href="#jobs" onClick={() => handleNavClick('home', 'jobs')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors">Jobs</a>
            <a href="#footer" onClick={() => handleNavClick('home', 'footer')} className="text-gray-300 hover:text-amber-400 text-sm lg:text-base transition-colors">Contact Us</a>
            
            {currentUser ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleNavClick(getDashboardTarget())}
                  className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all flex items-center gap-2 ${
                    currentView === getDashboardTarget()
                      ? 'bg-amber-400 text-[#0A192F] border-amber-400 font-bold shadow-md' 
                      : 'border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-[#0A192F]'
                  }`}
                >
                  {userRole === 'professional' ? <Award className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {getDashboardLabel()}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white flex items-center gap-1 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-5 py-2.5 text-sm font-bold bg-amber-400 text-[#0A192F] rounded-lg hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4" /> Login / Register
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-gray-300 hover:text-white bg-white/5 border border-white/10 active:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0A192F] border-b border-white/10 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <a 
            href="#about" 
            onClick={() => handleNavClick('home', 'about')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            About
          </a>
          <a 
            href="#services" 
            onClick={() => handleNavClick('home', 'services')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            Services
          </a>
          <a 
            href="#professionals" 
            onClick={() => handleNavClick('home', 'professionals')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            Professionals
          </a>
          <a 
            href="#portfolio" 
            onClick={() => handleNavClick('home', 'portfolio')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            Our projects
          </a>
          <a 
            href="#jobs" 
            onClick={() => handleNavClick('home', 'jobs')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            Partner Jobs
          </a>
          <a 
            href="#footer" 
            onClick={() => handleNavClick('home', 'footer')} 
            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-200 hover:bg-white/5 hover:text-amber-400 active:bg-white/10 transition-colors"
          >
            Contact Us
          </a>
          
          <div className="pt-3 border-t border-white/10">
            {currentUser ? (
              <div className="space-y-2">
                <button 
                  onClick={() => handleNavClick(getDashboardTarget())}
                  className="w-full py-3 px-4 text-center font-bold rounded-lg bg-amber-400 text-[#0A192F] hover:bg-amber-300 active:bg-amber-500 transition-colors text-sm shadow-md flex items-center justify-center gap-2"
                >
                  {userRole === 'professional' ? <Award className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {getDashboardLabel()}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 text-center font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}
                className="w-full py-3 px-4 text-center font-bold rounded-lg bg-amber-400 text-[#0A192F] hover:bg-amber-300 active:bg-amber-500 transition-colors text-sm shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Login / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
