import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, updateDoc, 
    collection, query, where, getDocs, orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    sendPasswordResetEmail, updatePassword, EmailAuthProvider, 
    reauthenticateWithCredential, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ==========================================
   2. UI & POPUP LOGIC (Fixed Global Access)
   ========================================== */
window.showMsg = (text) => {
    const msgBox = get("msgBox");
    const msgText = get("msgText");
    if(msgBox && msgText) {
        msgText.innerText = text;
        msgBox.classList.add("active");
    }
};

window.closeMsg = () => {
    const msgBox = get("msgBox");
    if(msgBox) msgBox.classList.remove("active");
};

window.showPage = (id) => {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.style.display = "none");
    const target = get(id);
    if(target) target.style.display = "block";
};

window.togglePass = () => {
    let p = get("password");
    if(p) p.type = p.type === "password" ? "text" : "password";
};

/* ==========================================
   3. AUTHENTICATION (Login, Register, Forgot)
   ========================================== */
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

// --- Login Logic with Error Fix ---
window.login = async () => {
    const num = get("number").value;
    const pass = get("password").value;

    if(!num || !pass) return window.showMsg("Enter Mobile & Password");

    try {
        const userRef = doc(db, "users", num);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
            const userData = snap.data();
            // Firebase Auth Sign In
            await signInWithEmailAndPassword(auth, userData.email, pass);
            
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            
            loadUserData(userData, num);
            loadSettings();
            loadAllBankData();
            renderDepositHistory();
            renderReferrals();
        } else {
            window.showMsg("Mobile number not registered!");
        }
    } catch (e) {
        console.error("Login Error:", e.code);
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            window.showMsg("Invalid Password! Please try again.");
        } else {
            window.showMsg("Login Failed: " + e.message);
        }
    }
};

window.openForgotPopup = () => {
    const forgotBox = get("forgotBox");
    if(forgotBox) forgotBox.classList.add("active");
};

window.closeForgot = () => {
    const forgotBox = get("forgotBox");
    if(forgotBox) forgotBox.classList.remove("active");
};

window.forgotPassword = async () => {
    const email = get("forgotEmail").value;
    if (!email) return window.showMsg("Enter your registered email!");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Password reset link sent! Check your inbox.");
        window.closeForgot();
    } catch (error) {
        window.showMsg("Error: " + error.message);
    }
};

/* ==========================================
   4. BANK BINDING (Home & Earning)
   ========================================== */

window.openBank = () => { 
    renderBankHistory(); 
    const bankBox = get("bankBox");
    if(bankBox) bankBox.classList.add("active");
};

window.closeBank = () => {
    const bankBox = get("bankBox");
    if(bankBox) bankBox.classList.remove("active");
};

// Primary Bank (Security) - Clears boxes
window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const name = get("homeBankName");
    const acc = get("homeBankAcc");
    const ifsc = get("homeBankIfsc");

    if(!name.value || !acc.value || !ifsc.value) return window.showMsg("Fill all details!");

    try {
        await setDoc(doc(db, "bank_home", user), {
            bank: name.value, acc: acc.value, ifsc: ifsc.value, date: new Date().toLocaleString()
        });
        window.showMsg("Primary Bank Saved!");
        name.value = ""; acc.value = ""; ifsc.value = ""; 
        renderBankHistory();
    } catch (e) { window.showMsg("Error: " + e.message); }
};

async function renderBankHistory() {
    const user = localStorage.getItem("user");
    const list = get("bankHistoryList");
    const actBtn = get("activateAccBtn");

    const snap = await getDoc(doc(db, "bank_home", user));
    if(snap.exists()) {
        const d = snap.data();
        list.innerHTML = `<div class="bank-history-item" style="background:#f0f0f0; color:#333; padding:10px; border-radius:8px;">
            <b>Holder:</b> ${d.bank}<br><b>Acc:</b> ${d.acc}<br><b>IFSC:</b> ${d.ifsc}</div>`;
        if(actBtn) actBtn.style.display = "block";
    }
}

