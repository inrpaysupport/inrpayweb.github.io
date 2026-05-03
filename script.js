import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 FIREBASE
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== DOM =====
const name = document.getElementById("name");
const number = document.getElementById("number");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authTitle = document.getElementById("authTitle");
const toggleText = document.getElementById("toggleText");
const forgotText = document.getElementById("forgotText");

const auth = document.getElementById("auth");
const appDiv = document.getElementById("app");

const usernameHome = document.getElementById("usernameHome");
const username2 = document.getElementById("username2");
const usernumber = document.getElementById("usernumber");

const earningList = document.getElementById("earningList");

const withdrawBox = document.getElementById("withdrawBox");
const withdrawList = document.getElementById("withdrawList");

const depositBox = document.getElementById("depositBox");
const depositList = document.getElementById("depositList");

const bankBox = document.getElementById("bankBox");
const bankList = document.getElementById("bankList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

const txStatus = document.getElementById("txStatus");

// ===== MESSAGE =====
function showMsg(t){
  msgText.innerText = t;
  msgBox.style.display = "flex";
}
window.closeMsg = () => msgBox.style.display = "none";

// ===== DEFAULT =====
window.onload = () => {
  showRegister();
};

// ===== TOGGLE =====
window.showLogin = () => {
  authTitle.innerText = "Sign In";
  name.style.display = "none";
  loginBtn.style.display = "block";
  registerBtn.style.display = "none";
  forgotText.style.display = "block";

  toggleText.innerHTML = `Don't have account? 
  <span onclick="showRegister()">Sign Up</span>`;
};

window.showRegister = () => {
  authTitle.innerText = "Create Account";
  name.style.display = "block";
  loginBtn.style.display = "none";
  registerBtn.style.display = "block";
  forgotText.style.display = "none";

  toggleText.innerHTML = `Already have account? 
  <span onclick="showLogin()">Sign In</span>`;
};

// ===== REGISTER =====
window.register = async () => {

  if(!name.value || !number.value || !password.value){
    return showMsg("Fill all fields");
  }

  await setDoc(doc(db,"users",number.value),{
    name:name.value,
    password:password.value,
    balance:0
  });

  showMsg("Account Created");
  showLogin();
};

// ===== LOGIN =====
window.login = async () => {

  if(!number.value || !password.value){
    return showMsg("Enter details");
  }

  let snap = await getDoc(doc(db,"users",number.value));

  if(!snap.exists()) return showMsg("User not found");

  let user = snap.data();

  if(user.password !== password.value){
    return showMsg("Wrong password");
  }

  auth.style.display = "none";
  appDiv.style.display = "block";

  usernameHome.innerText = user.name;
  username2.innerText = user.name;
  usernumber.innerText = number.value;

  localStorage.setItem("user",number.value);

  loadEarnings();
  loadWithdraw();
  loadDeposits();
  loadBanks();
  loadTxStatus();
};

// ===== NAV =====
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
};

// ===== POPUP FIX =====
function openPopup(el){ el.classList.add("active"); }
function closePopup(el){ el.classList.remove("active"); }

// ===== CLICK OUTSIDE CLOSE =====
document.querySelectorAll(".popup").forEach(p=>{
  p.addEventListener("click",(e)=>{
    if(e.target === p){
      p.classList.remove("active");
    }
  });
});

// ===== DEPOSIT =====
window.deposit = ()=> openPopup(depositBox);
window.closeDeposit = ()=> closePopup(depositBox);

window.submitDeposit = async ()=>{

  if(!utr.value) return showMsg("Enter UTR");

  await setDoc(doc(db,"deposits",Date.now()+""),{
    user:localStorage.getItem("user"),
    utr:utr.value,
    status:"Pending",
    date:new Date().toLocaleDateString()
  });

  showMsg("Deposit Submitted");
  loadDeposits();
};

