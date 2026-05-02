import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);

// ================= MESSAGE =================
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// ================= TOGGLE =================
window.showRegister=()=>{
authTitle.innerText="Create Account";
name.style.display="block";
loginBtn.style.display="none";
registerBtn.style.display="block";

toggleText.innerHTML=`Already have account? 
<span onclick="showLogin()" style="color:yellow;">Sign In</span>`;
}

window.showLogin=()=>{
authTitle.innerText="Login";
name.style.display="none";
loginBtn.style.display="block";
registerBtn.style.display="none";

toggleText.innerHTML=`Don't have account? 
<span onclick="showRegister()" style="color:yellow;">Sign Up</span>`;
}

// ================= REGISTER =================
window.register=async()=>{
await setDoc(doc(db,"users",number.value),{
name:name.value,
password:password.value,
balance:0
});

showMsg("Account Created ✅");
showLogin();
}

// ================= LOGIN =================
window.login=async()=>{
let snap=await getDoc(doc(db,"users",number.value));

if(!snap.exists()) return showMsg("User not found");

let user=snap.data();

if(user.password!==password.value){
return showMsg("Wrong password");
}

auth.style.display="none";
app.style.display="block";

username2.innerText=user.name;
usernumber.innerText=number.value;
balance.innerText="₹"+user.balance;

localStorage.setItem("user",number.value);
}

// ================= NAV =================
window.showPage=(id)=>{
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

// ================= LOGOUT =================
window.logout=()=>{
localStorage.clear();
location.reload();
}

// ================= DEPOSIT =================
window.deposit=()=>depositBox.style.display="flex";
window.closeDeposit=()=>depositBox.style.display="none";

window.submitDeposit=async()=>{
await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:utr.value,
status:"Pending"
});

showMsg("Deposit Submitted");
}

// ================= BANK =================
window.openBank=()=>{bankBox.style.display="flex";loadBanks();}
window.closeBank=()=>bankBox.style.display="none";

window.saveBank=async()=>{
await setDoc(doc(db,"bank",Date.now()+""),{
user:localStorage.getItem("user"),
bank:bankName.value,
account:accNumber.value
});

showMsg("Bank Added");
loadBanks();
}

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

// ================= PASSWORD =================
window.changePassword=async()=>{
let ref=doc(db,"users",localStorage.getItem("user"));
await updateDoc(ref,{
password:newPass.value
});
showMsg("Password Updated");
}