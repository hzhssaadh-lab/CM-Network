import { create } from 'zustand';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  bgUrl: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: QuizCategory[] = [
  { id: 'countries', name: 'Countries', icon: '🌍', color: 'from-blue-500 to-cyan-400' },
  { id: 'animals', name: 'Animals', icon: '🐅', color: 'from-orange-500 to-amber-400' },
  { id: 'cars', name: 'Cars', icon: '🚗', color: 'from-red-500 to-rose-400' },
  { id: 'space', name: 'Space', icon: '🚀', color: 'from-indigo-600 to-purple-500' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-emerald-500 to-teal-400' },
  { id: 'movies', name: 'Movies', icon: '🎬', color: 'from-pink-500 to-rose-400' }
];

export const MOCK_QUESTIONS: Record<string, Question[]> = {
  countries: [
    { id: 'c1', text: 'Which country has the largest population?', options: ['India', 'China', 'USA', 'Indonesia'], correctAnswer: 0, bgUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { id: 'c2', text: 'What is the capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correctAnswer: 2, bgUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80' },
    { id: 'c3', text: 'Which of these is NOT in Europe?', options: ['France', 'Egypt', 'Germany', 'Spain'], correctAnswer: 1, bgUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80' }
  ],
  space: [
    { id: 's1', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1, bgUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80' },
    { id: 's2', text: 'What is the largest moon of Saturn?', options: ['Europa', 'Titan', 'Ganymede', 'Callisto'], correctAnswer: 1, bgUrl: 'https://images.unsplash.com/photo-1614316053303-a26a3d606138?auto=format&fit=crop&w=800&q=80' }
  ]
};

// Fill missing categories with default questions for demo
CATEGORIES.forEach(c => {
  if (!MOCK_QUESTIONS[c.id]) {
    MOCK_QUESTIONS[c.id] = [
      { id: `${c.id}1`, text: `Question 1 about ${c.name}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0, bgUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80' },
      { id: `${c.id}2`, text: `Question 2 about ${c.name}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 1, bgUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
    ];
  }
});

interface QuizState {
  xp: number;
  coins: number;
  level: number;
  streak: number;
  currentCategory: string | null;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  setCategory: (categoryId: string | null) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  xp: 1250,
  coins: 450,
  level: 5,
  streak: 12,
  currentCategory: null,
  addXp: (amount) => set((state) => ({ 
    xp: state.xp + amount,
    level: Math.floor((state.xp + amount) / 1000) + 1
  })),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  setCategory: (categoryId) => set({ currentCategory: categoryId }),
}));
