import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== DOM =====
const authEl = document.getElementById("auth");
const appEl = document.getElementById("app");

const authTitle = document.getElementById("authTitle");
const nameInput = document.getElementById("name");
const numberInput = document.getElementById("number");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const toggleText = document.getElementById("toggleText");

const usernameHome = document.getElementById("usernameHome");
const username2 = document.getElementById("username2");
const usernumber = document.getElementById("usernumber");
const balance = document.getElementById("balance");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

const depositBox = document.getElementById("depositBox");
const depositList = document.getElementById("depositList");
const utrInput = document.getElementById("utr");
const upiText = document.getElementById("upiText");
const qrImg = document.getElementById("qrImg");

const bankBox = document.getElementById("bankBox");
const bankList = document.getElementById("bankList");
const bankNameInput = document.getElementById("bankName");
const accNumberInput = document.getElementById("accNumber");

const newPass = document.getElementById("newPass");
const confirmPass = document.getElementById("confirmPass");

// ===== MESSAGE =====
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// ===== TOGGLE =====
window.showRegister=()=>{
authTitle.innerText="Create Account";
nameInput.style.display="block";
registerBtn.style.display="block";
loginBtn.style.display="none";

toggleText.innerHTML=`
Already have an account?
<span onclick="showLogin()" style="color:yellow;">Sign In</span>`;
}

window.showLogin=()=>{
authTitle.innerText="Sign In";
nameInput.style.display="none";
registerBtn.style.display="none";
loginBtn.style.display="block";

toggleText.innerHTML=`
Don't have an account?
<span onclick="showRegister()" style="color:yellow;">Sign Up</span>`;
}

// ===== REGISTER =====
window.register=async()=>{
let name=nameInput.value.trim();
let number=numberInput.value.trim();
let password=passwordInput.value.trim();

if(!name || !number || !password){
return showMsg("Fill all fields");
}

await setDoc(doc(db,"users",number),{
name,
password,
balance:0
});

showMsg("Account Created ✅");
showLogin();
}

// ===== LOGIN =====
window.login=async()=>{
let number=numberInput.value.trim();
let password=passwordInput.value.trim();

if(!number || !password){
return showMsg("Enter details");
}

let snap=await getDoc(doc(db,"users",number));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password){
return showMsg("Wrong password");
}

// UI
authEl.style.display="none";
appEl.style.display="block";

// DATA
username2.innerText=user.name;
usernumber.innerText=number;
balance.innerText="₹"+user.balance;

if(usernameHome) usernameHome.innerText=user.name;

localStorage.setItem("user",number);

loadDeposits();
loadBanks();
loadPayment();
}

// ===== AUTO LOGIN =====
window.onload=async()=>{
let u=localStorage.getItem("user");

if(!u){
showRegister();
return;
}

let snap=await getDoc(doc(db,"users",u));

if(!snap.exists()){
showRegister();
return;
}

let user=snap.data();

authEl.style.display="none";
appEl.style.display="block";

username2.innerText=user.name;
usernumber.innerText=u;
balance.innerText="₹"+user.balance;

if(usernameHome) usernameHome.innerText=user.name;

loadDeposits();
loadBanks();
loadPayment();
}

// ===== NAV =====
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

// ===== LOGOUT =====
window.logout=()=>{
localStorage.clear();
location.reload();
}

// ===== DEPOSIT =====
window.deposit=()=>{
depositBox.style.display="flex";
loadDeposits();
}

window.closeDeposit=()=>depositBox.style.display="none";

window.submitDeposit=async()=>{
if(!utrInput.value) return showMsg("Enter UTR");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utrInput.value,
status:"Pending",
time:new Date().toLocaleString()
});

showMsg("Deposit Submitted");
utrInput.value="";
loadDeposits();
}

// ===== LOAD DEPOSITS =====
async function loadDeposits(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"deposits"));

depositList.innerHTML="";

snap.forEach(d=>{
let data=d.data();

if(data.user===user){
depositList.innerHTML+=`
<div style="background:#fff;color:black;padding:10px;margin:5px;border-radius:10px;text-align:left;">
UTR: ${data.utr}<br>
Status: ${data.status}<br>
${data.time||""}
</div>`;
}
});
}

// ===== PAYMENT =====
async function loadPayment(){
let snap=await getDoc(doc(db,"settings","payment"));

if(snap.exists()){
let d=snap.data();
upiText.innerText=d.upi||"";
qrImg.src=d.qr||"";
}
}

// ===== BANK =====
window.openBank=()=>{
bankBox.style.display="flex";
loadBanks();
}

window.closeBank=()=>bankBox.style.display="none";

window.saveBank=async()=>{
if(!bankNameInput.value || !accNumberInput.value){
return showMsg("Fill bank details");
}

await setDoc(doc(db,"bank",Date.now()+""),{
user:localStorage.getItem("user"),
bank:bankNameInput.value,
account:accNumberInput.value
});

showMsg("Bank Added");
bankNameInput.value="";
accNumberInput.value="";
loadBanks();
}

// ===== LOAD BANK =====
async function loadBanks(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"bank"));

bankList.innerHTML="";

snap.forEach(d=>{
let data=d.data();

if(data.user===user){
bankList.innerHTML+=`
<div style="background:#fff;color:black;padding:10px;margin:5px;border-radius:10px;text-align:left;">
${data.bank}<br>${data.account}
</div>`;
}
});
}

// ===== PASSWORD =====
window.changePassword=async()=>{
if(!newPass.value || !confirmPass.value){
return showMsg("Fill password");
}

if(newPass.value!==confirmPass.value){
return showMsg("Password not match");
}

let ref=doc(db,"users",localStorage.getItem("user"));

await updateDoc(ref,{
password:newPass.value
});

showMsg("Password Updated");
}

// SPLASH LOAD
setTimeout(()=>{
document.getElementById("splash").style.display="none";
document.getElementById("auth").style.display="flex";
},2500);