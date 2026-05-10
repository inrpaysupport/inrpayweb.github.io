import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Firebase Configuration
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
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

/* ================= FORGOT PASSWORD ================= */
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");

window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if (!email) return window.showMsg("Please enter your email!");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Password reset link sent! Check your email/spam folder.");
        window.closeForgot();
    } catch (error) { window.showMsg("Error: " + error.message); }
};

/* ================= AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");

    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref') || "Direct";

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), {
            name: name, 
            email: email, 
            password: pass, 
            balance: 0,
            uid: generatedUID,
            status: "Deactivate",
            referredBy: refBy,
            date: new Date().toLocaleDateString()
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Email or Number already in use!"); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const email = snap.data().email;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            syncAppData(); 
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= SETTINGS: PASSWORD CHANGE ================= */
window.changePassword = async () => {
    const user = auth.currentUser;
    const oldPass = get("oldPass").value;
    const newPass = get("newPass").value;

    if (!user) return window.showMsg("Please login again!");
    if (!oldPass || !newPass) return window.showMsg("Fill both fields!");

    try {
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newPass });
        window.showMsg("Password updated!");
        get("oldPass").value = ""; get("newPass").value = "";
    } catch (error) { window.showMsg("Error: " + error.message); }
};

/* ================= LIVE DATA SYNC & APP LOGIC ================= */
async function syncAppData() {
    const u = localStorage.getItem("user");
    if(!u) return;

    onSnapshot(doc(db, "users", u), (s) => {
        if(s.exists()){
            const d = s.data();
            get("balance").innerText = "₹" + (d.balance || 0);
            get("usernameHome").innerText = "Hello, " + (d.name || "User");
            get("username2").innerText = d.name;
            get("useremail").innerText = d.email;
            get("usernumber").innerText = "Mobile: " + u;
            get("userid").innerText = "UID: " + d.uid;
            
            const wrap = get("accStatusWrap"); 
            const txt = get("accStatusText");
            if(wrap && txt) {
                wrap.style.color = d.status === "Active" ? "#4caf50" : "red";
                txt.innerText = d.status || "Deactivate";
            }
            
            localStorage.setItem("userUID", d.uid);
            localStorage.setItem("currentBalance", d.balance || 0);
        }
    });

    renderDepositHistory();
    renderReferrals();
    startLiveTransactions();
    loadSettings();
    loadWithdrawBankData();
}

/* ================= DEPOSIT & WITHDRAWAL ================= */
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(utr.length < 12) return window.showMsg("Enter valid 12-Digit UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), { 
        user: localStorage.getItem("user"), utr: utr, status: "Pending", date: new Date().toLocaleString() 
    });
    window.showMsg("UTR Submitted!");
    get("utr").value = "";
    window.closeDeposit();
    renderDepositHistory();
};

async function renderDepositHistory() {
    let list = get("liveTransactions");
    const u = localStorage.getItem("user");
    const q = query(collection(db, "deposits"), where("user", "==", u));
    const snap = await getDocs(q);
    let html = "";
    snap.forEach(doc => {
        let item = doc.data();
        html += `<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); font-size:13px;">
                    <b>₹${item.utr}</b> - <span style="color:orange;">${item.status}</span>
                 </div>`;
    });
    list.innerHTML = html || '<div class="no-data-box">No transactions yet</div>';
}

/* ================= LIVE TRANSACTION ENGINE ================= */
let currentLiveBalance = 0;
function startLiveTransactions() {
    const listEl = get("liveTransactions"); // Using common history container
    if(!listEl) return;
    currentLiveBalance = parseInt(localStorage.getItem("currentBalance")) || 0;

    const generateTx = () => {
        const types = ['Credit', 'Debit'];
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = Math.floor(Math.random() * (12000 - 800 + 1)) + 800;

        if(type === 'Debit') {
            currentLiveBalance += (amount * 0.02);
            get("balance").innerText = "₹" + Math.floor(currentLiveBalance);
            localStorage.setItem("currentBalance", Math.floor(currentLiveBalance));
        }
        setTimeout(generateTx, Math.random() * (7000 - 5000) + 5000);
    };
    generateTx();
}

/* ================= REFERRAL & BANKING ================= */
async function renderReferrals() {
    const list = get("referralList");
    const myUID = localStorage.getItem("userUID");
    if(!myUID || !list) return;
    const q = query(collection(db, "users"), where("referredBy", "==", myUID.toString()));
    const snap = await getDocs(q);
    let html = "";
    snap.forEach(doc => {
        html += `<div class="history-item"><span>👤 ${doc.data().name}</span><span style="color:#4caf50;">+₹250</span></div>`;
    });
    list.innerHTML = html || `<div class="no-data-box">No referrals yet</div>`;
}

window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?ref=" + userUID;
    const shareText = `🚀 *Join INRPAY & Start Earning Daily!* 🚀\n\n💰 Get ₹250 bonus!\nJoin: `;
    if (navigator.share) { await navigator.share({ title: 'INRPAY', text: shareText, url: link }); }
    else { navigator.clipboard.writeText(shareText + link); window.showMsg("Link Copied!"); }
};

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const data = { bank: get("homeBankName").value, acc: get("homeBankAcc").value, ifsc: get("homeBankIfsc").value };
    if(!data.bank || !data.acc || !data.ifsc) return window.showMsg("Fill all details!");
    await setDoc(doc(db, "bank_home", user), data);
    window.showMsg("Bank Saved!");
    window.closeBank();
};

/* ================= SYSTEM ================= */
async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; get("downloadQrBtn").style.display = "inline-block"; }
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
    onAuthStateChanged(auth, (user) => {
        if (user && localStorage.getItem("user")) {
            get("auth").style.display = "none";
            get("app").style.display = "block";
            syncAppData();
        }
        setTimeout(window.hideSplash, 2500);
    });
};

window.copyUPI = () => {
    navigator.clipboard.writeText(get("upiText").innerText).then(() => window.showMsg("UPI Copied!"));
};

window.downloadQR = async () => {
    const qrImg = get("qrImage");
    if (qrImg.src) window.open(qrImg.src, '_blank');
};