// ===== LOAD DEPOSIT =====
async function loadDeposits(){
  let user = localStorage.getItem("user");
  let snap = await getDocs(collection(db,"deposits"));

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
window.openBank = ()=> openPopup(bankBox);
window.closeBank = ()=> closePopup(bankBox);

window.saveBank = async ()=>{

  if(!bankName.value || !accNumber.value){
    return showMsg("Fill bank details");
  }

  await setDoc(doc(db,"bank",Date.now()+""),{
    user:localStorage.getItem("user"),
    bank:bankName.value,
    account:accNumber.value
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

// ===== EARNINGS =====
async function loadEarnings(){
  let user = localStorage.getItem("user");
  let snap = await getDocs(collection(db,"withdraw"));

  earningList.innerHTML="";

  snap.forEach(d=>{
    let data = d.data();

    if(data.user===user && data.status==="Done"){
      earningList.innerHTML += `
      <div class="listItem">
      <span>${data.date}</span>
      <span>₹${data.amount}</span>
      </div>`;
    }
  });
}

// ===== WITHDRAW =====
window.openWithdraw = ()=> openPopup(withdrawBox);
window.closeWithdraw = ()=> closePopup(withdrawBox);

window.submitWithdraw = async ()=>{

  let user = localStorage.getItem("user");
  let snap = await getDoc(doc(db,"users",user));
  let bal = snap.data().balance || 0;

  if(bal === 0) return showMsg("Balance is 0");
  if(bal < 200) return showMsg("Minimum ₹200 required");

  await setDoc(doc(db,"withdraw",Date.now()+""),{
    user:user,
    name:wName.value,
    account:wAcc.value,
    ifsc:wIfsc.value,
    amount:bal,
    status:"Process",
    date:new Date().toLocaleDateString(),
    time:new Date().toLocaleTimeString()
  });

  await updateDoc(doc(db,"users",user),{
    balance:0
  });

  showMsg("Withdraw Submitted");
  loadWithdraw();
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){
  let user = localStorage.getItem("user");
  let snap = await getDocs(collection(db,"withdraw"));

  withdrawList.innerHTML="";

  snap.forEach(d=>{
    let data = d.data();

    if(data.user === user){
      withdrawList.innerHTML += `
      <div class="listItem">
      ${data.date} - ₹${data.amount} - ${data.status}
      </div>`;
    }
  });
}

// ===== TRANSACTION STATUS =====
async function loadTxStatus(){
  let snap = await getDoc(doc(db,"settings","tx"));

  if(snap.exists()){
    txStatus.innerText = snap.data().status;
  }else{
    txStatus.innerText = "Deactivate";
  }
}

// ===== PASSWORD CHANGE =====
window.changePassword = async ()=>{

  let user = localStorage.getItem("user");
  let snap = await getDoc(doc(db,"users",user));
  let data = snap.data();

  if(oldPass.value !== data.password){
    return showMsg("Wrong old password");
  }

  if(newPass.value !== confirmPass.value){
    return showMsg("Password not match");
  }

  await updateDoc(doc(db,"users",user),{
    password:newPass.value
  });

  showMsg("Password Updated");
};

// ===== FORGOT =====
window.openForgot = ()=> document.getElementById("forgotBox").classList.add("active");
window.closeForgot = ()=> document.getElementById("forgotBox").classList.remove("active");

let otp = "";

window.sendOtp = ()=>{
  otp = Math.floor(1000 + Math.random()*9000);
  showMsg("OTP: "+otp);
};

window.resetPass = async ()=>{
  if(document.getElementById("fOtp").value != otp){
    return showMsg("Wrong OTP");
  }

  await updateDoc(doc(db,"users",document.getElementById("fNumber").value),{
    password:document.getElementById("fNewPass").value
  });

  showMsg("Password Updated");
};

// ===== LOGOUT =====
window.logout = ()=>{
  localStorage.clear();
  location.reload();
};