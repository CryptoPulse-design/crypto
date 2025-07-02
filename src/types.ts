export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
}

export type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h';

export interface Order {
    price: number;
    amount: number;
    total: number;
}

export interface Trade {
    id: string;
    time: string;
    price: number;
    amount: number;
    type: 'buy' | 'sell';
}

export interface TradeHistory {
  id: string;
  pair: string;
  entryPrice: number;
  exitPrice: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  direction: 'Buy' | 'Sell';
  amount: number;
  profit: number; // Can be positive or negative
}

// --- SHARED USER & TRANSACTION TYPES ---

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  type: 'security' | 'transaction' | 'system';
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface Transaction {
  id:string;
  type: 'Deposit' | 'Withdrawal' | 'Trade';
  asset: string;
  amount: number; // For trades, this is the PROFIT/LOSS.
  status: 'Completed' | 'Pending' | 'Failed';
  date: string; // This will be the start time for trades
  network?: 'TRC20' | 'ERC20' | 'BTC';
  transactionProof?: string;
  address?: string;
  
  // Trade specific
  pair?: string;
  direction?: 'Buy' | 'Sell';
  stake?: number;
  commission?: number;
  profit?: number; // Redundant with amount, but explicit.
  entryPrice?: number;
  exitPrice?: number;
  endTime?: string; // For trades
}

export interface UserPortfolio {
  balance: number;
  pendingBalance: number;
  pl: number;
  plPercentage: number;
}

export interface User {
  name: string;
  email: string;
  uid: string;
  photoURL?: string;
  password?: string; // This is for mock auth only, DO NOT DO THIS IN PRODUCTION
  portfolio: UserPortfolio;
  transactions: Transaction[];
  notifications: Notification[];
  kycStatus: KYCStatus;
  fullName?: string;
  dateOfBirth?: string;
  country?: string;
  address?: string;
  isAdmin?: boolean;
  chatHistory?: ChatMessage[];
}

// --- ADMIN PANEL TYPES ---

export interface KycRequest {
    user: User;
    kycImages: {
        idFront: string;
        idBack: string;
    };
}

export interface PendingDeposit {
    userEmail: string;
    userName: string;
    userId: string;
    transaction: Transaction;
}