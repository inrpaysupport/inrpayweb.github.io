import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// 🔥 MESSAGE
function showMsg(text){
document.getElementById("msgText").innerText = text;
msgBox.style.display="flex";
}
window.closeMsg = ()=> msgBox.style.display="none";

// 🔐 REGISTER
window.register = async function(){

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
window.login = async function(){

let numberVal = document.getElementById("number").value;
let passVal = document.getElementById("password").value;

if(!numberVal || !passVal){
showMsg("Enter number & password");
return;
}

let snap = await getDoc(doc(db,"users",numberVal));

if(!snap.exists()){
showMsg("User not found");
return;
}

let user = snap.data();

if(user.password !== passVal){
showMsg("Wrong password");
return;
}

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",numberVal);
}

// 🔄 AUTO LOGIN
window.onload = async function(){
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
window.logout = function(){
localStorage.clear();
location.reload();
}