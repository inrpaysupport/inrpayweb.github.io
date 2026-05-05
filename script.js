import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ===== MESSAGE =====
function showMsg(t){
msgText.innerText=t;
msgBox.classList.add("active");
}
window.closeMsg=()=>msgBox.classList.remove("active");

// ===== DEFAULT =====
window.onload=()=>showRegister();

// ===== TOGGLE =====
window.showRegister=()=>{
authTitle.innerText="Create Account";
name.style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";
forgotText.style.display="none";
};

window.showLogin=()=>{
authTitle.innerText="Sign In";
name.style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";
forgotText.style.display="block";
};

// ===== REGISTER =====
window.register=async()=>{

if(!name.value || !number.value || !password.value){
return showMsg("Fill all fields");
}

// UID 6 digit
let uid=Math.floor(100000+Math.random()*900000);

await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0,
uid:uid
});

showMsg("Account Created");
showLogin();
};

// ===== LOGIN =====
window.login=async()=>{

let snap=await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password.value){
return showMsg("Wrong password");
}

auth.style.display="none";
app.style.display="block";

usernameHome.innerText=user.name;
username2.innerText=user.name;
usernumber.innerText=number.value;
userid.innerText="UID: "+user.uid;

localStorage.setItem("user",number.value);

loadWithdraw();
};

// ===== NAV =====
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
};

// ===== POPUP =====
function openPopup(el){el.classList.add("active")}
function closePopup(el){el.classList.remove("active")}

// ===== DEPOSIT =====
window.deposit=()=>openPopup(depositBox);
window.closeDeposit=()=>closePopup(depositBox);

// ===== BANK =====
window.openBank=()=>openPopup(bankBox);
window.closeBank=()=>closePopup(bankBox);

// ===== WITHDRAW =====
window.openWithdraw=()=>openPopup(withdrawBox);
window.closeWithdraw=()=>closePopup(withdrawBox);

// ===== WITHDRAW SUBMIT =====
window.submitWithdraw=async()=>{

let amt=Number(wAmount.value);

if(amt<200) return showMsg("Minimum ₹200");

await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
amount:amt,
status:"Process",
date:new Date().toLocaleDateString()
});

showMsg("Withdraw Submitted");
loadWithdraw();
};

// ===== LOAD WITHDRAW =====
async function loadWithdraw(){

let snap=await getDocs(collection(db,"withdraw"));
withdrawList.innerHTML="";

snap.forEach(d=>{
let data=d.data();

if(data.user===localStorage.getItem("user")){
withdrawList.innerHTML+=`
<div class="listItem">
${data.date} - ₹${data.amount} - ${data.status}
</div>`;
}
});
}

// ===== PASSWORD =====
window.changePassword=async()=>{
await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:newPass.value
});
showMsg("Password Updated");
};

// ===== LOGOUT =====
window.logout=()=>{
localStorage.clear();
location.reload();
};