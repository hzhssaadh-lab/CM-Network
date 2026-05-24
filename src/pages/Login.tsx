import { useApp } from '../hooks/useAppStore';
import React, { useState, useEffect } from 'react';

export function Login() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loading } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

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

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setErrorCode(null);
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (error: any) {
      if (error?.code === 'auth/unauthorized-domain') {
        setErrorCode('auth/unauthorized-domain');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        // The user closed the popup, we don't need to show a scary error message.
        console.log('Login popup closed by user.');
      } else {
        setErrorMsg(error?.message || 'Google Login failed.');
      }
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

      {errorCode === 'auth/unauthorized-domain' && (
        <div className="w-full max-w-sm mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-sm text-center relative z-10 break-words">
          <p className="font-bold mb-2">Domain Not Authorized</p>
          <p className="mb-2 text-xs">Please go to your Firebase Console under Authentication &gt; Settings &gt; Authorized domains and add the following domain:</p>
          <code className="bg-black/50 px-2 py-1 rounded text-white block mb-2 break-all font-mono text-xs select-all">
            {window.location.hostname}
          </code>
          <p className="text-[10px] text-red-300">You must do this manually because you are using a custom Firebase project.</p>
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
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-200 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.1)] active:scale-95 relative z-10 disabled:opacity-50"
          disabled={loading || isSubmitting}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>
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
