import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH SWITCH (FIXED LOGIC) ================= */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block"; // Name dikhao
    get("forgotText").style.display = "none"; // Forgot password chupao
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none"; // Name chupao
    get("forgotText").style.display = "block"; // Forgot password dikhao Mobile ke niche
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= REGISTER & LOGIN ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass) return window.showMsg("Please fill all details correctly");
    
    await setDoc(doc(db, "users", num), {
        name: name,
        password: pass,
        balance: 0,
        uid: Math.floor(100000 + Math.random() * 900000)
    });
    window.showMsg("Account Created! Now Sign In.");
    window.showLogin();
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter credentials");
    
    let snap = await getDoc(doc(db, "users", num));
    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        loadUserData(snap.data(), num);
        loadSettings();
    } else {
        window.showMsg("Invalid User or Password!");
    }
};

/* ================= APP LOGIC ================= */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
}

window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), {
        user: localStorage.getItem("user"),
        utr: utr,
        status: "Pending"
    });
    window.showMsg("UTR Submitted!");
    window.closeDeposit();
};

window.saveBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("bankName").value,
        acc: get("bankAcc").value,
        ifsc: get("bankIfsc").value
    });
    window.showMsg("Bank Saved!");
    window.closeBank();
};

window.changePassword = async () => {
    let user = localStorage.getItem("user");
    let oldP = get("oldPass").value;
    let newP = get("newPass").value;
    let snap = await getDoc(doc(db, "users", user));
    if(snap.data().password === oldP) {
        await updateDoc(doc(db, "users", user), { password: newP });
        window.showMsg("Password Updated!");
    } else {
        window.showMsg("Old password is wrong!");
    }
};

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        get("qrImage").src = d.qr;
        get("upiText").innerText = d.upi;
        get("amountText").innerText = "₹" + d.amount;
    }
}

window.logout = () => { localStorage.clear(); location.reload(); };

// On Start
window.onload = () => {
    window.showRegister();
    if(localStorage.getItem("user")) window.showLogin();
};
