import type { User, Transaction, KYCStatus, KycRequest, PendingDeposit, Notification, ChatMessage } from '../types.ts';

// --- DATABASE PERSISTENCE ---
const DB_KEY = 'cryptoPulseDB';

interface MockDB {
  users: Record<string, User>;
  kycImages: Record<string, {idFront: string, idBack: string}>;
}

const initialDb: MockDB = {
  users: {
    'Lengmelina1996@yahoo.com': {
      name: 'Leng Melina',
      email: 'Lengmelina1996@yahoo.com',
      uid: '10221',
      password: '123456',
      kycStatus: 'verified',
      portfolio: {
        balance: 5000,
        pendingBalance: 0,
        pl: 0,
        plPercentage: 0,
      },
      transactions: [
        { id: 'tx-leng1', type: 'Deposit', asset: 'USDT', amount: 5000, status: 'Completed', date: '2025-07-01' },
      ],
      notifications: [],
      chatHistory: [],
    },
    'alex@test.com': {
      name: 'Alex Johnson',
      email: 'alex@test.com',
      uid: 'UID-TESTUSER',
      password: 'password123',
      kycStatus: 'unverified',
      portfolio: {
        balance: 50000,
        pendingBalance: 0,
        pl: 1250.75,
        plPercentage: 2.5,
      },
      transactions: [
        { id: 'tx1', type: 'Deposit', asset: 'USD', amount: 50000, status: 'Completed', date: '2025-06-20' },
      ],
      notifications: [
        { id: 'notif1', type: 'transaction', title: 'Deposit Successful', message: 'Your deposit of 1.2 BTC has been confirmed.', date: new Date(Date.now() - 86400000).toISOString(), read: false },
        { id: 'notif2', type: 'security', title: 'Password Changed', message: 'Your password was changed successfully from a new device.', date: new Date(Date.now() - 2 * 86400000).toISOString(), read: false },
        { id: 'notif3', type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance will occur on Sunday at 2 AM UTC.', date: new Date(Date.now() - 5 * 86400000).toISOString(), read: true },
      ],
      chatHistory: [
        { role: 'user', parts: [{ text: 'Hi, can you help me?'}] },
        { role: 'model', parts: [{ text: 'Of course! I am the CryptoPulse AI assistant. How can I help you today?'}] },
      ]
    },
    'admin@cryptopulse.com': {
      name: 'Admin',
      email: 'admin@cryptopulse.com',
      uid: 'UID-ADMIN',
      password: 'admin',
      isAdmin: true,
      kycStatus: 'verified',
      portfolio: { balance: 0, pendingBalance: 0, pl: 0, plPercentage: 0 },
      transactions: [],
      notifications: [],
      chatHistory: [],
    }
  },
  kycImages: {},
};

const loadDB = (): MockDB => {
  const storedDbRaw = localStorage.getItem(DB_KEY);
  
  // If no DB in storage, use a fresh copy of the initial DB.
  if (!storedDbRaw) {
    return JSON.parse(JSON.stringify(initialDb));
  }

  try {
    const finalDb: MockDB = JSON.parse(storedDbRaw);
    
    // Ensure the users and kycImages objects exist to prevent errors on corrupted data.
    finalDb.users = finalDb.users || {};
    finalDb.kycImages = finalDb.kycImages || {};

    // Restore default users and their passwords.
    // This is the critical part to fix the login issue. It ensures that
    // even if a default user's password was wiped in localStorage, it gets restored on load.
    // This preserves all other data for the user (like transactions, balance).
    for (const email in initialDb.users) {
        if(finalDb.users[email]) {
            // Default user exists in storage, just restore their password.
            finalDb.users[email].password = initialDb.users[email].password;
        } else {
            // Default user was missing from storage, restore them completely.
            finalDb.users[email] = initialDb.users[email];
        }
    }

    return finalDb;
  } catch (error) {
    console.error("Error loading DB from localStorage, using initialDB", error);
    // If parsing fails for any reason, fall back to a fresh initial DB.
    return JSON.parse(JSON.stringify(initialDb));
  }
};

const saveDB = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save mock DB to localStorage", e);
  }
};

let db: MockDB = loadDB();

// --- API SIMULATION ---
// These functions simulate async API calls to a backend server.
const apiCall = <T>(data: T, delay = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

const apiError = (message: string, delay = 500): Promise<any> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));

// --- HELPERS ---
const findUserByUid = (uid: string) => Object.values(db.users).find(u => u.uid === uid);

const checkAdmin = (token: string): User => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user || !user.isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }
    return user;
}

// --- EXPORTED API FUNCTIONS ---
interface UserDetails {
    dateOfBirth: string;
    country: string;
    address: string;
}

