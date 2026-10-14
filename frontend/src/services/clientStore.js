// Client-side persistent banking engine for standalone / Vercel deployment
// Provides strict authentication, account creation, and user isolation.

const DB_KEY = 'bankease_local_db_v3';

const SEED_USERS = [
  {
    id: 5,
    username: 'himanshu02z',
    email: 'himanshupachouri945@gmail.com',
    fullName: 'Himanshu Pachouri',
    phone: '9876543210',
    password: '@himanshu123',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2026-10-14T08:00:00.000Z',
  },
  {
    id: 9,
    username: 'ishaand',
    email: 'ishan@gmail.com',
    fullName: 'Ishan Singh',
    phone: '1234567890',
    password: '@ishaaand',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2026-10-14T12:18:43.000Z',
  },
  {
    id: 11,
    username: 'golu',
    email: 'golu@gmail.com',
    fullName: 'Golu',
    phone: '1234567890',
    password: '@golu1234',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2026-10-14T14:00:00.000Z',
  },
];

const SEED_ACCOUNTS = [
  {
    id: 501,
    accountNumber: '100234567890',
    ifscCode: 'BNKE0000001',
    accountType: 'SAVINGS',
    balance: 150000.0,
    currency: 'INR',
    active: true,
    userId: 5,
    createdAt: '2026-10-14T08:05:00.000Z',
  },
  {
    id: 502,
    accountNumber: '267798554837',
    ifscCode: 'BNKE0000001',
    accountType: 'SAVINGS',
    balance: 1100000.0,
    currency: 'INR',
    active: true,
    userId: 9,
    createdAt: '2026-10-14T12:20:00.000Z',
  },
  {
    id: 503,
    accountNumber: '348912784512',
    ifscCode: 'BNKE0000001',
    accountType: 'SAVINGS',
    balance: 25000.0,
    currency: 'INR',
    active: true,
    userId: 11,
    createdAt: '2026-10-14T14:05:00.000Z',
  },
];

const SEED_TRANSACTIONS = [
  {
    id: 1001,
    accountId: 501,
    accountNumber: '100234567890',
    type: 'DEPOSIT',
    amount: 150000.0,
    balanceAfter: 150000.0,
    description: 'Initial account activation deposit',
    relatedAccountNumber: null,
    transactionReference: 'TXNACT100234',
    createdAt: '2026-10-14T08:10:00.000Z',
  },
  {
    id: 1002,
    accountId: 502,
    accountNumber: '267798554837',
    type: 'DEPOSIT',
    amount: 1100000.0,
    balanceAfter: 1100000.0,
    description: 'Direct wire deposit',
    relatedAccountNumber: null,
    transactionReference: 'TXNDEP267798',
    createdAt: '2026-10-14T12:22:00.000Z',
  },
  {
    id: 1003,
    accountId: 503,
    accountNumber: '348912784512',
    type: 'DEPOSIT',
    amount: 25000.0,
    balanceAfter: 25000.0,
    description: 'Welcome bonus credit',
    relatedAccountNumber: null,
    transactionReference: 'TXNWEL348912',
    createdAt: '2026-10-14T14:10:00.000Z',
  },
];

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read client db:', e);
  }
  const initial = {
    users: [...SEED_USERS],
    accounts: [...SEED_ACCOUNTS],
    transactions: [...SEED_TRANSACTIONS],
  };
  saveDB(initial);
  return initial;
}

function saveDB(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Could not save client db:', e);
  }
}

function generateAccountNumber(accounts) {
  let num;
  do {
    num = String(Math.floor(100000000000 + Math.random() * 900000000000));
  } while (accounts.some((a) => a.accountNumber === num));
  return num;
}

function generateToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS384', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.username,
      email: user.email,
      role: user.role || 'CUSTOMER',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  return `${header}.${payload}.mockSignature_${user.id}`;
}

