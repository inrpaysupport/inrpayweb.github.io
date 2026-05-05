import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// FIREBASE CONFIG
const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// SAFE GET
const get = (id)=>document.getElementById(id);

// MESSAGE
function showMsg(t){
  if(get("msgText")){
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
  }else{
    alert(t);
  }
}
window.closeMsg = ()=> get("msgBox")?.classList.remove("active");

// PASSWORD TOGGLE
window.togglePass = ()=>{
  let p = get("password");
  if(p) p.type = p.type === "password" ? "text" : "password";
};

// NUMBER VALIDATION
get("number")?.addEventListener("input",function(){
  this.value = this.value.replace(/\D/g,"").slice(0,10);
});

// DEFAULT
window.onload = ()=>{
  showRegister();
};

// TOGGLE
window.showRegister = ()=>{
  get("authTitle").innerText = "Create Account";

  get("name").style.display = "block";
  get("registerBtn").style.display = "block";
  get("loginBtn").style.display = "none";

  if(get("forgotText")) get("forgotText").style.display = "none";

  get("toggleText").innerHTML =
  `Already have account? <span onclick="showLogin()">Sign In</span>`;
};

window.showLogin = ()=>{
  get("authTitle").innerText = "Sign In";

  get("name").style.display = "none";
  get("registerBtn").style.display = "none";
  get("loginBtn").style.display = "block";

  if(get("forgotText")) get("forgotText").style.display = "block";

  get("toggleText").innerHTML =
  `Don't have account? <span onclick="showRegister()">Sign Up</span>`;
};

// REGISTER
window.register = async ()=>{
try{

  let name = get("name").value.trim();
  let number = get("number").value.trim();
  let password = get("password").value.trim();

  if(!name || !number || !password){
    return showMsg("Fill all fields");
  }

  let uid = Math.floor(100000 + Math.random()*900000);

  await setDoc(doc(db,"users",number),{
    name,
    password,
    uid,
    balance:0
  });

  showMsg("Account Created");
  showLogin();

}catch(e){
  console.log(e);
  showMsg("Register error");
}
};

// LOGIN (🔥 FULL SAFE)
window.login = async ()=>{
try{

  let numberVal = get("number").value.trim();
  let passwordVal = get("password").value.trim();

  if(!numberVal || !passwordVal){
    return showMsg("Enter details");
  }

  let snap = await getDoc(doc(db,"users",numberVal));

  if(!snap.exists()){
    return showMsg("User not found");
  }

  let user = snap.data();

  if(user.password !== passwordVal){
    return showMsg("Wrong password");
  }

  // SCREEN SWITCH
  get("auth").style.display = "none";
  get("app").style.display = "block";

  // SAFE DATA SET
  if(get("usernameHome")) get("usernameHome").innerText = user.name || "";
  if(get("username2")) get("username2").innerText = user.name || "";
  if(get("usernumber")) get("usernumber").innerText = numberVal;
  if(get("userid")) get("userid").innerText = "UID: " + (user.uid || "---");

  localStorage.setItem("user", numberVal);

  // SAFE CALL
  if(typeof loadWithdraw === "function") loadWithdraw();
  if(typeof loadAccount === "function") loadAccount();

}catch(e){
  console.log("LOGIN ERROR:", e);
  showMsg("Login error");
}
};

// NAV
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  get(id)?.style.display="block";
};

// WITHDRAW
window.openWithdraw = ()=>{
  get("withdrawBox")?.classList.add("active");
  if(typeof loadWithdraw === "function") loadWithdraw();
  if(typeof loadAccount === "function") loadAccount();
};

window.closeWithdraw = ()=>{
  get("withdrawBox")?.classList.remove("active");
};

// WITHDRAW RULE
window.submitWithdraw = async ()=>{
try{
  let amt = Number(get("wAmount").value);

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

}catch(e){
  console.log(e);
}
};

// LOAD WITHDRAW
async function loadWithdraw(){
try{
  let snap = await getDocs(collection(db,"withdraw"));
  if(get("withdrawList")) get("withdrawList").innerHTML = "";

  snap.forEach(d=>{
    let data = d.data();
    if(data.user === localStorage.getItem("user")){
      get("withdrawList").innerHTML += `
      <div>${data.date} - ₹${data.amount} - ${data.status}</div>`;
    }
  });

}catch(e){}
}

// SAVE ACCOUNT
window.saveAccount = async ()=>{
try{
  await setDoc(doc(db,"bank",localStorage.getItem("user")),{
    name: get("accNameInput").value,
    account: get("accNumberInput").value,
    ifsc: get("ifscInput").value
  });

  showMsg("Account Saved");

}catch(e){}
};

// LOAD ACCOUNT
async function loadAccount(){
try{
  let snap = await getDoc(doc(db,"bank",localStorage.getItem("user")));

  if(snap.exists()){
    let d = snap.data();
    if(get("accNameInput")) get("accNameInput").value = d.name || "";
    if(get("accNumberInput")) get("accNumberInput").value = d.account || "";
    if(get("ifscInput")) get("ifscInput").value = d.ifsc || "";
  }

}catch(e){}
}

// PASSWORD CHANGE
window.changePassword = async ()=>{
try{
  await updateDoc(doc(db,"users",localStorage.getItem("user")),{
    password: get("newPass").value
  });

  showMsg("Password Updated");

}catch(e){}
};

// LOGOUT
window.logout = ()=>{
  localStorage.clear();
  location.reload();
};