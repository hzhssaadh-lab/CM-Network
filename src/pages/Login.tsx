import { useApp } from '../hooks/useAppStore';
import React, { useState, useEffect } from 'react';

export function Login() {
  const { loginWithEmail, signupWithEmail, loading } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Email form state
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tgUser = (window as any).Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setTelegramUser(tgUser);
      }
    }
  }, []);

  const handleTelegramLogin = async () => {
    if (!telegramUser) return;
    
    const email = `tg_${telegramUser.id}@cmnetwork.app`;
    const password = `tg_pass_${telegramUser.id}_secret`;
    const tgName = telegramUser.first_name || telegramUser.username || 'Telegram User';

    try {
      setErrorMsg(null);
      setErrorCode(null);
      setIsSubmitting(true);
      // Try to login first
      await loginWithEmail(email, password);
    } catch (error: any) {
      try {
        // If login fails, attempt to register
        await signupWithEmail(tgName, email, password);
      } catch (signupError: any) {
        setErrorMsg(signupError?.message || 'Telegram Login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    if (isSignup && !name) {
      setErrorMsg('Please enter your name.');
      return;
    }

    try {
      setErrorMsg(null);
      setErrorCode(null);
      setIsSubmitting(true);
      
      if (isSignup) {
        await signupWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return <div className="flex h-screen items-center justify-center bg-[#050505]">
       <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
     </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen w-full p-8 relative overflow-hidden bg-[#050505] text-white selection:bg-[#FFD700]/30">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFD700] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] mb-8 animate-bounce relative z-10">
        <span className="text-black font-black text-5xl">CM</span>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tighter mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 relative z-10">Welcome to CM Network</h1>
      <p className="text-[#FFD700] mb-8 text-center uppercase tracking-[0.2em] text-xs font-bold relative z-10">Premium Mining Protocol</p>
      
      {errorMsg && (
        <div className="w-full max-w-sm mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-sm text-center relative z-10 break-words">
          {errorMsg}
        </div>
      )}
      
      {telegramUser ? (
        <button 
          type="button"
          onClick={handleTelegramLogin}
          className="w-full max-w-sm bg-[#2AABEE] text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-[#229ED9] transition-all shadow-[0_5px_20px_rgba(42,171,238,0.2)] active:scale-95 relative z-10 disabled:opacity-50 mb-4"
          disabled={loading || isSubmitting}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span>Continue as {telegramUser.first_name}</span>
        </button>
      ) : (
        <form onSubmit={handleEmailAuth} className="w-full max-w-sm flex flex-col space-y-4 relative z-10 border border-white/10 p-6 rounded-3xl bg-white/5 backdrop-blur-md">
          {isSignup && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          
          <button 
            type="submit"
            className="w-full bg-[#FFD700] text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-[#e6c200] transition-all shadow-[0_5px_20px_rgba(255,215,0,0.2)] active:scale-95 disabled:opacity-50 mt-2"
            disabled={loading || isSubmitting}
          >
            <span>{isSignup ? 'Sign Up' : 'Log In'}</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-gray-400 hover:text-white transition-colors mt-4 text-center w-full"
          >
            {isSignup ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-gray-400 max-w-xs relative z-10">
        <p>If you have an Invite Code, you can enter it on the <b>Friends</b> page after signing in.</p>
      </div>

      <p className="text-[10px] text-gray-500 tracking-widest mt-8 uppercase text-center font-bold max-w-xs relative z-10">
        By continuing, you agree to our Terms of Service & Privacy Policy
      </p>
    </div>
  );
}
