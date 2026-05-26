import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Edit2, X, Check, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export function Profile() {
  const { user, logout, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsFlipped(false);
      return;
    }
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [isEditing]);

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center bg-black/60 backdrop-blur-3xl rounded-[32px] p-10 border border-white/10 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.05)]"
      >
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#FFD700]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-10 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
         
         {user.role === 'admin' && (
           <span className="absolute top-6 right-6 bg-red-500/10 text-red-400 text-[10px] items-center flex font-bold px-4 py-1.5 rounded-full border border-red-500/20 uppercase tracking-widest">
             <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
             Admin
           </span>
         )}
         
         <div className="w-full relative z-20 flex flex-col items-center justify-center h-[260px] mb-6" style={{ perspective: 1000 }}>
           <motion.div
             initial={false}
             animate={{ rotateY: isFlipped && !isEditing ? 180 : 0 }}
             transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
             style={{ transformStyle: "preserve-3d" }}
             className="w-full h-full relative"
           >
             {/* Front Side - User Info */}
             <div style={{ backfaceVisibility: "hidden" }} className="w-full h-full flex flex-col items-center justify-center absolute inset-0">
               <div className="relative mb-6 group cursor-pointer" onClick={() => {
                   if (!isEditing) {
                     setEditedName(user.name);
                     setIsEditing(true);
                   }
                 }}>
                 <div className="absolute inset-0 bg-[#FFD700] blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
                 {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full border-2 border-[#FFD700]/30 object-cover z-10 group-hover:border-[#FFD700]/60 transition-colors duration-300 shadow-xl" />
                 ) : (
                    <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-[#FFD700]/30 flex items-center justify-center z-10 group-hover:border-[#FFD700]/60 transition-colors duration-300 shadow-xl">
                       <span className="text-5xl font-black text-[#FFD700] drop-shadow-md">{user.name.charAt(0)}</span>
                    </div>
                 )}
                 <button 
                   className="absolute bottom-0 right-0 z-20 bg-black/80 backdrop-blur-sm border border-[#FFD700]/50 p-2.5 rounded-full text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-all duration-300 shadow-lg"
                 >
                   <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                 </button>
               </div>

               {isEditing ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                   className="w-full max-w-sm relative z-20"
                 >
                   <div className="flex bg-black/40 border border-[#FFD700]/30 rounded-2xl p-1 backdrop-blur-md">
                     <input
                       type="text"
                       value={editedName}
                       onChange={(e) => setEditedName(e.target.value)}
                       className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none text-center font-bold text-lg"
                       placeholder="Enter your name"
                       autoFocus
                       disabled={saving}
                     />
                     <button 
                       onClick={async () => {
                         if (!editedName.trim() || editedName.trim() === user.name) {
                           setIsEditing(false);
                           return;
                         }
                         setSaving(true);
                         try {
                           await updateUser({ name: editedName.trim() });
                           setIsEditing(false);
                         } catch(e) {
                           console.error("Update error:", e);
                           alert("Failed to update name.");
                         } finally {
                           setSaving(false);
                         }
                       }}
                       disabled={saving}
                       className="bg-[#FFD700]/10 text-[#FFD700] px-4 rounded-xl hover:bg-[#FFD700]/20 transition-colors flex items-center justify-center font-bold"
                     >
                       <Check className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => setIsEditing(false)}
                       disabled={saving}
                       className="text-gray-400 px-3 hover:text-white transition-colors"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                 </motion.div>
               ) : (
                 <div className="text-center relative z-20 cursor-pointer group" onClick={() => {
                    setEditedName(user.name);
                    setIsEditing(true);
                 }}>
                   <h2 className="text-3xl lg:text-4xl font-black mb-1 lg:mb-2 capitalize tracking-tight flex items-center justify-center gap-2 group-hover:text-[#FFD700] transition-colors">
                     {user.name}
                   </h2>
                   <p className="text-gray-400 font-mono text-xs lg:text-sm">{user.email}</p>
                 </div>
               )}
             </div>

             {/* Back Side - Coins Info */}
             <div 
               style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} 
               className="w-full h-full flex flex-col items-center justify-center absolute inset-0 cursor-pointer"
               onClick={() => setIsFlipped(false)}
             >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#FFD700] blur-3xl opacity-30 rounded-full animate-pulse"></div>
                  <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-400 to-[#FFD700] border-4 border-yellow-200/50 flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.4)]">
                     <div className="absolute inset-1 rounded-full border-2 border-dashed border-white/30 animate-[spin_10s_linear_infinite]"></div>
                     <Coins className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-900 drop-shadow-md" />
                  </div>
                </div>
                <div className="text-center">
                   <h2 className="text-4xl font-black mb-1 lg:mb-2 tracking-tight text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                     {formatCurrency(user.balance)}
                   </h2>
                   <p className="text-gray-400 font-bold tracking-widest uppercase text-xs lg:text-sm">Total Balance</p>
                </div>
             </div>
           </motion.div>
         </div>
         
         <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-5 flex justify-between items-center border border-white/5 relative z-20 hover:bg-white/10 transition-colors">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account Status</span>
              <span className="text-sm text-white font-medium">Verified Profile</span>
            </div>
            <span className={`text-[10px] px-4 py-1.5 bg-black/40 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 shadow-inner ${user.isActive ? 'text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]' : 'text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shadow-md ${user.isActive ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'}`}></span>
              {user.isActive ? 'Active' : 'Blocked'}
            </span>
         </div>
      </motion.div>

      <div className="space-y-4">
        <button onClick={() => {
           setEditedName(user.name);
           setIsEditing(true);
           window.scrollTo({ top: 0, behavior: 'smooth' });
        }} className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
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
