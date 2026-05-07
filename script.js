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

/* AUTH LOGIC */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = get("email").style.display = get("registerBtn").style.display = "block";
    get("loginBtn").style.display = get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = get("email").style.display = get("registerBtn").style.display = "none";
    get("loginBtn").style.display = get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

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
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            location.reload();
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else window.showMsg("Not Registered!");
};

/* FORGOT PASSWORD */
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");
window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if(!email) return window.showMsg("Email daalein");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Reset link email par bhej diya gaya hai!");
        window.closeForgot();
    } catch (e) { window.showMsg("User nahi mila."); }
};

/* PASSWORD CHANGE */
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
    } catch (e) { window.showMsg("Old password galat hai."); }
};

/* APP FEATURES */
window.downloadQR = () => {
    const link = document.createElement("a");
    link.href = get("qrImage").src;
    link.download = "QR_Payment.png";
    link.click();
};

window.shareReferLink = async () => {
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + localStorage.getItem("user");
    if(navigator.share) await navigator.share({ title: 'INRPAY', url: link });
    else { navigator.clipboard.writeText(link); window.showMsg("Link Copied!"); }
};

window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("UTR daalein");
    await setDoc(doc(db, "deposits", Date.now().toString()), { user: localStorage.getItem("user"), utr, status: "Pending" });
    window.showMsg("Submitted!"); closeDeposit();
};

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");
window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("earnBankName").value || get("bankName").value,
        acc: get("earnBankAcc").value || get("bankAcc").value,
        ifsc: get("earnBankIfsc").value || get("bankIfsc").value
    });
    window.showMsg("Bank Saved!"); closeBank();
};

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value, bal = parseInt(localStorage.getItem("currentBalance"));
    if(amt < 100 || amt > bal) return window.showMsg("Invalid Amount/Balance");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), { user: localStorage.getItem("user"), amount: amt, status: "Pending" });
    window.showMsg("Requested!"); get("withdrawAmount").value = "";
};

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
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; get("downloadQrBtn").style.display = "inline-block"; }
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
                get("auth").style.display = "none"; get("app").style.display = "block";
                loadUserData(s.data(), u); loadSettings(); loadBankData();
            });
        } else {
            if(params.get("signup") === "true") window.showRegister(); else window.showLogin();
        }
    });
};
