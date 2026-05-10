import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app-check.js";

// --- Firebase Configuration ---
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY_HERE'),
    isTokenAutoRefreshEnabled: true
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= SPLASH & UI UTILS ================= */
window.hideSplash = () => {
    const splash = get('splash');
    if (splash) {
        splash.classList.add('hide-splash');
        setTimeout(() => splash.remove(), 800);
    }
};

window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= LIVE TRANSACTIONS LOGIC ================= */
function startLiveTransactions() {
    const txContainer = document.querySelector('.card .no-data-box');
    if (!txContainer) return;

    // Transaction list UI initialize karein
    txContainer.parentElement.innerHTML = `<h4 style="margin:0 0 10px 0;">Recent Transactions</h4><div id="liveTxList"></div>`;
    
    const generateTx = () => {
        const list = document.getElementById('liveTxList');
        if (!list) return;

        const amount = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
        const type = Math.random() > 0.5 ? 'Deposit' : 'Credit';
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const txHtml = `
            <div class="history-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0; display:flex; justify-content:space-between;">
                <span>${type} <small style="color:#aaa; font-size:10px;">${timeStr}</small></span>
                <span style="color: #4caf50; font-weight:bold;">+₹${amount}</span>
            </div>`;
        
        list.insertAdjacentHTML('afterbegin', txHtml);
        if (list.children.length > 5) list.lastElementChild.remove();

        // 5% Balance Credit Logic (Local update)
        let currentBal = parseInt(localStorage.getItem("currentBalance") || 0);
        let bonus = Math.floor(amount * 0.05);
        let newBal = currentBal + bonus;
        
        localStorage.setItem("currentBalance", newBal);
        get("balance").innerText = "₹" + newBal;

        // Interval: 4 to 25 seconds
        const nextInterval = (Math.floor(Math.random() * (25 - 4 + 1)) + 4) * 1000;
        setTimeout(generateTx, nextInterval);
    };
    generateTx();
}

/* ================= AUTH ACTIONS ================= */
window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.setProperty("display", "block", "important");
    get("email").style.setProperty("display", "block", "important");
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref') || "none";

    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: generatedUID, referredBy: refBy, accountStatus: "Deactivated"
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Error: " + error.message); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
            loadWithdrawBankData();
            renderDepositHistory();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= DATA LOADING & UI SYNC ================= */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + (data.name || "User");
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + data.email;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    
    localStorage.setItem("currentBalance", data.balance || 0);
    localStorage.setItem("userUID", data.uid);

    // Account Status Color Sync (Green for Active, Red for Deactivate)
    const statusBox = document.querySelector('.card span[style*="color:red"]');
    if (statusBox) {
        if (data.accountStatus === "Active") {
            statusBox.style.color = "#00ff00";
            statusBox.innerHTML = `● <span style="color:white; font-weight:normal;">Activated</span>`;
        } else {
            statusBox.style.color = "red";
            statusBox.innerHTML = `● <span style="color:white; font-weight:normal;">Deactivate</span>`;
        }
    }

    startLiveTransactions();
    renderReferrals();
}

/* ================= REFERRAL SYSTEM (With UID) ================= */
async function renderReferrals() {
    const list = get("referralList");
    const userUID = localStorage.getItem("userUID");
    if(!userUID) return;

    try {
        const q = query(collection(db, "users"), where("referredBy", "==", userUID));
        const snap = await getDocs(q);
        
        if(snap.empty) {
            list.innerHTML = `<div class="no-data-box">No referrals yet</div>`;
            return;
        }

        let html = "";
        snap.forEach(doc => {
            const d = doc.data();
            html += `
                <div class="history-item">
                    <span>UID: ${d.uid} (${d.name})</span>
                    <span style="color:#00d4ff;">+₹250</span>
                </div>`;
        });
        list.innerHTML = html;
    } catch (e) { console.log("Referral Load Error", e); }
}

window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?ref=" + userUID;
    const shareText = `🚀 *Join INRPAY & Start Earning Daily!* 🚀\n\n💰 Get instant *₹250 bonus* per referral!\nUse my Referral ID: *${userUID}*`;

    if (navigator.share) {
        await navigator.share({ title: 'INRPAY', text: shareText, url: link });
    } else {
        navigator.clipboard.writeText(`${shareText}\n${link}`);
        window.showMsg("Link copied to clipboard!");
    }
};

/* ================= DEPOSIT & BANK ACTIONS ================= */
window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    let now = new Date().toLocaleString();
    try {
        await setDoc(doc(db, "deposits", Date.now().toString()), { 
            user: localStorage.getItem("user"), utr: utr, status: "Pending", date: now 
        });
        window.showMsg("Submitted Successfully!");
        get("utr").value = "";
        renderDepositHistory(); 
    } catch (e) { window.showMsg("Error: " + e.message); }
};

async function renderDepositHistory() {
    let list = get("depositHistoryList");
    const user = localStorage.getItem("user");
    if(!user) return;
    try {
        const q = query(collection(db, "deposits"), where("user", "==", user));
        const querySnapshot = await getDocs(q);
        let html = "";
        querySnapshot.forEach((doc) => {
            let item = doc.data();
            html += `<div class="dep-hist-item"><b>UTR:</b> ${item.utr}<br><b>Time:</b> ${item.date} | <span style="color:orange;">${item.status}</span></div>`;
        });
        list.innerHTML = html || `<div class="no-data-box" style="font-size: 10px;">No history</div>`;
    } catch (e) { list.innerHTML = `<div class="no-data-box">History error</div>`; }
}

/* ================= SYSTEM SETTINGS & ONLOAD ================= */
async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) { 
            get("qrImage").src = d.qr; 
            get("qrImage").style.display = "block"; 
            get("downloadQrBtn").style.display = "inline-block"; 
        }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.onload = () => {
    const start = Date.now();
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        const finalize = () => {
            const delay = Math.max(0, 3000 - (Date.now() - start));
            setTimeout(window.hideSplash, delay);
        };

        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){ 
                    get("auth").style.display = "none"; 
                    get("app").style.display = "block"; 
                    loadUserData(s.data(), u); 
                    loadSettings(); 
                }
                finalize();
            }).catch(finalize);
        } else {
            finalize();
        }
    });
};

/* ================= OTHER UI TRIGGERS ================= */
window.openBank = () => { get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");
window.triggerActivate = () => {
    get("bankBox").classList.remove("active");
    window.showMsg("Please deposit security amount first");
};
window.copyUPI = () => {
    const upiId = get("upiText").innerText;
    if (upiId && upiId !== "Loading...") {
        navigator.clipboard.writeText(upiId).then(() => window.showMsg("Copy"));
    }
};
// Withdrawal History Popups
window.openWithdrawHistory = () => get("withdrawHistoryBox").classList.add("active");
window.closeWithdrawHistory = () => get("withdrawHistoryBox").classList.remove("active");
