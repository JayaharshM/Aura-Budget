#!/usr/bin/env node
/**
 * seed_mock_data.js
 * 
 * Logs in as test1@gmail.com and seeds realistic mock transaction data
 * spread over the past 4 months to test the ML spending forecast model.
 * 
 * Run: node seed_mock_data.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5001';
const EMAIL = 'test1@gmail.com';
const PASSWORD = '123456';

// ── Helper: HTTP request ───────────────────────────────────────────────────
function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 5001,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            }
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', chunk => raw += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// ── Date helpers ───────────────────────────────────────────────────────────
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

// ── Mock transaction data ──────────────────────────────────────────────────
// 80 transactions: ~65 expenses + ~15 income over last 4 months
const transactions = [
    // ▸ INCOME
    { title: 'Monthly Salary', amount: 55000, type: 'income', category: 'Salary', date: daysAgo(2) },
    { title: 'Monthly Salary', amount: 55000, type: 'income', category: 'Salary', date: daysAgo(32) },
    { title: 'Monthly Salary', amount: 55000, type: 'income', category: 'Salary', date: daysAgo(62) },
    { title: 'Monthly Salary', amount: 55000, type: 'income', category: 'Salary', date: daysAgo(92) },
    { title: 'Freelance Project', amount: 12000, type: 'income', category: 'Other', date: daysAgo(15) },
    { title: 'Freelance Project', amount: 8500, type: 'income', category: 'Other', date: daysAgo(50) },
    { title: 'Cashback Reward', amount: 450, type: 'income', category: 'Other', date: daysAgo(20) },
    { title: 'Stock Dividend', amount: 2200, type: 'income', category: 'Other', date: daysAgo(75) },
    { title: 'Tuition Reimbursement', amount: 5000, type: 'income', category: 'Other', date: daysAgo(100) },
    { title: 'Referral Bonus', amount: 1000, type: 'income', category: 'Other', date: daysAgo(40) },

    // ▸ FOOD & DRINK
    { title: 'Zomato Order', amount: 340, type: 'expense', category: 'Food', date: daysAgo(1) },
    { title: 'Swiggy Dinner', amount: 280, type: 'expense', category: 'Food', date: daysAgo(3) },
    { title: 'Grocery Store', amount: 1850, type: 'expense', category: 'Food', date: daysAgo(5) },
    { title: 'Coffee Shop', amount: 160, type: 'expense', category: 'Food', date: daysAgo(7) },
    { title: 'Restaurant Dinner', amount: 1200, type: 'expense', category: 'Food', date: daysAgo(10) },
    { title: 'Zomato Order', amount: 420, type: 'expense', category: 'Food', date: daysAgo(12) },
    { title: 'Grocery Store', amount: 2100, type: 'expense', category: 'Food', date: daysAgo(18) },
    { title: 'Bakery Snacks', amount: 95, type: 'expense', category: 'Food', date: daysAgo(19) },
    { title: 'Swiggy Lunch', amount: 260, type: 'expense', category: 'Food', date: daysAgo(22) },
    { title: 'Restaurant Brunch', amount: 980, type: 'expense', category: 'Food', date: daysAgo(25) },
    { title: 'Grocery Store', amount: 1700, type: 'expense', category: 'Food', date: daysAgo(35) },
    { title: 'Coffee Shop', amount: 140, type: 'expense', category: 'Food', date: daysAgo(38) },
    { title: 'Zomato Order', amount: 390, type: 'expense', category: 'Food', date: daysAgo(42) },
    { title: 'Grocery Store', amount: 2200, type: 'expense', category: 'Food', date: daysAgo(55) },
    { title: 'Restaurant Dinner', amount: 1350, type: 'expense', category: 'Food', date: daysAgo(60) },
    { title: 'Grocery Store', amount: 1900, type: 'expense', category: 'Food', date: daysAgo(80) },
    { title: 'Swiggy Dinner', amount: 310, type: 'expense', category: 'Food', date: daysAgo(88) },
    { title: 'Grocery Store', amount: 2050, type: 'expense', category: 'Food', date: daysAgo(110) },

    // ▸ RENT / UTILITIES
    { title: 'Monthly Rent', amount: 18000, type: 'expense', category: 'Rent', date: daysAgo(2) },
    { title: 'Monthly Rent', amount: 18000, type: 'expense', category: 'Rent', date: daysAgo(32) },
    { title: 'Monthly Rent', amount: 18000, type: 'expense', category: 'Rent', date: daysAgo(62) },
    { title: 'Monthly Rent', amount: 18000, type: 'expense', category: 'Rent', date: daysAgo(92) },
    { title: 'Electricity Bill', amount: 950, type: 'expense', category: 'Utilities', date: daysAgo(8) },
    { title: 'Water Bill', amount: 220, type: 'expense', category: 'Utilities', date: daysAgo(9) },
    { title: 'WiFi Bill', amount: 799, type: 'expense', category: 'Utilities', date: daysAgo(14) },
    { title: 'Electricity Bill', amount: 1100, type: 'expense', category: 'Utilities', date: daysAgo(40) },
    { title: 'WiFi Bill', amount: 799, type: 'expense', category: 'Utilities', date: daysAgo(45) },
    { title: 'Electricity Bill', amount: 880, type: 'expense', category: 'Utilities', date: daysAgo(70) },
    { title: 'WiFi Bill', amount: 799, type: 'expense', category: 'Utilities', date: daysAgo(75) },
    { title: 'Electricity Bill', amount: 1030, type: 'expense', category: 'Utilities', date: daysAgo(100) },

    // ▸ TRANSPORT
    { title: 'Uber Ride', amount: 220, type: 'expense', category: 'Transport', date: daysAgo(1) },
    { title: 'Petrol Fill-up', amount: 1500, type: 'expense', category: 'Transport', date: daysAgo(6) },
    { title: 'Metro Card Recharge', amount: 500, type: 'expense', category: 'Transport', date: daysAgo(11) },
    { title: 'Uber Ride', amount: 180, type: 'expense', category: 'Transport', date: daysAgo(16) },
    { title: 'Rapido Bike', amount: 65, type: 'expense', category: 'Transport', date: daysAgo(20) },
    { title: 'Petrol Fill-up', amount: 1500, type: 'expense', category: 'Transport', date: daysAgo(36) },
    { title: 'Uber Ride', amount: 340, type: 'expense', category: 'Transport', date: daysAgo(44) },
    { title: 'Petrol Fill-up', amount: 1500, type: 'expense', category: 'Transport', date: daysAgo(68) },
    { title: 'Uber Ride', amount: 195, type: 'expense', category: 'Transport', date: daysAgo(90) },
    { title: 'Petrol Fill-up', amount: 1500, type: 'expense', category: 'Transport', date: daysAgo(105) },

    // ▸ ENTERTAINMENT
    { title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: daysAgo(5) },
    { title: 'Movie Tickets', amount: 720, type: 'expense', category: 'Entertainment', date: daysAgo(13) },
    { title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', date: daysAgo(6) },
    { title: 'Weekend Trip', amount: 3500, type: 'expense', category: 'Entertainment', date: daysAgo(21) },
    { title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: daysAgo(35) },
    { title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', date: daysAgo(36) },
    { title: 'Gaming Purchase', amount: 1299, type: 'expense', category: 'Entertainment', date: daysAgo(48) },
    { title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: daysAgo(65) },
    { title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', date: daysAgo(66) },
    { title: 'Movie Tickets', amount: 600, type: 'expense', category: 'Entertainment', date: daysAgo(72) },
    { title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: daysAgo(95) },
    { title: 'Spotify Premium', amount: 119, type: 'expense', category: 'Entertainment', date: daysAgo(96) },

    // ▸ HEALTH & SHOPPING
    { title: 'Pharmacy', amount: 530, type: 'expense', category: 'Other', date: daysAgo(4) },
    { title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Other', date: daysAgo(3) },
    { title: 'Doctor Consultation', amount: 600, type: 'expense', category: 'Other', date: daysAgo(26) },
    { title: 'Amazon Shopping', amount: 2800, type: 'expense', category: 'Other', date: daysAgo(17) },
    { title: 'Clothing Purchase', amount: 3200, type: 'expense', category: 'Other', date: daysAgo(30) },
    { title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Other', date: daysAgo(33) },
    { title: 'Amazon Shopping', amount: 1500, type: 'expense', category: 'Other', date: daysAgo(56) },
    { title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Other', date: daysAgo(63) },
    { title: 'Pharmacy', amount: 280, type: 'expense', category: 'Other', date: daysAgo(82) },
    { title: 'Gym Membership', amount: 1500, type: 'expense', category: 'Other', date: daysAgo(93) },
    { title: 'Amazon Shopping', amount: 4200, type: 'expense', category: 'Other', date: daysAgo(108) },
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
    console.log('🔐 Logging in as', EMAIL);
    const login = await request('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD });

    if (login.status !== 200 || !login.body.token) {
        console.error('❌ Login failed:', login.body);
        process.exit(1);
    }

    const token = login.body.token;
    console.log('✅ Logged in. User ID:', login.body.user.id);
    console.log(`\n📤 Seeding ${transactions.length} transactions...\n`);

    let success = 0;
    let fail = 0;

    for (const tx of transactions) {
        const res = await request('POST', '/api/transactions', tx, token);
        if (res.status === 201) {
            success++;
            process.stdout.write('.');
        } else {
            fail++;
            console.error(`\n❌ Failed: ${tx.title} →`, res.body);
        }
    }

    console.log(`\n\n✅ Done! ${success} transactions added, ${fail} failed.`);
    console.log('\n📊 Summary by category:');
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, total]) => {
        console.log(`   ${cat.padEnd(16)} ₹${total.toLocaleString('en-IN')}`);
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    console.log(`\n   Total Income:  ₹${totalIncome.toLocaleString('en-IN')}`);
    console.log(`   Total Expense: ₹${totalExpense.toLocaleString('en-IN')}`);
}

main().catch(console.error);
