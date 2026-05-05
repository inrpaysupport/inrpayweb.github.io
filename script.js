import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain:"inrpay-44413.firebaseapp.com",
projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
get(id).style.display="block";
};

window.register=async()=>{
await setDoc(doc(db,"users",get("number").value),{
name:get("name").value,
password:get("password").value,
balance:0
});
alert("Registered");
};

window.login=async()=>{
let snap=await getDoc(doc(db,"users",get("number").value));
let user=snap.data();

if(user.password!==get("password").value){
return alert("Wrong password");
}

get("auth").style.display="none";
get("app").style.display="block";

localStorage.setItem("user",get("number").value);

loadUser();
};

async function loadUser(){
let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let bal=snap.data().balance||0;

get("balance").innerText=bal;
get("earnBalance").innerText=bal;

// account bind
let bankSnap=await getDoc(doc(db,"bank",localStorage.getItem("user")));
if(bankSnap.exists()){
get("bindStatus").innerText="Active";
get("bindDot").style.background="lime";
}else{
get("bindStatus").innerText="Deactivate";
get("bindDot").style.background="red";
}
}

window.deposit=()=>{
loadDepositSettings();
get("depositBox").style.display="block";
};

window.closeDeposit=()=>{
get("depositBox").style.display="none";
};

async function loadDepositSettings(){
let snap=await getDoc(doc(db,"settings","deposit"));
if(snap.exists()){
let d=snap.data();
get("depositAmountText").innerText="₹"+d.amount;
get("qrImage").src=d.qr;
get("upiText").innerText="UPI ID: "+d.upi;
}
}

window.submitDeposit=async()=>{
await setDoc(doc(db,"deposits",Date.now()+""),{
utr:get("utr").value,
user:localStorage.getItem("user")
});
alert("Submitted");
};

window.openBank=()=>{
alert("Bank popup already present in your old code");
};

window.changePassword=async()=>{
let oldP=get("oldPass").value;
let newP=get("newPass").value;
let confirmP=get("confirmPass").value;

let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let user=snap.data();

if(user.password!==oldP){
return alert("Wrong old password");
}

if(newP!==confirmP){
return alert("Mismatch");
}

await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:newP
});

alert("Changed");
};

// ✅ NAV FIX
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
};

// ✅ LOAD SETTINGS (QR / UPI / AMOUNT)
async function loadSettings(){
let snap=await getDoc(doc(db,"settings","main"));
if(snap.exists()){
let d=snap.data();

document.getElementById("qrImage").src=d.qr || "";
document.getElementById("upiText").innerText=d.upi || "upi@id";
document.getElementById("amountText").innerText="₹"+(d.amount || 1000);
}
}

// override deposit
window.deposit=()=>{
get("depositBox").classList.add("active");
loadSettings();
};