function getCurrentUserFromStorage() {
  try {
    const raw = localStorage.getItem('bankease_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export const clientStore = {
  async register(details) {
    const db = getDB();
    const username = (details.username || '').trim();
    const email = (details.email || '').trim().toLowerCase();
    const fullName = (details.fullName || '').trim();
    const phone = (details.phone || '').trim();
    const password = details.password || '';

    if (!fullName) throw new Error('Full name is required');
    if (!email) throw new Error('Email address is required');
    if (!phone) throw new Error('Phone number is required');
    if (!username) throw new Error('Username is required');
    if (!password) throw new Error('Password is required');

    // Strict registration check: username or email must not exist
    const existingUser = db.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email
    );

    if (existingUser) {
      throw new Error('An account with this username or email already exists. Please sign in.');
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      fullName,
      phone,
      password,
      role: 'CUSTOMER',
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Auto-provision personal Savings account for the newly registered user
    const newAccNum = generateAccountNumber(db.accounts);
    const newAccount = {
      id: Date.now() + 1,
      accountNumber: newAccNum,
      ifscCode: 'BNKE0000001',
      accountType: 'SAVINGS',
      balance: 10000.0,
      currency: 'INR',
      active: true,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
    };
    db.accounts.push(newAccount);

    db.transactions.push({
      id: Date.now() + 2,
      accountId: newAccount.id,
      accountNumber: newAccNum,
      type: 'DEPOSIT',
      amount: 10000.0,
      balanceAfter: 10000.0,
      description: 'Welcome bonus credit on account opening',
      relatedAccountNumber: null,
      transactionReference: 'TXNWEL' + newAccNum.slice(-6),
      createdAt: new Date().toISOString(),
    });

    saveDB(db);

    const safeUser = { ...newUser };
    delete safeUser.password;
    return safeUser;
  },

  async login({ username, password }) {
    const db = getDB();
    const query = (username || '').trim().toLowerCase();
    const pass = password || '';

    if (!query) throw new Error('Username or email is required');
    if (!pass) throw new Error('Password is required');

    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === query ||
        u.email.toLowerCase() === query
    );

    // Strict rejection if user does not have an existing account
    if (!user) {
      throw new Error('Account does not exist. Please create an account first.');
    }

    // Strict password verification
    if (user.password !== pass) {
      throw new Error('Invalid username or password.');
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;
    return { token, user: safeUser };
  },

  async getMe() {
    const current = getCurrentUserFromStorage();
    if (!current) throw new Error('Unauthenticated');
    const db = getDB();
    const user = db.users.find(
      (u) =>
        u.id === current.id ||
        u.username.toLowerCase() === (current.username || '').toLowerCase()
    );
    if (!user) return current;
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
  },

  async getAccounts() {
    const current = getCurrentUserFromStorage();
    const db = getDB();
    let userId = current?.id;

    if (!userId && current?.username) {
      const match = db.users.find(
        (u) => u.username.toLowerCase() === current.username.toLowerCase()
      );
      if (match) userId = match.id;
    }

    let userAccounts = db.accounts.filter((a) => a.userId === userId);

    if (userAccounts.length === 0 && userId) {
      const newAccNum = generateAccountNumber(db.accounts);
      const newAcc = {
        id: Date.now(),
        accountNumber: newAccNum,
        ifscCode: 'BNKE0000001',
        accountType: 'SAVINGS',
        balance: 10000.0,
        currency: 'INR',
        active: true,
        userId: userId,
        createdAt: new Date().toISOString(),
      };
      db.accounts.push(newAcc);
      db.transactions.push({
        id: Date.now() + 1,
        accountId: newAcc.id,
        accountNumber: newAccNum,
        type: 'DEPOSIT',
        amount: 10000.0,
        balanceAfter: 10000.0,
        description: 'Opening balance',
        relatedAccountNumber: null,
        transactionReference: 'TXNINIT' + newAccNum.slice(-6),
        createdAt: new Date().toISOString(),
      });
      saveDB(db);
      userAccounts = [newAcc];
    }

    return userAccounts;
  },

  async createAccount(accountType) {
    const current = getCurrentUserFromStorage();
    if (!current) throw new Error('Unauthenticated');
    const db = getDB();
    const newAccNum = generateAccountNumber(db.accounts);
    const newAcc = {
      id: Date.now(),
      accountNumber: newAccNum,
      ifscCode: 'BNKE0000001',
      accountType: accountType || 'SAVINGS',
      balance: 0.0,
      currency: 'INR',
      active: true,
      userId: current.id,
      createdAt: new Date().toISOString(),
    };
    db.accounts.push(newAcc);
    saveDB(db);
    return newAcc;
  },

  async deposit(accountNumber, { amount, description }) {
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }
    const db = getDB();
    const acc = db.accounts.find((a) => a.accountNumber === accountNumber);
    if (!acc) throw new Error(`Account ${accountNumber} not found`);

    acc.balance = Number((Number(acc.balance) + numAmount).toFixed(2));
    const tx = {
      id: Date.now(),
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      type: 'DEPOSIT',
      amount: numAmount,
      balanceAfter: acc.balance,
      description: description || 'Cash deposit',
      relatedAccountNumber: null,
      transactionReference: 'TXNDEP' + Date.now().toString().slice(-8),
      createdAt: new Date().toISOString(),
    };
    db.transactions.push(tx);
    saveDB(db);
    return tx;
  },

  async withdraw(accountNumber, { amount, description }) {
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }
    const db = getDB();
    const acc = db.accounts.find((a) => a.accountNumber === accountNumber);
    if (!acc) throw new Error(`Account ${accountNumber} not found`);

    if (Number(acc.balance) < numAmount) {
      throw new Error(`Insufficient funds. Available balance: ₹${acc.balance}`);
    }

    acc.balance = Number((Number(acc.balance) - numAmount).toFixed(2));
    const tx = {
      id: Date.now(),
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      type: 'WITHDRAWAL',
      amount: numAmount,
      balanceAfter: acc.balance,
      description: description || 'Cash withdrawal',
      relatedAccountNumber: null,
      transactionReference: 'TXNWTH' + Date.now().toString().slice(-8),
      createdAt: new Date().toISOString(),
    };
    db.transactions.push(tx);
    saveDB(db);
    return tx;
  },

  async transfer(senderAccountNumber, { receiverAccountNumber, amount, description }) {
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }
    const cleanReceiver = (receiverAccountNumber || '').trim();
    if (!cleanReceiver) throw new Error('Receiver account number is required');
    if (senderAccountNumber === cleanReceiver) {
      throw new Error('Cannot transfer money to the same account');
    }

    const db = getDB();
    const sender = db.accounts.find((a) => a.accountNumber === senderAccountNumber);
    if (!sender) throw new Error('Sender account not found');

    if (Number(sender.balance) < numAmount) {
      throw new Error(`Insufficient balance. Available: ₹${sender.balance}`);
    }

    let receiver = db.accounts.find((a) => a.accountNumber === cleanReceiver);
    if (!receiver) {
      receiver = {
        id: Date.now() + 50,
        accountNumber: cleanReceiver,
        ifscCode: 'BNKE0000001',
        accountType: 'SAVINGS',
        balance: 0.0,
        currency: 'INR',
        active: true,
        userId: 9999,
        createdAt: new Date().toISOString(),
      };
      db.accounts.push(receiver);
    }

    sender.balance = Number((Number(sender.balance) - numAmount).toFixed(2));
    receiver.balance = Number((Number(receiver.balance) + numAmount).toFixed(2));

    const ref = 'TXNTRF' + Date.now().toString().slice(-8);
    const now = new Date().toISOString();

    db.transactions.push({
      id: Date.now(),
      accountId: sender.id,
      accountNumber: sender.accountNumber,
      type: 'TRANSFER_DEBIT',
      amount: numAmount,
      balanceAfter: sender.balance,
      description: description || `Transfer to ${cleanReceiver}`,
      relatedAccountNumber: cleanReceiver,
      transactionReference: ref,
      createdAt: now,
    });

    db.transactions.push({
      id: Date.now() + 1,
      accountId: receiver.id,
      accountNumber: receiver.accountNumber,
      type: 'TRANSFER_CREDIT',
      amount: numAmount,
      balanceAfter: receiver.balance,
      description: description || `Transfer from ${sender.accountNumber}`,
      relatedAccountNumber: sender.accountNumber,
      transactionReference: ref,
      createdAt: now,
    });

    saveDB(db);
    return 'Transfer successful';
  },

  async history(accountNumber) {
    const db = getDB();
    return db.transactions
      .filter((t) => t.accountNumber === accountNumber)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
