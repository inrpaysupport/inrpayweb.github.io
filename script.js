import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ================= MESSAGE =================
function showMsg(text){
msgText.innerText = text;
msgBox.style.display = "flex";
}
window.closeMsg = ()=> msgBox.style.display="none";

// ================= REGISTER =================
window.register = async function(){

if(!name.value || !number.value || !password.value){
return showMsg("Fill all fields");
}

await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});

showMsg("✅ Account Created Successfully");
}

// ================= LOGIN =================
window.login = async function(){

let snap = await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return showMsg("User not found");

let user = snap.data();

if(user.password !== password.value){
return showMsg("Wrong password");
}

// UI switch
auth.style.display = "none";
app.style.display = "block";

// hide name after login
name.style.display = "none";

// set data
username.innerText = user.name;
username2.innerText = user.name;
usernumber.innerText = number.value;

balance.innerText = "₹" + user.balance;

localStorage.setItem("user",number.value);

// realtime listener
listenDeposits();
}

// ================= AUTO LOGIN =================
window.onload = async function(){

let u = localStorage.getItem("user");
if(!u) return;

let snap = await getDoc(doc(db,"users",u));

if(snap.exists()){

let user = snap.data();

auth.style.display = "none";
app.style.display = "block";

username.innerText = user.name;
username2.innerText = user.name;
usernumber.innerText = u;

balance.innerText = "₹" + user.balance;

listenDeposits();
}
}

// ================= LOGOUT =================
window.logout = function(){
localStorage.clear();
location.reload();
}

// ================= NAVIGATION =================
window.showPage = function(id){
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

// ================= BANK =================
window.openBank = ()=>{
bankBox.style.display = "flex";
loadBanks();
}

window.closeBank = ()=>{
bankBox.style.display = "none";
}

window.saveBank = async ()=>{

let user = localStorage.getItem("user");

await setDoc(doc(db,"bank",Date.now()+""),{
user,
bank:bankName.value,
account:accNumber.value
});

showMsg("Bank Added");
loadBanks();
}

async function loadBanks(){

let user = localStorage.getItem("user");

let snap = await getDocs(collection(db,"bank"));

bankList.innerHTML = "";

snap.forEach(d=>{
let data = d.data();

if(data.user === user){

bankList.innerHTML += `
<div style="background:#eee;color:black;padding:10px;margin:5px;border-radius:10px;text-align:left;">
${data.bank}<br>${data.account}
</div>`;
}
});
}

// ================= DEPOSIT =================
window.deposit = async ()=>{

let snap = await getDoc(doc(db,"settings","payment"));

if(snap.exists()){
let d = snap.data();
upiText.innerText = d.upi;
qrImg.src = d.qr;
}

depositBox.style.display = "flex";
loadDeposits();
}

window.closeDeposit = ()=>{
depositBox.style.display = "none";
}

// SUBMIT
window.submitDeposit = async ()=>{

if(!utr.value) return showMsg("Enter UTR");

let user = localStorage.getItem("user");

await setDoc(doc(db,"deposits",Date.now()+""),{
user,
utr:utr.value,
status:"Pending",
time:new Date().toLocaleString()
});

showMsg("Submitted ✅\nWait 24 hours");
loadDeposits();
}

// HISTORY
async function loadDeposits(){

let user = localStorage.getItem("user");

let snap = await getDocs(collection(db,"deposits"));

depositList.innerHTML = "";

snap.forEach(d=>{
let data = d.data();

if(data.user === user){

let color = data.status === "approved" ? "green" : "orange";

depositList.innerHTML += `
<div style="background:#fff;color:black;padding:10px;margin:5px;border-radius:10px;text-align:left;">
UTR: ${data.utr}<br>
Status: <span style="color:${color}">${data.status}</span>
</div>`;
}
});
}

// ================= REALTIME =================
function listenDeposits(){

let user = localStorage.getItem("user");

onSnapshot(collection(db,"deposits"),snap=>{

snap.forEach(async d=>{
let data = d.data();

if(data.user === user && data.status === "approved"){

showMsg("💰 Deposit Approved");

updateBalance();
}
});
});
}

async function updateBalance(){

let user = localStorage.getItem("user");

let snap = await getDoc(doc(db,"users",user));

balance.innerText = "₹" + snap.data().balance;
}

// ================= PASSWORD CHANGE =================
window.changePassword = async function(){

let user = localStorage.getItem("user");

let ref = doc(db,"users",user);
let snap = await getDoc(ref);

let data = snap.data();

if(data.password !== oldPass.value){
return showMsg("Wrong current password");
}

if(newPass.value !== confirmPass.value){
return showMsg("Password not match");
}

await updateDoc(ref,{
password:newPass.value
});

showMsg("Password Changed");
}

// ================= SUPPORT =================
window.openSupport = ()=>{
supportBox.style.display="flex";
}

window.closeSupport = ()=>{
supportBox.style.display="none";
}

window.autoReply = ()=>{
supportMsg.innerText = "Wait 30-60 minutes";
}