import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 YOUR CONFIG (already added)
const firebaseConfig = {
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413",
  storageBucket: "inrpay-44413.firebasestorage.app",
  messagingSenderId: "642534834276",
  appId: "1:642534834276:web:601fa7327a3e896df71f71",
  measurementId: "G-H04H3VLEEF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🔐 REGISTER
window.register = async function(){
let name=nameInput();
let number=numberInput();
let password=passwordInput();

let ref = doc(db,"users",number);
let snap = await getDoc(ref);

if(snap.exists()){
alert("User exists");
return;
}

await setDoc(ref,{
name,
number,
password,
balance:0
});

alert("Account created");
}

// 🔐 LOGIN
window.login = async function(){
let number=numberInput();
let password=passwordInput();

let ref = doc(db,"users",number);
let snap = await getDoc(ref);

if(!snap.exists()){
alert("User not found");
return;
}

let user=snap.data();

if(user.password!==password){
alert("Wrong password");
return;
}

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number);
}

// 💳 DEPOSIT
window.deposit = async function(){
let number=localStorage.getItem("user");

let ref=doc(db,"users",number);
let snap=await getDoc(ref);

let user=snap.data();
let newBalance=user.balance+1000;

await updateDoc(ref,{balance:newBalance});

balance.innerText="₹"+newBalance;

alert("₹1000 Added");
}

// 🚪 LOGOUT
window.logout=function(){
localStorage.clear();
location.reload();
}

// 💬 SUPPORT
window.openSupport=function(){
supportBox.style.display="flex";
}

window.closeSupport=function(){
supportBox.style.display="none";
}

window.autoReply=function(){
supportMsg.innerText="Please wait 30 minutes to 1 hour. Our representative will contact you.";
}

// 🔄 AUTO LOGIN
window.onload=async function(){
let number=localStorage.getItem("user");

if(number){
let ref=doc(db,"users",number);
let snap=await getDoc(ref);

if(snap.exists()){
let user=snap.data();

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;
}
}
}

// 🔧 helper
function nameInput(){return document.getElementById("name").value;}
function numberInput(){return document.getElementById("number").value;}
function passwordInput(){return document.getElementById("password").value;}