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

/* UTILS */
window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

/* AUTH SWITCHING (ONLY NUMBER & PASS FOR LOGIN) */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block";
    get("email").style.display = "block";
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none";
    get("email").style.display = "none";
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* AUTH ACTIONS */
window.register = async () => {
    let num = get("number").value, name = get("name").value, email = get("email").value, pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Details check karein");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), { name, email, password: pass, balance: 0, uid: Math.floor(100000 + Math.random() * 900000) });
        window.showMsg("Account Created!"); window.showLogin();
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
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else window.showMsg("Number not registered!");
};

/* FORGOT PASSWORD */
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");
window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if(!email) return window.showMsg("Enter your email");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Reset link sent to your email!");
        window.closeForgot();
    } catch (e) { window.showMsg("Error: User not found"); }
};

/* CHANGE PASSWORD */
window.changePassword = async () => {
    let oldP = get("oldPass").value, newP = get("newPass").value, u = auth.currentUser;
    if(!oldP || !newP) return window.showMsg("Dono password daalein");
    try {
        const cred = EmailAuthProvider.credential(u.email, oldP);
        await reauthenticateWithCredential(u, cred);
        await updatePassword(u, newP);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newP });
        window.showMsg("Password Updated! ✅");
        get("oldPass").value = get("newPass").value = "";
    } catch (e) { window.showMsg("Old password is incorrect"); }
};

/* DEPOSIT & QR */
window.downloadQR = () => {
    const link = document.createElement("a");
    link.href = get("qrImage").src;
    link.download = "INRPAY_QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr, status: "Pending" });
    window.showMsg("Submitted!"); closeDeposit();
};

/* BANK & WITHDRAWAL */
window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");
window.saveWithdrawBank = async () => {
    let u = localStorage.getItem("user");
    await setDoc(doc(db, "bank", u), {
        bank: get("earnBankName").value || get("bankName").value,
        acc: get("earnBankAcc").value || get("bankAcc").value,
        ifsc: get("earnBankIfsc").value || get("bankIfsc").value
    });
    window.showMsg("Bank Details Saved!"); closeBank();
};

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value, bal = parseInt(localStorage.getItem("currentBalance"));
    if(amt < 100 || amt > bal) return window.showMsg("Invalid Amount or Balance");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending", date: new Date().toLocaleString() });
    window.showMsg("Withdraw Request Sent!"); get("withdrawAmount").value = "";
};

/* REFER & SHARE */
window.shareReferLink = async () => {
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + localStorage.getItem("user");
    if (navigator.share) {
        try { await navigator.share({ title: 'INRPAY', text: 'Join now and earn!', url: link }); } catch (e) { console.log(e); }
    } else {
        navigator.clipboard.writeText(link); window.showMsg("Link Copied!");
    }
};

/* DATA LOADING */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = data.email;
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

async function loadBankData() {
    let snap = await getDoc(doc(db, "bank", localStorage.getItem("user")));
    if(snap.exists()) {
        let d = snap.data();
        get("earnBankName").value = get("bankName").value = d.bank || "";
        get("earnBankAcc").value = get("bankAcc").value = d.acc || "";
        get("earnBankIfsc").value = get("bankIfsc").value = d.ifsc || "";
    }
}

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome";
        if(d.qr) { 
            get("qrImage").src = d.qr; get("qrImage").style.display = "block"; 
            get("downloadQrBtn").style.display = "inline-block";
        }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){
                    get("auth").style.display = "none"; get("app").style.display = "block";
                    loadUserData(s.data(), u); loadSettings(); loadBankData();
                }
            });
        } else {
            if(params.get("signup") === "true") window.showRegister(); else window.showLogin();
        }
    });
};
