const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });




require('dotenv').config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5001;

// Socket.io Connection
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User joined personal room: ${userId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Models ---

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onboarding: {
    basics: {
      preferredName: String,
      occupation: { type: String, enum: ['student', 'employee', 'other'] },
      subOccupation: String,
      currency: { type: String, default: 'USD' }
    },
    income: {
      monthly: Number,
      type: { type: String, enum: ['fixed', 'variable', 'mixed'] },
      otherSources: String,
      savingsTarget: { type: Number, default: 20 }
    },

    expenses: {
      type: { type: String, enum: ['fixed', 'variable', 'mixed'] },
      hasLoans: Boolean,
      loanDetails: String
    },
    goals: {
      shortTerm: String,
      longTerm: String
    },
    personalization: {
      preferences: String
    },
    completed: { type: Boolean, default: false }
  }
});


const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  collaborationId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetRoom' },
  category: { type: String, required: true },

  date: { type: Date, default: Date.now },
});


const Transaction = mongoose.model('Transaction', TransactionSchema);

const BudgetRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});


const BudgetRoom = mongoose.model('BudgetRoom', BudgetRoomSchema);

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetRoom' },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  status: { type: String, enum: ['active', 'draft'], default: 'active' }
});


const Budget = mongoose.model('Budget', BudgetSchema);

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  nextBillingDate: { type: Date, required: true },
  category: { type: String, default: 'Subscription' }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  category: { type: String },
  deadline: { type: Date },
  contributions: [{
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', GoalSchema);

const InvestmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetName: { type: String, required: true },
  symbol: { type: String },
  shares: { type: Number, default: 1 },
  amountInvested: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  type: { type: String, enum: ['Stock', 'Crypto', 'Real Estate', 'Gold', 'Mutual Fund', 'Other'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Investment = mongoose.model('Investment', InvestmentSchema);

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);



// Removed old Collaboration and SharedBudget models



// --- Auth Middleware ---

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// --- Routes ---

// Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboarding?.completed || false,
        onboarding: user.onboarding
      }
    });

  } catch (err) {
    res.status(400).json({ message: 'Registration failed. Email might already exist.' });
  }
});


// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboarding?.completed || false,
        onboarding: user.onboarding
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save Onboarding
app.post('/api/user/onboarding', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.onboarding = {
      ...req.body,
      completed: true
    };

    await user.save();
    res.json({ message: 'Onboarding completed', onboarding: user.onboarding });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Account
app.post('/api/user/reset', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // WIPE DATA
    await Transaction.deleteMany({ userId: req.userId });
    await Budget.deleteMany({ userId: req.userId });
    await Subscription.deleteMany({ userId: req.userId });
    await Goal.deleteMany({ userId: req.userId });

    // Handle BudgetRooms (Remove as member, delete if admin)
    await BudgetRoom.deleteMany({ admin: req.userId });
    await BudgetRoom.updateMany(
      { members: req.userId },
      { $pull: { members: req.userId } }
    );

    // Reset Onboarding
    user.onboarding = {
      completed: false
    };
    await user.save();

    res.json({ message: 'Account has been successfully reset' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Transactions
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/transactions', auth, async (req, res) => {
  const transaction = new Transaction({
    ...req.body,
    userId: req.userId
  });

  try {
    const newTransaction = await transaction.save();

    // Real-time Update: If it is a room transaction, notify the room
    if (newTransaction.collaborationId) {
      io.to(newTransaction.collaborationId.toString()).emit('new_transaction', newTransaction);
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Budgets
app.get('/api/budgets', auth, async (req, res) => {
  try {
    // Only return personal budgets (no roomId)
    const budgets = await Budget.find({ userId: req.userId, roomId: { $eq: null } });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/budgets', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;
    // Update existing personal budget for category or create new
    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category, roomId: { $eq: null } },
      { limit },
      { new: true, upsert: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/budgets/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId, roomId: { $eq: null } });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Diary / Journal
app.get('/api/diary', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/diary', auth, async (req, res) => {
  try {
    const entry = new JournalEntry({
      userId: req.userId,
      text: req.body.text
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/diary/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Insights (Groq LPU)
app.post('/api/insights', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(50);
    const budgets = await Budget.find({ userId: req.userId });

    const user = await User.findById(req.userId);
    const currencyCode = user.onboarding?.basics?.currency || 'USD';
    const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
    const currencySymbol = currencySymbols[currencyCode] || '$';

    const prompt = `
      You are a specialized Personal Finance AI Assistant powered by Google Gemini. 
      Analyze the user's financial data and provide 3 clear, actionable insights.
      
      Financial Data:
      - Recent Transactions: ${JSON.stringify(transactions.map(t => ({ title: t.title, amount: t.amount, category: t.category, type: t.type })))}
      - Budgets Set: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit })))}
      - Preferred Currency: ${currencyCode} (${currencySymbol})
      
      User's Specific Query: ${query || "Give me a general overview and 3 ways to save money based on my data."}
      
      Output Structure:
      1. Use a ## Heading for each section.
      2. Use emojis to make it visually engaging (e.g., 💰 for income, 📉 for expenses, 💡 for tips).
      3. Use a Markdown Table if comparing data.
      4. Use bullet points for actionable items.
      5. Use --- to separate major sections.
      
      Guidelines:
      1. Be helpful, encouraging, and professional.
      2. If transactions is empty, suggest how to start budgeting.
      3. Use clear Markdown: Bold numbers and specific categories.
      4. IMPORTANT: All monetary values in your response MUST use the ${currencySymbol} symbol.
      5. Keep it structured and easy to read.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;
    res.json({ text: content || "No insight generated." });
  } catch (err) {
    console.error('Gemini Insight Error Details:', err.message);
    let userMessage = "The Gemini AI assistant is currently unavailable.";

    if (err.status === 401) {
      userMessage = "Invalid Gemini API Key. Please verify your GEMINI_API_KEY.";
    } else if (err.status === 429) {
      userMessage = "Gemini Rate Limit Exceeded. Please try again in a moment.";
    }

    res.status(500).json({ message: userMessage });
  }
});

app.post('/api/ai/suggest-budget', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.onboarding) return res.status(400).json({ message: 'Onboarding data missing' });

    const { description } = req.body;

    // Fetch real spending data from the last 90 days
    const transactions = await Transaction.find({ userId: req.userId, type: 'expense' }).sort({ date: -1 }).limit(90);
    const subscriptions = await Subscription.find({ userId: req.userId });

    // Aggregate actual spending by category (monthly average)
    const categorySpend = {};
    transactions.forEach(t => {
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });

    const { monthly } = user.onboarding.income || {};
    const { preferredName, currency = 'USD' } = user.onboarding.basics || {};
    const { preferences } = user.onboarding.personalization || {};
    const { shortTerm, longTerm } = user.onboarding.goals || {};
    const currencySymbols = { 'USD': '$', 'INR': 'Rs.', 'EUR': 'EUR', 'GBP': 'GBP', 'JPY': 'JPY' };
    const currencySymbol = currencySymbols[currency] || '$';

    const totalSubsCost = subscriptions.reduce((s, sub) => {
      return s + (sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount);
    }, 0);

    const spendingContext = Object.entries(categorySpend).length > 0
      ? Object.entries(categorySpend).map(([cat, amt]) => `- ${cat}: ${currencySymbol}${(amt / 3).toFixed(0)}/month avg`).join('\n')
      : '- No transaction history yet. Create a fresh budget plan.';

    const prompt = [
      'You are an expert personal finance advisor. Create a detailed, personalized monthly budget.',
      '',
      'USER PROFILE:',
      `- Name: ${preferredName || 'User'}`,
      `- Monthly Income: ${currencySymbol}${monthly}`,
      `- Currency: ${currency}`,
      `- Short-term Goal: ${shortTerm || 'Not specified'}`,
      `- Long-term Goal: ${longTerm || 'Not specified'}`,
      `- Preferences: ${preferences || 'None'}`,
      '',
      "USER'S SPECIFIC REQUEST:",
      `"${description || 'Create a balanced budget that helps me save more.'}"`,
      '',
      'ACTUAL SPENDING (monthly avg from last 90 days):',
      spendingContext,
      '',
      `RECURRING SUBSCRIPTIONS (${currencySymbol}${totalSubsCost.toFixed(0)}/month total):`,
      subscriptions.length > 0 ? subscriptions.map(s => `- ${s.name}: ${currencySymbol}${s.amount} (${s.frequency})`).join('\n') : '- None',
      '',
      'INSTRUCTIONS:',
      "1. Respect the USER'S SPECIFIC REQUEST above - this is the MOST important factor.",
      '2. Base limits on ACTUAL spending history if available, adjusted to meet the request.',
      `3. Total of all limits must NOT exceed ${currencySymbol}${monthly}.`,
      '4. Include categories: Food, Rent, Transport, Entertainment, Savings, Subscriptions, Other.',
      `5. Subscriptions limit must cover the ${currencySymbol}${totalSubsCost.toFixed(0)} recurring cost minimum.`,
      '6. "reason" must be a short human explanation (max 12 words) for why you chose that limit.',
      '7. "savingsRate" is the percentage of income going to Savings.',
      '',
      'Respond ONLY with this JSON format:',
      '{',
      '  "budgets": [',
      '    { "category": "Food", "limit": 400, "reason": "Trimmed 10% from avg to boost savings." },',
      '    { "category": "Rent", "limit": 800, "reason": "Fixed cost, kept at current level." }',
      '  ],',
      '  "summary": "2-3 sentence overview explaining this budget and how it meets the goals.",',
      '  "savingsRate": 20',
      '}'
    ].join('\n');

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    let result;
    try {
      result = JSON.parse(content);
      if (!result.budgets) {
        const arr = result.suggestions || result.budget || Object.values(result)[0];
        result = { budgets: Array.isArray(arr) ? arr : [], summary: '', savingsRate: 20 };
      }
    } catch (e) {
      result = { budgets: [], summary: 'Could not parse AI response.', savingsRate: 0 };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const exchangeRateCache = {};

const fetchExchangeRate = async (toCurrency) => {
  if (!toCurrency || toCurrency === 'USD') return 1.0;

  const now = Date.now();
  if (exchangeRateCache[toCurrency] && (now - exchangeRateCache[toCurrency].timestamp < 3600000)) {
    console.log(`Using cached exchange rate for ${toCurrency}: ${exchangeRateCache[toCurrency].rate}`);
    return exchangeRateCache[toCurrency].rate;
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=${toCurrency}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Note || data.Information) {
      console.warn(`Alpha Vantage Rate Limit/Note for Exchange Rate (${toCurrency}):`, data.Note || data.Information);
      return 1.0;
    }

    const rate = data['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
    if (rate) {
      const numericRate = parseFloat(rate);
      exchangeRateCache[toCurrency] = { rate: numericRate, timestamp: now };
      console.log(`Fetched new exchange rate for ${toCurrency} (AlphaVantage): ${numericRate}`);
      return numericRate;
    }

    // Fallback if AlphaVantage fails/rate-limits
    console.log(`AlphaVantage failed for ${toCurrency}, trying fallback (Frankfurter)...`);
    const fallbackRes = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${toCurrency}`);
    const fallbackData = await fallbackRes.json();
    const fallbackRate = fallbackData.rates?.[toCurrency];

    if (fallbackRate) {
      exchangeRateCache[toCurrency] = { rate: fallbackRate, timestamp: now };
      console.log(`Fetched fallback exchange rate for ${toCurrency}: ${fallbackRate}`);
      return fallbackRate;
    }

    console.warn(`All exchange rate lookups failed for ${toCurrency}`);
    return 1.0;
  } catch (err) {
    console.error(`Exchange Rate Error for ${toCurrency}:`, err.message);
    return 1.0;
  }
};

const fetchStockPrice = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === 'your_alpha_vantage_key_here') {
    console.log('Alpha Vantage: No API Key provided or default used.');
    return null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check for rate limit or error notifications
    if (data.Note || data.Information) {
      console.warn(`Alpha Vantage Rate Limit/Note for ${symbol}:`, data.Note || data.Information);
      return null;
    }

    const quote = data['Global Quote'];
    if (quote && quote['05. price']) {
      const price = parseFloat(quote['05. price']);
      console.log(`Alpha Vantage: Fetched ${symbol} at $${price}`);
      return price;
    }

    console.log(`Alpha Vantage: No quote data for ${symbol}. Response:`, JSON.stringify(data));
    return null;
  } catch (err) {
    console.error(`Alpha Vantage Error for ${symbol}:`, err.message);
    return null;
  }
};

app.get('/api/stocks/search', auth, async (req, res) => {
  try {
    const { keywords } = req.query;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'API key missing' });

    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const results = data.bestMatches || [];
    const formatted = results.map(m => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      type: m['3. type'],
      region: m['4. region']
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/stocks/price', auth, async (req, res) => {
  try {
    const { symbol } = req.query;
    console.log(`Price request for symbol: ${symbol}`);

    const priceUSD = await fetchStockPrice(symbol);
    if (priceUSD === null) return res.status(404).json({ message: 'Price not found' });

    res.json({ price: priceUSD, currency: 'USD' });
  } catch (err) {
    console.error('Price endpoint error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/ai/stock-suggestions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.onboarding) return res.status(400).json({ message: 'Onboarding data missing' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { monthly } = user.onboarding.income || {};
    const { preferredName } = user.onboarding.basics || {};
    const currencyCode = user.onboarding.basics?.currency || 'USD';
    const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
    const currencySymbol = currencySymbols[currencyCode] || '$';

    const prompt = `
      As a financial advisor AI, suggest EXACTLY 5 high-potential stocks for ${preferredName} based on their monthly income of ${currencySymbol}${monthly}.
      
      Structure your response exactly like this:
      
      ### 📈 Top 5 Investment Picks
      Provide a concise Markdown table with columns: [Stock Name/Symbol], [Approx. Price (USD)], [Brief Why (Max 10 words)].
      
      ### 💰 Recommended Monthly Allocation
      Suggest a specific ${currencySymbol} amount based on 10-20% of their income. 
      Mention a starting "safety fund" if their income is low or they are a student.
      
      Guidelines:
      1. Keep it brief. 
      2. No long paragraphs. 
      3. Use USD ($) for stock prices in the table.
      4. Use ${currencySymbol} for the recommended allocation amount.
      5. Include a one-sentence disclaimer at the very end.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;
    res.json({ text: content || "No suggestions generated." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/ai/parse-day', auth, async (req, res) => {
  try {
    const { description, rooms: userRooms = [], goals: userGoals = [] } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required' });

    // Build a context string of room names for the prompt
    const roomContext = userRooms.length > 0
      ? `The user is a member of these shared budget rooms: ${userRooms.map(r => `"${r.name}" (code: ${r.code})`).join(', ')}.
For each transaction, if it is specifically mentioned in the context of one of these rooms (e.g. "added to our Home Expenses room", "for the flatmates", "in the trip group"), set "roomName" to the EXACT room name from the list above. If a transaction is personal and not related to any room, set "roomName" to null.
IMPORTANT: Only tag a transaction with a roomName if that specific transaction was explicitly associated with a room in the description. Do NOT assign all transactions to a room just because one room is mentioned.`
      : 'The user has no shared budget rooms. Always set "roomName" to null for all transactions.';

    const goalContext = userGoals.length > 0
      ? `The user has these existing savings goals: ${userGoals.map(g => `"${g.title}"`).join(', ')}.
If the user mentions adding, saving, or contributing money to one of these specific goals (e.g. "put 50 into my car fund", "saved 100 for college"), return it as a "contribute" type with the EXACT title from the list. 
If they want to start a NEW goal, return it as a "create" type.`
      : 'The user has no existing goals. If they mention wanting to save for something, return it as a "create" type.';

    const prompt = `
      Analyze the following description of a user's day and extract financial data:
      "${description}"
      
      ${roomContext}
      ${goalContext}
      
      Extract:
      1. Transactions: Each transaction may optionally belong to a shared room.
      2. Subscriptions: (e.g., "purchase of Netflix for 500" -> name: "Netflix", amount: 500, frequency: "monthly", category: "Entertainment")
      3. Goals: 
         - To create: type "create", title "Save for Car", targetAmount 10000
         - To contribute: type "contribute", title "Car Fund", amount 50 (must match an existing goal title if possible)
      
      Respond ONLY with a JSON object in this format:
      {
        "transactions": [{"title": "string", "amount": number, "category": "Food|Rent|Entertainment|Transport|Utilities|Other", "type": "expense|income", "roomName": "exact room name or null"}],
        "subscriptions": [{"name": "string", "amount": number, "frequency": "monthly|yearly", "category": "Food|Rent|Entertainment|Transport|Utilities|Other"}],
        "goals": [{"title": "string", "targetAmount": number, "amount": number, "type": "create|contribute"}]
      }
      If no data is found for a category, return an empty array for it.
      Important Rules:
      1. Default frequency for subscriptions is "monthly" unless "year" or "yearly" is mentioned.
      2. If you extract an item as a subscription, do NOT also include it in the transactions list. Items must be mutually exclusive.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0]?.message?.content);

    // Helper: match a room name string to an actual room ID
    const resolveRoomId = (roomName) => {
      if (!roomName || !userRooms.length) return null;
      const lower = roomName.toLowerCase();
      const matched = userRooms.find(r =>
        r.name.toLowerCase().includes(lower) ||
        lower.includes(r.name.toLowerCase()) ||
        r.code.toLowerCase() === lower
      );
      return matched?._id || null;
    };

    // Attach resolved collaborationId to each transaction
    const enrichedTransactions = (parsedData.transactions || []).map(t => ({
      ...t,
      collaborationId: resolveRoomId(t.roomName) || null
    }));

    res.json({
      transactions: enrichedTransactions,
      subscriptions: parsedData.subscriptions || [],
      goals: parsedData.goals || []
    });
  } catch (err) {
    console.error('AI Parse Day Error:', err);
    res.status(500).json({ message: 'Failed to parse your day. Please try again.' });
  }
});

app.post('/api/ai/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file provided' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Rename file to have correct extension for Groq
    const filePathWithExt = req.file.path + '.webm';
    fs.renameSync(req.file.path, filePathWithExt);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePathWithExt),
      model: "whisper-large-v3",
      response_format: "json"
    });

    // Clean up
    if (fs.existsSync(filePathWithExt)) fs.unlinkSync(filePathWithExt);

    res.json({ text: transcription.text });
  } catch (err) {
    console.error('Transcription Error:', err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to transcribe audio' });
  }
});







// AI Insights (existing code)
// ... (I'll keep it as is, just showing where I'm adding)

// --- Budget Room Routes ---

// Create a Room
app.post('/api/rooms', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new BudgetRoom({
      name,
      code,
      admin: req.userId,
      members: [req.userId]
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join a Room (Submit request)
app.post('/api/rooms/join', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const room = await BudgetRoom.findOne({ code });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Only block if there's an ACTIVE pending request
    const pendingRequest = room.requests.find(r => r.userId.toString() === req.userId && r.status === 'pending');
    if (pendingRequest) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    // If there was a previous accepted/rejected request, remove it to start fresh
    room.requests = room.requests.filter(r => r.userId.toString() !== req.userId);

    room.requests.push({ userId: req.userId, status: 'pending' });
    await room.save();

    // Real-time Update: Notify the specific admin via their personal room
    io.to(room.admin.toString()).emit('new_join_request', {
      roomId: room._id,
      roomName: room.name
    });

    // Also notify the room if anybody is already in it
    io.to(room._id.toString()).emit('new_join_request', { roomId: room._id });

    res.json({ message: 'Request sent to admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Room Details
app.get('/api/rooms/:id', auth, async (req, res) => {
  try {
    const room = await BudgetRoom.findOne({ _id: req.params.id, members: req.userId })
      .populate('admin members requests.userId comments.userId', 'name email');
    if (!room) return res.status(404).json({ message: 'Room not found or unauthorized' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get My Rooms
app.get('/api/rooms', auth, async (req, res) => {
  try {
    const rooms = await BudgetRoom.find({ members: req.userId })
      .populate('admin members requests.userId comments.userId', 'name email');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/rooms/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const room = await BudgetRoom.findOne({ _id: req.params.id, members: req.userId });
    if (!room) return res.status(403).json({ message: 'Unauthorized' });

    room.comments.push({ userId: req.userId, text });
    await room.save();

    // Refresh to get populated user info
    const updatedRoom = await BudgetRoom.findById(req.params.id).populate('comments.userId', 'name');

    // Real-time Update: Emit the new comments to the room
    io.to(req.params.id).emit('new_comment', updatedRoom.comments);

    res.json(updatedRoom.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Manage Requests (Admin only)
app.put('/api/rooms/:id/requests', auth, async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const room = await BudgetRoom.findOne({ _id: req.params.id, admin: req.userId });
    if (!room) return res.status(404).json({ message: 'Room not found or unauthorized' });

    const request = room.requests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    if (status === 'accepted') {
      // Avoid duplicate members
      if (!room.members.map(m => m.toString()).includes(request.userId.toString())) {
        room.members.push(request.userId);
      }
    }
    await room.save();

    // Return fully populated room so the frontend can sync state
    const updatedRoom = await BudgetRoom.findById(req.params.id)
      .populate('admin members requests.userId comments.userId', 'name email');

    // Real-time Update: Notify all current members and the admin
    io.to(req.params.id).emit('room_update', updatedRoom);

    // Real-time Update: Specifically notify the user who was processed
    io.to(request.userId.toString()).emit('request_processed', { roomId: req.params.id, status });

    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Room (Admin only)
app.delete('/api/rooms/:id', auth, async (req, res) => {
  try {
    const room = await BudgetRoom.findOneAndDelete({ _id: req.params.id, admin: req.userId });
    if (!room) return res.status(404).json({ message: 'Room not found or unauthorized' });

    // Notify all members that the room is gone
    io.to(req.params.id).emit('room_deleted', { roomId: req.params.id });

    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Kick Member (Admin only)
app.delete('/api/rooms/:id/members/:userId', auth, async (req, res) => {
  try {
    const room = await BudgetRoom.findOne({ _id: req.params.id, admin: req.userId });
    if (!room) return res.status(404).json({ message: 'Room not found or unauthorized' });

    // Cannot kick yourself
    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot kick yourself. Delete the room instead.' });
    }

    room.members = room.members.filter(m => m.toString() !== req.params.userId);

    // Also remove any existing requests for this user to allow them to re-join later
    room.requests = room.requests.filter(r => r.userId.toString() !== req.params.userId);

    await room.save();

    const updatedRoom = await BudgetRoom.findById(req.params.id)
      .populate('admin members requests.userId comments.userId', 'name email');

    // Notify the kicked user and update the room for others
    io.to(req.params.id).emit('room_update', updatedRoom);
    io.to(req.params.userId).emit('member_kicked', { roomId: req.params.id });

    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Shared Budgets in Rooms
app.get('/api/rooms/:id/budgets', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ roomId: req.params.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/rooms/:id/budgets', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;
    const room = await BudgetRoom.findOne({ _id: req.params.id, members: req.userId });
    if (!room) return res.status(403).json({ message: 'Unauthorized' });

    const budget = new Budget({
      userId: req.userId,
      roomId: req.params.id,
      category,
      limit,
      status: 'active'
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Removed approval route as per request


// Room Transactions
app.get('/api/rooms/:id/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ collaborationId: req.params.id })
      .populate('userId', 'name')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Calculate settlements for a room
app.get('/api/rooms/:id/settle', auth, async (req, res) => {
  try {
    const room = await BudgetRoom.findOne({ _id: req.params.id, members: req.userId }).populate('members', 'name');
    if (!room) return res.status(403).json({ message: 'Unauthorized or room not found' });

    const transactions = await Transaction.find({ collaborationId: req.params.id, type: 'expense' }).populate('userId', 'name');

    // Calculate total spent by each member
    const spentByMember = {};
    let totalSpent = 0;

    room.members.forEach(member => {
      spentByMember[member._id.toString()] = { name: member.name, spent: 0 };
    });

    transactions.forEach(t => {
      const uId = t.userId._id.toString();
      if (spentByMember[uId]) {
        spentByMember[uId].spent += t.amount;
        totalSpent += t.amount;
      }
    });

    const numMembers = room.members.length;
    if (numMembers === 0) return res.json([]);

    const averageSplit = totalSpent / numMembers;

    // Calculate balances (positive = owes money, negative = is owed money)
    const balances = {};
    for (const [uId, data] of Object.entries(spentByMember)) {
      balances[uId] = { name: data.name, balance: averageSplit - data.spent };
    }

    // Split into debtors and creditors
    const debtors = []; // People who owe
    const creditors = []; // People who are owed

    for (const [uId, data] of Object.entries(balances)) {
      if (data.balance > 0.01) debtors.push({ uId, name: data.name, amount: data.balance });
      else if (data.balance < -0.01) creditors.push({ uId, name: data.name, amount: Math.abs(data.balance) });
    }

    // Sort by amount to optimize settlements 
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settleAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.name,
        fromId: debtor.uId,
        to: creditor.name,
        toId: creditor.uId,
        amount: settleAmount
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Subscriptions
app.get('/api/subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId }).sort({ nextBillingDate: 1 });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/subscriptions', auth, async (req, res) => {
  try {
    const subscription = new Subscription({
      ...req.body,
      userId: req.userId
    });
    const newSubscription = await subscription.save();
    res.status(201).json(newSubscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/subscriptions/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// Goals
app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.userId
    });
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/goals/:id', auth, async (req, res) => {
  try {
    const { currentAmount, contribution } = req.body;
    const update = { currentAmount };

    // If a specific contribution amount is provided, record it in history
    if (contribution) {
      update.$push = { contributions: { amount: contribution, date: new Date() } };
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// AI Goal Insight
app.post('/api/ai/goal-insight', auth, async (req, res) => {
  try {
    const { goalId } = req.body;
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const user = await User.findById(req.userId);
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(50);

    // Calculate stats
    const totalSaved = goal.currentAmount;
    const target = goal.targetAmount;
    const remaining = target - totalSaved;

    // Analyze spending style
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const topCategories = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const currencyCode = user.onboarding?.basics?.currency || 'USD';
    const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
    const currencySymbol = currencySymbols[currencyCode] || '$';

    const prompt = `
      Based on the following financial data, provide ONE CONCISE SENTENCE (maximum 2 lines) of direct financial advice to help the user reach their goal.
      
      User Profile:
      - Monthly Income: ${currencySymbol}${user.onboarding?.income?.monthly || 'Not specified'} (${currencyCode})
      - Occupation: ${user.onboarding?.basics?.occupation}
      - Top Expense Categories: ${JSON.stringify(topCategories)}

      Goal Details:
      - Title: "${goal.title}"
      - Progress: ${currencySymbol}${totalSaved} / ${currencySymbol}${target}

      Provide ONLY the advice sentence. No headers, no bold lists, no paragraphs. Just one powerful, data-driven advice line.
      Important: ALWAYS use ${currencySymbol} and ${currencyCode} whenever mentioning monetary values. Never use other currencies like $.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;
    res.json({ text: content || "No insight generated." });
  } catch (err) {
    console.error('Goal Insight Error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Investments
app.get('/api/investments', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/investments', auth, async (req, res) => {
  try {
    const investment = new Investment({
      ...req.body,
      userId: req.userId
    });
    const newInvestment = await investment.save();
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/investments/:id', auth, async (req, res) => {
  try {
    const { currentPrice } = req.body;
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { currentPrice },
      { new: true }
    );
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json(investment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/investments/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json({ message: 'Investment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Spending Forecast using ML model
app.post('/api/forecast', auth, async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });

    const inputPayload = JSON.stringify({
      transactions: transactions.map(t => ({
        date: t.date,
        amount: t.amount,
        type: t.type,
        category: t.category
      })),
      days: req.body.days || 30
    });

    const pythonScript = path.join(__dirname, 'forecast.py');
    const python = spawn('python3', [pythonScript]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Forecast Python error:', stderr);
        return res.status(500).json({ message: 'Forecast model failed to run.', detail: stderr });
      }
      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return res.status(500).json({ message: result.error });
        }
        res.json(result);
      } catch (parseErr) {
        res.status(500).json({ message: 'Failed to parse forecast output.' });
      }
    });

    python.stdin.write(inputPayload);
    python.stdin.end();

  } catch (err) {
    console.error('Forecast route error:', err);
    res.status(500).json({ message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