// Withdraw Bank (Earning) - Persistent
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const name = get("earnBankName");
    const acc = get("earnBankAcc");
    const ifsc = get("earnBankIfsc");

    if(!name.value || !acc.value || !ifsc.value) return window.showMsg("Fill all bank details!");

    try {
        await setDoc(doc(db, "bank_earning", user), { bank: name.value, acc: acc.value, ifsc: ifsc.value });
        window.showMsg("Withdraw Details Saved!");
    } catch (e) { window.showMsg("Error: " + e.message); }
};

/* ==========================================
   5. DEPOSIT (Firebase History)
   ========================================== */
window.deposit = () => { 
    renderDepositHistory(); 
    const depBox = get("depositBox");
    if(depBox) depBox.classList.add("active");
};

window.closeDeposit = () => {
    const depBox = get("depositBox");
    if(depBox) depBox.classList.remove("active");
};

window.submitDeposit = async () => {
    const utr = get("utr").value;
    const user = localStorage.getItem("user");
    if(!utr) return window.showMsg("Enter UTR Number!");

    try {
        await setDoc(doc(db, "deposits", Date.now().toString()), {
            user: user, utr: utr, status: "Pending", date: new Date().toLocaleString(), timestamp: Date.now()
        });
        window.showMsg("UTR Submitted!");
        get("utr").value = "";
        renderDepositHistory();
    } catch (e) { window.showMsg("Error: " + e.message); }
};

async function renderDepositHistory() {
    const list = get("depositHistoryList");
    const user = localStorage.getItem("user");
    if(!list) return;

    try {
        const q = query(collection(db, "deposits"), where("user", "==", user));
        const snap = await getDocs(q);
        let items = [];
        snap.forEach(doc => items.push(doc.data()));
        items.sort((a, b) => b.timestamp - a.timestamp);

        if(items.length === 0) {
            list.innerHTML = `<div class="no-data-box">No History</div>`;
        } else {
            list.innerHTML = items.map(i => `<div class="dep-hist-item" style="padding:10px; border-bottom:1px solid #444;">
                <b>UTR:</b> ${i.utr} <br> <small>${i.date}</small> | <span style="color:orange;">${i.status}</span>
            </div>`).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================
   6. REFERRAL & OTHER
   ========================================== */
window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + userUID;
    const shareText = `🚀 *Join INRPAY & Earn Daily!* 🚀\n💰 *₹250 bonus* per friend!\nUse ID: *${userUID}*\nJoin here:\n${link}`;

    if (navigator.share) {
        try { await navigator.share({ title: 'INRPAY', text: shareText, url: link }); } catch (err) {}
    } else {
        navigator.clipboard.writeText(shareText);
        window.showMsg("Referral message copied!");
    }
};

async function loadAllBankData() {
    const user = localStorage.getItem("user");
    const wSnap = await getDoc(doc(db, "bank_earning", user));
    if(wSnap.exists()){
        const d = wSnap.data();
        get("earnBankName").value = d.bank || "";
        get("earnBankAcc").value = d.acc || "";
        get("earnBankIfsc").value = d.ifsc || "";
    }
}

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + (data.name || "User");
    get("username2").innerText = data.name;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    localStorage.setItem("userUID", data.uid);
}

async function loadSettings() {
    const snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        const d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) get("qrImage").src = d.qr;
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.logout = () => { localStorage.clear(); location.reload(); };

/* ==========================================
   7. INITIALIZATION
   ========================================== */
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        const u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(snap => {
                if(snap.exists()){
                    get("auth").style.display = "none";
                    get("app").style.display = "block";
                    loadUserData(snap.data(), u);
                    loadSettings();
                    loadAllBankData();
                    renderDepositHistory();
                    renderBankHistory();
                }
            });
        }
    });
};
