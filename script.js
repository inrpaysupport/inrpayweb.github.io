import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== DOM =====
const splash = document.getElementById("splash");
const auth = document.getElementById("auth");
const appDiv = document.getElementById("app");

const nameInput = document.getElementById("name");
const numberInput = document.getElementById("number");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authTitle = document.getElementById("authTitle");
const toggleText = document.getElementById("toggleText");

const usernameHome = document.getElementById("usernameHome");
const username2 = document.getElementById("username2");
const usernumber = document.getElementById("usernumber");
const balance = document.getElementById("balance");

const depositBox = document.getElementById("depositBox");
const depositList = document.getElementById("depositList");
const utrInput = document.getElementById("utr");

const bankBox = document.getElementById("bankBox");
const bankList = document.getElementById("bankList");
const bankNameInput = document.getElementById("bankName");
const accNumberInput = document.getElementById("accNumber");

const withdrawBox = document.getElementById("withdrawBox");
const withdrawList = document.getElementById("withdrawList");

const earningList = document.getElementById("earningList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

// ===== SPLASH =====
setTimeout(()=>{
  splash.style.display="none";
  auth.style.display="flex";
  showRegister();
},2000);

// ===== MESSAGE =====
function showMsg(t){
  msgText.innerText=t;
  msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// ===== TOGGLE =====
window.showLogin = ()=>{
  authTitle.innerText="Sign In";
  nameInput.style.display="none";
  loginBtn.style.display="block";
  registerBtn.style.display="none";

  toggleText.innerHTML=`Don't have account? 
  <span onclick="showRegister()">Sign Up</span>`;
}

window.showRegister = ()=>{
  authTitle.innerText="Create Account";
  nameInput.style.display="block";
  loginBtn.style.display="none";
  registerBtn.style.display="block";

  toggleText.innerHTML=`Already have account? 
  <span onclick="showLogin()">Sign In</span>`;
}

// ===== REGISTER =====
window.register = async ()=>{
  let name = nameInput.value.trim();
  let number = numberInput.value.trim();
  let password = passwordInput.value.trim();

  if(!name || !number || !password){
    return showMsg("Fill all fields");
  }

  await setDoc(doc(db,"users",number),{
    name,
    password,
    balance:0
  });

  showMsg("Account Created ✅");
  showLogin();
}

// ===== LOGIN =====
window.login = async ()=>{
  let number = numberInput.value.trim();
  let password = passwordInput.value.trim();

  if(!number || !password){
    return showMsg("Enter details");
  }

  let snap = await getDoc(doc(db,"users",number));

  if(!snap.exists()) return showMsg("User not found");

  let user = snap.data();

  if(user.password !== password){
    return showMsg("Wrong password");
  }

  auth.style.display="none";
  appDiv.style.display="block";

  document.querySelector(".bottomNav").style.display="flex";

  usernameHome.innerText=user.name;
  username2.innerText=user.name;
  usernumber.innerText=number;
  balance.innerText="₹"+user.balance;

  localStorage.setItem("user",number);

  loadEarnings();
  loadDeposits();
  loadBanks();
}

// ===== NAV =====
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
}

// ===== LOGOUT =====
window.logout = ()=>{
  localStorage.clear();
  location.reload();
}

// ===== DEPOSIT =====
window.deposit = ()=> depositBox.style.display="flex";
window.closeDeposit = ()=> depositBox.style.display="none";

window.submitDeposit = async ()=>{
  if(!utrInput.value) return showMsg("Enter UTR");

  await setDoc(doc(db,"deposits",Date.now()+""),{
    user:localStorage.getItem("user"),
    utr:utrInput.value,
    status:"pending",
    time:new Date().toLocaleString()
  });

  utrInput.value="";
  showMsg("Deposit Submitted");
  loadDeposits();
}

// ===== LOAD DEPOSITS =====
async function loadDeposits(){
  let user=localStorage.getItem("user");
  let snap=await getDocs(collection(db,"deposits"));

  depositList.innerHTML="";

  snap.forEach(d=>{
    let data=d.data();
    if(data.user===user){
      depositList.innerHTML+=`<div>${data.utr} - ${data.status}</div>`;
    }
  });
}

// ===== BANK =====
window.openBank = ()=>{
  bankBox.style.display="flex";
  loadBanks();
}
window.closeBank = ()=> bankBox.style.display="none";

window.saveBank = async ()=>{
  if(!bankNameInput.value || !accNumberInput.value){
    return showMsg("Fill bank details");
  }

  await setDoc(doc(db,"bank",Date.now()+""),{
    user:localStorage.getItem("user"),
    bank:bankNameInput.value,
    account:accNumberInput.value
  });

  bankNameInput.value="";
  accNumberInput.value="";
  showMsg("Bank Added");
  loadBanks();
}

// ===== LOAD BANK =====
async function loadBanks(){
  let user=localStorage.getItem("user");
  let snap=await getDocs(collection(db,"bank"));

  bankList.innerHTML="";

  snap.forEach(d=>{
    let data=d.data();
    if(data.user===user){
      bankList.innerHTML+=`<div>${data.bank} - ${data.account}</div>`;
    }
  });
}

// ===== EARNINGS =====
function loadEarnings(){
  earningList.innerHTML="";
  for(let i=1;i<=30;i++){
    earningList.innerHTML+=`<div>Day ${i} - ₹${Math.floor(Math.random()*100)}</div>`;
  }
}

// ===== WITHDRAW =====
window.openWithdraw = ()=>{
  withdrawBox.style.display="flex";
  loadWithdraw();
}
window.closeWithdraw = ()=> withdrawBox.style.display="none";

window.submitWithdraw = async ()=>{
  await setDoc(doc(db,"withdraw",Date.now()+""),{
    user:localStorage.getItem("user"),
    time:new Date().toLocaleString()
  });

  showMsg("Withdraw Request Sent");
  loadWithdraw();
}

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){
  let user=localStorage.getItem("user");
  let snap=await getDocs(collection(db,"withdraw"));

  withdrawList.innerHTML="";

  snap.forEach(d=>{
    let data=d.data();
    if(data.user===user){
      withdrawList.innerHTML+=`<div>${data.time}</div>`;
    }
  });
}

// ===== PASSWORD =====
window.changePassword = async ()=>{
  await updateDoc(doc(db,"users",localStorage.getItem("user")),{
    password:document.getElementById("newPass").value
  });

  showMsg("Password Updated");
}