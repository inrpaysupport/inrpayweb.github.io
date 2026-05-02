import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== TOGGLE =====
window.showLogin=()=>{
authTitle.innerText="Sign In";
name.style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";
toggleText.innerHTML=`No account? <span onclick="showRegister()">Sign Up</span>`;
}

window.showRegister=()=>{
authTitle.innerText="Create Account";
name.style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";
toggleText.innerHTML=`Have account? <span onclick="showLogin()">Sign In</span>`;
}

// ===== REGISTER =====
window.register=async()=>{
await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});
alert("Created");
showLogin();
}

// ===== LOGIN =====
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return alert("User not found");

let u=snap.data();

if(u.password!==password.value) return alert("Wrong password");

auth.style.display="none";
app.style.display="block";

usernameHome.innerText=u.name;
username2.innerText=u.name;
usernumber.innerText=number.value;

localStorage.setItem("user",number.value);

loadEarnings();
}

// ===== NAV =====
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

// ===== EARNINGS =====
function loadEarnings(){

let user=localStorage.getItem("user");

earningList.innerHTML=`
<div style="display:flex;font-weight:bold;">
<div style="flex:1;">Name</div>
<div style="flex:1;">Date</div>
<div style="flex:1;">Time</div>
<div style="flex:1;">Amount</div>
<div style="flex:1;">Status</div>
</div>
`;

for(let i=0;i<30;i++){
let d=new Date();
d.setDate(d.getDate()-i);

earningList.innerHTML+=`
<div style="display:flex;background:#fff;color:black;margin:5px;padding:8px;">
<div style="flex:1;">${user}</div>
<div style="flex:1;">${d.toLocaleDateString()}</div>
<div style="flex:1;">${d.toLocaleTimeString()}</div>
<div style="flex:1;">₹${Math.floor(Math.random()*100)}</div>
<div style="flex:1;color:green;">Done</div>
</div>`;
}
}

// ===== WITHDRAW =====
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
amount:1000,
status:"Process",
date:new Date().toLocaleDateString(),
time:new Date().toLocaleTimeString()
});

loadWithdraw();
}

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){

let user=localStorage.getItem("user");
let snap=await getDocs(collection(db,"withdraw"));

withdrawList.innerHTML=`
<div style="display:flex;font-weight:bold;">
<div style="flex:1;">Name</div>
<div style="flex:1;">Date</div>
<div style="flex:1;">Time</div>
<div style="flex:1;">Amount</div>
<div style="flex:1;">Status</div>
</div>
`;

snap.forEach(d=>{
let data=d.data();

if(data.user===user){
withdrawList.innerHTML+=`
<div style="display:flex;background:#fff;color:black;margin:5px;padding:8px;">
<div style="flex:1;">${data.name}</div>
<div style="flex:1;">${data.date}</div>
<div style="flex:1;">${data.time}</div>
<div style="flex:1;">₹${data.amount}</div>
<div style="flex:1;color:${data.status=="Done"?"green":"orange"};">${data.status}</div>
</div>`;
}
});
}

// ===== LOGOUT =====
window.logout=()=>{
localStorage.clear();
location.reload();
}