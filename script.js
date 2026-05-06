import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc,
getDocs,
updateDoc,
collection
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain:"inrpay-44413.firebaseapp.com",
projectId:"inrpay-44413"
});

const db=getFirestore(app);
const auth=getAuth(app);

const get=id=>document.getElementById(id);

/* ================= MSG ================= */
function showMsg(t){
get("msgText").innerText=t;
get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

/* ================= CLICK FIX ================= */
document.addEventListener("click",()=>{});

/* ================= PASSWORD TOGGLE ================= */
window.togglePass=()=>{
let p=get("password");
p.type=p.type==="password"?"text":"password";
};

/* ================= AUTH SWITCH FIX ================= */
window.onload=()=>showRegister();

window.showRegister=()=>{
get("authTitle").innerText="Create Account";
get("name").style.display="block";
get("email").style.display="block";
get("registerBtn").style.display="block";
get("loginBtn").style.display="none";
get("forgotText").style.display="none";
};

window.showLogin=()=>{
get("authTitle").innerText="Sign In";
get("name").style.display="none";
get("email").style.display="none";
get("registerBtn").style.display="none";
get("loginBtn").style.display="block";
get("forgotText").style.display="block";
};

/* ================= REGISTER ================= */
window.register=async()=>{

let email=get("email").value;
let password=get("password").value;

if(!email){
return showMsg("Enter email");
}

try{

await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(doc(db,"users",get("number").value),{
name:get("name").value,
email:email,
password:password,
balance:0
});

showMsg("Account Created");
showLogin();

}catch(err){

showMsg(err.message);

}

};

/* ================= LOGIN ================= */
window.login=async()=>{

let number=get("number").value;
let password=get("password").value;

let snap=await getDoc(doc(db,"users",number));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password){
return showMsg("Wrong password");
}

try{

await signInWithEmailAndPassword(
auth,
user.email,
password
);

get("auth").style.display="none";
get("app").style.display="block";

get("usernameHome").innerText=user.name;
get("username2").innerText=user.name;
get("usernumber").innerText=number;
get("useremail").innerText=user.email;

localStorage.setItem("user",number);

loadUser();

}catch(err){

showMsg("Login failed");

}

};

/* ================= LOAD USER ================= */
async function loadUser(){
let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
if(snap.exists()){
let bal=snap.data().balance||0;
get("walletBalance").innerText=bal;
get("earnBalance").innerText=bal;
}
}

/* ================= NAV FIX ================= */
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
get(id).style.display="block";
};

/* ================= WITHDRAW ================= */
window.openWithdraw=()=>get("withdrawBox").classList.add("active");
window.closeWithdraw=()=>get("withdrawBox").classList.remove("active");

window.submitWithdraw=async()=>{
let amt=Number(get("wAmount").value);

let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let bal=snap.data().balance||0;

if(bal<200) return showMsg("Minimum ₹200 required");
if(amt>bal) return showMsg("Insufficient balance");

await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
amount:amt,
status:"Pending"
});

showMsg("Withdraw Submitted");
};

/* ================= SETTINGS LOAD ================= */
async function loadSettings(){
let snap=await getDoc(doc(db,"settings","main"));
if(snap.exists()){
let d=snap.data();

get("qrImage").src=d.qr || "";
get("upiText").innerText=d.upi || "upi@id";
get("amountText").innerText="₹"+(d.amount || 1000);
}
}

/* ================= DEPOSIT ================= */
window.deposit=()=>{
get("depositBox").classList.add("active");
loadSettings();
};

window.closeDeposit=()=>get("depositBox").classList.remove("active");

window.submitDeposit=async()=>{
let utr=get("utr").value;

if(!utr) return showMsg("Enter UTR Number");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utr,
status:"Pending"
});

showMsg("Deposit Submitted");
};

/* ================= BANK ================= */
window.openBank=()=>get("bankBox").classList.add("active");
window.closeBank=()=>get("bankBox").classList.remove("active");

window.saveBank=async()=>{
await setDoc(doc(db,"bank",localStorage.getItem("user")),{
name:get("bankName").value,
account:get("bankAcc").value,
ifsc:get("bankIfsc").value
});
showMsg("Bank Saved");
};

/* ================= PASSWORD CHANGE ================= */
window.changePassword=async()=>{
let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let user=snap.data();

if(user.password!==get("oldPass").value){
return showMsg("Wrong old password");
}

if(get("newPass").value!==get("confirmPass").value){
return showMsg("Password mismatch");
}

await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:get("newPass").value
});

showMsg("Password Changed");
};

/* ================= FORGOT PASSWORD ================= */
window.forgotPassword=async()=>{

let number=get("number").value;

if(!number){
return showMsg("Enter mobile number");
}

let snap=await getDoc(doc(db,"users",number));

if(!snap.exists()){
return showMsg("User not found");
}

let user=snap.data();

try{

await sendPasswordResetEmail(auth,user.email);

showMsg("Reset link sent to email");

}catch(err){

showMsg("Reset failed");

}

};

/* ================= LOGOUT ================= */
window.logout=()=>{
localStorage.clear();
location.reload();
};