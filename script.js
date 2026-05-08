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
   2. UI & NAVIGATION LOGIC
   ========================================== */
window.showMsg = (text) => {
    get("msgText").innerText = text;
    get("msgBox").classList.add("active");
};

window.closeMsg = () => {
    get("msgBox").classList.remove("active");
};

window.showPage = (id) => {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
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

window.register = async () => {
    const num = get("number").value;
    const name = get("name").value;
    const email = get("email").value;
    const pass = get("password").value;

    if(!name || num.length < 10 || !pass || !email) {
        return window.showMsg("Please fill all details correctly!");
    }

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        const generatedUID = Math.floor(100000 + Math.random() * 900000);
        
        await setDoc(doc(db, "users", num), {
            name: name,
            email: email,
            password: pass,
            balance: 0,
            uid: generatedUID,
            joinedAt: new Date().toLocaleString()
        });

        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) {
        window.showMsg("Registration Error: " + error.message);
    }
};

window.login = async () => {
    const num = get("number").value;
    const pass = get("password").value;

    if(!num || !pass) return window.showMsg("Enter Mobile & Password");

    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        const userData = snap.data();
        try {
            await signInWithEmailAndPassword(auth, userData.email, pass);
            localStorage.setItem("user", num);
            
            get("auth").style.display = "none";
            get("app").style.display = "block";
            
            loadUserData(userData, num);
            loadSettings();
            loadAllBankData();
            renderDepositHistory();
            renderReferrals();
        } catch (e) {
            window.showMsg("Invalid Password!");
        }
    } else {
        window.showMsg("User not found! Please Register.");
    }
};

window.forgotPassword = async () => {
    const email = get("forgotEmail").value;
    if (!email) return window.showMsg("Enter your registered email!");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Password reset link sent! Check your inbox.");
        get("forgotBox").classList.remove("active");
    } catch (error) {
        window.showMsg("Error: " + error.message);
    }
};

/* ==========================================
   4. BANK BINDING & HISTORY
   ========================================== */

// --- PRIMARY BANK (Security) ---
window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const name = get("homeBankName");
    const acc = get("homeBankAcc");
    const ifsc = get("homeBankIfsc");

    if(!name.value || !acc.value || !ifsc.value) return window.showMsg("Fill all details!");

    try {
        await setDoc(doc(db, "bank_home", user), {
            bank: name.value,
            acc: acc.value,
            ifsc: ifsc.value,
            updatedAt: new Date().toLocaleString()
        });

        window.showMsg("Primary Bank Saved Successfully!");
        
        // Requirements: Clear boxes after save
        name.value = "";
        acc.value = "";
        ifsc.value = "";

        renderBankHistory();
    } catch (e) {
        window.showMsg("Error: " + e.message);
    }
};

async function renderBankHistory() {
    const user = localStorage.getItem("user");
    const list = get("bankHistoryList");
    const actBtn = get("activateAccBtn");

    const snap = await getDoc(doc(db, "bank_home", user));
    if(snap.exists()) {
        const d = snap.data();
        list.innerHTML = `
            <div class="bank-history-item" style="background: #f9f9f9; padding: 10px; border-radius: 8px; color: #333;">
                <p><b>Holder:</b> ${d.bank}</p>
                <p><b>Account:</b> ${d.acc}</p>
                <p><b>IFSC:</b> ${d.ifsc}</p>
            </div>`;
        actBtn.style.display = "block";
    } else {
        list.innerHTML = `<p style="font-size:12px; color:#666;">No primary bank linked yet.</p>`;
        actBtn.style.display = "none";
    }
}

// --- WITHDRAW BANK (Persistent) ---
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const name = get("earnBankName");
    const acc = get("earnBankAcc");
    const ifsc = get("earnBankIfsc");

    if(!name.value || !acc.value || !ifsc.value) return window.showMsg("Fill all details!");

    try {
        await setDoc(doc(db, "bank_earning", user), {
            bank: name.value,
            acc: acc.value,
            ifsc: ifsc.value
        });
        window.showMsg("Withdraw Bank Updated!");
        // Requirement: Boxes should NOT clear here.
    } catch (e) {
        window.showMsg("Error: " + e.message);
    }
};

/* ==========================================
   5. SECURITY DEPOSIT (Firebase History)
   ========================================== */
