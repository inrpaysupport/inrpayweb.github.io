import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase config (अपना डालो)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 REGISTER
window.register = async function(){
let name=document.getElementById("name").value;
let number=document.getElementById("number").value;
let password=document.getElementById("password").value;

let ref = doc(db,"users",number);
let snap = await getDoc(ref);

if(snap.exists()){
alert("User already exists");
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
let number=document.getElementById("number").value;
let password=document.getElementById("password").value;

let ref = doc(db,"users",number);
let snap = await getDoc(ref);

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

localStorage.setItem("user", number);
}

// 💳 DEPOSIT
window.deposit = async function(){
let number = localStorage.getItem("user");

let ref = doc(db,"users",number);
let snap = await getDoc(ref);

let user = snap.data();
let newBalance = user.balance + 1000;

await updateDoc(ref,{balance:newBalance});

balance.innerText="₹"+newBalance;

alert("₹1000 Added");
}

// 🚪 LOGOUT
window.logout = function(){
localStorage.clear();
location.reload();
}

// 💬 SUPPORT
window.openSupport = function(){
supportBox.style.display="flex";
}

window.closeSupport = function(){
supportBox.style.display="none";
}

window.autoReply = function(){
supportMsg.innerText="Please wait 30 minutes to 1 hour. Our representative will contact you.";
}