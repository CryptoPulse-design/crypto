import * as React from 'react';
import type { User, KycRequest, PendingDeposit, Notification, Transaction, ChatMessage } from '../types.ts';
import { apiLogin, apiSignup, apiGetUserByToken, apiDeposit, apiSubmitKyc, apiWithdraw, apiGetAllUsers, apiGetPendingKyc, apiUpdateKycStatus, apiGetPendingDeposits, apiUpdateDepositStatus, apiMarkAllNotificationsAsRead, apiMarkNotificationAsRead, apiCompleteTrade, apiUpdateChatHistory } from '../server/api.ts';

const AUTH_TOKEN_KEY = 'cryptoPulseAuthToken';

interface KYCData {
    fullName: string;
    dateOfBirth: string;
    country: string;
    address: string;
    idFrontBase64: string;
    idBackBase64: string;
}

interface UserDetails {
    dateOfBirth: string;
    country: string;
    address: string;
}

interface DepositDetails {
    amount: number;
    network: 'TRC20' | 'ERC20' | 'BTC';
    asset: string;
    transactionProof: string; // base64
}

interface WithdrawDetails {
    amount: number;
    address: string;
    asset: string;
}

interface TradeResultDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    commission: number;
    profit: number;
    entryPrice: number;
    exitPrice: number;
    startTime: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, details: UserDetails) => Promise<void>;
  logout: () => void;
  deposit: (details: DepositDetails) => Promise<void>;
  updateUserPhoto: (photoFile: File) => Promise<void>;
  submitKyc: (kycData: KYCData) => Promise<void>;
  withdraw: (password: string, details: WithdrawDetails) => Promise<void>;
  completeTrade: (details: TradeResultDetails) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  // Admin functions
  fetchAllUsers: () => Promise<User[]>;
  fetchPendingKyc: () => Promise<KycRequest[]>;
  updateKycStatus: (targetUserId: string, status: 'verified' | 'rejected') => Promise<void>;
  fetchPendingDeposits: () => Promise<PendingDeposit[]>;
  updateDepositStatus: (targetUserId: string, transactionId: string, status: 'Completed' | 'Failed') => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  const rehydrateSession = React.useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        const fetchedUser = await apiGetUserByToken(storedToken);
        const storedPhoto = localStorage.getItem(`cryptoPulsePhoto-${fetchedUser.uid}`);
        if (storedPhoto) {
            fetchedUser.photoURL = storedPhoto;
        }
        setUser(fetchedUser);
        setToken(storedToken);
        setIsAdmin(fetchedUser.isAdmin || false);
      }
    } catch (error) {
      console.error("Session rehydration failed:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  React.useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, token: new_token } = await apiLogin(email, password);
      const storedPhoto = localStorage.getItem(`cryptoPulsePhoto-${loggedInUser.uid}`);
      if (storedPhoto) {
          loggedInUser.photoURL = storedPhoto;
      }
      setUser(loggedInUser);
      setToken(new_token);
      setIsAdmin(loggedInUser.isAdmin || false);
      localStorage.setItem(AUTH_TOKEN_KEY, new_token);
    } catch (error) {
       console.error("Login failed:", error);
       throw error; // re-throw to be caught in the component
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, password: string, details: UserDetails) => {
    setIsLoading(true);
    try {
        const { user: signedUpUser, token: new_token } = await apiSignup(name, email, password, details);
        setUser(signedUpUser);
        setToken(new_token);
        setIsAdmin(signedUpUser.isAdmin || false);
        localStorage.setItem(AUTH_TOKEN_KEY, new_token);
    } catch(error) {
        console.error("Signup failed:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };
  
  const deposit = async (details: DepositDetails) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
          const updatedUser = await apiDeposit(token, details);
          setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
          console.error("Deposit failed:", error);
          throw error;
      } finally {
          setIsLoading(false);
      }
  };

  const submitKyc = async (kycData: KYCData) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
        const updatedUser = await apiSubmitKyc(token, kycData);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
        console.error("KYC Submission failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
  };
  
  const withdraw = async (password: string, details: WithdrawDetails) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
        const updatedUser = await apiWithdraw(token, password, details);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
        console.error("Withdrawal failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
  };

  const completeTrade = async (details: TradeResultDetails) => {
      if(!token) throw new Error("Not authenticated");
      try {
        const updatedUser = await apiCompleteTrade(token, details);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
        console.error("Trade completion failed:", error);
        throw error;
      }
  };

  const updateUserPhoto = (photoFile: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        localStorage.setItem(`cryptoPulsePhoto-${user.uid}`, dataUrl);
        setUser(prevUser => (prevUser ? { ...prevUser, photoURL: dataUrl } : null));
        setIsLoading(false);
        resolve();
      };
      reader.onerror = error => {
        setIsLoading(false);
        reject(error);
      };
    });
  };

  const markAllNotificationsAsRead = async () => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
          const updatedUser = await apiMarkAllNotificationsAsRead(token);
          setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
          console.error("Failed to mark all notifications as read:", error);
          throw error;
      } finally {
          setIsLoading(false);
      }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if(!token) throw new Error("Not authenticated");
    try {
        const updatedUser = await apiMarkNotificationAsRead(token, notificationId);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
    } catch (error) {
        console.error(`Failed to mark notification ${notificationId} as read:`, error);
        throw error;
    }
  };

  // --- Admin Functions ---
  const fetchAllUsers = async (): Promise<User[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetAllUsers(token);
  };

  const fetchPendingKyc = async (): Promise<KycRequest[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetPendingKyc(token);
  };

  const updateKycStatus = async (targetUserId: string, status: 'verified' | 'rejected'): Promise<void> => {
    if(!token) throw new Error("Not authenticated");
    // Not setting global isLoading, as this is a background action on an admin screen
    await apiUpdateKycStatus(token, targetUserId, status);
  };

  const fetchPendingDeposits = async (): Promise<PendingDeposit[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetPendingDeposits(token);
  };
  
  const updateDepositStatus = async (targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
      if(!token) throw new Error("Not authenticated");
      await apiUpdateDepositStatus(token, targetUserId, transactionId, status);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isInitialized,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
    deposit,
    updateUserPhoto,
    submitKyc,
    withdraw,
    completeTrade,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    setUser,
    // Admin
    fetchAllUsers,
    fetchPendingKyc,
    updateKycStatus,
    fetchPendingDeposits,
    updateDepositStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};