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

const db = getFirestore(app);
const auth = getAuth(app);

const get = (id) => document.getElementById(id);

/* ================= MESSAGE ================= */

function showMsg(text){
get("msgText").innerText = text;
get("msgBox").classList.add("active");
}

window.closeMsg = () => {
get("msgBox").classList.remove("active");
};

/* ================= PASSWORD TOGGLE ================= */

window.togglePass = () => {

let pass = get("password");

if(pass.type === "password"){
pass.type = "text";
}else{
pass.type = "password";
}

};

/* ================= AUTH SWITCH ================= */

window.onload = () => {
showRegister();
};

window.showRegister = () => {

document.getElementById("name").style.display = "block";
document.getElementById("email").style.display = "block";

document.getElementById("registerBtn").style.display = "block";
document.getElementById("loginBtn").style.display = "none";

document.getElementById("forgotText").style.display = "none";

document.getElementById("authTitle").innerText = "Create Account";

document.getElementById("toggleText").innerHTML =
'Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>';

};

window.showLogin = () => {

document.getElementById("name").style.display = "none";
document.getElementById("email").style.display = "none";

document.getElementById("registerBtn").style.display = "none";
document.getElementById("loginBtn").style.display = "block";

document.getElementById("forgotText").style.display = "block";

document.getElementById("authTitle").innerText = "Sign In";

document.getElementById("toggleText").innerHTML =
'New user? <button class="linkBtn" onclick="showRegister()">Create Account</button>';

};

/* ================= REGISTER ================= */

window.register = async () => {

let name = get("name").value.trim();
let number = get("number").value.trim();
let email = get("email").value.trim();
let password = get("password").value;

if(!name || !number || !email || !password){
return showMsg("Fill all fields");
}

try{

await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(doc(db,"users",number),{
name:name,
number:number,
email:email,
password:password,
balance:0
});

showMsg("Account Created");

get("name").value = "";
get("number").value = "";
get("email").value = "";
get("password").value = "";

showLogin();

}catch(err){

showMsg(err.message);

}

};

/* ================= LOGIN ================= */

window.login = async () => {

let number = get("number").value.trim();
let password = get("password").value;

if(!number || !password){
return showMsg("Fill all fields");
}

try{

let snap = await getDoc(doc(db,"users",number));

if(!snap.exists()){
return showMsg("User not found");
}

let user = snap.data();

if(user.password !== password){
return showMsg("Wrong password");
}

await signInWithEmailAndPassword(
auth,
user.email,
password
);

localStorage.setItem("user",number);

get("auth").style.display = "none";
get("app").style.display = "block";

get("usernameHome").innerText = user.name;
get("username2").innerText = user.name;
get("usernumber").innerText = user.number;
get("useremail").innerText = user.email;

loadUser();

}catch(err){

showMsg("Login failed");

}

};

/* ================= LOAD USER ================= */

async function loadUser(){

let userId = localStorage.getItem("user");

if(!userId) return;

let snap = await getDoc(doc(db,"users",userId));

if(snap.exists()){

let user = snap.data();
let bal = user.balance || 0;

get("walletBalance").innerText = bal;
get("earnBalance").innerText = bal;

}

}

/* ================= NAVIGATION ================= */

window.showPage = (id) => {

document.querySelectorAll(".page").forEach(page=>{
page.style.display = "none";
});

get(id).style.display = "block";

};

/* ================= WITHDRAW ================= */

window.openWithdraw = () => {
get("withdrawBox").classList.add("active");
};

window.closeWithdraw = () => {
get("withdrawBox").classList.remove("active");
};

window.submitWithdraw = async () => {

let amt = Number(get("wAmount").value);

let snap = await getDoc(
doc(db,"users",localStorage.getItem("user"))
);

let bal = snap.data().balance || 0;

if(bal < 200){
return showMsg("Minimum ₹200 required");
}

if(amt > bal){
return showMsg("Insufficient balance");
}

await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
amount:amt,
status:"Pending"
});

showMsg("Withdraw Submitted");

};

/* ================= SETTINGS ================= */

async function loadSettings(){

let snap = await getDoc(doc(db,"settings","main"));

if(snap.exists()){

let d = snap.data();

get("qrImage").src = d.qr || "";
get("upiText").innerText = d.upi || "upi@id";
get("amountText").innerText = "₹"+(d.amount || 1000);

}

}

/* ================= DEPOSIT ================= */

window.deposit = () => {

get("depositBox").classList.add("active");
loadSettings();

};

window.closeDeposit = () => {
get("depositBox").classList.remove("active");
};

window.submitDeposit = async () => {

let utr = get("utr").value;

if(!utr){
return showMsg("Enter UTR Number");
}

await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utr,
status:"Pending"
});

showMsg("Deposit Submitted");

};

/* ================= BANK ================= */

window.openBank = () => {
get("bankBox").classList.add("active");
};

window.closeBank = () => {
get("bankBox").classList.remove("active");
};

window.saveBank = async () => {

await setDoc(doc(db,"bank",localStorage.getItem("user")),{
name:get("bankName").value,
account:get("bankAcc").value,
ifsc:get("bankIfsc").value
});

showMsg("Bank Saved");

};

/* ================= CHANGE PASSWORD ================= */

window.changePassword = async () => {

let snap = await getDoc(
doc(db,"users",localStorage.getItem("user"))
);

let user = snap.data();

if(user.password !== get("oldPass").value){
return showMsg("Wrong old password");
}

if(get("newPass").value !== get("confirmPass").value){
return showMsg("Password mismatch");
}

await updateDoc(
doc(db,"users",localStorage.getItem("user")),
{
password:get("newPass").value
}
);

showMsg("Password Changed");

};

/* ================= FORGOT PASSWORD ================= */

window.forgotPassword = async () => {

let number = get("number").value.trim();

if(!number){
return showMsg("Enter mobile number");
}

let snap = await getDoc(doc(db,"users",number));

if(!snap.exists()){
return showMsg("User not found");
}

let user = snap.data();

try{

await sendPasswordResetEmail(
auth,
user.email
);

showMsg("Reset link sent to email");

}catch(err){

showMsg("Reset failed");

}

};

/* ================= LOGOUT ================= */

window.logout = () => {

localStorage.clear();
location.reload();

};