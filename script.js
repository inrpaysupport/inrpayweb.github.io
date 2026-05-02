import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey: "AIzaSyBh...",
authDomain: "inrpay-44413.firebaseapp.com",
projectId: "inrpay-44413"
});

const db = getFirestore(app);

// SPLASH
setTimeout(()=>{
splash.style.display="none";
auth.style.display="flex";
},2000);

// MESSAGE
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// TOGGLE
window.showLogin=()=>{
authTitle.innerText="Login";
name.style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";
toggleText.innerHTML=`Don't have account? <span onclick="showRegister()">Sign Up</span>`;
}

window.showRegister=()=>{
authTitle.innerText="Create Account";
name.style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";
toggleText.innerHTML=`Already have account? <span onclick="showLogin()">Sign In</span>`;
}

// REGISTER
window.register=async()=>{
if(!name.value || !number.value || !password.value){
return showMsg("Fill all fields");
}

await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});

showMsg("Account Created");
showLogin();
}

// LOGIN
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password.value) return showMsg("Wrong password");

auth.style.display="none";
app.style.display="block";

document.querySelector(".bottomNav").style.display="flex";

usernameHome.innerText=user.name;
username2.innerText=user.name;
usernumber.innerText=number.value;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number.value);

loadEarnings();
loadDeposits();
loadBanks();
}

// NAV
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

// LOGOUT
window.logout=()=>{
localStorage.clear();
location.reload();
}

// DEPOSIT
window.deposit=()=>{depositBox.style.display="flex";}
window.closeDeposit=()=>depositBox.style.display="none";

window.submitDeposit=async()=>{
await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utr.value,
status:"pending",
time:new Date().toLocaleString()
});
loadDeposits();
}

// LOAD DEPOSITS
async function loadDeposits(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"deposits"));

depositList.innerHTML="";

snap.forEach(d=>{
let data=d.data();
if(data.user===user){
depositList.innerHTML+=`<div>${data.utr} - ${data.status}</div>`;
}
});
}

// BANK
window.openBank=()=>{bankBox.style.display="flex";loadBanks();}
window.closeBank=()=>bankBox.style.display="none";

window.saveBank=async()=>{
await setDoc(doc(db,"bank",Date.now()+""),{
user:localStorage.getItem("user"),
bank:bankName.value,
account:accNumber.value
});
loadBanks();
}

// LOAD BANK
async function loadBanks(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"bank"));

bankList.innerHTML="";

snap.forEach(d=>{
let data=d.data();
if(data.user===user){
bankList.innerHTML+=`<div>${data.bank} - ${data.account}</div>`;
}
});
}

// EARNINGS
function loadEarnings(){
earningList.innerHTML="";
for(let i=1;i<=30;i++){
earningList.innerHTML+=`<div>Day ${i} - ₹${Math.floor(Math.random()*100)}</div>`;
}
}

// WITHDRAW
window.openWithdraw=()=>{
withdrawBox.style.display="flex";
loadWithdraw();
}

window.closeWithdraw=()=>withdrawBox.style.display="none";

window.submitWithdraw=async()=>{
await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
name:wName.value,
account:wAcc.value,
ifsc:wIfsc.value,
time:new Date().toLocaleString()
});
loadWithdraw();
}

// LOAD WITHDRAW
async function loadWithdraw(){
let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"withdraw"));

withdrawList.innerHTML="";

snap.forEach(d=>{
let data=d.data();
if(data.user===user){
withdrawList.innerHTML+=`<div>${data.time}</div>`;
}
});
}

// PASSWORD
window.changePassword=async()=>{
await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:newPass.value
});
showMsg("Updated");
}