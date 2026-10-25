import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useAppStore';
import { 
  Moon, 
  Sun, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  Pickaxe,
  Home,
  Zap,
  Wallet
} from 'lucide-react';
import cmLogo from '../assets/images/cm_official_logo.jpg';
import { AdminSecretModal } from './AdminSecretModal';

interface NavbarProps {
  onOpenAuth?: (initialMode?: 'login' | 'signup') => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const { user, updateUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'EN' | 'UR' | 'ES' | 'AR'>('EN');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Secret admin code access via 6 logo clicks
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const logoClickTimeoutRef = useRef<any>(null);

  const handleLogoClick = () => {
    if (logoClickTimeoutRef.current) {
      clearTimeout(logoClickTimeoutRef.current);
    }
    const next = logoClicks + 1;
    if (next >= 6) {
      setLogoClicks(0);
      setShowAdminPrompt(true);
    } else {
      setLogoClicks(next);
      logoClickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 4000);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Mining', path: user ? '/dashboard' : '/#mining' },
    { name: 'P2P', path: '/p2p' },
    { name: 'KYC', path: '/kyc' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const el = document.getElementById(path.replace('/#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
      }
      setMobileMenuOpen(false);
      return;
    }

    if ((path === '/tasks' || path === '/wallet' || path === '/profile') && !user) {
      e.preventDefault();
      if (onOpenAuth) onOpenAuth('login');
      else navigate('/login');
      setMobileMenuOpen(false);
      return;
    }

    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Secret Admin Verification Modal */}
      <AdminSecretModal 
        isOpen={showAdminPrompt} 
        onClose={() => setShowAdminPrompt(false)} 
      />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-40 relative">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="relative">
            <img 
              src={cmLogo} 
              alt="CM Network" 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-black border border-[#FFD700]/60 shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform" 
            />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 blur-sm pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-[#FFD700] transition-colors">
                CM NETWORK
              </span>
            </div>
            <p className="text-[9px] text-[#FFD700] tracking-[0.22em] font-extrabold uppercase -mt-0.5">
              CONNECT • MINE • GROW
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-full backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);

            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(link.path, e)}
                className={({ isActive: isCurrentActive }) => `
                  text-sm font-bold tracking-wide transition-all relative py-1
                  ${(link.path === '/' ? location.pathname === '/' : isCurrentActive) 
                    ? 'text-white font-black' 
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                {link.name}
                {(link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path)) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="hidden sm:flex items-center space-x-3.5">
          
          {/* Theme switch button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FFD700] hover:bg-white/10 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-10 px-3 rounded-full bg-white/5 border border-white/10 flex items-center space-x-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-sm">🇬🇧</span>
              <span>{selectedLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#161512] border border-[#FFD700]/30 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 animate-in fade-in">
                {[
                  { code: 'EN', name: 'English', flag: '🇬🇧' },
                  { code: 'UR', name: 'Urdu', flag: '🇵🇰' },
                  { code: 'ES', name: 'Español', flag: '🇪🇸' },
                  { code: 'AR', name: 'العربية', flag: '🇦🇪' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setSelectedLang(item.code as any);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedLang === item.code ? 'bg-[#FFD700]/15 text-[#FFD700]' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User state / Get Started Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <NavLink
                to="/dashboard"
                className="h-10 px-4 rounded-full bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/profile"
                className="h-10 px-3 rounded-full bg-white/5 border border-[#FFD700]/40 flex items-center space-x-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[70px] truncate hidden sm:inline">{user.name || 'Account'}</span>
              </NavLink>

              <button
                onClick={logout}
                title="Log Out"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('signup') : navigate('/login')}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center space-x-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center space-x-2">
          {!user && (
            <button
              onClick={() => onOpenAuth ? onOpenAuth('signup') : navigate('/login')}
              className="px-3 py-1.5 rounded-full bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-wider"
            >
              Start
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-50 bg-[#0e0d0b]/95 border-b border-[#FFD700]/30 backdrop-blur-xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(link.path, e)}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Language:</span>
              <span className="text-xs font-bold text-[#FFD700]">🇬🇧 EN</span>
            </div>

            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                  else navigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-black text-xs font-black uppercase tracking-wider"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
