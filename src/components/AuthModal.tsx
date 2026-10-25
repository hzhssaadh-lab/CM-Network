import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useAppStore';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  LogIn, 
  UserPlus,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import cmLogo from '../assets/images/cm_official_logo.jpg';
import { AdminSecretModal } from './AdminSecretModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { loginWithGoogle, loginWithStudioEmail, loginWithEmail, signupWithEmail, loading } = useApp();
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [secretAdminOpen, setSecretAdminOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimeoutRef = useRef<any>(null);

  if (!isOpen) return null;

  const handleLogoClick = () => {
    if (logoClickTimeoutRef.current) {
      clearTimeout(logoClickTimeoutRef.current);
    }
    const next = logoClicks + 1;
    if (next >= 6) {
      setLogoClicks(0);
      setSecretAdminOpen(true);
    } else {
      setLogoClicks(next);
      logoClickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 4000);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      // If auth listener or popup succeeds
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google sign-in could not open inside this iframe. Please use the Studio 1-Click Access or Email Sign-In below.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        toast.success("Welcome back!", { icon: "👋" });
      } else {
        await signupWithEmail(name || email.split('@')[0], email, password, inviteCode);
        toast.success("Account created successfully!", { icon: "🎉" });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#12110e] border border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_0_60px_rgba(255,215,0,0.18)] max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Secret Admin Verification Modal */}
        <AdminSecretModal
          isOpen={secretAdminOpen}
          onClose={() => setSecretAdminOpen(false)}
          onSuccess={() => {
            setSecretAdminOpen(false);
            onClose();
          }}
        />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div 
            onClick={handleLogoClick}
            className="inline-block relative mb-3 cursor-pointer select-none active:scale-95 transition-transform"
          >
            <img 
              src={cmLogo} 
              alt="CM Network" 
              className="w-14 h-14 rounded-2xl mx-auto border-2 border-[#FFD700]/60 shadow-[0_0_25px_rgba(255,215,0,0.3)] object-contain bg-black" 
            />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Sign In to CM Network' : 'Create Your CM Account'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Mine CM coins, earn USDT, and build for tomorrow in Web3.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-colors mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.5 0 2.8.5 3.9 1.4l2.9-2.9C17 1.8 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.6 2.8C6.4 7.2 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.6-2.8z"/>
            <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.1-6.5-5.1L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-[#FFD700] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'signup' ? 'bg-[#FFD700] text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Referral Code (Optional)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Invite Code (e.g. CM123456)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] uppercase font-mono"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] mt-2"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-gray-500 text-center mt-4">
          By signing in, you agree to CM Network's Terms of Service and Privacy Policy. All Phase 1 balances remain secured.
        </p>

      </div>
    </div>
  );
}
