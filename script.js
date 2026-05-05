import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain:"inrpay-44413.firebaseapp.com",
projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

/* PASSWORD */
window.togglePass=()=>{
let p=get("password");
p.type=p.type==="password"?"text":"password";
};

/* AUTH SWITCH */
window.onload=()=>showRegister();

window.showRegister=()=>{
get("authTitle").innerText="Create Account";
get("name").style.display="block";
get("registerBtn").style.display="block";
get("loginBtn").style.display="none";
};

window.showLogin=()=>{
get("authTitle").innerText="Sign In";
get("name").style.display="none";
get("registerBtn").style.display="none";
get("loginBtn").style.display="block";
};

/* TOGGLE FIX */
window.toggleAuth=()=>{
if(get("authTitle").innerText==="Create Account"){
showLogin();
get("toggleMsg").innerText="New user?";
}else{
showRegister();
get("toggleMsg").innerText="Already have account?";
}
};

/* REGISTER */
window.register=async()=>{
await setDoc(doc(db,"users",get("number").value),{
name:get("name").value,
password:get("password").value,
balance:0
});
alert("Account Created");
showLogin();
};

/* LOGIN */
window.login=async()=>{
let snap=await getDoc(doc(db,"users",get("number").value));
if(!snap.exists()) return alert("User not found");

let user=snap.data();
if(user.password!==get("password").value) return alert("Wrong password");

get("auth").style.display="none";
get("app").style.display="block";

get("usernameHome").innerText=user.name;

loadSettings(); // 🔥 NOTICE LOAD
};

/* LOAD SETTINGS (NOTICE + QR ETC) */
async function loadSettings(){
let snap=await getDoc(doc(db,"settings","main"));
if(snap.exists()){
let d=snap.data();
get("noticeText").innerText=d.notice || "Welcome";
}
}