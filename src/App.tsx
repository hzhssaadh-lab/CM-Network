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
import { AdBanner } from './components/AdBanner';
import { SocialPopup } from './components/SocialPopup';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading, submitReferralCode } = useApp();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMaintenance = (dbValue: boolean) => {
      let targetTime = localStorage.getItem('cm_maintenance_end_timestamp');
      if (!targetTime) {
        const fiveHoursFromNow = Date.now() + 5 * 60 * 60 * 1000;
        targetTime = fiveHoursFromNow.toString();
        localStorage.setItem('cm_maintenance_end_timestamp', targetTime);
      }
      const targetMs = parseInt(targetTime, 10);
      return (Date.now() < targetMs) || dbValue;
    };

    const fetchMaintenance = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'app').single();
        if (data) {
           setMaintenanceMode(checkMaintenance(data.maintenanceMode === true));
        } else {
           setMaintenanceMode(checkMaintenance(false));
        }
      } catch (err) {
        console.error("Maintenance check failed:", err);
        setMaintenanceMode(checkMaintenance(false));
      }
    };
    
    fetchMaintenance();

    const channel = supabase.channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.app' }, (payload: any) => {
         if (payload.new) {
            setMaintenanceMode(checkMaintenance(payload.new.maintenanceMode === true));
         }
      })
      .subscribe();
      
    // Re-check periodically in case time passes while user is on the page
    const interval = setInterval(() => {
      fetchMaintenance();
    }, 10000); // check every 10 seconds
      
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('cm_invite_code', ref);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const applyPendingRef = async () => {
      if (user && !user.referredBy) {
        const code = localStorage.getItem('cm_invite_code');
        if (code) {
          try {
             await submitReferralCode(code);
          } catch(e) {
             console.error("Failed to apply pending referral code", e);
          } finally {
             localStorage.removeItem('cm_invite_code');
          }
        }
      }
    };
    applyPendingRef();
  }, [user, submitReferralCode]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading || maintenanceMode === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
      </div>
    );
  }

  // If maintenance mode is ON, block access for all users
  if (maintenanceMode) {
    return <Maintenance onMaintenanceEnd={() => setMaintenanceMode(false)} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto p-4 sm:p-8 relative">
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '16px' } }} />
      {!isAdminRoute && <SocialPopup />}
      {!isAdminRoute && <Header />}
      {!isAdminRoute && <AdBanner />}
      
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
        {!isAdminRoute && <AdBanner />}
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
