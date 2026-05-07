import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none";
    get("email").style.display = "none";
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("toggleText").innerHTML = `Don't have account? <button class="linkBtn" onclick="location.reload()">Sign Up</button>`;
};

/* ================= AUTH & UID LOGIC ================= */
window.register = async () => {
    let num = get("number").value, name = get("name").value, email = get("email").value, pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        // User Number ki jagah UID generate ki
        let newUID = "INR" + Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), { name, email, password: pass, balance: 0, uid: newUID });
        window.showMsg("Registration Successful!");
        window.showLogin();
    } catch (e) { window.showMsg(e.message); }
};

window.login = async () => {
    let num = get("number").value, pass = get("password").value;
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists() && snap.data().password === pass) {
        await signInWithEmailAndPassword(auth, snap.data().email, pass);
        localStorage.setItem("user", num);
        localStorage.setItem("userUID", snap.data().uid); // UID store ki link ke liye
        location.reload();
    } else { window.showMsg("Invalid Details!"); }
};

/* ================= REFER & EARN (UID BASED) ================= */
window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    if(!userUID) return window.showMsg("Error: UID not found. Login again.");
    
    // Link me Number nahi UID dikhegi
    const shareLink = window.location.origin + window.location.pathname + "?ref=" + userUID;
    
    if (navigator.share) {
        try {
            await navigator.share({ title: 'INRPAY', text: 'Earn ₹50 on joining!', url: shareLink });
        } catch (e) { console.log(e); }
    } else {
        navigator.clipboard.writeText(shareLink);
        window.showMsg("Link Copied! ID: " + userUID);
    }
};

/* ================= DEPOSIT & HISTORY ================= */
window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr || utr.length < 6) return window.showMsg("Enter valid UTR!");
    
    let now = new Date();
    let timeStr = now.toLocaleDateString() + " " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Local History Update
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    history.push({ utr, date: timeStr });
    localStorage.setItem("dep_history", JSON.stringify(history));

    // Firebase Update
    await setDoc(doc(db, "deposits", Date.now().toString()), { 
        user: localStorage.getItem("user"), 
        utr: utr, 
        status: "Pending", 
        date: timeStr 
    });

    window.showMsg("UTR Submitted!");
    get("utr").value = "";
    renderDepositHistory();
};

function renderDepositHistory() {
    let list = get("depositHistoryList");
    let history = JSON.parse(localStorage.getItem("dep_history") || "[]");
    
    if(history.length === 0) {
        list.innerHTML = `<div class="no-data-box" style="padding:10px;">No submissions yet</div>`;
    } else {
        list.innerHTML = history.reverse().map(item => `
            <div class="dep-hist-item">
                <b>UTR:</b> ${item.utr}<br>
                <b>Date:</b> ${item.date} | <span style="color:orange;">Pending</span>
            </div>
        `).join('');
    }
}

/* ================= UI LOAD ================= */
function loadUserData(data) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; }
        get("upiText").innerText = d.upi || "";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.onload = () => {
    let u = localStorage.getItem("user");
    if (u) {
        getDoc(doc(db, "users", u)).then(s => {
            if(s.exists()){ 
                get("auth").style.display = "none"; 
                get("app").style.display = "block"; 
                loadUserData(s.data()); 
                loadSettings();
                renderDepositHistory();
            }
        });
    }
};
