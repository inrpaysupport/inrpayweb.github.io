// 🔥 FIREBASE IMPORT
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 FIREBASE CONFIG (MINIMAL WORKING)
const firebaseConfig = {
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
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
const useridText = document.getElementById("userid");

const withdrawBox = document.getElementById("withdrawBox");
const withdrawList = document.getElementById("withdrawList");

const earningList = document.getElementById("earningList");

const depositBox = document.getElementById("depositBox");
const depositList = document.getElementById("depositList");

const bankBox = document.getElementById("bankBox");
const bankList = document.getElementById("bankList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

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
  Don't have account? <span onclick="showRegister()">Sign Up</span>`;
};

window.showRegister = () => {
  authTitle.innerText = "Create Account";
  nameInput.style.display = "block";
  loginBtn.style.display = "none";
  registerBtn.style.display = "block";

  toggleText.innerHTML = `
  Already have account? <span onclick="showLogin()">Sign In</span>`;
};

// ===== REGISTER =====
window.register = async () => {

let name = nameInput.value.trim();
let number = numberInput.value.trim();
let password = passwordInput.value.trim();

if (!name || !number || !password) {
  return showMsg("Fill all fields");
}

// 🔥 user id
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
useridText.innerText = "User ID: " + (user.userId || "000000");

localStorage.setItem("user", number);

loadEarnings();
loadWithdraw();
loadDeposits();
loadBanks();
};

// ===== NAV =====
window.showPage = (id) => {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
};

// ===== EARNINGS =====
async function loadEarnings() {

let user = localStorage.getItem("user");
let snap = await getDocs(collection(db, "withdraw"));

earningList.innerHTML = "";

snap.forEach(d => {
let data = d.data();

if (data.user === user && data.status === "Done") {
earningList.innerHTML += `
<div class="listItem">
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
<div class="listItem">
${data.date} - ₹${data.amount} - ${data.status}
</div>`;
}
});
}

// ===== DEPOSIT =====
window.deposit = () => {
  depositBox.style.display = "flex";
  loadDeposits();
};

window.closeDeposit = () => {
  depositBox.style.display = "none";
};

window.submitDeposit = async () => {

await setDoc(doc(db, "deposits", Date.now() + ""), {
  user: localStorage.getItem("user"),
  utr: document.getElementById("utr").value,
  status: "Pending",
  date: new Date().toLocaleDateString()
});

showMsg("Deposit Submitted");
loadDeposits();
};

// ===== LOAD DEPOSIT =====
async function loadDeposits(){
let user = localStorage.getItem("user");
let snap = await getDocs(collection(db, "deposits"));

depositList.innerHTML="";

snap.forEach(d=>{
let data = d.data();

if(data.user === user){
depositList.innerHTML += `
<div class="listItem">
${data.utr} - ${data.status}
</div>`;
}
});
}

// ===== BANK =====
window.openBank = ()=>{
bankBox.style.display="flex";
loadBanks();
};

window.closeBank = ()=>{
bankBox.style.display="none";
};

window.saveBank = async ()=>{

await setDoc(doc(db,"bank",Date.now()+""),{
user:localStorage.getItem("user"),
bank:document.getElementById("bankName").value,
account:document.getElementById("accNumber").value
});

showMsg("Bank Added");
loadBanks();
};

// ===== LOAD BANK =====
async function loadBanks(){
let user = localStorage.getItem("user");
let snap = await getDocs(collection(db,"bank"));

bankList.innerHTML="";

snap.forEach(d=>{
let data = d.data();

if(data.user === user){
bankList.innerHTML += `
<div class="listItem">
${data.bank} - ${data.account}
</div>`;
}
});
}

// ===== LOGOUT =====
window.logout = ()=>{
localStorage.clear();
location.reload();
};