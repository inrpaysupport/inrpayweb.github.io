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

/* ================= BANK HISTORY IN POPUP ================= */
function renderBankPopupHistory() {
    let list = get("bankHistoryList");
    let history = JSON.parse(localStorage.getItem("bank_history") || "[]");
    if (history.length === 0) {
        list.innerHTML = `<div class="no-data-box" style="padding: 10px; font-size: 10px;">No history</div>`;
    } else {
        list.innerHTML = history.reverse().map(item => `
            <div class="bank-hist-item">
                <b>Bank:</b> ${item.bank}<br>
                <b>A/C:</b> ${item.acc} | <b>Time:</b> ${item.date}
            </div>
        `).join('');
    }
}

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const bank = get("homeBankName").value;
    const acc = get("homeBankAcc").value;
    const ifsc = get("homeBankIfsc").value;
    const now = new Date().toLocaleString();

    if(!bank || !acc) return window.showMsg("Fill details");

    const data = { bank, acc, ifsc, date: now };
    
    try {
        await setDoc(doc(db, "bank_home", user), data);
        
        let history = JSON.parse(localStorage.getItem("bank_history") || "[]");
        history.push(data);
        localStorage.setItem("bank_history", JSON.stringify(history));
        
        window.showMsg("Primary Bank Saved!");
        renderBankPopupHistory();
    } catch (e) { window.showMsg("Error saving bank"); }
};

/* ================= WITHDRAW BANK TO FIREBASE ================= */
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const data = { 
        bank: get("earnBankName").value, 
        acc: get("earnBankAcc").value, 
        ifsc: get("earnBankIfsc").value 
    };
    if(!data.bank || !data.acc) return window.showMsg("Fill details");
    
    try {
        await setDoc(doc(db, "bank_earning", user), data);
        window.showMsg("Withdraw Bank Updated!");
    } catch (e) { window.showMsg("Database Error!"); }
};

/* ================= AUTH ACTIONS ================= */
window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
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
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
            loadAllBankData();
            renderDepositHistory();
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), { name, email, password: pass, balance: 0, uid: generatedUID });
        window.showMsg("Account Created!");
        window.showLogin();
    } catch (error) { window.showMsg("Error: " + error.message); }
};

/* ================= OTHER LOGIC ================= */
window.openBank = () => { renderBankPopupHistory(); get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");

window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

function renderDepositHistory() {
    let list = get("depositHistoryList");
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    if (history.length === 0) list.innerHTML = `<div class="no-data-box" style="padding: 5px; font-size: 10px;">No history</div>`;
    else list.innerHTML = history.reverse().map(item => `<div class="dep-hist-item">UTR: ${item.utr}<br>${item.date} | <span style="color:orange;">Pending</span></div>`).join('');
}

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    let now = new Date().toLocaleString();
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    history.push({ utr, date: now });
    localStorage.setItem("dep_history", JSON.stringify(history));
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr, status: "Pending", date: now });
    window.showMsg("Submitted!");
    get("utr").value = "";
    renderDepositHistory();
};

async function loadAllBankData() {
    let u = localStorage.getItem("user");
    const hSnap = await getDoc(doc(db, "bank_home", u));
    if(hSnap.exists()){
        get("homeBankName").value = hSnap.data().bank || "";
        get("homeBankAcc").value = hSnap.data().acc || "";
        get("homeBankIfsc").value = hSnap.data().ifsc || "";
    }
    const eSnap = await getDoc(doc(db, "bank_earning", u));
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
    localStorage.setItem("userUID", data.uid);
}

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

window.showPage = (id) => { document.querySelectorAll(".page").forEach(p => p.style.display = "none"); get(id).style.display = "block"; };
window.logout = () => { localStorage.clear(); location.reload(); };

window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){ 
                    get("auth").style.display = "none"; get("app").style.display = "block"; 
                    loadUserData(s.data(), u); loadSettings(); loadAllBankData(); renderDepositHistory();
                }
            });
        }
    });
};
