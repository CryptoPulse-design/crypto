import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, Lock, Sun, Moon, CreditCard, Download, Repeat, ArrowLeft, HelpCircle, Mail, User as UserIcon, Users, LogOut, AlertCircle, Loader, Camera, ShieldCheck, CheckCircle2, Clock, XCircle, ArrowDownLeft, ArrowUpRight, MailCheck, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { User, Transaction, KYCStatus, Notification } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const FormInput = ({ id, label, type = 'text', value, onChange, placeholder = '', required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
    </div>
);

const CountrySelect = ({ id, value, onChange }) => {
    const countries = [ "Brazil", "United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "Australia", "India", "Mexico", "Argentina", "South Korea" ];
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
                <option value="">Select a country</option>
                {countries.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
        </div>
    );
};

const KycStatusBadge = ({ status, onClick }: { status: KYCStatus; onClick?: () => void }) => {
    const statusInfo = {
        verified: { Icon: CheckCircle2, text: 'Verified', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        pending: { Icon: Clock, text: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        unverified: { Icon: AlertCircle, text: 'Unverified', className: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-300' },
        rejected: { Icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    }[status];

    const Tag = onClick ? 'button' : 'span';

    return (
        <Tag
            onClick={onClick}
            className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${statusInfo.className} ${onClick ? 'hover:opacity-80 transition-opacity' : ''}`}
        >
            <statusInfo.Icon size={14} className="mr-1.5" />
            {statusInfo.text}
        </Tag>
    );
};

const MenuItem = ({ icon, label, onClick, badge }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: number; }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center space-x-4">
            {icon}
            <span className="font-medium text-slate-900 dark:text-white">{label}</span>
        </div>
        <div className="flex items-center space-x-3">
            {badge > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{badge}</span>
            )}
            <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
        </div>
    </button>
);

const ViewContainer = ({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) => (
    <div className="animate-fade-in">
        <header className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">{title}</h2>
        </header>
        {children}
    </div>
);

const LoginSignupForm = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [formData, setFormData] = React.useState({ name: '', email: '', password: '', dateOfBirth: '', country: '', address: '' });
  const [error, setError] = React.useState('');
  const { login, signup, isLoading } = useAuth();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await signup(formData.name, formData.email, formData.password, { 
                dateOfBirth: formData.dateOfBirth, 
                country: formData.country, 
                address: formData.address 
            });
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{isLogin ? 'Log in to continue your trading journey.' : 'Join the future of finance.'}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && <FormInput id="name" label="Full Name" value={formData.name} onChange={handleChange} placeholder="Alex Johnson" />}
            <FormInput id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            <FormInput id="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            {!isLogin && (
                <>
                    <FormInput id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                    <CountrySelect id="country" value={formData.country} onChange={handleChange} />
                    <FormInput id="address" label="Residential Address" value={formData.address} onChange={handleChange} placeholder="123 Crypto Lane" />
                </>
            )}
            
            {error && <p className="text-sm text-center text-red-500 dark:text-red-400">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400">
                 {isLoading ? <Loader className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 font-medium text-purple-600 hover:text-purple-500">
                {isLogin ? 'Sign up' : 'Log in'}
            </button>
        </p>
    </div>
  );
};

const ProfileScreen = () => {
  const { user, isLoggedIn, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = React.useState('main');

  React.useEffect(() => {
    if (location.state?.view) {
        setView(location.state.view);
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  if (!isLoggedIn || !user) {
    return (
        <div className="p-4">
            <LoginSignupForm />
        </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="animate-fade-in space-y-6">
        <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assets</h1>
            <button onClick={logout} title="Log Out" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <LogOut size={22} className="text-red-500 dark:text-red-400" />
            </button>
        </header>

        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center">
                    <UserIcon size={40} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.uid}</p>
                    <KycStatusBadge status={user.kycStatus} />
                </div>
            </div>
            
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Balance (USDT)</p>
                <p className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    {user.portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm dark:shadow-none font-semibold text-lg transition hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-800">
                <ArrowDownLeft size={24} className="text-green-500"/>
                <span className="text-slate-900 dark:text-white">Deposit</span>
            </button>
            <button className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm dark:shadow-none font-semibold text-lg transition hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-800">
                <ArrowUpRight size={24} className="text-yellow-500"/>
                <span className="text-slate-900 dark:text-white">Withdraw</span>
            </button>
        </div>

        <div className="space-y-2 pt-4">
            {isAdmin && (
                 <MenuItem icon={<ShieldCheck size={20} className="text-purple-500 dark:text-purple-400"/>} label="Admin Panel" onClick={() => navigate('/admin')} />
            )}
            <MenuItem icon={<ShieldCheck size={20} />} label="Identity Verification" onClick={() => {}} />
            <MenuItem icon={<Repeat size={20} />} label="Transaction History" onClick={() => navigate('/history')} />
            <MenuItem icon={<Bell size={20} />} label="Notifications" onClick={() => {}} badge={user.notifications.filter(n => !n.read).length} />
            <MenuItem icon={<LifeBuoy size={20} />} label="Customer Service" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;