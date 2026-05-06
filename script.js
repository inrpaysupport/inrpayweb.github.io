import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

// AUTH LOGIC
window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.display = "none";
    get("email").style.display = "none";
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || !email || num.length < 10 || !pass) return window.showMsg("Fill all details!");

    await setDoc(doc(db, "users", num), {
        name: name,
        email: email,
        password: pass,
        balance: 0,
        uid: Math.floor(100000 + Math.random() * 900000)
    });
    window.showMsg("Account Created!");
    location.reload();
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));

    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        loadUserData(snap.data(), num);
    } else {
        window.showMsg("Invalid Details!");
    }
};

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + data.email;
    get("usernumber").innerText = "Mobile: " + num;
    get("balance").innerText = "₹" + (data.balance || 0);
    localStorage.setItem("currentBalance", data.balance || 0);
}

// PASSWORD CHANGE LOGIC (FIXED)
window.changePassword = async () => {
    let oldP = get("oldPass").value;
    let newP = get("newPass").value;
    let userNum = localStorage.getItem("user");

    if(!oldP || !newP) return window.showMsg("Enter both passwords!");

    try {
        let userRef = doc(db, "users", userNum);
        let snap = await getDoc(userRef);

        if(snap.exists()){
            if(snap.data().password === oldP) {
                await updateDoc(userRef, { password: newP });
                window.showMsg("Password Updated Successfully!");
                get("oldPass").value = "";
                get("newPass").value = "";
            } else {
                window.showMsg("Old Password is wrong!");
            }
        }
    } catch (e) {
        window.showMsg("Error: " + e.message);
    }
};

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };
