import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});
const db = getFirestore(app);
const get = id => document.getElementById(id);

/* ================= UTILITY ================= */
window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

/* ================= AUTH SWITCH (FIXED) ================= */
window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none"; // Sign In mein Name hide
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `No account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block"; // Sign Up mein Name show
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

/* ================= FIREBASE ACTIONS ================= */
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
        loadBanks();
    } else { window.showMsg("Invalid credentials!"); }
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    if(!name || num.length < 10) return window.showMsg("Enter valid details");
    await setDoc(doc(db, "users", num), { name: name, password: get("password").value, balance: 0, uid: Math.floor(100000 + Math.random()*900000) });
    window.showMsg("Account Created!"); window.showLogin();
};

/* ================= BANK & WITHDRAWAL ================= */
window.saveHomeBank = async () => {
    await setDoc(doc(db, "home_bank", localStorage.getItem("user")), { bank: get("homeBankName").value, acc: get("homeBankAcc").value, ifsc: get("homeBankIfsc").value });
    window.showMsg("Profile Bank Saved!");
};

window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "withdraw_bank", localStorage.getItem("user")), { bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value });
    window.showMsg("Withdrawal Bank Updated!");
};

window.submitWithdraw = async () => {
    let amt = Number(get("withdrawAmount").value);
    let bal = Number(localStorage.getItem("currentBal") || 0);
    if(bal < 200) return window.showMsg("Minimum ₹200 balance required.");
    if(amt < 100 || amt > bal) return window.showMsg("Invalid Amount!");
    await setDoc(doc(db, "withdraw", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending" });
    window.showMsg("Request Sent!");
};

async function loadBanks() {
    let user = localStorage.getItem("user");
    let h = await getDoc(doc(db, "home_bank", user));
    if(h.exists()){ get("homeBankName").value = h.data().bank; get("homeBankAcc").value = h.data().acc; get("homeBankIfsc").value = h.data().ifsc; }
    let w = await getDoc(doc(db, "withdraw_bank", user));
    if(w.exists()){ get("earnBankName").value = w.data().bank; get("earnBankAcc").value = w.data().acc; get("earnBankIfsc").value = w.data().ifsc; }
}

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("balance").innerText = "₹" + data.balance;
    localStorage.setItem("currentBal", data.balance);
}

window.showPage = (id) => { document.querySelectorAll(".page").forEach(p => p.style.display = "none"); get(id).style.display = "block"; };

async function loadSettings() {
    let s = await getDoc(doc(db, "settings", "main"));
    if(s.exists()){ get("scrollingNotice").innerText = s.data().notice; get("qrImage").src = s.data().qr; get("upiText").innerText = s.data().upi; get("amountText").innerText = "₹"+s.data().amount; }
}

window.onload = () => { if(localStorage.getItem("user")) showLogin(); else showRegister(); };
