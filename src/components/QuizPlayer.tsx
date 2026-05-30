import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuizStore, MOCK_QUESTIONS, Question } from '../store/quizStore';
import { X, Heart, MessageCircle, Share2, Music, Check, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

export function QuizPlayer() {
  const { currentCategory, setCategory, addCoins, addXp } = useQuizStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentCategory && MOCK_QUESTIONS[currentCategory]) {
      setQuestions(MOCK_QUESTIONS[currentCategory]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setShowResult(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    if (selectedAnswer === null && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Wait actually NodeJS.Timeout typing issues might arise if DOM compiler is used, let's just use window.setInterval
    };
  }, [currentIndex, selectedAnswer, showResult]);

  const currentQ = questions[currentIndex];

  const handleTimeUp = () => {
    setSelectedAnswer(-1); // -1 signifies timeout
    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    if (timerRef.current) clearInterval(timerRef.current as any);

    if (index === currentQ.correctAnswer) {
      // Correct!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ffffff', '#eab308']
      });
      addCoins(10);
      addXp(50);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      setShowResult(true);
    }
  };

  const quit = () => {
    setCategory(null);
  };

  if (!currentQ) return null;

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center p-6 z-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-xl flex flex-col items-center max-w-sm w-full text-center"
        >
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            <span className="text-5xl">🏆</span>
          </div>
          <h2 className="text-3xl font-black mb-2">Awesome!</h2>
          <p className="text-gray-300 mb-8">You completed the {currentCategory} quiz</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <span className="text-emerald-400 font-bold block text-2xl">+Xp</span>
              <span className="text-xs text-gray-400 uppercase">Earned</span>
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
              <span className="text-yellow-400 font-bold block text-2xl">+Coins</span>
              <span className="text-xs text-gray-400 uppercase">Earned</span>
            </div>
          </div>

          <button 
            onClick={quit}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col bg-black">
      {/* Video Background Simulation */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -200 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-0"
        >
          <img src={currentQ.bgUrl} alt="bg" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
        </motion.div>
      </AnimatePresence>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-8 sm:pt-6">
        <button onClick={quit} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20">
          <ChevronLeft size={24} className="text-white" />
        </button>

        <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 font-bold text-white text-sm">
          {currentIndex + 1} / {questions.length}
        </div>

        <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20">
          {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-8 px-4 sm:px-6 max-w-lg mx-auto w-full">
        {/* Question Text */}
        <motion.div 
          key={`q-${currentQ.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
            {currentQ.text}
          </h2>
        </motion.div>

        {/* Options */}
        <div className="flex flex-col gap-3 w-full pr-14 sm:pr-16">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === currentQ.correctAnswer;
            const isAnswered = selectedAnswer !== null;

            let btnClass = "bg-white/15 backdrop-blur-md border border-white/20 text-white";
            if (isAnswered) {
              if (isCorrect) {
                btnClass = "bg-emerald-500/80 backdrop-blur-md border border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]";
              } else if (isSelected) {
                btnClass = "bg-rose-500/80 backdrop-blur-md border border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-[shake_0.5s_ease-in-out]";
              } else {
                btnClass = "bg-black/40 border border-white/5 text-gray-400";
              }
            }

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={!isAnswered ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={isAnswered}
                className={`relative w-full text-left p-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${btnClass}`}
              >
                {opt}
                {isAnswered && isCorrect && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check size={16} className="text-emerald-500" />
                  </motion.div>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <X size={16} className="text-rose-500" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right side floating action buttons (TikTok style) */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
          <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex flex-col items-center justify-center pb-1">
             <span className="font-bold text-lg text-white">{timeLeft}</span>
             <svg className="absolute inset-0 w-full h-full transform -rotate-90">
               <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
               <motion.circle 
                 cx="24" 
                 cy="24" 
                 r="22" 
                 stroke={timeLeft <= 5 ? "#ef4444" : "#eab308"} 
                 strokeWidth="3" 
                 fill="none" 
                 strokeDasharray="138" 
                 initial={{ strokeDashoffset: 0 }}
                 animate={{ strokeDashoffset: 138 - (138 * timeLeft) / 15 }}
                 transition={{ ease: "linear", duration: 1 }}
               />
             </svg>
          </div>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
              <Heart size={24} className="text-white" />
            </div>
            <span className="text-xs text-white font-medium">12.4k</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
              <MessageCircle size={24} className="text-white" />
            </div>
            <span className="text-xs text-white font-medium">104</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
              <Share2 size={24} className="text-white" />
            </div>
            <span className="text-xs text-white font-medium">Share</span>
          </button>

          <div className="w-10 h-10 mt-4 rounded-full overflow-hidden border-2 border-white/30 animate-[spin_4s_linear_infinite]">
            <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=100&q=80" alt="audio" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      
      {/* Bottom Audio Scroller Info */}
      <div className="absolute bottom-4 left-4 right-20 z-10 flex items-center gap-2 overflow-hidden whitespace-nowrap mask-fade-right">
        <Music size={16} className="text-white shrink-0" />
        <span className="text-white/80 text-sm animate-[marquee_10s_linear_infinite] inline-block font-medium">
          Original Sound - QuizMaster • Epic Gaming Track • Original Sound - QuizMaster
        </span>
      </div>
    </div>
  );
}
