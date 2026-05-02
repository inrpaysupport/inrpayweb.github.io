import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== DOM =====
const nameInput = document.getElementById("name");
const numberInput = document.getElementById("number");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authTitle = document.getElementById("authTitle");
const toggleText = document.getElementById("toggleText");

const auth = document.getElementById("auth");
const appDiv = document.getElementById("app");

const usernameHome = document.getElementById("usernameHome");
const username2 = document.getElementById("username2");
const usernumber = document.getElementById("usernumber");
const useridText = document.getElementById("userid"); // NEW

const withdrawBox = document.getElementById("withdrawBox");
const withdrawList = document.getElementById("withdrawList");

const earningList = document.getElementById("earningList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

const forgotBox = document.getElementById("forgotBox");

// ===== MESSAGE =====
function showMsg(t){
  msgText.innerText = t;
  msgBox.style.display = "flex";
}
window.closeMsg = ()=> msgBox.style.display="none";

// ===== DEFAULT =====
window.onload = () => {
  showRegister();
};

// ===== TOGGLE =====
window.showLogin = () => {
  authTitle.innerText = "Sign In";
  nameInput.style.display = "none";
  loginBtn.style.display = "block";
  registerBtn.style.display = "none";

  toggleText.innerHTML = `
  Don't have an account? 
  <span onclick="showRegister()">Sign Up</span>`;
};

window.showRegister = () => {
  authTitle.innerText = "Create Account";
  nameInput.style.display = "block";
  loginBtn.style.display = "none";
  registerBtn.style.display = "block";

  toggleText.innerHTML = `
  Already have an account? 
  <span onclick="showLogin()">Sign In</span>`;
};

// ===== REGISTER =====
window.register = async () => {

let name = nameInput.value.trim();
let number = numberInput.value.trim();
let password = passwordInput.value.trim();

if (!name || !number || !password) {
  return showMsg("Fill all fields");
}

// 🔥 random user id
let userId = Math.floor(100000 + Math.random()*900000);

await setDoc(doc(db, "users", number), {
  name,
  password,
  balance: 0,
  userId
});

showMsg("Account Created");
showLogin();
};

// ===== LOGIN =====
window.login = async () => {

let number = numberInput.value.trim();
let password = passwordInput.value.trim();

if (!number || !password) {
  return showMsg("Enter details");
}

let snap = await getDoc(doc(db, "users", number));

if (!snap.exists()) return showMsg("User not found");

let user = snap.data();

if (user.password !== password) {
  return showMsg("Wrong password");
}

auth.style.display = "none";
appDiv.style.display = "block";

usernameHome.innerText = user.name;
username2.innerText = user.name;
usernumber.innerText = number;
useridText.innerText = "User ID: " + user.userId;

localStorage.setItem("user", number);

loadEarnings();
loadWithdraw();
};

// ===== NAV =====
window.showPage = (id) => {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
};

// ===== EARNINGS (REAL DATA ONLY) =====
async function loadEarnings() {

let user = localStorage.getItem("user");
let snap = await getDocs(collection(db, "withdraw"));

earningList.innerHTML = "";

snap.forEach(d => {
let data = d.data();

if (data.user === user && data.status === "Done") {
earningList.innerHTML += `
<div style="background:white;color:black;margin:5px;padding:10px;border-radius:10px;display:flex;justify-content:space-between;">
<span>${data.date}</span>
<span>₹${data.amount}</span>
</div>`;
}
});
}

// ===== WITHDRAW =====
window.openWithdraw = () => {
  withdrawBox.style.display = "flex";
  loadWithdraw();
};

window.closeWithdraw = () => {
  withdrawBox.style.display = "none";
};

window.submitWithdraw = async () => {

await setDoc(doc(db, "withdraw", Date.now() + ""), {
  user: localStorage.getItem("user"),
  name: document.getElementById("wName").value,
  account: document.getElementById("wAcc").value,
  ifsc: document.getElementById("wIfsc").value,
  amount: 1000,
  status: "Process",
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString()
});

showMsg("Withdraw Submitted");
loadWithdraw();
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw() {

let user = localStorage.getItem("user");
let snap = await getDocs(collection(db, "withdraw"));

withdrawList.innerHTML = "";

snap.forEach(d => {
let data = d.data();

if (data.user === user) {
withdrawList.innerHTML += `
<div style="background:white;color:black;margin:5px;padding:10px;border-radius:10px;">
${data.date} - ₹${data.amount} - ${data.status}
</div>`;
}
});
}

// ===== FORGOT PASSWORD =====
window.openForgot = ()=> forgotBox.style.display="flex";
window.closeForgot = ()=> forgotBox.style.display="none";

let otp = "";

window.sendOtp = ()=>{
otp = Math.floor(1000 + Math.random()*9000);
showMsg("OTP: " + otp);
}

window.resetPass = async ()=>{

let num = document.getElementById("fNumber").value;
let userOtp = document.getElementById("fOtp").value;
let newPass = document.getElementById("fNewPass").value;

if(userOtp != otp){
return showMsg("Wrong OTP");
}

await updateDoc(doc(db,"users",num),{
password:newPass
});

showMsg("Password Updated");
closeForgot();
}

// ===== LOGOUT =====
window.logout = () => {
  localStorage.clear();
  location.reload();
};