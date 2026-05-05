import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

const get = (id)=>document.getElementById(id);

// MESSAGE
function showMsg(t){
  get("msgText").innerText = t;
  get("msgBox").classList.add("active");
}
window.closeMsg = ()=> get("msgBox").classList.remove("active");

// PASSWORD
window.togglePass = ()=>{
  let p = get("password");
  p.type = p.type==="password"?"text":"password";
};

// DEFAULT
window.onload = ()=> showRegister();

// TOGGLE
window.showRegister = ()=>{
  get("authTitle").innerText="Create Account";
  get("name").style.display="block";
  get("registerBtn").style.display="block";
  get("loginBtn").style.display="none";
  get("forgotText").style.display="none";
};

window.showLogin = ()=>{
  get("authTitle").innerText="Sign In";
  get("name").style.display="none";
  get("registerBtn").style.display="none";
  get("loginBtn").style.display="block";
  get("forgotText").style.display="block";
};

// REGISTER
window.register = async ()=>{
  await setDoc(doc(db,"users",get("number").value),{
    name:get("name").value,
    password:get("password").value
  });
  showMsg("Account Created");
  showLogin();
};

// LOGIN
window.login = async ()=>{
  let snap = await getDoc(doc(db,"users",get("number").value));
  if(!snap.exists()) return showMsg("User not found");

  let user = snap.data();

  if(user.password !== get("password").value){
    return showMsg("Wrong password");
  }

  get("auth").style.display="none";
  get("app").style.display="block";

  get("usernameHome").innerText=user.name;
  get("username2").innerText=user.name;
  get("usernumber").innerText=get("number").value;

  localStorage.setItem("user",get("number").value);

  loadDeposits();
  loadBank();
};

// NAV
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  get(id).style.display="block";
};

// DEPOSIT
window.deposit = ()=> depositBox.classList.add("active");
window.closeDeposit = ()=> depositBox.classList.remove("active");

window.submitDeposit = async ()=>{
  await setDoc(doc(db,"deposits",Date.now()+""),{
    user:localStorage.getItem("user"),
    utr:get("utr").value,
    status:"Pending"
  });
  showMsg("Deposit Submitted");
  loadDeposits();
};

async function loadDeposits(){
  let snap = await getDocs(collection(db,"deposits"));
  depositList.innerHTML="";
  snap.forEach(d=>{
    let data=d.data();
    if(data.user===localStorage.getItem("user")){
      depositList.innerHTML+=`<div>${data.utr} - ${data.status}</div>`;
    }
  });
}

// BANK
window.openBank = ()=> bankBox.classList.add("active");
window.closeBank = ()=> bankBox.classList.remove("active");

window.saveBank = async ()=>{
  await setDoc(doc(db,"bank",localStorage.getItem("user")),{
    name:get("bankName").value,
    account:get("bankAcc").value,
    ifsc:get("bankIfsc").value
  });
  showMsg("Bank Saved");
  loadBank();
};

async function loadBank(){
  let snap = await getDoc(doc(db,"bank",localStorage.getItem("user")));
  if(snap.exists()){
    let d=snap.data();
    bankList.innerHTML=`<div>${d.name}<br>${d.account}<br>${d.ifsc}</div>`;
  }
}

// WITHDRAW
window.openWithdraw = ()=> withdrawBox.classList.add("active");
window.closeWithdraw = ()=> withdrawBox.classList.remove("active");

window.submitWithdraw = async ()=>{
  let amt = Number(get("wAmount").value);
  if(amt<200) return showMsg("Minimum ₹200 required");

  await setDoc(doc(db,"withdraw",Date.now()+""),{
    user:localStorage.getItem("user"),
    amount:amt,
    status:"Process"
  });

  showMsg("Withdraw Submitted");
};

// PASSWORD
window.changePassword = async ()=>{
  await updateDoc(doc(db,"users",localStorage.getItem("user")),{
    password:get("newPass").value
  });
  showMsg("Password Updated");
};

// LOGOUT
window.logout = ()=>{
  localStorage.clear();
  location.reload();
};