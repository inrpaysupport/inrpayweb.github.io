import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

/* ================= UTILITY FUNCTIONS ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH SWITCH ================= */
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

/* ================= FIREBASE ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");

    await setDoc(doc(db, "users", num), {
        name: name,
        email: email,
        password: pass,
        balance: 0,
        uid: Math.floor(100000 + Math.random() * 900000)
    });
    window.showMsg("Account Created!");
    window.showLogin();
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));

    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        loadUserData(snap.data(), num);
        loadSettings();
        loadBankData(); 
    } else {
        window.showMsg("Invalid credentials!");
    }
};

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + (data.email || "N/A");
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    const bal = data.balance || 0;
    get("balance").innerText = "₹" + bal;
    localStorage.setItem("currentBalance", bal);
}

/* ================= PAGE & APP LOGIC ================= */
window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => {
    localStorage.clear();
    location.reload();
};

/* ================= DEPOSIT & BANK ================= */
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), {
        user: localStorage.getItem("user"),
        utr: utr,
        status: "Pending"
    });
    window.showMsg("Submitted!");
    window.closeDeposit();
};

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");

async function loadBankData() {
    let user = localStorage.getItem("user");
    let snapHome = await getDoc(doc(db, "bank", user));
    if(snapHome.exists()) {
        let d = snapHome.data();
        if(get("bankName")) get("bankName").value = d.bank || "";
        if(get("bankAcc")) get("bankAcc").value = d.acc || "";
        if(get("bankIfsc")) get("bankIfsc").value = d.ifsc || "";
    }

    let snapEarn = await getDoc(doc(db, "bank_withdraw", user));
    if(snapEarn.exists()) {
        let d = snapEarn.data();
        if(get("earnBankName")) get("earnBankName").value = d.bank || "";
        if(get("earnBankAcc")) get("earnBankAcc").value = d.acc || "";
        if(get("earnBankIfsc")) get("earnBankIfsc").value = d.ifsc || "";
    }
}

window.saveBank = async () => {
    const bName = get("bankName").value;
    const bAcc = get("bankAcc").value;
    const bIfsc = get("bankIfsc").value;

    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: bName,
        acc: bAcc,
        ifsc: bIfsc
    });
    window.showMsg("Home Bank Details Updated!");
    if(get("bankBox")) closeBank();
};

window.saveWithdrawBank = async () => {
    const bName = get("earnBankName").value;
    const bAcc = get("earnBankAcc").value;
    const bIfsc = get("earnBankIfsc").value;

    await setDoc(doc(db, "bank_withdraw", localStorage.getItem("user")), {
        bank: bName,
        acc: bAcc,
        ifsc: bIfsc
    });
    window.showMsg("Withdrawal Bank Details Updated!");
};

/* ================= EARNING / WITHDRAW ================= */
window.submitWithdraw = async () => {
    let amt = Number(get("withdrawAmount").value);
    let user = localStorage.getItem("user");
    let currentBal = Number(localStorage.getItem("currentBalance"));

    if(!amt || amt < 100) return window.showMsg("Minimum withdrawal ₹100");
    if(currentBal < 100) {
        return window.showMsg("Withdrawal Failed: Minimum ₹100 Balance Required.");
    }
    if(amt > currentBal) return window.showMsg("Insufficient Balance!");

    await setDoc(doc(db, "withdraw", Date.now().toString()), {
        user: user,
        amount: amt,
        status: "Pending",
        date: new Date().toLocaleString()
    });
    window.showMsg("Withdrawal Request Submitted!");
    get("withdrawAmount").value = "";
};

/* ================= SETTINGS & QR LOAD ================= */
async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) {
            get("qrImage").src = d.qr;
            get("qrImage").style.display = "block";
        }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.onload = () => {
    if(localStorage.getItem("user")) {
        window.showLogin();
    } else {
        window.showRegister();
    }
};
