import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

window.hideSplash = () => {
    const splash = get('splash');
    if (splash) { splash.classList.add('hide-splash'); setTimeout(() => splash.remove(), 800); }
};

window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

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

window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");

window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if (!email) return window.showMsg("Please enter your email!");
    try { await sendPasswordResetEmail(auth, email); window.showMsg("Password reset link sent!"); closeForgot(); } catch (error) { window.showMsg("Error: " + error.message); }
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    
    // Referral URL logic
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref') || "Direct";

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: generatedUID, referredBy: refId
        });
        window.showMsg("Account Created!");
        window.showLogin();
    } catch (error) { window.showMsg("Error during signup!"); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter credentials");
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none"; get("app").style.display = "block";
            loadUserData(snap.data(), num); loadSettings(); loadWithdrawBankData(); renderDepositHistory(); fetchReferrals();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("Not registered!"); }
};

async function fetchReferrals() {
    const list = get("referralList");
    const userUID = localStorage.getItem("userUID");
    if(!userUID) return;
    const q = query(collection(db, "users"), where("referredBy", "==", userUID.toString()));
    const snap = await getDocs(q);
    let html = "";
    snap.forEach(d => {
        html += `<div class="history-item"><span>${d.data().name}</span><span style="color:green">+₹250</span></div>`;
    });
    list.innerHTML = html || `<div class="no-data-box">No referrals yet</div>`;
}

window.changePassword = async () => {
    const user = auth.currentUser;
    const oldP = get("oldPass").value;
    const newP = get("newPass").value;
    try {
        const cred = EmailAuthProvider.credential(user.email, oldP);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newP);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newP });
        window.showMsg("Updated!");
    } catch (error) { window.showMsg("Error!"); }
};

window.deposit = () => { renderDepositHistory(); get("depositBox").classList.add("active"); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr: utr, status: "Pending", date: new Date().toLocaleString() });
    window.showMsg("Submitted!"); renderDepositHistory();
};

async function renderDepositHistory() {
    let list = get("depositHistoryList");
    const q = query(collection(db, "deposits"), where("user", "==", localStorage.getItem("user")));
    const snap = await getDocs(q);
    let html = "";
    snap.forEach(d => { html += `<div class="dep-hist-item"><b>UTR:</b> ${d.data().utr}<br>${d.data().date} | <span style="color:orange">${d.data().status}</span></div>`; });
    list.innerHTML = html || "No history";
}

window.openBank = () => { renderBankHistory(); get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");

async function renderBankHistory() {
    const snap = await getDoc(doc(db, "bank_home", localStorage.getItem("user")));
    if(snap.exists()) {
        get("bankHistoryList").innerHTML = `<div class="bank-history-item">${snap.data().bank}<br>${snap.data().acc}</div>`;
        get("activateAccBtn").style.display = "block";
    }
}

window.saveHomeBank = async () => {
    const data = { bank: get("homeBankName").value, acc: get("homeBankAcc").value, ifsc: get("homeBankIfsc").value };
    await setDoc(doc(db, "bank_home", localStorage.getItem("user")), data);
    window.showMsg("Saved!"); renderBankHistory();
};

window.triggerActivate = () => window.showMsg("Please deposit security first");

window.saveWithdrawBank = async () => {
    const data = { bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value };
    await setDoc(doc(db, "bank_earning", localStorage.getItem("user")), data);
    window.showMsg("Updated!");
};

async function loadWithdrawBankData() {
    const snap = await getDoc(doc(db, "bank_earning", localStorage.getItem("user")));
    if(snap.exists()) { get("earnBankName").value = snap.data().bank; get("earnBankAcc").value = snap.data().acc; get("earnBankIfsc").value = snap.data().ifsc; }
}

window.shareReferLink = () => {
    const link = window.location.origin + window.location.pathname + "?ref=" + localStorage.getItem("userUID");
    navigator.clipboard.writeText(link); window.showMsg("Referral link copied!");
};

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = data.email;
    get("usernumber").innerText = num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    localStorage.setItem("userUID", data.uid);
}

window.showPage = (id) => { document.querySelectorAll(".page").forEach(p => p.style.display = "none"); get(id).style.display = "block"; };
window.logout = () => { localStorage.clear(); location.reload(); };

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value;
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending", date: new Date().toLocaleString() });
    window.showMsg("Submitted!");
};

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        get("scrollingNotice").innerText = snap.data().notice;
        get("qrImage").src = snap.data().qr; get("qrImage").style.display = "block"; get("downloadQrBtn").style.display = "flex";
        get("upiText").innerText = snap.data().upi; get("amountText").innerText = "₹" + snap.data().amount;
    }
}

window.copyUPI = () => { navigator.clipboard.writeText(get("upiText").innerText); window.showMsg("Copied!"); };
window.downloadQR = () => { window.open(get("qrImage").src, '_blank'); };

window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){ get("auth").style.display = "none"; get("app").style.display = "block"; loadUserData(s.data(), u); loadSettings(); loadWithdrawBankData(); renderDepositHistory(); fetchReferrals(); }
                window.hideSplash();
            });
        } else { window.hideSplash(); }
    });
};
