import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
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

/* ================= AUTH SWITCH LOGIC ================= */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.setProperty("display", "block", "important");
    get("email").style.setProperty("display", "block", "important"); // Signup me email dikhega
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important"); // Login me email hide ho jayega
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= FORGOT PASSWORD POPUP LOGIC ================= */
window.openForgotPopup = () => get("forgotBox").classList.add("active");
window.closeForgotPopup = () => get("forgotBox").classList.remove("active");

window.sendResetLink = async () => {
    let email = get("forgotEmail").value;
    if (!email) return window.showMsg("Please enter your email.");

    try {
        await sendPasswordResetEmail(auth, email);
        closeForgotPopup();
        window.showMsg("Password reset link sent! Please check your email and Spam folder.");
    } catch (error) {
        window.showMsg("Error: User not found or invalid email.");
    }
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

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const userData = snap.data();
        const email = userData.email;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            await updateDoc(userRef, { password: pass });
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(userData, num);
        } catch (error) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Mobile number not registered!"); }
};

// Baki sabhi functions (deposit, withdraw, loadUserData) pehle jaise hi rahenge...
window.onload = () => {
    let savedUser = localStorage.getItem("user");
    if(savedUser) {
        getDoc(doc(db, "users", savedUser)).then(snap => {
            if(snap.exists()){
                get("auth").style.display = "none";
                get("app").style.display = "block";
                loadUserData(snap.data(), savedUser);
            }
        });
    } else { window.showLogin(); }
};
