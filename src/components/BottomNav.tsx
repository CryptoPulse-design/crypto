import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CandlestickChart, Sword, Wallet, LifeBuoy } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const activeClass = 'text-purple-500 dark:text-purple-400';
  const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400';

  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

const BottomNav = () => {
    const { openTelegramModal } = useAppContext();
 
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-slate-700 flex justify-around items-center z-50">
        <NavItem to="/" icon={<Home size={24} />} label="Home" />
        <NavItem to="/markets" icon={<CandlestickChart size={24} />} label="Markets" />
        <NavItem to="/trading" icon={<Sword size={24} />} label="Trading" />
        <button
            onClick={openTelegramModal}
            className="flex flex-col items-center justify-center w-full text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-200"
            aria-label="Contact Customer Service"
          >
              <LifeBuoy size={24} />
              <span className="text-xs mt-1">Service</span>
        </button>
        <NavItem to="/profile" icon={<Wallet size={24} />} label="Assets" />
      </nav>
    );
};

export default BottomNav;