interface DepositDetails {
    amount: number;
    network: 'TRC20' | 'ERC20' | 'BTC';
    asset: string;
    transactionProof: string; // base64 encoded string
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
    profit: number; // This is the PNL (can be positive or negative)
    entryPrice: number;
    exitPrice: number;
    startTime: string;
}

/**
 * Signs up a new user.
 * @returns {Promise<{user: User, token: string}>}
 */
export const apiSignup = (name: string, email: string, password: string, details: UserDetails): Promise<{user: User, token: string}> => {
  if (db.users[email]) {
    return apiError("An account with this email already exists.");
  }
  
  const formattedName = name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
      
  const uid = 'UID-' + Math.random().toString(36).substring(2, 11).toUpperCase();

  const newUser: User = { 
      name: formattedName, 
      email, 
      uid, 
      password,
      fullName: formattedName,
      dateOfBirth: details.dateOfBirth,
      country: details.country,
      address: details.address,
      kycStatus: 'unverified',
      portfolio: { balance: 0, pendingBalance: 0, pl: 0, plPercentage: 0 },
      transactions: [],
      notifications: [],
      chatHistory: [],
  };

  db.users[email] = newUser;
  saveDB(); // Persist the new user
  
  const { password: _, ...userToReturn } = newUser;
  return apiCall({ user: userToReturn, token: `TOKEN_${uid}`});
};

/**
 * Logs in a user.
 * @returns {Promise<{user: User, token:string}>}
 */
export const apiLogin = (email: string, password: string): Promise<{user: User, token: string}> => {
  const user = db.users[email];
  if (user && user.password === password) {
    const { password: _, ...userToReturn } = user;
    return apiCall({ user: userToReturn, token: `TOKEN_${user.uid}`});
  }
  return apiError("Invalid credentials.");
};

/**
 * Fetches user data using a token.
 */
export const apiGetUserByToken = (token: string): Promise<User> => {
  const uid = token.replace('TOKEN_', '');
  const user = findUserByUid(uid);
  if (user) {
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
  }
  return apiError("Invalid token.");
};

/**
 * Submits a deposit request.
 */
export const apiDeposit = (token: string, details: DepositDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    
    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'Deposit',
        status: 'Pending',
        ...details,
        date: new Date().toISOString()
    };
    
    user.transactions.unshift(newTransaction);
    user.portfolio.pendingBalance += details.amount;
    
    // Notify admin
    const admin = db.users['admin@cryptopulse.com'];
    if (admin) {
        admin.notifications.unshift({
            id: `notif-${Date.now()}`,
            type: 'system',
            title: 'New Deposit Request',
            message: `${user.name} has submitted a new deposit of ${details.amount} ${details.asset}.`,
            date: new Date().toISOString(),
            read: false,
        });
    }

    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

/**
 * Submits KYC data.
 */
export const apiSubmitKyc = (token: string, kycData: { fullName: string, dateOfBirth: string, country: string, address: string, idFrontBase64: string, idBackBase64: string }): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    user.fullName = kycData.fullName;
    user.dateOfBirth = kycData.dateOfBirth;
    user.country = kycData.country;
    user.address = kycData.address;
    user.kycStatus = 'pending';
    db.kycImages[uid] = { idFront: kycData.idFrontBase64, idBack: kycData.idBackBase64 };

    // Notify admin
    const admin = db.users['admin@cryptopulse.com'];
    if (admin) {
        admin.notifications.unshift({
            id: `notif-${Date.now()}`,
            type: 'system',
            title: 'New KYC Submission',
            message: `${user.name} has submitted documents for KYC verification.`,
            date: new Date().toISOString(),
            read: false,
        });
    }

    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

/**
 * Submits a withdrawal request.
 */
export const apiWithdraw = (token: string, passwordAttempt: string, details: WithdrawDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    if (user.password !== passwordAttempt) return apiError("Incorrect password.");
    if (user.kycStatus !== 'verified') return apiError("KYC verification is required for withdrawals.");
    if (user.portfolio.balance < details.amount) return apiError("Insufficient balance.");

    user.portfolio.balance -= details.amount;
    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'Withdrawal',
        status: 'Completed',
        amount: details.amount,
        address: details.address,
        asset: details.asset,
        date: new Date().toISOString(),
    };
    user.transactions.unshift(newTransaction);
    user.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'transaction',
        title: 'Withdrawal Processed',
        message: `Your withdrawal of ${details.amount} ${details.asset} has been processed successfully.`,
        date: new Date().toISOString(),
        read: false,
    });

    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

/**
 * Completes a trade, updates balance, and records the transaction.
 */
