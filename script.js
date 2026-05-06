import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

/* ================= UTILITY & AUTH ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none";
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("toggleText").innerHTML = `Don't have account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block";
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass) return window.showMsg("Fill all details");
    await setDoc(doc(db, "users", num), { name: name, password: pass, balance: 0, uid: Math.floor(100000 + Math.random()*900000) });
    window.showMsg("Registered!"); window.showLogin();
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));
    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        location.reload(); 
    } else { window.showMsg("Wrong details!"); }
};

/* ================= APP LOGIC ================= */
async function loadAppData() {
    let user = localStorage.getItem("user");
    if(!user) return;
    get("auth").style.display = "none";
    get("app").style.display = "block";

    let snap = await getDoc(doc(db, "users", user));
    if(snap.exists()) {
        let d = snap.data();
        get("usernameHome").innerText = "Hello, " + d.name;
        get("balance").innerText = "₹" + (d.balance || 0);
        get("username2").innerText = d.name;
        get("usernumber").innerText = user;
        get("userid").innerText = "UID: " + d.uid;
        localStorage.setItem("currentBalance", d.balance || 0);
    }
    loadSettings();
    loadBankData();
}

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome!";
        get("amountText").innerText = "₹" + (d.amount || "0");
        get("upiText").innerText = "UPI: " + (d.upi || "");
        
        // QR LOAD FIX: Agar URL hai toh dikhao warna hide karo
        if(d.qr && d.qr !== "") {
            get("qrImage").src = d.qr;
            get("qrImage").style.display = "block";
        } else {
            get("qrImage").style.display = "none";
        }
    }
}

/* ================= BANK LOGIC (ALAG SAVE) ================= */
async function loadBankData() {
    let user = localStorage.getItem("user");
    // Home Bank
    let h = await getDoc(doc(db, "bank", user));
    if(h.exists()){
        get("bankName").value = h.data().bank || "";
        get("bankAcc").value = h.data().acc || "";
        get("bankIfsc").value = h.data().ifsc || "";
    }
    // Earning Bank
    let e = await getDoc(doc(db, "bank_withdraw", user));
    if(e.exists()){
        get("earnBankName").value = e.data().bank || "";
        get("earnBankAcc").value = e.data().acc || "";
        get("earnBankIfsc").value = e.data().ifsc || "";
    }
}

window.saveBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("bankName").value, acc: get("bankAcc").value, ifsc: get("bankIfsc").value
    });
    window.showMsg("Home Bank Saved!");
};

window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "bank_withdraw", localStorage.getItem("user")), {
        bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value
    });
    window.showMsg("Withdrawal Bank Saved!");
};

/* ================= DEPOSIT & WITHDRAW ================= */
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(utr.length < 12) return window.showMsg("Enter 12 digit UTR");
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr: utr, status: "Pending" });
    window.showMsg("UTR Submitted!"); closeDeposit();
};

window.submitWithdraw = async () => {
    let amt = Number(get("withdrawAmount").value);
    let bal = Number(localStorage.getItem("currentBalance"));
    if(bal < 200) return window.showMsg("Min ₹200 balance required");
    if(amt > bal) return window.showMsg("Insufficient Balance");
    await setDoc(doc(db, "withdraw", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending" });
    window.showMsg("Request Sent!");
};

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.onload = () => {
    if(localStorage.getItem("user")) loadAppData();
    else showRegister();
};
