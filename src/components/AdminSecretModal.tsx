import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppStore';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ALLOWED_ADMIN_EMAILS = [
  'hzhssaadh@gmail.com',
  'hzhadh@gmail.com',
  'ms888mf@gmail.com'
];

export const ADMIN_SECRET_PASSWORD = 'cmnetwork@804@';
export const ALLOWED_ADMIN_PASSWORDS = [
  'cmnetwork@804@',
  'Saad3268@12',
  'saad3268@12'
];

interface AdminSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminSecretModal({ isOpen, onClose, onSuccess }: AdminSecretModalProps) {
  const { user, loginWithStudioEmail, updateUser } = useApp();
  const navigate = useNavigate();
  
  const [adminEmail, setAdminEmail] = useState(() => {
    const cur = (user?.email || '').trim().toLowerCase();
    return ALLOWED_ADMIN_EMAILS.some(a => a.toLowerCase() === cur) ? user?.email || '' : '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your authorized Admin Gmail.');
      return;
    }

    const isEmailValid = ALLOWED_ADMIN_EMAILS.some(
      (allowed) => allowed.toLowerCase() === cleanEmail
    );

    if (!isEmailValid) {
      setErrorMsg('Access Denied: Unrecognized Admin Gmail.');
      return;
    }

    const isPasswordValid = ALLOWED_ADMIN_PASSWORDS.includes(cleanPwd);
    if (!isPasswordValid) {
      setErrorMsg('Incorrect Admin Password. Please try again.');
      return;
    }

    setIsVerifying(true);
    try {
      // Set session unlock tokens
      sessionStorage.setItem('cm_admin_unlocked', 'true');
      sessionStorage.setItem('cm_admin_unlocked_time', Date.now().toString());

      // If user is not yet signed in or signed in with a different account, log into admin account
      if (!user || user.email?.trim().toLowerCase() !== cleanEmail) {
        await loginWithStudioEmail(cleanEmail);
      } else if (user.role !== 'admin') {
        await updateUser({ role: 'admin' });
      }

      toast.success('Admin Protocol Verified ✓ Opening Admin Panel...', {
        icon: '🛡️',
        duration: 3000
      });

      setPassword('');
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Admin verification error:', err);
      setErrorMsg(err.message || 'Authentication error. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12110d] border-2 border-[#FFD700]/70 rounded-3xl p-6 sm:p-8 w-full max-w-md relative shadow-[0_0_80px_rgba(255,215,0,0.3)] space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setPassword('');
            setErrorMsg('');
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/50 flex items-center justify-center text-[#FFD700] shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.25)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Admin Protocol Gateway</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Enter Gmail and Master Password</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Gmail Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
              Admin Gmail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#FFD700] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="Enter Admin Gmail..."
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Admin Password Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#FFD700] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter Admin Password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:border-[#FFD700] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setErrorMsg('');
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Unlock & Open'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
