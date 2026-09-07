import { useState } from 'react';
import { Briefcase, Menu, X, LogIn, LogOut, User, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export type AppView = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'order-service' 
  | 'professionals' 
  | 'portfolio' 
  | 'jobs' 
  | 'contact' 
  | 'admin' 
  | 'client' 
  | 'professional' 
  | 'chat' 
  | 'professional-profile';

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

  const handleNavClick = (view: AppView) => {
    setIsMobileMenuOpen(false);
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('idea_hub_local_user');
      window.dispatchEvent(new CustomEvent('idea_hub_auth_changed', { detail: null }));
      showToast('Logged out successfully', 'success');
      setView('home');
    }
  };

  const getUserDisplayName = (): string => {
    if (!currentUser) return '';
    if (currentUser.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const getDashboardTarget = (): AppView => {
    if (userRole === 'admin' || currentUser?.email === 'simonemmanuel8344@gmail.com') {
      return 'admin';
    }
    if (userRole === 'professional') {
      return 'professional';
    }
    return 'client';
  };

  const getDashboardLabel = (): string => {
    if (userRole === 'admin' || currentUser?.email === 'simonemmanuel8344@gmail.com') {
      return 'Admin Dashboard';
    }
    if (userRole === 'professional') {
      return 'Pro Dashboard';
    }
    return 'Client Dashboard';
  };

  const navLinks: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'About Us', view: 'about' },
    { label: 'Services', view: 'services' },
    { label: 'Hire professionals', view: 'professionals' },
    { label: 'Our projects', view: 'portfolio' },
    { label: 'Find jobs', view: 'jobs' },
    { label: 'Contact Us', view: 'contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
            onClick={() => handleNavClick('home')}
          >
            {logoUrl ? (
              <img src={logoUrl || undefined} alt="iDEA Creation Hub Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
            )}
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 truncate">
              iDEA <span className="text-indigo-600">Creation Hub</span>
            </span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-7">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`text-sm font-semibold transition-colors cursor-pointer py-1.5 px-1 relative ${
                    isActive 
                      ? 'text-indigo-600 font-bold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
            
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight max-w-[120px] truncate">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                      {userRole === 'admin' || currentUser?.email === 'simonemmanuel8344@gmail.com' ? 'Admin' : (userRole === 'professional' ? 'Verified Pro' : 'Client')}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleNavClick(getDashboardTarget())}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold border rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    currentView === getDashboardTarget()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {userRole === 'professional' ? <Award className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{getDashboardLabel()}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  title="Sign out of account"
                  className="px-2.5 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer ml-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => handleNavClick(getDashboardTarget())}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-xs flex items-center gap-1"
              >
                {userRole === 'professional' ? <Award className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-indigo-600 bg-gray-100/80 active:bg-gray-200 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-indigo-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-1 shadow-2xl animate-in slide-in-from-top duration-200">
          {currentUser && (
            <div className="p-3 mb-2 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{getUserDisplayName()}</span>
                  <span className="text-xs text-indigo-600 font-semibold uppercase">
                    {userRole === 'admin' || currentUser?.email === 'simonemmanuel8344@gmail.com' ? 'Admin' : (userRole === 'professional' ? 'Verified Pro' : 'Client')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button 
                key={link.view}
                onClick={() => handleNavClick(link.view)} 
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-bold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
            {currentUser ? (
              <>
                <button 
                  onClick={() => handleNavClick(getDashboardTarget())}
                  className="w-full py-3 px-4 font-bold rounded-xl bg-indigo-600 text-white text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {userRole === 'professional' ? <Award className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {getDashboardLabel()}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer border border-red-100"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}
                className="w-full py-3 px-4 font-bold rounded-xl bg-indigo-600 text-white text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
