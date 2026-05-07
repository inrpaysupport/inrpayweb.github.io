import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
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
        window.showMsg("Password reset link sent to your email!");
        closeForgot();
    } catch (error) { window.showMsg("Error: " + error.message); }
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
            uid: generatedUID
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
        const email = snap.data().email;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
            loadAllBankData();
            renderReferrals();
            renderDepositHistory();
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= SETTINGS: PASSWORD CHANGE ================= */
window.changePassword = async () => {
    const user = auth.currentUser;
    const oldPassField = get("oldPass");
    const newPassField = get("newPass");
    const oldPass = oldPassField.value;
    const newPass = newPassField.value;

    if (!user) return window.showMsg("Please login again!");
    if (!oldPass || !newPass) return window.showMsg("Fill both password fields!");
    
    try {
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newPass });
        
        window.showMsg("Password updated successfully!");
        
        // Input fields clear karna
        oldPassField.value = "";
        newPassField.value = "";
    } catch (error) { 
        window.showMsg("Error: " + error.message); 
    }
};

/* ================= DEPOSIT & BANK BINDING ================= */
window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    let now = new Date().toLocaleString();
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    history.push({ utr: utr, date: now });
    localStorage.setItem("dep_history", JSON.stringify(history));
    await setDoc(doc(db, "deposits", Date.now().toString()), { 
        user: localStorage.getItem("user"), utr: utr, status: "Pending", date: now 
    });
    window.showMsg("Submitted Successfully!");
    get("utr").value = "";
    renderDepositHistory();
};

function renderDepositHistory() {
    let list = get("depositHistoryList");
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    if (history.length === 0) {
        list.innerHTML = `<div class="no-data-box" style="padding: 5px; font-size: 10px;">No history</div>`;
    } else {
        list.innerHTML = history.reverse().map(item => `
            <div class="dep-hist-item"><b>UTR:</b> ${item.utr}<br><b>Time:</b> ${item.date} | <span style="color:orange;">Pending</span></div>
        `).join('');
    }
}

// Bind Primary Bank (Home Page)
window.openBank = () => { renderBankHistory(); get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");

async function renderBankHistory() {
    const user = localStorage.getItem("user");
    const list = get("bankHistoryList");
    const actBtn = get("activateAccBtn");
    const snap = await getDoc(doc(db, "bank_home", user));
    if(snap.exists()) {
        const d = snap.data();
        list.innerHTML = `
            <div class="bank-history-item">
                <b>Holder Name:</b> ${d.bank}<br>
                <b>Account No:</b> ${d.acc}<br>
                <b>IFSC:</b> ${d.ifsc}
            </div>`;
        actBtn.style.display = "block";
    } else {
        list.innerHTML = `<p style="font-size:12px; color:#666;">No bank bound yet.</p>`;
        actBtn.style.display = "none";
    }
}

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const data = { bank: get("homeBankName").value, acc: get("homeBankAcc").value, ifsc: get("homeBankIfsc").value };
    if(!data.bank || !data.acc || !data.ifsc) return window.showMsg("Fill all details!");
    await setDoc(doc(db, "bank_home", user), data);
    window.showMsg("Primary Bank Saved!");
    renderBankHistory();
};

window.triggerActivate = () => {
    get("bankBox").classList.remove("active");
    window.showMsg("Please deposit security amount first");
};

/* ================= EARNING: WITHDRAW BANK ================= */
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const data = { 
        bank: get("earnBankName").value, 
        acc: get("earnBankAcc").value, 
        ifsc: get("earnBankIfsc").value 
    };
    if(!data.bank || !data.acc || !data.ifsc) return window.showMsg("Fill all withdraw bank details!");
    
    try {
        // Alag collection 'bank_earning' mein save ho raha hai
        await setDoc(doc(db, "bank_earning", user), data);
        window.showMsg("Withdraw Bank Details Saved!");
    } catch (e) {
        window.showMsg("Error: " + e.message);
    }
};

/* ================= OTHER ACTIONS ================= */
function renderReferrals() { get("referralList").innerHTML = `<div class="no-data-box">No referrals available</div>`; }

window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + userUID;
    if (navigator.share) { await navigator.share({ title: 'INRPAY', url: link }); }
    else { navigator.clipboard.writeText(link); window.showMsg("Link Copied!"); }
};

async function loadAllBankData() {
    let user = localStorage.getItem("user");
    // Load home bank
    const hSnap = await getDoc(doc(db, "bank_home", user));
    if(hSnap.exists()){
        get("homeBankName").value = hSnap.data().bank || "";
        get("homeBankAcc").value = hSnap.data().acc || "";
        get("homeBankIfsc").value = hSnap.data().ifsc || "";
    }
    // Load withdraw bank
    const wSnap = await getDoc(doc(db, "bank_earning", user));
    if(wSnap.exists()){
        get("earnBankName").value = wSnap.data().bank || "";
        get("earnBankAcc").value = wSnap.data().acc || "";
        get("earnBankIfsc").value = wSnap.data().ifsc || "";
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

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value;
    let bal = parseInt(localStorage.getItem("currentBalance"));
    if(!amt || amt < 100) return window.showMsg("Min ₹100!");
    if(amt > bal) return window.showMsg("Insufficient Balance!");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { 
        user: localStorage.getItem("user"), 
        amount: amt, 
        status: "Pending", 
        date: new Date().toLocaleString() 
    });
    window.showMsg("Withdrawal Request Submitted!");
};

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

window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){ 
                    get("auth").style.display = "none"; 
                    get("app").style.display = "block"; 
                    loadUserData(s.data(), u); 
                    loadSettings(); 
                    loadAllBankData(); 
                    renderReferrals(); 
                    renderDepositHistory();
                }
            });
        }
    });
};
