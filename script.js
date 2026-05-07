import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= UTILITY & UI ================= */
window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block"; get("email").style.display = "block"; get("referralInput").style.display = "block";
    get("registerBtn").style.display = "block"; get("loginBtn").style.display = "none"; get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none"; get("email").style.display = "none"; get("referralInput").style.display = "none";
    get("registerBtn").style.display = "none"; get("loginBtn").style.display = "block"; get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= REFERRAL LOGIC ================= */
function checkReferralURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        showRegister();
        if(get("referralInput")) get("referralInput").value = refCode;
    }
}

window.copyInviteLink = () => {
    const u = localStorage.getItem("user");
    const link = window.location.origin + window.location.pathname + "?ref=" + u;
    navigator.clipboard.writeText(link).then(() => window.showMsg("Invite Link Copied!"));
};

/* ================= AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value, name = get("name").value, email = get("email").value, pass = get("password").value, ref = get("referralInput").value || "none";
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), { name, email, password: pass, balance: 0, referredBy: ref, uid: Math.floor(100000 + Math.random() * 900000) });
        window.showMsg("Success!"); window.showLogin();
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
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else window.showMsg("User not found!");
};

window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");
window.forgotPassword = async () => {
    try {
        await sendPasswordResetEmail(auth, get("forgotEmail").value);
        window.showMsg("Reset link sent! Check Inbox/Spam."); closeForgot();
    } catch (e) { window.showMsg("Error!"); }
};

/* ================= PASSWORD CHANGE (WORKING) ================= */
window.changePassword = async () => {
    let oldP = get("oldPass").value, newP = get("newPass").value, uNum = localStorage.getItem("user");
    if(!oldP || !newP) return window.showMsg("Enter passwords");
    try {
        const user = auth.currentUser;
        const cred = EmailAuthProvider.credential(user.email, oldP);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newP);
        await updateDoc(doc(db, "users", uNum), { password: newP });
        window.showMsg("Password Updated!");
        get("oldPass").value = ""; get("newPass").value = "";
    } catch (e) { window.showMsg("Old password incorrect!"); }
};

/* ================= APP CORE ================= */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = data.email;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    get("referralLinkText").innerText = window.location.origin + window.location.pathname + "?ref=" + num;
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.onload = () => {
    let u = localStorage.getItem("user");
    if(u) {
        getDoc(doc(db, "users", u)).then(s => {
            if(s.exists()){
                get("auth").style.display = "none"; get("app").style.display = "block";
                loadUserData(s.data(), u);
            }
        });
    } else {
        showLogin(); checkReferralURL();
    }
};