export const apiCompleteTrade = (token: string, details: TradeResultDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    const isWin = details.profit > 0;

    // The user's balance was already debited the stake + commission on the client-side for UX.
    // Now, we add back the stake and the profit if it was a winning trade.
    if (isWin) {
        const amountToReturn = details.stake + details.profit;
        user.portfolio.balance += amountToReturn;
    }
    // If it's a loss, the stake is lost, so no balance is returned. The PNL is negative.

    const newTransaction: Transaction = {
        id: `trade-${Date.now()}`,
        type: 'Trade',
        status: 'Completed',
        amount: details.profit, // The net PNL
        asset: details.pair.split('-')[1] || 'USDT',
        date: details.startTime,
        endTime: new Date().toISOString(),
        pair: details.pair,
        direction: details.direction,
        stake: details.stake,
        commission: details.commission,
        profit: details.profit, // Explicitly store PNL here as well
        entryPrice: details.entryPrice,
        exitPrice: details.exitPrice,
    };
    user.transactions.unshift(newTransaction);

    const resultMessage = isWin
        ? `Your ${details.direction} trade on ${details.pair} was successful, with a profit of $${details.profit.toFixed(2)}.`
        : `Your ${details.direction} trade on ${details.pair} resulted in a loss of $${(details.stake).toFixed(2)}.`;
        
    user.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'transaction',
        title: `Trade Completed: ${isWin ? 'Win' : 'Loss'}`,
        message: resultMessage,
        date: new Date().toISOString(),
        read: false,
    });
    
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

// --- CHAT API ---
export const apiUpdateChatHistory = (token: string, history: ChatMessage[]): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    user.chatHistory = history;
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 50); // very short delay
};

// --- NOTIFICATION API ---
export const apiMarkAllNotificationsAsRead = (token: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    user.notifications.forEach(n => n.read = true);
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 200);
}

export const apiMarkNotificationAsRead = (token: string, notificationId: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    
    const notification = user.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveDB();
    }
    
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 100);
}

// --- ADMIN API ---
export const apiGetAllUsers = (token: string): Promise<User[]> => {
    checkAdmin(token);
    const users = Object.values(db.users).map(({ password, ...user }) => user);
    return apiCall(users);
};

export const apiGetPendingKyc = (token: string): Promise<KycRequest[]> => {
    checkAdmin(token);
    const pendingUsers = Object.values(db.users).filter(u => u.kycStatus === 'pending');
    const kycQueue = pendingUsers.map(user => ({
        user,
        kycImages: db.kycImages[user.uid] || { idFront: '', idBack: '' }
    }));
    return apiCall(kycQueue);
};

export const apiUpdateKycStatus = (token: string, targetUserId: string, status: 'verified' | 'rejected'): Promise<void> => {
    checkAdmin(token);
    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");

    targetUser.kycStatus = status;
    const message = status === 'verified'
        ? 'Your identity has been successfully verified.'
        : 'Your KYC submission has been rejected. Please review your details and resubmit.';
    
    targetUser.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'system',
        title: `KYC ${status === 'verified' ? 'Approved' : 'Rejected'}`,
        message: message,
        date: new Date().toISOString(),
        read: false,
    });

    saveDB();
    return apiCall(undefined);
};

export const apiGetPendingDeposits = (token: string): Promise<PendingDeposit[]> => {
    checkAdmin(token);
    const allUsers = Object.values(db.users);
    const pendingDeposits: PendingDeposit[] = [];
    allUsers.forEach(user => {
        user.transactions.forEach(tx => {
            if (tx.type === 'Deposit' && tx.status === 'Pending') {
                pendingDeposits.push({
                    userId: user.uid,
                    userName: user.name,
                    userEmail: user.email,
                    transaction: tx,
                });
            }
        });
    });
    return apiCall(pendingDeposits);
};

export const apiUpdateDepositStatus = (token: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
    checkAdmin(token);
    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");

    const transaction = targetUser.transactions.find(tx => tx.id === transactionId);
    if (!transaction || transaction.type !== 'Deposit') return apiError("Deposit transaction not found.");
    
    transaction.status = status;
    targetUser.portfolio.pendingBalance -= transaction.amount;
    
    if (status === 'Completed') {
        targetUser.portfolio.balance += transaction.amount;
    }

    const message = status === 'Completed'
        ? `Your deposit of ${transaction.amount} ${transaction.asset} has been approved and added to your balance.`
        : `Your deposit of ${transaction.amount} ${transaction.asset} has been declined. Please contact support.`;

    targetUser.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'transaction',
        title: `Deposit ${status}`,
        message: message,
        date: new Date().toISOString(),
        read: false,
    });

    saveDB();
    return apiCall(undefined);
};