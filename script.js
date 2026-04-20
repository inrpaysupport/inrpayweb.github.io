import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 REGISTER
window.register = async function(){

alert("Clicked");

try{

let name = document.getElementById("name").value;
let number = document.getElementById("number").value;
let password = document.getElementById("password").value;

alert("Inputs OK"); // step 1

let ref = doc(db,"users",number);

alert("Doc created"); // step 2

await setDoc(ref,{
name,
number,
password,
balance:0
});

alert("Data saved"); // step 3

}catch(e){
alert("ERROR: " + e.message);
}

}

// 🔐 LOGIN
window.login = async function(){

let number = document.getElementById("number").value;
let password = document.getElementById("password").value;

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

localStorage.setItem("user",number);
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

// AUTO LOGIN
window.onload = async function(){
let number = localStorage.getItem("user");

if(number){
let ref = doc(db,"users",number);
let snap = await getDoc(ref);

if(snap.exists()){
let user = snap.data();

auth.style.display="none";
dashboard.style.display="block";

username.innerText=user.name;
balance.innerText="₹"+user.balance;
}
}
}