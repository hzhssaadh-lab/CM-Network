import { useApp } from '../hooks/useAppStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import cmLogo from '../assets/images/cm_simple_logo_1785173778768.jpg';

export function Header() {
  const { user, updateUser, refreshUser } = useApp();
  const [clicks, setClicks] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  const handleAdminClick = async () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 3) {
      setClicks(0);
      setShowPrompt(true);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdInput === "Saad3268@12") {
      if (user && user.role !== 'admin') {
        await updateUser({ role: 'admin' });
      }
      setShowPrompt(false);
      setPwdInput('');
      navigate('/admin');
    } else {
      setErrorMsg('Incorrect Access Code');
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshUser();
    setTimeout(() => setIsRefreshing(false), 500); // UI feel
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Admin Access Required</h3>
            <form onSubmit={submitPassword} className="space-y-4">
              <input 
                type="password"
                placeholder="Enter Access Code"
                value={pwdInput}
                onChange={(e) => { setPwdInput(e.target.value); setErrorMsg(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
                autoFocus
              />
              {errorMsg && <p className="text-red-400 text-xs font-medium">{errorMsg}</p>}
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowPrompt(false); setPwdInput(''); setErrorMsg(''); }}
                  className="flex-1 bg-white/5 text-gray-300 py-3 rounded-xl hover:bg-white/10 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#FFD700] text-black py-3 rounded-xl hover:bg-[#e6c200] transition-colors font-bold text-sm"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <header className="flex justify-between items-center mb-8 px-4 sm:px-8 pt-8 max-w-5xl mx-auto w-full flex-shrink-0">
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={handleAdminClick}>
          <img src={cmLogo} alt="CM Network Logo" className="w-12 h-12 rounded-full shadow-[0_0_25px_rgba(212,175,55,0.5)]" />
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent">CM NETWORK</h1>
            <p className="text-[9px] text-[#FFD700] uppercase tracking-[0.3em] font-bold">Protocol Active</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#FFD700]' : ''}`} />
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Global Price</p>
          <p className="text-[#FFD700] font-mono font-bold text-lg">$6.00 <span className="text-[10px] text-green-400 font-normal ml-1">+0.0%</span></p>
        </div>
        {user?.photoURL ? (
          user.photoURL.startsWith('emoji:') ? (
            (() => {
              const parts = user.photoURL.split(':');
              const emoji = parts[1] || '🤠';
              const grad = parts[2] || 'from-yellow-500/20 via-amber-600/10 to-transparent';
              return (
                <div className={`w-12 h-12 rounded-full border border-[#FFD700]/30 flex items-center justify-center bg-gradient-to-br ${grad} overflow-hidden shadow-md relative`}>
                  <div className="absolute inset-0 bg-black/40 -z-10"></div>
                  <span className="text-2xl drop-shadow-sm select-none">{emoji}</span>
                </div>
              );
            })()
          ) : (
            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-[#FFD700]/30 object-cover" />
          )
        ) : (
          <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center bg-white/5">
            <img src={cmLogo} alt="CM Network Logo" className="w-8 h-8 rounded-full border border-[#FFD700]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
          </div>
        )}
      </div>
    </header>
  </>
  );
}
