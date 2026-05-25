import { NavLink } from 'react-router-dom';
import { Home, Zap, Wallet, Users, User, Shield, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../hooks/useAppStore';

export function Navigation() {
  const { user } = useApp();
  
  const navItems = [
    { to: '/', icon: Home, label: 'DASHBOARD' },
    { to: '/tasks', icon: Zap, label: 'TASKS' },
    { to: '/wallet', icon: Wallet, label: 'WALLET' },
    { to: '/friends', icon: Users, label: 'FRIENDS' },
    { to: '/leaderboard', icon: Trophy, label: 'RANKS' },
    { to: '/profile', icon: User, label: 'PROFILE' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: Shield, label: 'ADMIN' });
  }

  return (
    <nav className="h-20 bg-white/5 border-t border-white/10 rounded-t-[40px] flex items-center justify-around px-2 sm:px-12 w-full max-w-7xl mx-auto backdrop-blur-md pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center transition-all duration-300",
              isActive 
                ? "text-[#FFD700] opacity-100 scale-110" 
                : "text-gray-500 opacity-60 hover:opacity-100 hover:text-gray-300"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] sm:text-[10px] font-black uppercase mt-1 tracking-tighter">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
