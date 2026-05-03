import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain: "inrpay-44413.firebaseapp.com",
projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== DOM =====
const name = document.getElementById("name");
const number = document.getElementById("number");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authTitle = document.getElementById("authTitle");
const toggleText = document.getElementById("toggleText");
const forgotText = document.getElementById("forgotText");

const auth = document.getElementById("auth");
const appDiv = document.getElementById("app");

const usernameHome = document.getElementById("usernameHome");
const username2 = document.getElementById("username2");
const usernumber = document.getElementById("usernumber");

const earningList = document.getElementById("earningList");

const withdrawBox = document.getElementById("withdrawBox");
const withdrawList = document.getElementById("withdrawList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

// ===== MESSAGE =====
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// ===== DEFAULT =====
window.onload=()=>showRegister();

// ===== TOGGLE =====
window.showLogin=()=>{
authTitle.innerText="Sign In";
name.style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";
forgotText.style.display="block";

toggleText.innerHTML=`Don't have account? 
<span onclick="showRegister()">Sign Up</span>`;
};

window.showRegister=()=>{
authTitle.innerText="Create Account";
name.style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";
forgotText.style.display="none";

toggleText.innerHTML=`Already have account? 
<span onclick="showLogin()">Sign In</span>`;
};

// ===== REGISTER =====
window.register=async()=>{
await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});
showMsg("Account Created");
showLogin();
};

// ===== LOGIN =====
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password.value) return showMsg("Wrong password");

auth.style.display="none";
appDiv.style.display="block";

usernameHome.innerText=user.name;
username2.innerText=user.name;
usernumber.innerText=number.value;

localStorage.setItem("user",number.value);

loadEarnings();
};

// ===== EARNINGS =====
async function loadEarnings(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"withdraw"));

earningList.innerHTML="";

snap.forEach(d=>{
let data=d.data();
if(data.user===user && data.status==="Done"){
earningList.innerHTML+=`<div>${data.date} - ₹${data.amount}</div>`;
}
});
}

// ===== WITHDRAW =====
window.openWithdraw=()=>withdrawBox.style.display="flex";
window.closeWithdraw=()=>withdrawBox.style.display="none";

window.submitWithdraw=async()=>{

let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let bal=snap.data().balance;

if(bal==0) return showMsg("Balance 0");
if(bal<200) return showMsg("Minimum ₹200 required");

showMsg("Withdraw Submitted");
};

// ===== PASSWORD CHANGE =====
window.changePassword=async()=>{
let ref=doc(db,"users",localStorage.getItem("user"));
await updateDoc(ref,{password:newPass.value});
showMsg("Password Updated");
};

// ===== LOGOUT =====
window.logout=()=>{
localStorage.clear();
location.reload();
};