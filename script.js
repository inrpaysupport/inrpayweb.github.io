import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== MESSAGE =====
function showMsg(t){
  msgText.innerText = t;
  msgBox.classList.add("active");
}
window.closeMsg = ()=> msgBox.classList.remove("active");

// ===== PASSWORD TOGGLE =====
window.togglePass = ()=>{
  let p = document.getElementById("password");
  p.type = p.type === "password" ? "text" : "password";
};

// ===== NUMBER VALIDATION =====
document.getElementById("number").addEventListener("input", function(){
  this.value = this.value.replace(/\D/g,"").slice(0,10);
});

// ===== DEFAULT =====
window.onload = ()=>{
  showRegister();
};

// ===== TOGGLE =====
window.showRegister = ()=>{
  authTitle.innerText = "Create Account";

  document.getElementById("name").style.display = "block";
  registerBtn.style.display = "block";
  loginBtn.style.display = "none";

  document.getElementById("forgotText").style.display = "none"; // ❌ hide

  toggleText.innerHTML =
  `Already have account? <span onclick="showLogin()">Sign In</span>`;
};

window.showLogin = ()=>{
  authTitle.innerText = "Sign In";

  document.getElementById("name").style.display = "none";
  registerBtn.style.display = "none";
  loginBtn.style.display = "block";

  document.getElementById("forgotText").style.display = "block"; // ✅ show

  toggleText.innerHTML =
  `Don't have account? <span onclick="showRegister()">Sign Up</span>`;
};

// ===== REGISTER =====
window.register = async ()=>{
  if(!name.value || !number.value || !password.value){
    return showMsg("Fill all fields");
  }

  let uid = Math.floor(100000 + Math.random()*900000);

  await setDoc(doc(db,"users",number.value),{
    name: name.value,
    password: password.value,
    uid: uid,
    balance: 0
  });

  showMsg("Account Created");
  showLogin();
};

// ===== LOGIN =====
window.login = async ()=>{
  let snap = await getDoc(doc(db,"users",number.value));

  if(!snap.exists()) return showMsg("User not found");

  let user = snap.data();

  if(user.password !== password.value){
    return showMsg("Wrong password");
  }

  auth.style.display = "none";
  app.style.display = "block";

  usernameHome.innerText = user.name;
  username2.innerText = user.name;
  usernumber.innerText = number.value;
  userid.innerText = "UID: " + user.uid;

  localStorage.setItem("user", number.value);

  loadWithdraw();
  loadAccount();
};

// ===== NAV =====
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
};

// ===== WITHDRAW =====
window.openWithdraw = ()=>{
  withdrawBox.classList.add("active");
  loadWithdraw();
  loadAccount();
};

window.closeWithdraw = ()=>{
  withdrawBox.classList.remove("active");
};

// ===== WITHDRAW RULE =====
window.submitWithdraw = async ()=>{
  let amt = Number(wAmount.value);

  if(amt < 200){
    return showMsg("Minimum ₹200 balance required to withdraw");
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
      <div>${data.date} - ₹${data.amount} - ${data.status}</div>`;
    }
  });
}

// ===== SAVE ACCOUNT =====
window.saveAccount = async ()=>{
  await setDoc(doc(db,"bank",localStorage.getItem("user")),{
    name: accNameInput.value,
    account: accNumberInput.value,
    ifsc: ifscInput.value
  });

  showMsg("Account Saved");
};

// ===== LOAD ACCOUNT =====
async function loadAccount(){
  let snap = await getDoc(doc(db,"bank",localStorage.getItem("user")));

  if(snap.exists()){
    let d = snap.data();
    accNameInput.value = d.name || "";
    accNumberInput.value = d.account || "";
    ifscInput.value = d.ifsc || "";
  }
}

// ===== PASSWORD CHANGE =====
window.changePassword = async ()=>{
  await updateDoc(doc(db,"users",localStorage.getItem("user")),{
    password: newPass.value
  });

  showMsg("Password Updated");
};

// ===== LOGOUT =====
window.logout = ()=>{
  localStorage.clear();
  location.reload();
};