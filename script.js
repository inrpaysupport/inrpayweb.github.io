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

// ===== DEFAULT VIEW =====
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
    return alert("Fill all fields");
  }

  await setDoc(doc(db, "users", number), {
    name,
    password,
    balance: 0
  });

  alert("Account Created");
  showLogin();
};

// ===== LOGIN =====
window.login = async () => {
  let number = numberInput.value.trim();
  let password = passwordInput.value.trim();

  if (!number || !password) {
    return alert("Enter details");
  }

  let snap = await getDoc(doc(db, "users", number));

  if (!snap.exists()) return alert("User not found");

  let user = snap.data();

  if (user.password !== password) {
    return alert("Wrong password");
  }

  auth.style.display = "none";
  appDiv.style.display = "block";

  usernameHome.innerText = user.name;
  username2.innerText = user.name;
  usernumber.innerText = number;

  localStorage.setItem("user", number);

  loadEarnings();
  loadWithdraw();
};

// ===== NAV =====
window.showPage = (id) => {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
};

// ===== EARNINGS TABLE =====
function loadEarnings() {
  let user = localStorage.getItem("user");

  earningList.innerHTML = `
  <div style="display:flex;font-weight:bold;">
    <div style="flex:1;">Name</div>
    <div style="flex:1;">Date</div>
    <div style="flex:1;">Time</div>
    <div style="flex:1;">Amount</div>
    <div style="flex:1;">Status</div>
  </div>`;

  for (let i = 0; i < 30; i++) {
    let d = new Date();
    d.setDate(d.getDate() - i);

    earningList.innerHTML += `
    <div style="display:flex;background:#fff;color:black;margin:5px;padding:8px;">
      <div style="flex:1;">${user}</div>
      <div style="flex:1;">${d.toLocaleDateString()}</div>
      <div style="flex:1;">${d.toLocaleTimeString()}</div>
      <div style="flex:1;">₹${Math.floor(Math.random()*100)}</div>
      <div style="flex:1;color:green;">Done</div>
    </div>`;
  }
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

  alert("Withdraw Submitted");
  loadWithdraw();
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw() {
  let user = localStorage.getItem("user");
  let snap = await getDocs(collection(db, "withdraw"));

  withdrawList.innerHTML = `
  <div style="display:flex;font-weight:bold;">
    <div style="flex:1;">Name</div>
    <div style="flex:1;">Date</div>
    <div style="flex:1;">Time</div>
    <div style="flex:1;">Amount</div>
    <div style="flex:1;">Status</div>
  </div>`;

  snap.forEach(d => {
    let data = d.data();

    if (data.user === user) {
      withdrawList.innerHTML += `
      <div style="display:flex;background:#fff;color:black;margin:5px;padding:8px;">
        <div style="flex:1;">${data.name}</div>
        <div style="flex:1;">${data.date}</div>
        <div style="flex:1;">${data.time}</div>
        <div style="flex:1;">₹${data.amount}</div>
        <div style="flex:1;color:${data.status=="Done"?"green":"orange"};">
          ${data.status}
        </div>
      </div>`;
    }
  });
}

// ===== LOGOUT =====
window.logout = () => {
  localStorage.clear();
  location.reload();
};