import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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

/* --- AUTH SWITCHING --- */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.setProperty("display", "block", "important");
    get("email").style.setProperty("display", "block", "important");
    get("registerBtn").style.setProperty("display", "block", "important");
    get("loginBtn").style.setProperty("display", "none", "important");
    get("forgotText").style.setProperty("display", "none", "important");
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    get("registerBtn").style.setProperty("display", "none", "important");
    get("loginBtn").style.setProperty("display", "block", "important");
    get("forgotText").style.setProperty("display", "block", "important");
    get("toggleText").innerHTML = `Don't have account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* --- ACTIONS --- */
window.register = async () => {
    let num = get("number").value, name = get("name").value, email = get("email").value, pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Details check karein");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), { name, email, password: pass, balance: 0, uid: Math.floor(100000 + Math.random() * 900000) });
        window.showMsg("Account Created!"); showLogin();
    } catch (e) { window.showMsg(e.message); }
};

window.login = async () => {
    let num = get("number").value, pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            location.reload();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else window.showMsg("Number not registered!");
};

window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if(!email) return window.showMsg("Email daalein");
    try { await sendPasswordResetEmail(auth, email); window.showMsg("Reset link sent!"); get("forgotBox").classList.remove("active"); } catch (e) { window.showMsg("User not found!"); }
};

window.changePassword = async () => {
    let oldP = get("oldPass").value, newP = get("newPass").value, u = auth.currentUser;
    if(!oldP || !newP) return window.showMsg("Fields empty!");
    try {
        const cred = EmailAuthProvider.credential(u.email, oldP);
        await reauthenticateWithCredential(u, cred);
        await updatePassword(u, newP);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newP });
        window.showMsg("Success! ✅"); get("oldPass").value = get("newPass").value = "";
    } catch (e) { window.showMsg("Old password galat hai!"); }
};

window.shareReferLink = async () => {
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + localStorage.getItem("user");
    if (navigator.share) await navigator.share({ title: 'INRPAY', url: link });
    else { navigator.clipboard.writeText(link); window.showMsg("Link Copied!"); }
};

window.downloadQR = () => { const a = document.createElement("a"); a.href = get("qrImage").src; a.download = "QR.png"; a.click(); };

window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value
    });
    window.showMsg("Saved!");
};

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value, bal = parseInt(localStorage.getItem("currentBalance"));
    if(amt < 100 || amt > bal) return window.showMsg("Invalid Amount");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending" });
    window.showMsg("Requested!");
};

window.showPage = (id) => { document.querySelectorAll(".page").forEach(p => p.style.display = "none"); get(id).style.display = "block"; };
window.logout = () => { localStorage.clear(); location.reload(); };
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.openBank = () => { window.showPage('earningPage'); window.showMsg("Bank details niche update karein!"); };
window.submitDeposit = async () => { await setDoc(doc(db,"deposits",Date.now().toString()),{user:localStorage.getItem("user"),utr:get("utr").value,status:"Pending"}); window.showMsg("Submitted!"); closeDeposit(); };

async function loadData() {
    let u = localStorage.getItem("user");
    let userSnap = await getDoc(doc(db, "users", u));
    if(userSnap.exists()){
        let d = userSnap.data();
        get("usernameHome").innerText = "Hello, " + d.name;
        get("username2").innerText = d.name; get("useremail").innerText = d.email;
        get("usernumber").innerText = "Mobile: " + u; get("userid").innerText = "UID: " + d.uid;
        get("balance").innerText = "₹" + (d.balance || 0);
        localStorage.setItem("currentBalance", d.balance || 0);
    }
    let bankSnap = await getDoc(doc(db, "bank", u));
    if(bankSnap.exists()){
        let bd = bankSnap.data();
        get("earnBankName").value = bd.bank || "";
        get("earnBankAcc").value = bd.acc || "";
        get("earnBankIfsc").value = bd.ifsc || "";
    }
    let setSnap = await getDoc(doc(db, "settings", "main"));
    if(setSnap.exists()){
        let sd = setSnap.data();
        get("scrollingNotice").innerText = sd.notice || "";
        if(sd.qr){ get("qrImage").src = sd.qr; get("qrImage").style.display = "block"; get("downloadQrBtn").style.display = "inline-block"; }
        get("upiText").innerText = sd.upi || ""; get("amountText").innerText = "₹" + (sd.amount || 0);
    }
}

window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user && localStorage.getItem("user")) {
            get("auth").style.display = "none"; get("app").style.display = "block"; loadData();
        } else { showLogin(); }
    });
};