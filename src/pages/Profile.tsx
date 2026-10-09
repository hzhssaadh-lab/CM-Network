import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppStore';
import { Edit2, X, Check, Coins, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';

const AVATARS = [
  { id: 'default_cap', type: 'image', url: 'https://i.pinimg.com/474x/61/4d/9a/614d9a5679cf070455092347cb4ec5e3.jpg', label: 'Yellow Cap' },
  { id: 'cool_goggles', type: 'image', url: 'https://i.pinimg.com/474x/7d/1a/3c/7d1a3c05f0376bd67f6bb178b66807d3.jpg', label: 'Cool Goggles' },
  { id: 'cute_panda', type: 'image', url: 'https://i.pinimg.com/474x/92/df/31/92df31b40b1df8e98327d92f97da64c7.jpg', label: 'Panda Friend' },
  { id: 'cute_anime', type: 'image', url: 'https://i.pinimg.com/474x/b8/b6/42/b8b642e557876a9c7ebbb4ff90ff8a7a.jpg', label: 'Cute Anime' },
  { id: 'cute_bunny', type: 'image', url: 'https://i.pinimg.com/474x/23/e8/63/23e86386da61ed67d4fdf8073b64cb91.jpg', label: 'Bunny Friend' },
  { id: 'black_hoodie', type: 'image', url: 'https://i.pinimg.com/474x/cb/09/be/cb09be4d0e657682f9d8ffb2067786bf.jpg', label: 'Black Hoodie' },
  { id: 'pink_teddy', type: 'image', url: 'https://i.pinimg.com/474x/32/cb/78/32cb78b05d15cae373d42b404d88e0cd.jpg', label: 'Pink Teddy' },
  { id: 'cute_kitten', type: 'image', url: 'https://i.pinimg.com/474x/06/f0/a4/06f0a40232df6cf82216bf33db35d791.jpg', label: 'Cute Kitty' },
  { id: 'neon_astronaut', type: 'image', url: 'https://i.pinimg.com/474x/24/73/80/2473809df6ebdfb19f170e7041a7e283.jpg', label: 'Astronaut' },
  { id: 'shinigami', type: 'image', url: 'https://i.pinimg.com/474x/d5/a2/12/d5a212264bbdc591a27e023f0df682e1.jpg', label: 'Shinigami' },
  { id: 'coffee_girl', type: 'image', url: 'https://i.pinimg.com/474x/13/ee/b2/13eeb2db80ff639e4a83e0cb972fe882.jpg', label: 'Coffee Vibe' },
  { id: 'mask_boy', type: 'image', url: 'https://i.pinimg.com/474x/bf/53/7d/bf537d7a46985012cf19fcf45da7990c.jpg', label: 'Mask Boy' },
  
  { id: 'emoji_cowboy', type: 'emoji', value: '🤠', gradient: 'from-yellow-400 to-amber-700', label: 'Cowboy' },
  { id: 'emoji_lion', type: 'emoji', value: '🦁', gradient: 'from-amber-500 to-orange-700', label: 'Lion' },
  { id: 'emoji_tiger', type: 'emoji', value: '🐯', gradient: 'from-orange-400 to-amber-600', label: 'Tiger' },
  { id: 'emoji_panda', type: 'emoji', value: '🐼', gradient: 'from-slate-100 to-slate-400 text-black', label: 'Panda' },
  { id: 'emoji_unicorn', type: 'emoji', value: '🦄', gradient: 'from-pink-400 to-purple-600', label: 'Unicorn' },
  { id: 'emoji_rocket', type: 'emoji', value: '🚀', gradient: 'from-sky-400 to-indigo-700', label: 'Rocket' },
  { id: 'emoji_crown', type: 'emoji', value: '👑', gradient: 'from-yellow-300 to-yellow-600', label: 'Crown' },
  { id: 'emoji_fire', type: 'emoji', value: '🔥', gradient: 'from-red-500 to-orange-600', label: 'Fire' },
  { id: 'emoji_ghost', type: 'emoji', value: '👻', gradient: 'from-purple-900 to-indigo-950', label: 'Ghost' },
  { id: 'emoji_alien', type: 'emoji', value: '👽', gradient: 'from-green-500 to-emerald-800', label: 'Alien' },
  { id: 'emoji_robot', type: 'emoji', value: '🤖', gradient: 'from-slate-400 to-slate-600', label: 'Robot' },
  { id: 'emoji_gem', type: 'emoji', value: '💎', gradient: 'from-cyan-400 to-blue-600', label: 'Diamond' },
  { id: 'emoji_controller', type: 'emoji', value: '🎮', gradient: 'from-purple-500 to-pink-700', label: 'Gamer' },
  { id: 'emoji_trophy', type: 'emoji', value: '🏆', gradient: 'from-yellow-400 to-amber-600', label: 'Champion' },
  { id: 'emoji_ninja', type: 'emoji', value: '🥷', gradient: 'from-neutral-800 to-neutral-950', label: 'Ninja' },
  { id: 'emoji_phoenix', type: 'emoji', value: '🐦', gradient: 'from-red-500 to-rose-700', label: 'Phoenix' },
];

const renderAvatarHelper = (url: string, name: string, containerClasses: string, textClasses: string) => {
  if (url && url.startsWith('emoji:')) {
    const parts = url.split(':');
    const emoji = parts[1] || '🤠';
    const grad = parts[2] || 'from-yellow-500/20 via-amber-600/10 to-transparent';
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br ${grad} border-2 border-[#FFD700]/30 z-10 rounded-full shadow-xl overflow-hidden ${containerClasses}`}>
        <div className="absolute inset-0 bg-black/40 -z-10"></div>
        <span className={`${textClasses} drop-shadow-md select-none`}>{emoji}</span>
      </div>
    );
  }
  
  if (url && url.startsWith('http')) {
    return (
      <img 
        src={url} 
        alt={name} 
        className={`relative border-2 border-[#FFD700]/30 object-cover z-10 shadow-xl rounded-full ${containerClasses}`}
      />
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-gray-900 to-black border-2 border-[#FFD700]/30 flex items-center justify-center z-10 shadow-xl rounded-full ${containerClasses}`}>
      <span className={`${textClasses} font-black text-[#FFD700] drop-shadow-md`}>{name ? name.charAt(0).toUpperCase() : 'CM'}</span>
    </div>
  );
};

export function Profile() {
  const { user, logout, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);


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
             <div 
               style={{ backfaceVisibility: "hidden" }} 
               className="w-full h-full flex flex-col items-center justify-center absolute inset-0 cursor-pointer"
               onClick={() => !isEditing && setIsFlipped(true)}
             >
               <div className="relative mb-6 group/avatar">
                 <div className="absolute inset-0 bg-[#FFD700] blur-2xl opacity-20 rounded-full group-hover/avatar:opacity-30 transition-opacity duration-500"></div>
                 {renderAvatarHelper(user.photoURL, user.name, "w-28 h-28 lg:w-32 lg:h-32 group-hover/avatar:border-[#FFD700]/60 transition-colors duration-300", "text-5xl")}
                 {!isEditing && (
                   <>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setShowAvatarModal(true);
                       }}
                       className="absolute bottom-0 left-0 z-20 bg-black/80 backdrop-blur-sm border border-[#FFD700]/50 p-2.5 rounded-full text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 shadow-lg animate-pulse"
                       title="Change Avatar"
                     >
                       <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
                     </button>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditedName(user.name);
                         setIsEditing(true);
                       }}
                       className="absolute bottom-0 right-0 z-20 bg-black/80 backdrop-blur-sm border border-[#FFD700]/50 p-2.5 rounded-full text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 shadow-lg"
                       title="Edit Name"
                     >
                       <Edit2 className="w-4 h-4 lg:w-5 lg:h-5" />
                     </button>
                   </>
                 )}
               </div>

               {isEditing ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                   className="w-full max-w-sm relative z-20 px-4"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <div className="flex flex-col gap-3">
                     <input
                       type="text"
                       value={editedName}
                       onChange={(e) => setEditedName(e.target.value)}
                       className="w-full bg-black/40 border border-[#FFD700]/30 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/60 text-center font-bold text-lg backdrop-blur-md"
                       placeholder="Enter your name"
                       autoFocus
                       disabled={saving}
                     />
                     <div className="flex justify-center gap-2">
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
                         className="flex-1 bg-[#FFD700]/10 text-[#FFD700] py-3 rounded-xl hover:bg-[#FFD700]/20 transition-colors flex items-center justify-center font-bold text-sm uppercase tracking-wider border border-[#FFD700]/30"
                       >
                         {saving ? 'Saving...' : 'Save'}
                       </button>
                       <button 
                         onClick={() => setIsEditing(false)}
                         disabled={saving}
                         className="px-6 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/5 font-bold text-sm uppercase tracking-wider"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="text-center relative z-20 group text-white">
                   <h2 className="text-3xl lg:text-4xl font-black mb-1 lg:mb-2 capitalize tracking-tight flex items-center justify-center gap-2 transition-colors">
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
        <button onClick={() => alert('Terms & Conditions: Please contact support at cmnetwork122@gmail.com for our policy.')} className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
           <span className="font-bold text-sm">Terms & Conditions</span>
           <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
        </button>
        <a href="mailto:cmnetwork122@gmail.com" className="w-full bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
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

      <AnimatePresence>
        {showAvatarModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-neutral-950 border border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-lg shadow-[0_0_50px_rgba(255,215,0,0.15)] relative overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Choose Avatar</h3>
                  <p className="text-gray-400 text-xs mt-1">Select your favorite look or emoji</p>
                </div>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar scrollbar-none">
                {/* Premium Styles */}
                <div>
                  <h4 className="text-xs font-black uppercase text-[#FFD700] tracking-widest mb-3">Premium Styles</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.filter(a => a.type === 'image').map((av) => {
                      const isSelected = user.photoURL === av.url;
                      return (
                        <button
                          key={av.id}
                          disabled={updatingAvatar}
                          onClick={async () => {
                            setUpdatingAvatar(true);
                            try {
                              await updateUser({ photoURL: av.url });
                              setShowAvatarModal(false);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setUpdatingAvatar(false);
                            }
                          }}
                          className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group/item ${
                            isSelected 
                              ? 'border-[#FFD700] scale-95 shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                              : 'border-white/10 hover:border-[#FFD700]/50 hover:scale-105'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#FFD700] text-black p-0.5 rounded-full z-10 shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emojis Section */}
                <div>
                  <h4 className="text-xs font-black uppercase text-[#FFD700] tracking-widest mb-3">Cool Emojis</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {AVATARS.filter(a => a.type === 'emoji').map((av) => {
                      const emojiValue = `emoji:${av.value}:${av.gradient}`;
                      const isSelected = user.photoURL === emojiValue;
                      return (
                        <button
                          key={av.id}
                          disabled={updatingAvatar}
                          onClick={async () => {
                            setUpdatingAvatar(true);
                            try {
                              await updateUser({ photoURL: emojiValue });
                              setShowAvatarModal(false);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setUpdatingAvatar(false);
                            }
                          }}
                          className={`aspect-square rounded-2xl bg-gradient-to-br ${av.gradient} border-2 flex items-center justify-center text-3xl transition-all relative group/item overflow-hidden ${
                            isSelected 
                              ? 'border-[#FFD700] scale-95 shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                              : 'border-white/10 hover:border-[#FFD700]/50 hover:scale-105'
                          }`}
                        >
                          <div className="absolute inset-0 bg-black/30 -z-10"></div>
                          <span className="drop-shadow-md select-none group-hover/item:scale-110 transition-transform duration-300">{av.value}</span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#FFD700] text-black p-0.5 rounded-full z-10 shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
