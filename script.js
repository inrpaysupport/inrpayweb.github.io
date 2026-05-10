import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
// App Check import add kiya gaya
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app-check.js";

// Firebase Configuration
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

// App Check Initialize karein
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY_HERE'),
    isTokenAutoRefreshEnabled: true
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= SPLASH SCREEN LOGIC ================= */
window.hideSplash = () => {
    const splash = get('splash');
    if (splash) {
        splash.classList.add('hide-splash');
        setTimeout(() => splash.remove(), 800);
    }
};

/* ================= UTILITY & UI ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
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

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: generatedUID, bankStatus: "Deactivate"
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Error: " + error.message); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            location.reload(); 
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= NEW: REAL-TIME BANK & BALANCE LISTENERS ================= */
function setupRealtimeListeners(num) {
    onSnapshot(doc(db, "users", num), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            get("usernameHome").innerText = "Hello, " + (data.name || "User");
            get("balance").innerText = "₹" + (data.balance || 0);
            localStorage.setItem("currentBalance", data.balance || 0);
            
            // Bank Status Check (Red/Green Dot Logic)
            const statusText = data.bankStatus === "Active" ? "Activated" : "Deactivate";
            const statusColor = data.bankStatus === "Active" ? "#38ef7d" : "red";
            
            const statusContainer = document.querySelector("#homePage .card span[style*='color:red'], #homePage .card span[style*='color:#38ef7d']");
            if(statusContainer) {
                statusContainer.style.color = statusColor;
                statusContainer.innerHTML = `● <span style="color:white; font-weight:normal;">${statusText}</span>`;
            }
        }
    });
}

/* ================= NEW: AUTO TRANSACTIONS SIMULATION ================= */
function startLiveTransactions() {
    const listContainer = document.querySelector("#homePage .card h4")?.parentElement;
    if(!listContainer) return;
    
    const run = () => {
        const amount = Math.floor(Math.random() * 5000) + 500;
        const isDebit = Math.random() > 0.5;
        const type = isDebit ? "Debit" : "Credit";
        const color = isDebit ? "#ff5252" : "#38ef7d";
        
        const item = document.createElement("div");
        item.style.cssText = "display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.1); font-size:13px;";
        item.innerHTML = `<span>${new Date().toLocaleTimeString()}</span><span style="color:${color}">${type}: ₹${amount}</span>`;
        
        if (listContainer.querySelector('.no-data-box')) {
            const h4 = listContainer.querySelector('h4');
            listContainer.innerHTML = "";
            if(h4) listContainer.appendChild(h4);
        }
        listContainer.insertBefore(item, listContainer.children[1]);
        if (listContainer.children.length > 6) listContainer.removeChild(listContainer.lastChild);
        setTimeout(run, Math.random() * 10000 + 5000);
    };
    run();
}

/* ================= NEW: FUNCTIONAL WITHDRAWAL ================= */
window.submitWithdraw = async () => {
    let amt = parseInt(get("withdrawAmount").value);
    let num = localStorage.getItem("user");
    let bal = parseInt(localStorage.getItem("currentBalance"));
    
    if(!amt || amt < 100) return window.showMsg("Min ₹100!");
    if(amt > bal) return window.showMsg("Insufficient Balance!");

    try {
        await setDoc(doc(db, "withdrawals", Date.now().toString()), {
            user: num, amount: amt, status: "Pending", date: new Date().toLocaleString()
        });
        await updateDoc(doc(db, "users", num), { balance: bal - amt });
        window.showMsg("Withdrawal Request Submitted!");
        get("withdrawAmount").value = "";
    } catch (e) { window.showMsg("Error: " + e.message); }
};

/* ================= ORIGINAL SETTINGS & DEPOSIT LOGIC ================= */
window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr || utr.length < 12) return window.showMsg("Enter 12-digit UTR!");
    try {
        await setDoc(doc(db, "deposits", Date.now().toString()), { 
            user: localStorage.getItem("user"), utr: utr, status: "Pending", date: new Date().toLocaleString() 
        });
        window.showMsg("UTR Submitted!");
        get("utr").value = "";
    } catch (e) { window.showMsg("Error: " + e.message); }
};

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

async function loadWithdrawBankData() {
    const user = localStorage.getItem("user");
    if(!user) return;
    const snap = await getDoc(doc(db, "bank_earning", user));
    if(snap.exists()) {
        const d = snap.data();
        get("earnBankName").value = d.bank || "";
        get("earnBankAcc").value = d.acc || "";
        get("earnBankIfsc").value = d.ifsc || "";
    }
}

/* ================= ORIGINAL APP INIT & NAV ================= */
onAuthStateChanged(auth, (user) => {
    let u = localStorage.getItem("user");
    if (user && u) {
        get("auth").style.display = "none";
        get("app").style.display = "block";
        setupRealtimeListeners(u);
        loadSettings();
        loadWithdrawBankData();
        startLiveTransactions();
    }
    setTimeout(window.hideSplash, 2000);
});

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };
window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

/* ================= ORIGINAL UTILITY FUNCTIONS ================= */
window.copyUPI = () => {
    const upiId = get("upiText").innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            window.showMsg("Copy");
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = upiId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            window.showMsg("Copy");
        });
    }
};

window.downloadQR = async () => {
    const qrImg = get("qrImage");
    if (!qrImg.src || qrImg.style.display === "none") {
        return window.showMsg("Please wait, QR loading...");
    }
    try {
        const response = await fetch(qrImg.src);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "INRPAY_QR_" + Date.now() + ".png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        window.open(qrImg.src, '_blank');
        window.showMsg("Opening QR in new tab...");
    }
};

/* ================= ORIGINAL SERVICE WORKER (PWA) ================= */
if ('service-worker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Error:', err));
    });
}
