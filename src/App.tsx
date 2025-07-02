import * as React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen.tsx';
import MarketsScreen from './screens/MarketsScreen.tsx';
import TradingScreen from './screens/TradingScreen.tsx';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { Loader, Send } from 'lucide-react';
import AdminRoute from './components/AdminRoute.tsx';
import AdminScreen from './screens/AdminScreen.tsx';
import HistoryScreen from './screens/HistoryScreen';
import { useAppContext } from './contexts/AppContext.tsx';

const TelegramFAB = () => {
    const handleTelegramClick = () => {
        window.open('https://t.me/customerservice_NSA', '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleTelegramClick}
            className="fixed bottom-24 right-4 z-50 bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
            aria-label="Contact Customer Service on Telegram"
            title="Contact on Telegram"
        >
            <Send size={24} />
        </button>
    );
};

const TelegramConfirmModal = () => {
    const { isTelegramModalOpen, closeTelegramModal } = useAppContext();

    if (!isTelegramModalOpen) return null;

    const confirmAndOpenTelegram = () => {
        window.open('https://t.me/customerservice_NSA', '_blank', 'noopener,noreferrer');
        closeTelegramModal();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={closeTelegramModal}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-sm mx-4 text-center shadow-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact Support</h3>
                <p className="my-4 text-gray-600 dark:text-gray-400">You are about to be redirected to Telegram for live support. Do you want to continue?</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={closeTelegramModal} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                    <button onClick={confirmAndOpenTelegram} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Continue</button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  const { isLoggedIn, isInitialized } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-black text-slate-900 dark:text-white">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-black text-slate-900 dark:text-white min-h-screen font-sans">
      <main className={isLoggedIn && !isAdminPage ? "pb-24" : ""}>
        <Routes>
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/markets" element={<ProtectedRoute><MarketsScreen /></ProtectedRoute>} />
          <Route path="/trading" element={<ProtectedRoute><TradingScreen /></ProtectedRoute>} />
          <Route path="/trading/:pair" element={<ProtectedRoute><TradingScreen /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminScreen /></AdminRoute>} />
          
          {/* If a user tries any other path, redirect them. */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/profile"} replace />} />
        </Routes>
      </main>
      {isLoggedIn && !isAdminPage && <BottomNav />}
      {isLoggedIn && !isAdminPage && <TelegramFAB />}
      <TelegramConfirmModal />
    </div>
  );
};

export default App;