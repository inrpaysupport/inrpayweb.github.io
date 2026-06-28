const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// GLOBAL CORE VARIABLES
let globalSettings = {
    appName: "MIXOWIN",
    logoText: "MIXOWIN",
    maintenanceMode: false,
    banners: [
        { id: 1, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800", link: "#deposit", title: "Mega 200% First Deposit Bonus!" },
        { id: 2, img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800", link: "https://t.me/mixowin_official", title: "Join Official Telegram Channel" }
    ],
    ipWhitelist: ["127.0.0.1", "::1"]
};

let adminSettings = {
    gameMode: "AUTO",
    targetWinRate: 65,
    manualCrashAt: 2.20
};

let smtpConfig = { host: "smtp.gmail.com", port: 465, senderEmail: "support@mixowin.com", senderName: "MIXOWIN Official", appPassword: "", isActive: false };

let emailTemplates = {
    welcome: `<div style="background:#070814; color:#fff; padding:20px; font-family:sans-serif; border-radius:8px;"><h2>Welcome to {APP_NAME}, {USERNAME}!</h2><p>Your unique account token ID is <strong>{USER_ID}</strong>. Start winning now!</p></div>`,
    deposit: `<div style="background:#070814; color:#fff; padding:20px; font-family:sans-serif; border-radius:8px;"><h2>Deposit Credited!</h2><p>Hi {USERNAME}, your wallet has been credited with INR {AMOUNT}. Current Balance: INR {BALANCE}</p></div>`,
    withdrawal: `<div style="background:#070814; color:#fff; padding:20px; font-family:sans-serif; border-radius:8px;"><h2>Withdrawal Success!</h2><p>Hi {USERNAME}, your payout of INR {AMOUNT} has been dispatched. Ref: {TXN_ID}</p></div>`
};

let currencyExchange = {
    base: "INR",
    rates: {
        "INR": { symbol: "₹", factor: 1.0, code: "+91" },
        "USD": { symbol: "$", factor: 0.012, code: "+1" },
        "AED": { symbol: "🇦🇪", factor: 0.043, code: "+971" }
    }
};

let accounting = { todayProfit: 45200, dailyProfit: 185000, monthlyProfit: 2420000, totalBetsCollected: 8950000, totalPaidOut: 6530000 };
let staffChatLogs = [];
let emailLogs = [];

let users = [
    { id: "User_99", name: "Vikram Singh", email: "vikram@gmail.com", balance: 5000, currency: "INR", ip: "127.0.0.1", deviceId: "D1", status: "Active", country: "India" },
    { id: "Player_X", name: "John Doe", email: "john@gmail.com", balance: 150, currency: "USD", ip: "192.168.1.10", deviceId: "D2", status: "Active", country: "USA" }
];

// CRASH SUITE LOOP ALGORITHM
let currentMultiplier = 1.00;
let gameStatus = "WAITING"; 
let timeToStart = 8;
let finalCrashPoint = 2.00;
let activeRoundBets = [];

function calculateNextCrashPoint() {
    if (adminSettings.gameMode === "MANUAL") return parseFloat(adminSettings.manualCrashAt);
    return Math.random() * 100 > adminSettings.targetWinRate ? parseFloat((1 + Math.random() * 0.12).toFixed(2)) : parseFloat((101 / (101 - Math.random() * 100)).toFixed(2));
}

function startCrashGameLoop() {
    gameStatus = "WAITING"; timeToStart = 8;
    activeRoundBets = [
        { id: "User_99", name: "Vik***", amount: 200, cashedOut: false, rate: 0 },
        { id: "Bot_1", name: "Aman***", amount: 500, cashedOut: Math.random() > 0.5, rate: 1.40 }
    ];
    let countdown = setInterval(() => {
        timeToStart--;
        io.emit('game-state', { status: gameStatus, countdown: timeToStart, activeBets: activeRoundBets });
        if (timeToStart <= 0) { clearInterval(countdown); runRocket(); }
    }, 1000);
}

function runRocket() {
    gameStatus = "RUNNING"; currentMultiplier = 1.00; finalCrashPoint = calculateNextCrashPoint();
    let gameInterval = setInterval(() => {
        currentMultiplier += 0.01 + (currentMultiplier * 0.005);
        currentMultiplier = parseFloat(currentMultiplier.toFixed(2));
        io.emit('game-state', { status: gameStatus, multiplier: currentMultiplier });
        if (currentMultiplier >= finalCrashPoint) { clearInterval(gameInterval); executeCrashSettlement(); }
    }, 100);
}

function executeCrashSettlement() {
    gameStatus = "CRASHED";
    let roundTotalBets = activeRoundBets.reduce((sum, b) => sum + b.amount, 0);
    let roundTotalPayout = 0;
    activeRoundBets.forEach(b => { if (b.cashedOut && b.rate < finalCrashPoint) roundTotalPayout += b.amount * b.rate; });
    
    let roundNet = roundTotalBets - roundTotalPayout;
    accounting.todayProfit += roundNet; accounting.dailyProfit += roundNet; accounting.monthlyProfit += roundNet;
    
    io.emit('game-state', { status: gameStatus, multiplier: currentMultiplier });
    io.emit('accounting-sync', accounting);
    setTimeout(startCrashGameLoop, 4000);
}

// WEBSOCKET COMMUNICATION PIPELINE
io.on('connection', (socket) => {
    let clientIp = socket.handshake.address;
    socket.emit('init-global', globalSettings);
    socket.emit('settings-sync', adminSettings);
    socket.emit('accounting-sync', accounting);
    socket.emit('users-sync', users);
    socket.emit('smtp-sync', smtpConfig);
    socket.emit('templates-sync', emailTemplates);
    socket.emit('currency-sync', currencyExchange);
    socket.emit('staff-chat-sync', staffChatLogs);
    socket.emit('email-logs-sync', emailLogs);

    socket.on('register-attempt', (data) => {
        if (!globalSettings.ipWhitelist.includes(clientIp)) {
            let exists = users.find(u => u.ip === clientIp || u.deviceId === data.deviceId);
            if (exists) return socket.emit('security-alert', { msg: "Multi-Account Security Protocol Violation. Registration Aborted." });
        }
    });

    socket.on('update-admin-settings', (data) => { adminSettings = data; io.emit('settings-sync', adminSettings); });
    socket.on('update-global-settings', (data) => { globalSettings = data; io.emit('global-settings-sync', globalSettings); });
    socket.on('staff-send-msg', (data) => { staffChatLogs.push({ sender: data.sender, text: data.text, timestamp: new Date().toLocaleTimeString() }); io.emit('staff-chat-sync', staffChatLogs); });
    
    socket.on('manual-wallet-update', (data) => {
        let u = users.find(user => user.id === data.userId);
        if(u) {
            if(data.action === "CREDIT") u.balance += parseInt(data.amount);
            if(data.action === "DEBIT") u.balance -= parseInt(data.amount);
            io.emit('users-sync', users);
        }
    });

    socket.on('update-smtp', (data) => { smtpConfig = data; io.emit('smtp-sync', smtpConfig); });
    socket.on('update-template', (data) => { emailTemplates[data.type] = data.html; io.emit('templates-sync', emailTemplates); });
    socket.on('update-exchange-rates', (data) => { currencyExchange.rates = data; io.emit('currency-sync', currencyExchange); });
    
    socket.on('send-direct-email', (data) => {
        let u = users.find(user => user.id === data.userId); if(!u) return;
        emailLogs.push({ target: u.email, subject: data.subject, type: "DIRECT CRM", status: "Processed (Sandbox)", time: new Date().toLocaleTimeString() });
        io.emit('email-logs-sync', emailLogs);
    });

    socket.on('trigger-bulk-email', (data) => {
        users.forEach((u, i) => {
            setTimeout(() => {
                emailLogs.push({ target: u.email, subject: data.subject, type: `BULK (${data.audience})`, status: "Dispatched", time: new Date().toLocaleTimeString() });
                io.emit('email-logs-sync', emailLogs);
                io.emit('bulk-progress', { sent: i + 1, total: users.length });
            }, i * 200);
        });
    });
});

startCrashGameLoop();
server.listen(3000, () => console.log('MIXOWIN Core Framework online on port 3000'));