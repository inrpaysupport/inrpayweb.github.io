import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= UTILITY ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH SWITCH (IMPROVED) ================= */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    // Show Name & Email
    get("name").style.setProperty("display", "block", "important");
    get("email").style.setProperty("display", "block", "important");
    
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have an account? <button onclick="showLogin()" class="linkBtn">Login</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Login";
    // Hide Name & Email
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button onclick="showRegister()" class="linkBtn">Register</button>`;
};

/* ================= CORE AUTH ================= */
window.register = async () => {
    let n = get("name").value;
    let m = get("number").value;
    let e = get("email").value;
    let p = get("password").value;

    if(!n || m.length < 10 || !e || p.length < 6) return window.showMsg("Fill all details correctly!");

    let userSnap = await getDoc(doc(db, "users", m));
    if(userSnap.exists()) return window.showMsg("Number already registered!");

    await setDoc(doc(db, "users", m), {
        name: n,
        number: m,
        email: e,
        password: p,
        balance: 0
    });

    window.showMsg("Account Created! You can login now.");
    showLogin();
};

window.login = async () => {
    let m = get("number").value;
    let p = get("password").value;

    let userSnap = await getDoc(doc(db, "users", m));
    if(userSnap.exists() && userSnap.data().password === p) {
        localStorage.setItem("user", m);
        loadUserData(m);
    } else {
        window.showMsg("Invalid Mobile or Password!");
    }
};

async function loadUserData(m) {
    let userSnap = await getDoc(doc(db, "users", m));
    if(userSnap.exists()){
        let data = userSnap.data();
        get("auth").style.display = "none";
        get("app").style.display = "block";
        get("userBalance").innerText = "₹" + data.balance;
        get("userNameDisplay").innerText = data.name;
        get("userNumDisplay").innerText = data.number;
        get("userEmailDisplay").innerText = data.email || "N/A";
    }
}

/* ================= PASSWORD RESET ================= */
window.showForgotPopup = () => get("forgotBox").classList.add("active");

window.sendResetLink = async () => {
    let m = get("forgotNum").value;
    if(!m) return window.showMsg("Please enter your number");

    let userSnap = await getDoc(doc(db, "users", m));
    if(!userSnap.exists()) return window.showMsg("This number is not registered!");

    let userEmail = userSnap.data().email;

    sendPasswordResetEmail(auth, userEmail)
    .then(() => {
        window.showMsg("Success! Password reset link sent to: " + userEmail);
        get("forgotBox").classList.remove("active");
    })
    .catch((error) => {
        window.showMsg("Error: " + error.message);
    });
};

window.logout = () => {
    localStorage.clear();
    location.reload();
};

window.onload = () => {
    let savedUser = localStorage.getItem("user");
    if(savedUser) loadUserData(savedUser);
};
