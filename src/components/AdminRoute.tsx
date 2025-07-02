import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Loader } from 'lucide-react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isInitialized, isAdmin } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-black text-slate-900 dark:text-white">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;