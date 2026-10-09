import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useAppStore';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Wallet } from './pages/Wallet';
import { Friends } from './pages/Friends';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Leaderboard } from './pages/Leaderboard';
import { Squads } from './pages/Squads';
import { Ads } from './pages/Ads';
import { Maintenance } from './pages/Maintenance';
import { SocialPopup } from './components/SocialPopup';
import { OFFICIAL_SOCIALS } from './components/SocialChannels';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { UNIVERSAL_MAINTENANCE_END_MS } from './lib/utils';

function AppContent() {
  console.log("AppContent rendered!");
  const { user, loading, submitReferralCode } = useApp();
  const location = useLocation();

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(true); // Default to true for safety

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('id', 'app').single();
        if (data) {
           setMaintenanceMode(data.maintenanceMode === true);
        }
      } catch (err) {
        console.error("Maintenance check failed:", err);
      }
    };
    
    fetchMaintenance();

    const channel = supabase.channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.app' }, (payload: any) => {
         if (payload.new) {
            setMaintenanceMode(payload.new.maintenanceMode === true);
         }
      })
      .subscribe();
      
    const interval = setInterval(fetchMaintenance, 15000);
      
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!user) {
    return <Login />;
  }

  if (maintenanceMode && !isAdminRoute) {
    return <Maintenance onMaintenanceEnd={() => setMaintenanceMode(false)} />;
  }


  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto p-4 sm:p-8 relative">
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '16px' } }} />
      {!isAdminRoute && <SocialPopup />}
      {!isAdminRoute && <Header />}
      
      <main className={`flex-1 w-full flex flex-col pt-4 ${isAdminRoute ? 'pb-8' : 'pb-32'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Footer with Direct Clickable Icons for WhatsApp, X (Twitter), and Telegram */}
        {!isAdminRoute && (
          <footer className="w-full max-w-5xl mx-auto mt-12 mb-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
            <div>
              <p className="font-extrabold text-white tracking-wider text-xs">CM NETWORK COMMUNITY</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Direct official channels: WhatsApp, X, and Telegram</p>
            </div>
            <div className="flex items-center gap-3">
              {OFFICIAL_SOCIALS.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${social.name}`}
                  title={`${social.name}: ${social.actionText}`}
                  className={`w-10 h-10 rounded-xl bg-black/60 border ${social.borderColor} ${social.shadowColor} flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center transition-transform group-hover:scale-110`} style={{ color: social.brandColor }}>
                    {social.icon}
                  </div>
                </a>
              ))}
              <a
                href="mailto:cmnetwork122@gmail.com"
                aria-label="Email Support"
                title="Email Support: cmnetwork122@gmail.com"
                className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 hover:border-[#FFD700]/60 flex items-center justify-center text-[#FFD700] hover:scale-110 active:scale-95 transition-all group"
              >
                <span className="text-xs font-bold">✉</span>
              </a>
            </div>
          </footer>
        )}
      </main>

      {!isAdminRoute && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-10 z-[100] pointer-events-none pb-4 sm:pb-8">
          <div className="max-w-7xl mx-auto w-full pointer-events-auto">
            <Navigation />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
