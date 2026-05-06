import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH SWITCH (FIXED) ================= */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.display = "block"; // Sign-up mein name dikhao
    get("forgotText").style.display = "none";
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none"; // Sign-in mein name hide karo
    get("forgotText").style.display = "block";
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass) return window.showMsg("Please fill all details");
    
    await setDoc(doc(db, "users", num), {
        name: name,
        password: pass,
        balance: 0,
        uid: Math.floor(100000 + Math.random() * 900000)
    });
    window.showMsg("Success! Please Sign In.");
    window.showLogin();
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));
    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        get("usernameHome").innerText = "Hello, " + snap.data().name;
    } else {
        window.showMsg("Wrong details!");
    }
};

window.onload = () => {
    window.showRegister();
};
