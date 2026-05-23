import { useApp } from '../hooks/useAppStore';

export function Profile() {
  const { user, logout } = useApp();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col items-center bg-gradient-to-br from-black to-[#0a0a0a] rounded-[32px] p-10 border border-[#FFD700]/20 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
         
         {user.role === 'admin' && (
           <span className="absolute top-6 right-6 bg-red-500/10 text-red-400 text-[10px] items-center flex font-bold px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
             <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
             Admin
           </span>
         )}
         
         <div className="relative mb-6">
           <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-20 rounded-full"></div>
           {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="relative w-28 h-28 rounded-full border-2 border-[#FFD700]/50 object-cover z-10" />
           ) : (
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-[#FFD700]/50 flex items-center justify-center z-10">
                 <span className="text-4xl font-black text-[#FFD700]">{user.name.charAt(0)}</span>
              </div>
           )}
         </div>

         <h2 className="text-3xl font-black mb-1 capitalize tracking-tight">{user.name}</h2>
         <p className="text-gray-500 font-mono text-sm mb-8">{user.email}</p>
         
         <div className="w-full bg-white/5 rounded-2xl p-5 flex justify-between items-center border border-white/5">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Account Status</span>
            <span className={`text-[10px] px-3 py-1 bg-black/40 rounded-full font-bold uppercase tracking-widest ${user.isActive ? 'text-green-400 border border-green-400/20' : 'text-red-400 border border-red-400/20'}`}>
              {user.isActive ? 'Active' : 'Blocked'}
            </span>
         </div>
      </div>

      <div className="space-y-4">
        <button onClick={() => alert('Account Settings: Currently unavailable')} className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
           <span className="font-bold text-sm">Account Settings</span>
           <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
        </button>
        <button onClick={() => alert('Terms & Conditions: Please contact support for our policy.')} className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
           <span className="font-bold text-sm">Terms & Conditions</span>
           <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
        </button>
        <a href="mailto:ms888mf@gmail.com" className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
           <span className="font-bold text-sm">Contact Support</span>
           <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
        </a>
        <button 
           onClick={handleLogout}
           className="w-full bg-white/5 hover:bg-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-center mt-8 font-bold text-sm tracking-widest uppercase"
        >
           LOGOUT SECURELY
        </button>
      </div>
    </div>
  );
}
