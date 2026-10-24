import { useApp } from '../hooks/useAppStore';
import React, { useState } from 'react';
import cmLogo from '../assets/images/cm_official_logo.jpg';
import { Sparkles, ShieldCheck, Mail, ArrowRight, LogIn } from 'lucide-react';

export function Login() {
  const { loginWithGoogle, loginWithStudioEmail, loading } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [inputEmail, setInputEmail] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (error: any) {
      setErrorMsg(error?.message || 'Google Login was blocked or failed. Please use Studio Direct Login below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudioQuickLogin = async (targetEmail: string) => {
    try {
      setErrorMsg(null);
      setIsSubmitting(true);
      await loginWithStudioEmail(targetEmail);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    await handleStudioQuickLogin(inputEmail.trim());
  };

  if (loading) {
     return (
       <div className="flex h-screen items-center justify-center bg-[#050505]">
         <div className="flex flex-col items-center gap-3">
           <div className="w-14 h-14 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
           <p className="text-xs uppercase tracking-widest text-[#FFD700] font-bold">Authenticating...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 sm:p-8 relative overflow-hidden bg-[#050505] text-white selection:bg-[#FFD700]/30">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFD700] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <img src={cmLogo} alt="CM Network Logo" className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-2xl bg-black object-contain border-2 border-[#FFD700]/60 drop-shadow-[0_0_30px_rgba(255,215,0,0.4)] relative z-10" />
      
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1 text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 relative z-10">
        CM Network
      </h1>
      <p className="text-[#FFD700] mb-8 text-center uppercase tracking-[0.25em] text-[11px] font-bold relative z-10 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" /> Premium Mining Protocol
      </p>
      
      {errorMsg && (
        <div className="w-full max-w-sm mb-5 p-3.5 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs text-center relative z-10 break-words shadow-lg">
          {errorMsg}
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col gap-3 relative z-10">
        {/* Instant Google Studio / Preview Login Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1a1805] to-[#0c0c04] border border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.08)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-[#FFD700] tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" /> Google Studio Login
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD700]/20 text-[#FFD700]">Verified Admin</span>
          </div>
          <p className="text-[11px] text-gray-300">
            One-click instant login for Google Studio preview environment:
          </p>
          <button
            type="button"
            onClick={() => handleStudioQuickLogin('hzhssaadh@gmail.com')}
            disabled={isSubmitting}
            className="w-full mt-1 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#D4AF37] text-black font-extrabold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:brightness-110 active:scale-98 transition shadow-[0_4px_16px_rgba(255,215,0,0.3)] disabled:opacity-50 text-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-black" />
            <span>Login as Earn with hashmi</span>
          </button>
        </div>

        {/* Continue with Google */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-200 transition shadow-[0_4px_15px_rgba(255,255,255,0.08)] active:scale-98 disabled:opacity-50 text-sm cursor-pointer"
          disabled={loading || isSubmitting}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        {/* Direct Email Access Toggle */}
        {!showEmailInput ? (
          <button
            type="button"
            onClick={() => setShowEmailInput(true)}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Sign In with Custom Email</span>
          </button>
        ) : (
          <form onSubmit={handleEmailSubmit} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-2">
            <label className="text-[11px] text-gray-400 font-medium">Enter your account email:</label>
            <div className="flex gap-2">
              <input 
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FFD700] text-black font-bold px-3 py-2 rounded-lg text-xs hover:bg-[#ffe033] flex items-center gap-1 shrink-0"
              >
                <span>Enter</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 max-w-xs relative z-10">
        <p>Invite code can be redeemed anytime on the <b className="text-gray-300">Friends</b> page.</p>
      </div>

      <p className="text-[10px] text-gray-500 tracking-wider mt-6 uppercase text-center font-semibold max-w-xs relative z-10">
        CM Network Autonomous Mining Engine
      </p>
    </div>
  );
}
