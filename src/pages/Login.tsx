import { useApp } from '../hooks/useAppStore';
import React, { useState } from 'react';

export function Login() {
  const { loginWithGoogle, loading } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (error: any) {
      setErrorMsg(error?.message || 'Google Login failed.');
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
    <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden bg-[#050505] text-white selection:bg-[#FFD700]/30">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FFD700] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <img src="/src/assets/images/cm_simple_logo_1785173778768.jpg" alt="CM Network Logo" className="w-24 h-24 mb-8 rounded-full drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] animate-bounce relative z-10" />
      
      <h1 className="text-4xl font-bold tracking-tighter mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 relative z-10">Welcome to CM Network</h1>
      <p className="text-[#FFD700] mb-12 text-center uppercase tracking-[0.2em] text-xs font-bold relative z-10">Premium Mining Protocol</p>
      
      {errorMsg && (
        <div className="w-full max-w-sm mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-sm text-center relative z-10 break-words">
          {errorMsg}
        </div>
      )}

      <button 
        type="button"
        onClick={handleGoogleLogin}
        className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-200 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.1)] active:scale-95 relative z-10 disabled:opacity-50"
        disabled={loading || isSubmitting}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        <span>Continue with Google</span>
      </button>

      <div className="mt-6 text-center text-sm text-gray-400 max-w-xs relative z-10">
        <p>If you have an Invite Code, you can enter it on the <b>Friends</b> page after signing in.</p>
      </div>

      <p className="text-[10px] text-gray-500 tracking-widest mt-8 uppercase text-center font-bold max-w-xs relative z-10">
        By continuing, you agree to our Terms of Service & Privacy Policy
      </p>
    </div>
  );
}
