import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db=getFirestore(app);

// MESSAGE
function showMsg(t){
msgText.innerText=t;
msgBox.classList.add("active");
}
window.closeMsg=()=>msgBox.classList.remove("active");

// DEFAULT
window.onload=()=>showRegister();

// TOGGLE
window.showLogin=()=>{
authTitle.innerText="Sign In";
document.getElementById("name").style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";
forgotText.style.display="block";
};

window.showRegister=()=>{
authTitle.innerText="Create Account";
document.getElementById("name").style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";
forgotText.style.display="none";
};

// REGISTER
window.register=async()=>{
let uid=Math.floor(100000+Math.random()*900000);

await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
uid:uid
});

showMsg("Account Created");
showLogin();
};

// LOGIN
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));
let user=snap.data();

auth.style.display="none";
app.style.display="block";

usernameHome.innerText=user.name;
username2.innerText=user.name;
usernumber.innerText=number.value;
userid.innerText="UID: "+user.uid;

localStorage.setItem("user",number.value);

loadWithdraw();
loadAccount();
};

// NAV
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
};

// WITHDRAW
window.openWithdraw=()=>{
withdrawBox.classList.add("active");
loadWithdraw();
loadAccount();
};

window.closeWithdraw=()=>withdrawBox.classList.remove("active");

// ACCOUNT SAVE
window.saveAccount=async()=>{
await setDoc(doc(db,"bank",localStorage.getItem("user")),{
name:accNameInput.value,
account:accNumberInput.value,
ifsc:ifscInput.value
});
showMsg("Saved");
};

// LOAD ACCOUNT
async function loadAccount(){
let snap=await getDoc(doc(db,"bank",localStorage.getItem("user")));
if(snap.exists()){
let d=snap.data();
accNameInput.value=d.name||"";
accNumberInput.value=d.account||"";
ifscInput.value=d.ifsc||"";
}
}

// WITHDRAW SUBMIT
window.submitWithdraw=async()=>{
await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
amount:wAmount.value,
status:"Process"
});
showMsg("Submitted");
loadWithdraw();
};

// LOAD WITHDRAW
async function loadWithdraw(){
let snap=await getDocs(collection(db,"withdraw"));
withdrawList.innerHTML="";
snap.forEach(d=>{
let data=d.data();
if(data.user===localStorage.getItem("user")){
withdrawList.innerHTML+=`<div>${data.amount} - ${data.status}</div>`;
}
});
}

// PASSWORD
window.changePassword=async()=>{
await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:newPass.value
});
showMsg("Updated");
};

// LOGOUT
window.logout=()=>{
localStorage.clear();
location.reload();
};