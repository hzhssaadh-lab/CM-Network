import React from 'react';
import { motion } from 'motion/react';
import { useQuizStore, CATEGORIES } from '../store/quizStore';
import { Coins, Flame, Star, Trophy, Play, Settings } from 'lucide-react';

export function Home() {
  const { xp, coins, level, streak, setCategory } = useQuizStore();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 pb-24 overflow-y-auto">
      {/* Header Profile Info */}
      <header className="flex items-center justify-between mt-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 object-cover" />
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
              Lvl {level}
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">QuizMaster</h1>
            <div className="text-xs text-gray-400">Pro Player</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-bold text-sm">{coins}</span>
          </div>
          <button className="p-2 bg-white/5 rounded-full border border-white/10">
            <Settings size={20} className="text-gray-300" />
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
          <Flame size={24} className="text-orange-500 mb-1" />
          <span className="font-bold text-lg">{streak}</span>
          <span className="text-[10px] text-orange-200/70 uppercase font-semibold">Day Streak</span>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center justify-center">
          <Trophy size={24} className="text-purple-400 mb-1" />
          <span className="font-bold text-lg">Top 5%</span>
          <span className="text-[10px] text-purple-200/70 uppercase font-semibold">Rank</span>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
          <Star size={24} className="text-emerald-400 mb-1" />
          <span className="font-bold text-lg">{xp}</span>
          <span className="text-[10px] text-emerald-200/70 uppercase font-semibold">Total XP</span>
          
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${(xp % 1000) / 10}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Play size={20} className="text-pink-500" />
        Choose Category
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(cat.id)}
            className="group relative overflow-hidden rounded-3xl aspect-[4/5] flex flex-col items-center justify-center p-4 border border-white/10 shadow-lg shadow-black/50"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
            
            {/* Glass effect */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl mb-3 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-lg text-white">{cat.name}</h3>
              <div className="mt-2 px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-wider font-semibold border border-white/5">
                Play Now
              </div>
            </div>
            
            {/* animated border glow */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${cat.color} blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