window.submitDeposit = async () => {
    const utr = get("utr").value;
    const user = localStorage.getItem("user");

    if(!utr) return window.showMsg("Please enter UTR Number!");

    const depositId = Date.now().toString();
    try {
        await setDoc(doc(db, "deposits", depositId), {
            user: user,
            utr: utr,
            status: "Pending",
            date: new Date().toLocaleString(),
            timestamp: Date.now()
        });

        window.showMsg("UTR Submitted for Verification!");
        get("utr").value = "";
        renderDepositHistory();
    } catch (e) {
        window.showMsg("Submission Error: " + e.message);
    }
};

async function renderDepositHistory() {
    const list = get("depositHistoryList");
    const user = localStorage.getItem("user");
    
    list.innerHTML = `<p style="text-align:center; font-size:12px;">Fetching from Server...</p>`;

    try {
        const q = query(collection(db, "deposits"), where("user", "==", user));
        const snap = await getDocs(q);
        
        let historyHTML = "";
        let items = [];

        snap.forEach(doc => items.push(doc.data()));
        items.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest

        if(items.length === 0) {
            historyHTML = `<div class="no-data-box" style="font-size:11px;">No transaction history found.</div>`;
        } else {
            items.forEach(item => {
                historyHTML += `
                <div class="dep-hist-item" style="border-bottom: 1px solid #eee; padding: 8px 0;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-size:12px;"><b>UTR:</b> ${item.utr}</span>
                        <span style="font-size:11px; color:${item.status === 'Pending' ? 'orange' : 'green'};">${item.status}</span>
                    </div>
                    <small style="color:#888;">${item.date}</small>
                </div>`;
            });
        }
        list.innerHTML = historyHTML;
    } catch (e) {
        list.innerHTML = "History failed to load.";
    }
}

/* ==========================================
   6. REFERRAL & SHARING LOGIC
   ========================================== */
window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + userUID;
    
    const shareText = `🚀 *Join INRPAY & Start Earning Daily!* 🚀\n\n💰 Get an instant *₹250 bonus* for every friend you refer!\n✅ Fast & Secure Withdrawals.\n✅ Trusted & Reliable Platform.\n✅ 24/7 Customer Support.\n\nDon't miss out! Use my Referral ID: *${userUID}*\n\nClick the link below to sign up now:\n👇👇👇`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'INRPAY Earning',
                text: shareText,
                url: link
            });
        } catch (err) { console.log("Share cancelled"); }
    } else {
        const fullMessage = `${shareText}\n${link}`;
        navigator.clipboard.writeText(fullMessage);
        window.showMsg("Referral link & message copied to clipboard!");
    }
};

/* ==========================================
   7. DATA LOADING & SYNC
   ========================================== */
async function loadAllBankData() {
    const user = localStorage.getItem("user");
    
    // Only auto-fill Withdraw Bank (as per requirement)
    const wSnap = await getDoc(doc(db, "bank_earning", user));
    if(wSnap.exists()){
        const data = wSnap.data();
        get("earnBankName").value = data.bank || "";
        get("earnBankAcc").value = data.acc || "";
        get("earnBankIfsc").value = data.ifsc || "";
    }
}

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + (data.name || "User");
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + data.email;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    
    localStorage.setItem("currentBalance", data.balance || 0);
    localStorage.setItem("userUID", data.uid);
}

async function loadSettings() {
    try {
        const snap = await getDoc(doc(db, "settings", "main"));
        if(snap.exists()) {
            const d = snap.data();
            get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
            if(d.qr) {
                get("qrImage").src = d.qr;
                get("qrImage").style.display = "block";
                get("downloadQrBtn").style.display = "inline-block";
            }
            get("upiText").innerText = d.upi || "N/A";
            get("amountText").innerText = "₹" + (d.amount || "0");
        }
    } catch (e) { console.log("Settings error"); }
}

window.logout = () => {
    localStorage.clear();
    location.reload();
};

/* ==========================================
   8. APP INITIALIZATION (On Load)
   ========================================== */
window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        const savedUser = localStorage.getItem("user");
        if (user && savedUser) {
            getDoc(doc(db, "users", savedUser)).then(snap => {
                if(snap.exists()){
                    get("auth").style.display = "none";
                    get("app").style.display = "block";
                    loadUserData(snap.data(), savedUser);
                    loadSettings();
                    loadAllBankData();
                    renderDepositHistory();
                    renderBankHistory();
                }
            });
        }
    });
};
