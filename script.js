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

/* ================= AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: Math.floor(100000 + Math.random() * 900000)
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
            renderReferrals(); // Load referral list
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= FORGOT & CHANGE PASSWORD ================= */
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");

window.forgotPassword = async () => {
    let email = get("forgotEmail").value.trim();
    if (!email) return window.showMsg("Enter registered email");
    try {
        await sendPasswordResetEmail(auth, email);
        window.closeForgot();
        window.showMsg("Reset link sent! Check Email/Spam folder.");
    } catch (e) { window.showMsg("Error: User not found."); }
};

window.changePassword = async () => {
    let oldPass = get("oldPass").value;
    let newPass = get("newPass").value;
    let userNum = localStorage.getItem("user");
    const user = auth.currentUser;

    if(!oldPass || !newPass) return window.showMsg("Fill both passwords");
    if(!user) return window.showMsg("Session expired, login again");

    try {
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        await updateDoc(doc(db, "users", userNum), { password: newPass });
        window.showMsg("Password Updated! ✅");
        get("oldPass").value = ""; get("newPass").value = "";
    } catch (e) { window.showMsg("Error: Old password incorrect."); }
};

/* ================= BANK & DEPOSIT ================= */
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const data = { bank: get("homeBankName").value, acc: get("homeBankAcc").value, ifsc: get("homeBankIfsc").value };
    if(!data.bank || !data.acc) return window.showMsg("Fill details");
    await setDoc(doc(db, "bank_home", user), data);
    window.showMsg("Primary Bank Saved!");
    closeBank();
};

window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const data = { bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value };
    if(!data.bank || !data.acc) return window.showMsg("Fill details");
    await setDoc(doc(db, "bank_earning", user), data);
    window.showMsg("Withdraw Bank Saved!");
};

/* ================= REFERRAL LOGIC (UI ONLY) ================= */
function renderReferrals() {
    let list = get("referralList");
    // Currently set to empty to show "No referrals yet" as requested
    let referralData = []; 

    if(referralData.length === 0) {
        list.innerHTML = `<div class="no-data-box">No referrals available</div>`;
    } else {
        list.innerHTML = referralData.map(ref => `
            <div class="history-item">
                <span>👤 ${ref.name}</span>
                <span style="color:#4caf50;">+₹${ref.amount}</span>
            </div>
        `).join('');
    }
}

window.shareReferLink = async () => {
    const user = localStorage.getItem("user");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + user;
    if (navigator.share) {
        try {
            await navigator.share({ title: 'INRPAY', text: 'Earn daily with INRPAY!', url: link });
        } catch (e) { console.log(e); }
    } else {
        navigator.clipboard.writeText(link);
        window.showMsg("Link Copied to Clipboard!");
    }
};

/* ================= DATA LOADING ================= */
async function loadAllBankData() {
    let user = localStorage.getItem("user");
    if(!user) return;
    const hSnap = await getDoc(doc(db, "bank_home", user));
    if(hSnap.exists()){
        get("homeBankName").value = hSnap.data().bank || "";
        get("homeBankAcc").value = hSnap.data().acc || "";
        get("homeBankIfsc").value = hSnap.data().ifsc || "";
    }
    const eSnap = await getDoc(doc(db, "bank_earning", user));
    if(eSnap.exists()){
        get("earnBankName").value = eSnap.data().bank || "";
        get("earnBankAcc").value = eSnap.data().acc || "";
        get("earnBankIfsc").value = eSnap.data().ifsc || "";
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
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr: utr, status: "Pending" });
    window.showMsg("Submitted!"); closeDeposit();
};

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value;
    let bal = parseInt(localStorage.getItem("currentBalance"));
    if(!amt || amt < 100) return window.showMsg("Min ₹100 required!");
    if(amt > bal) return window.showMsg("Insufficient Balance!");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending", date: new Date().toLocaleString() });
    window.showMsg("Request Submitted!");
};

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; get("downloadQrBtn").style.display = "inline-block"; }
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
                    loadUserData(s.data(), u); loadSettings(); loadAllBankData(); renderReferrals();
                }
            });
        }
    });
};
