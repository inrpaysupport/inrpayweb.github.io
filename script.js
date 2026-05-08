import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
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
            renderDepositHistory(); // Firebase se history load karega
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= DEPOSIT HISTORY (FIREBASE) ================= */
window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    let now = new Date().toLocaleString();
    let user = localStorage.getItem("user");

    try {
        await setDoc(doc(db, "deposits", Date.now().toString()), { 
            user: user, 
            utr: utr, 
            status: "Pending", 
            date: now,
            timestamp: Date.now()
        });
        window.showMsg("Submitted Successfully!");
        get("utr").value = "";
        renderDepositHistory(); // Nayi history fetch karega
    } catch (e) { window.showMsg("Error: " + e.message); }
};

async function renderDepositHistory() {
    let list = get("depositHistoryList");
    let user = localStorage.getItem("user");
    list.innerHTML = "Loading...";

    try {
        const q = query(collection(db, "deposits"), where("user", "==", user));
        const snap = await getDocs(q);
        let items = [];
        snap.forEach(doc => items.push(doc.data()));
        
        items.sort((a, b) => b.timestamp - a.timestamp); // Newest first

        if (items.length === 0) {
            list.innerHTML = `<div class="no-data-box" style="padding: 5px; font-size: 10px;">No history</div>`;
        } else {
            list.innerHTML = items.map(item => `
                <div class="dep-hist-item"><b>UTR:</b> ${item.utr}<br><b>Time:</b> ${item.date} | <span style="color:orange;">${item.status}</span></div>
            `).join('');
        }
    } catch (e) { list.innerHTML = "Error loading history"; }
}

/* ================= BANK BINDING ================= */
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

// Security Bank: CLEAR HO JAYEGA
window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const nameInput = get("homeBankName");
    const accInput = get("homeBankAcc");
    const ifscInput = get("homeBankIfsc");

    if(!nameInput.value || !accInput.value || !ifscInput.value) return window.showMsg("Fill all details!");
    
    try {
        await setDoc(doc(db, "bank_home", user), { bank: nameInput.value, acc: accInput.value, ifsc: ifscInput.value });
        window.showMsg("Primary Bank Saved!");
        nameInput.value = ""; accInput.value = ""; ifscInput.value = ""; // Clear Boxes
        renderBankHistory();
    } catch (e) { window.showMsg("Error: " + e.message); }
};

// Withdraw Bank: CLEAR NAHI HOGA
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const nameInput = get("earnBankName");
    const accInput = get("earnBankAcc");
    const ifscInput = get("earnBankIfsc");

    if(!nameInput.value || !accInput.value || !ifscInput.value) return window.showMsg("Fill all withdraw bank details!");

    try {
        await setDoc(doc(db, "bank_earning", user), { bank: nameInput.value, acc: accInput.value, ifsc: ifscInput.value });
        window.showMsg("Withdraw Bank Details Saved!");
        // Input boxes me data show hota rahega, clear nahi hoga.
    } catch (e) { window.showMsg("Error: " + e.message); }
};

/* ================= OTHER ACTIONS ================= */
window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + userUID;
    const shareText = `🚀 *Join INRPAY & Start Earning Daily!* 🚀\n\n💰 Get an instant *₹250 bonus* for every friend you refer!\n✅ Fast & Secure Withdrawals.\n✅ Trusted Platform.\n\nReferral ID: *${userUID}*\nJoin now:\n👇👇👇`;

    if (navigator.share) { 
        try { await navigator.share({ title: 'INRPAY', text: shareText, url: link }); } catch (err) {}
    } else { 
        navigator.clipboard.writeText(`${shareText}\n${link}`); 
        window.showMsg("Invitation message copied!"); 
    }
};

async function loadAllBankData() {
    let user = localStorage.getItem("user");
    // Only Withdraw bank details ko login par load karna hai taaki wo show hoti rahein
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

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; }
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
                    get("auth").style.display = "none"; get("app").style.display = "block"; 
                    loadUserData(s.data(), u); loadSettings(); loadAllBankData(); renderDepositHistory();
                }
            });
        }
    });
};
