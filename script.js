import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// MESSAGE
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// REGISTER
window.register=async()=>{
await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});
showMsg("Account Created");
}

// LOGIN
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));
if(!snap.exists()) return showMsg("User not found");

let user=snap.data();
if(user.password!==password.value) return showMsg("Wrong password");

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number.value);
listenDeposits();
}

// AUTO LOGIN
window.onload=async()=>{
let u=localStorage.getItem("user");
if(!u) return;

let snap=await getDoc(doc(db,"users",u));
if(snap.exists()){
let user=snap.data();

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

listenDeposits();
}
}

// LOGOUT
window.logout=()=>{localStorage.clear();location.reload();}

// BANK
window.openBank=()=>{bankBox.style.display="flex";loadBanks();}
window.closeBank=()=>bankBox.style.display="none";
window.showAddBank=()=>bankForm.style.display="block";

window.saveBank=async()=>{
let user=localStorage.getItem("user");

await setDoc(doc(db,"bank",Date.now()+""),{
user,
bank:bankName.value,
account:accNumber.value
});

showMsg("Saved");
loadBanks();
}

async function loadBanks(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"bank"));

bankList.innerHTML="";

snap.forEach(d=>{
let data=d.data();
if(data.user===user){
bankList.innerHTML+=`<p>${data.bank} - ${data.account}</p>`;
}
});
}

// DEPOSIT
window.deposit=async()=>{
let snap=await getDoc(doc(db,"settings","payment"));

if(snap.exists()){
let d=snap.data();
upiText.innerText=d.upi;
qrImg.src=d.qr;
}

depositBox.style.display="flex";
loadDeposits();
}

window.closeDeposit=()=>depositBox.style.display="none";

window.submitDeposit=async()=>{
if(!utr.value) return showMsg("Enter UTR");

let user=localStorage.getItem("user");

await setDoc(doc(db,"deposits",Date.now()+""),{
user,
utr:utr.value,
status:"Pending",
time:new Date().toLocaleString()
});

showMsg("Submitted - wait 24h");
loadDeposits();
}

// LOAD HISTORY
async function loadDeposits(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"deposits"));

depositList.innerHTML="";

snap.forEach(d=>{
let data=d.data();

if(data.user===user){
depositList.innerHTML+=`
<div>
UTR: ${data.utr}<br>
Status: ${data.status}
</div>`;
}
});
}

// REALTIME
function listenDeposits(){
let user=localStorage.getItem("user");

onSnapshot(collection(db,"deposits"),snap=>{
snap.forEach(d=>{
let data=d.data();

if(data.user===user && data.status==="approved"){
showMsg("Deposit Success ✅");
updateBalance();
}
});
});
}

async function updateBalance(){
let user=localStorage.getItem("user");
let snap=await getDoc(doc(db,"users",user));
balance.innerText="₹"+snap.data().balance;
}

// SUPPORT
window.openSupport=()=>supportBox.style.display="flex";
window.closeSupport=()=>supportBox.style.display="none";
window.autoReply=()=>supportMsg.innerText="Wait 30-60 min";