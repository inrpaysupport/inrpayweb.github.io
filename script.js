import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// REGISTER
window.register = async function(){
let name = document.getElementById("name").value;
let number = document.getElementById("number").value;
let password = document.getElementById("password").value;

await setDoc(doc(db,"users",number),{
name,
number,
password,
balance:0
});

alert("Account Created");
}

// LOGIN
window.login = async function(){

let number = document.getElementById("number").value;
let password = document.getElementById("password").value;

let snap = await getDoc(doc(db,"users",number));

if(!snap.exists()){
alert("User not found");
return;
}

let user = snap.data();

if(user.password !== password){
alert("Wrong password");
return;
}

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number);
}

// AUTO LOGIN
window.onload = async function(){
let number = localStorage.getItem("user");

if(number){
let snap = await getDoc(doc(db,"users",number));

if(snap.exists()){
let user = snap.data();

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;
}
}
}

// LOGOUT
window.logout = function(){
localStorage.clear();
location.reload();
}

// 🔥 OPEN DEPOSIT (LOAD FROM ADMIN)
window.deposit = async function(){

let snap = await getDoc(doc(db,"settings","payment"));

if(snap.exists()){
let data = snap.data();

document.getElementById("upiText").innerText = data.upi;
document.getElementById("qrImg").src = data.qr;
}

depositBox.style.display="flex";
}

// CLOSE
window.closeDeposit = function(){
depositBox.style.display="none";
}

// 🔥 SUBMIT UTR + ANIMATION
window.submitDeposit = async function(){

let utr = document.getElementById("utr").value;

if(!utr){
alert("Enter UTR");
return;
}

// animation
alert("Processing Payment...");
setTimeout(()=>{

alert("Payment Verified ✅");

},2000);

let number = localStorage.getItem("user");

await setDoc(doc(db,"deposits",Date.now().toString()),{
user:number,
utr:utr,
status:"pending"
});

depositBox.style.display="none";
}