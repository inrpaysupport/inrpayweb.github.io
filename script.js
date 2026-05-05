import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain:"inrpay-44413.firebaseapp.com",
projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

/* ===== AUTH TOGGLE FIX ===== */
let isLogin=false;

function updateUI(){
if(isLogin){
get("authTitle").innerText="Sign In";
get("name").style.display="none";
get("registerBtn").style.display="none";
get("loginBtn").style.display="block";
get("forgotText").style.display="block";
get("switchAuth").innerText="Sign Up";
}else{
get("authTitle").innerText="Create Account";
get("name").style.display="block";
get("registerBtn").style.display="block";
get("loginBtn").style.display="none";
get("forgotText").style.display="none";
get("switchAuth").innerText="Sign In";
}
}

document.addEventListener("DOMContentLoaded",()=>{
updateUI();
get("switchAuth").onclick=()=>{
isLogin=!isLogin;
updateUI();
};
});

/* ===== MSG ===== */
function showMsg(t){
get("msgText").innerText=t;
get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

/* ===== PASSWORD ===== */
window.togglePass=()=>{
let p=get("password");
p.type=p.type==="password"?"text":"password";
};

/* ===== REGISTER ===== */
window.register=async()=>{
await setDoc(doc(db,"users",get("number").value),{
name:get("name").value,
password:get("password").value,
balance:0
});
showMsg("Account Created");
};

/* ===== LOGIN ===== */
window.login=async()=>{
let snap=await getDoc(doc(db,"users",get("number").value));
if(!snap.exists()) return showMsg("User not found");

let user=snap.data();
if(user.password!==get("password").value) return showMsg("Wrong password");

get("auth").style.display="none";
get("app").style.display="block";

get("usernameHome").innerText=user.name;
localStorage.setItem("user",get("number").value);
};

/* ===== SETTINGS LOAD ===== */
async function loadSettings(){
let snap=await getDoc(doc(db,"settings","main"));
if(snap.exists()){
let d=snap.data();
get("qrImage").src=d.qr;
get("upiText").innerText=d.upi;
get("amountText").innerText="₹"+d.amount;
}
}

/* ===== DEPOSIT ===== */
window.deposit=()=>{
get("depositBox").classList.add("active");
loadSettings();
};

window.closeDeposit=()=>get("depositBox").classList.remove("active");

window.submitDeposit=async()=>{
let utr=get("utr").value;
if(!utr) return showMsg("Enter UTR");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utr
});
showMsg("Submitted");
};