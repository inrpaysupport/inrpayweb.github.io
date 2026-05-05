import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// ✅ FIREBASE CONFIG (तुम्हारा वाला)
const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== SAFE DOM GET =====
const get = (id) => document.getElementById(id);

// ===== MESSAGE =====
function showMsg(t){
  get("msgText").innerText = t;
  get("msgBox").classList.add("active");
}
window.closeMsg = () => get("msgBox").classList.remove("active");

// ===== DEFAULT =====
window.onload = () => showRegister();

// ===== TOGGLE =====
window.showLogin = () => {
  get("authTitle").innerText = "Sign In";
  get("name").style.display = "none";
  get("loginBtn").style.display = "block";
  get("registerBtn").style.display = "none";
  get("forgotText").style.display = "block";
};

window.showRegister = () => {
  get("authTitle").innerText = "Create Account";
  get("name").style.display = "block";
  get("loginBtn").style.display = "none";
  get("registerBtn").style.display = "block";
  get("forgotText").style.display = "none";
};

// ===== REGISTER =====
window.register = async () => {
  try{
    const name = get("name").value.trim();
    const number = get("number").value.trim();
    const password = get("password").value.trim();

    if(!name || !number || !password){
      return showMsg("Fill all fields");
    }

    let uid = Math.floor(100000 + Math.random()*900000);

    await setDoc(doc(db,"users",number),{
      name, password, uid
    });

    showMsg("Account Created");
    showLogin();

  }catch(e){
    console.log(e);
    showMsg("Register error");
  }
};

// ===== LOGIN =====
window.login = async () => {
  try{
    const number = get("number").value.trim();
    const password = get("password").value.trim();

    if(!number || !password){
      return showMsg("Enter details");
    }

    const snap = await getDoc(doc(db,"users",number));

    if(!snap.exists()){
      return showMsg("User not found");
    }

    const user = snap.data();

    if(user.password !== password){
      return showMsg("Wrong password");
    }

    // ✅ SHOW APP
    get("auth").style.display = "none";
    get("app").style.display = "block";

    // ✅ SET DATA (safe)
    if(get("usernameHome")) get("usernameHome").innerText = user.name || "";
    if(get("username2")) get("username2").innerText = user.name || "";
    if(get("usernumber")) get("usernumber").innerText = number;
    if(get("userid")) get("userid").innerText = "UID: " + (user.uid || "---");

    localStorage.setItem("user",number);

    loadWithdraw();
    loadAccount();

  }catch(e){
    console.log("LOGIN ERROR:", e);
    showMsg("Login error");
  }
};

// ===== NAV =====
window.showPage = (id)=>{
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  const el = document.getElementById(id);
  if(el) el.style.display="block";
};

// ===== WITHDRAW =====
window.openWithdraw = ()=>{
  get("withdrawBox").classList.add("active");
  loadWithdraw();
  loadAccount();
};

window.closeWithdraw = ()=>{
  get("withdrawBox").classList.remove("active");
};

// ===== ACCOUNT SAVE =====
window.saveAccount = async ()=>{
  try{
    await setDoc(doc(db,"bank",localStorage.getItem("user")),{
      name:get("accNameInput").value,
      account:get("accNumberInput").value,
      ifsc:get("ifscInput").value
    });
    showMsg("Saved");
  }catch(e){
    console.log(e);
  }
};

// ===== LOAD ACCOUNT =====
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

// ===== WITHDRAW =====
window.submitWithdraw = async ()=>{
  try{
    let amt = Number(get("wAmount").value);

    if(amt < 200){
      return showMsg("Minimum ₹200");
    }

    await setDoc(doc(db,"withdraw",Date.now()+""),{
      user:localStorage.getItem("user"),
      amount:amt,
      status:"Process"
    });

    showMsg("Submitted");
    loadWithdraw();

  }catch(e){
    console.log(e);
  }
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){
  try{
    let snap = await getDocs(collection(db,"withdraw"));
    get("withdrawList").innerHTML="";

    snap.forEach(d=>{
      let data=d.data();
      if(data.user===localStorage.getItem("user")){
        get("withdrawList").innerHTML+=`
        <div>${data.amount} - ${data.status}</div>`;
      }
    });

  }catch(e){}
}

// ===== LOGOUT =====
window.logout = ()=>{
  localStorage.clear();
  location.reload();
};