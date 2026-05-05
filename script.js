import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
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

const depositBox = document.getElementById("depositBox");
const bankBox = document.getElementById("bankBox");
const withdrawBox = document.getElementById("withdrawBox");

const withdrawList = document.getElementById("withdrawList");

const msgBox = document.getElementById("msgBox");
const msgText = document.getElementById("msgText");

// ===== MESSAGE =====
function showMsg(t){
  msgText.innerText = t;
  msgBox.classList.add("active");
}
window.closeMsg = ()=> msgBox.classList.remove("active");

// ===== DEFAULT (REGISTER FIRST) =====
window.onload = () => {
  showRegister();
};

// ===== REGISTER MODE =====
window.showRegister = () => {

  authTitle.innerText = "Create Account";

  name.style.display = "block";
  loginBtn.style.display = "none";
  registerBtn.style.display = "block";

  if(forgotText) forgotText.style.display = "none";

  toggleText.innerHTML = `
  Already have an account? 
  <span onclick="showLogin()">Sign In</span>`;
};

// ===== LOGIN MODE =====
window.showLogin = () => {

  authTitle.innerText = "Sign In";

  name.style.display = "none";
  loginBtn.style.display = "block";
  registerBtn.style.display = "none";

  if(forgotText) forgotText.style.display = "block";

  toggleText.innerHTML = `
  Don't have an account? 
  <span onclick="showRegister()">Sign Up</span>`;
};

// ===== REGISTER =====
window.register = async () => {

  if(!name.value || !number.value || !password.value){
    return showMsg("Fill all fields");
  }

  await setDoc(doc(db,"users",number.value),{
    name: name.value,
    password: password.value,
    balance: 0
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

  localStorage.setItem("user", number.value);

  loadWithdraw();
};

// ===== NAV =====
window.showPage = (id) => {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
};

// ===== POPUP =====
function openPopup(el){ el.classList.add("active"); }
function closePopup(el){ el.classList.remove("active"); }

// ===== DEPOSIT =====
window.deposit = () => openPopup(depositBox);
window.closeDeposit = () => closePopup(depositBox);

// ===== BANK =====
window.openBank = () => openPopup(bankBox);
window.closeBank = () => closePopup(bankBox);

// ===== WITHDRAW =====
window.openWithdraw = () => {
  openPopup(withdrawBox);
  loadWithdraw();
};

window.closeWithdraw = () => closePopup(withdrawBox);

// ===== SUBMIT WITHDRAW =====
window.submitWithdraw = async () => {

  let amt = Number(document.getElementById("wAmount").value);

  if(amt < 200){
    return showMsg("Minimum ₹200 required");
  }

  await setDoc(doc(db,"withdraw",Date.now()+""),{
    user: localStorage.getItem("user"),
    amount: amt,
    status: "Process",
    date: new Date().toLocaleDateString()
  });

  showMsg("Withdraw Submitted");
  loadWithdraw();
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){

  let snap = await getDocs(collection(db,"withdraw"));

  withdrawList.innerHTML = "";

  snap.forEach(d=>{
    let data = d.data();

    if(data.user === localStorage.getItem("user")){
      withdrawList.innerHTML += `
      <div class="listItem">
      ${data.date} - ₹${data.amount} - ${data.status}
      </div>`;
    }
  });
}

// ===== PASSWORD CHANGE =====
window.changePassword = async () => {

  let user = localStorage.getItem("user");

  await updateDoc(doc(db,"users",user),{
    password: document.getElementById("newPass").value
  });

  showMsg("Password Updated");
};

// ===== LOGOUT =====
window.logout = () => {
  localStorage.clear();
  location.reload();
};