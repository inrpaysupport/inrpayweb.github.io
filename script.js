import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Firebase Configuration
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= UTILITY FUNCTIONS ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH SWITCH LOGIC ================= */
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

/* ================= MAIN AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: Math.floor(100000 + Math.random() * 900000)
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Registration Error: " + error.message); }
};

window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgot = () => get("forgotBox").classList.remove("active");

window.forgotPassword = async () => {
    let email = get("forgotEmail").value;
    if (!email) return window.showMsg("Please enter your email");
    try {
        await sendPasswordResetEmail(auth, email);
        window.showMsg("Password reset link sent to your email! Please check your Inbox and Spam folder.");
        closeForgot();
    } catch (error) { window.showMsg("Error: User not found."); }
};

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
            await updateDoc(userRef, { password: pass });
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
            loadBankData();
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= CHANGE PASSWORD (SETTINGS) ================= */
window.changePassword = async () => {
    let oldPass = get("oldPass").value;
    let newPass = get("newPass").value;
    let userNum = localStorage.getItem("user");
    if(!oldPass || !newPass) return window.showMsg("Enter both passwords");
    try {
        const userRef = doc(db, "users", userNum);
        const snap = await getDoc(userRef);
        await signInWithEmailAndPassword(auth, snap.data().email, oldPass);
        await updatePassword(auth.currentUser, newPass);
        await updateDoc(userRef, { password: newPass });
        window.showMsg("Password Updated Successfully!");
        get("oldPass").value = ""; get("newPass").value = "";
    } catch (e) { window.showMsg("Failed: Old password incorrect."); }
};

/* ================= OTHER APP LOGIC ================= */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + (data.email || "N/A");
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

window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), {
        user: localStorage.getItem("user"), utr: utr, status: "Pending"
    });
    window.showMsg("Submitted!"); closeDeposit();
};

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");
window.saveBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("bankName").value, acc: get("bankAcc").value, ifsc: get("bankIfsc").value
    });
    window.showMsg("Bank Saved!"); closeBank();
};

async function loadBankData() {
    let snap = await getDoc(doc(db, "bank", localStorage.getItem("user")));
    if(snap.exists()) {
        get("bankName").value = snap.data().bank || "";
        get("bankAcc").value = snap.data().acc || "";
        get("bankIfsc").value = snap.data().ifsc || "";
    }
}

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome";
        if(d.qr) { get("qrImage").src = d.qr; get("qrImage").style.display = "block"; }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.onload = () => {
    let u = localStorage.getItem("user");
    if(u) {
        getDoc(doc(db, "users", u)).then(s => {
            if(s.exists()){
                get("auth").style.display = "none"; get("app").style.display = "block";
                loadUserData(s.data(), u); loadSettings(); loadBankData();
            }
        });
    } else { window.showLogin(); }
};
