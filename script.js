import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

/* ================= MSG ================= */
function showMsg(t){
    get("msgText").innerText=t;
    get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

/* ================= PASSWORD TOGGLE ================= */
window.togglePass=()=>{
    let p=get("password");
    p.type=p.type==="password"?"text":"password";
};

/* ================= AUTH SWITCH (FIXED) ================= */
window.showRegister=()=>{
    get("authTitle").innerText="Create Account";
    get("name").style.display="block"; // Show Name
    get("registerBtn").style.display="block";
    get("loginBtn").style.display="none";
    get("forgotText").style.display="none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin=()=>{
    get("authTitle").innerText="Sign In";
    get("name").style.display="none"; // Hide Name
    get("registerBtn").style.display="none";
    get("loginBtn").style.display="block";
    get("forgotText").style.display="block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= REGISTER ================= */
window.register=async()=>{
    if(get("name").style.display !== "none" && !get("name").value) return showMsg("Please enter your name");
    if(!get("number").value || !get("password").value) return showMsg("Please fill all fields");
    
    await setDoc(doc(db,"users",get("number").value),{
        name:get("name").value,
        password:get("password").value,
        balance:0
    });
    showMsg("Account Created Successfully");
    showLogin();
};

/* ================= LOGIN ================= */
window.login=async()=>{
    let snap=await getDoc(doc(db,"users",get("number").value));
    if(!snap.exists()) return showMsg("User not found");

    let user=snap.data();
    if(user.password!==get("password").value) return showMsg("Wrong password");

    get("auth").style.display="none";
    get("app").style.display="block";
    
    get("usernameHome").innerText= "Hello, " + user.name;
    localStorage.setItem("user",get("number").value);
    loadUser();
};

/* ================= LOAD USER ================= */
async function loadUser(){
    let userKey = localStorage.getItem("user");
    if(!userKey) return;
    let snap=await getDoc(doc(db,"users",userKey));
    if(snap.exists()){
        let bal=snap.data().balance||0;
        get("balance").innerText="₹"+bal;
    }
}

window.onload=()=>showRegister();
