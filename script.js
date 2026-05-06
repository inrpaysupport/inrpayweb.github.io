import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

/* ================= MESSAGE BOX ================= */
function showMsg(t){
    get("msgText").innerText=t;
    get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

/* ================= AUTH SWITCH (FIXED) ================= */
window.showRegister=()=>{
    get("authTitle").innerText="Create Account";
    get("name").style.display="block";
    get("registerBtn").style.display="block";
    get("loginBtn").style.display="none";
    get("forgotText").style.display="none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin=()=>{
    get("authTitle").innerText="Sign In";
    get("name").style.display="none";
    get("registerBtn").style.display="none";
    get("loginBtn").style.display="block";
    get("forgotText").style.display="block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= PASSWORD TOGGLE ================= */
window.togglePass=()=>{
    let p=get("password");
    p.type=p.type==="password"?"text":"password";
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
    showMsg("Account Created");
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
    get("username2").innerText= user.name;
    get("usernumber").innerText= "Mobile: " + get("number").value;
    get("userid").innerText= "UID: " + (user.uid || Math.floor(100000 + Math.random() * 900000));

    localStorage.setItem("user",get("number").value);
    loadUser();
    loadSettings();
};

/* ================= SUPPORT LOGIC ================= */
window.openSupport = () => get("supportBox").classList.add("active");
window.closeSupport = () => get("supportBox").classList.remove("active");
window.supportMsg = (type) => {
    let msg = type === 'rep' ? "Our representative will contact you in 5 minutes." : "Our manager will contact you in 5 minutes.";
    closeSupport();
    showMsg(msg);
};

/* ================= SETTINGS & NOTICE ================= */
async function loadSettings(){
    let snap=await getDoc(doc(db,"settings","main"));
    if(snap.exists()){
        let d=snap.data();
        if(d.notice) get("scrollingNotice").innerText = d.notice;
        get("qrImage").src=d.qr || "";
        get("upiText").innerText=d.upi || "upi@id";
        get("amountText").innerText="₹"+(d.amount || 1000);
    }
}

/* ================= OTHER FUNCTIONS ================= */
async function loadUser(){
    let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
    if(snap.exists()){
        let bal=snap.data().balance||0;
        get("balance").innerText="₹"+bal;
        if(get("earnBalance")) get("earnBalance").innerText=bal;
    }
}

window.showPage=(id)=>{
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    get(id).style.display="block";
};

window.logout=()=>{
    localStorage.clear();
    location.reload();
};

window.onload=()=>showRegister();
