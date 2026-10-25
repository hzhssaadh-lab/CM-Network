import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppStore';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ALLOWED_ADMIN_EMAILS = [
  'hzhadh@gmail.com',
  'hzhssaadh@gmail.com',
  'ms888mf@gmail.com'
];

export const ADMIN_SECRET_PASSWORD = 'cmnetwork@804@';

interface AdminSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminSecretModal({ isOpen, onClose, onSuccess }: AdminSecretModalProps) {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const currentEmail = (user?.email || '').trim().toLowerCase();
  const isAuthorizedEmail = ALLOWED_ADMIN_EMAILS.some(
    (allowed) => allowed.toLowerCase() === currentEmail
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in with hzhadh@gmail.com first.');
      return;
    }

    if (!isAuthorizedEmail) {
      setErrorMsg('Access Denied: Only authorized admin (hzhadh@gmail.com) can access this terminal.');
      return;
    }

    if (password !== ADMIN_SECRET_PASSWORD) {
      setErrorMsg('Incorrect Admin Password. Please try again.');
      return;
    }

    setIsVerifying(true);
    try {
      // Set session unlock token
      sessionStorage.setItem('cm_admin_unlocked', 'true');
      sessionStorage.setItem('cm_admin_unlocked_time', Date.now().toString());

      if (user.role !== 'admin') {
        await updateUser({ role: 'admin' });
      }

      toast.success('Admin Terminal Unlocked ✓', {
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
      console.error('Admin unlock error:', err);
      setErrorMsg('Authentication error. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12110d] border-2 border-[#FFD700]/60 rounded-3xl p-6 sm:p-8 w-full max-w-md relative shadow-[0_0_60px_rgba(255,215,0,0.25)] space-y-5">
        
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
          <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Admin Terminal Access</span>
              <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">CM Network Internal Protocol Gateway</p>
          </div>
        </div>

        {/* Email Verification Status */}
        <div className={`p-3.5 rounded-2xl border text-xs ${
          isAuthorizedEmail
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Session Email</span>
            {isAuthorizedEmail ? (
              <span className="font-mono font-bold flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Authorized Admin
              </span>
            ) : (
              <span className="font-mono font-bold flex items-center gap-1 text-[10px] text-amber-400">
                <AlertTriangle className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>
          <p className="font-mono font-black truncate">{user?.email || 'Not logged in'}</p>
          {!isAuthorizedEmail && (
            <p className="text-[10px] text-amber-400/80 mt-1">
              Required: Log in using <strong>hzhadh@gmail.com</strong>
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Admin Gateway Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm font-mono focus:border-[#FFD700] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white p-0.5"
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
              className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !isAuthorizedEmail}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Authenticating...' : 'Unlock Terminal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
