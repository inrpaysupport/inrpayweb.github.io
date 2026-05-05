import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
authDomain:"inrpay-44413.firebaseapp.com",
projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

function showMsg(t){
get("msgText").innerText=t;
get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

window.togglePass=()=>{
let p=get("password");
p.type=p.type==="password"?"text":"password";
};

window.onload=()=>showRegister();

window.showRegister=()=>{
get("authTitle").innerText="Create Account";
get("name").style.display="block";
get("registerBtn").style.display="block";
get("loginBtn").style.display="none";
get("forgotText").style.display="none";
};

window.showLogin=()=>{
get("authTitle").innerText="Sign In";
get("name").style.display="none";
get("registerBtn").style.display="none";
get("loginBtn").style.display="block";
get("forgotText").style.display="block";
};

window.register=async()=>{
await setDoc(doc(db,"users",get("number").value),{
name:get("name").value,
password:get("password").value,
balance:0
});
showMsg("Account Created");
showLogin();
};

window.login=async()=>{
let snap=await getDoc(doc(db,"users",get("number").value));
if(!snap.exists()) return showMsg("User not found");

let user=snap.data();
if(user.password!==get("password").value) return showMsg("Wrong password");

get("auth").style.display="none";
get("app").style.display="block";

get("usernameHome").innerText=user.name;
get("username2").innerText=user.name;
get("usernumber").innerText=get("number").value;

localStorage.setItem("user",get("number").value);

loadUser();
loadDeposits();
loadBank();
};

async function loadUser(){
let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
if(snap.exists()){
get("walletBalance").innerText=snap.data().balance||0;
}
}

window.deposit=()=>get("depositBox").classList.add("active");
window.closeDeposit=()=>get("depositBox").classList.remove("active");

window.submitDeposit=async()=>{
await setDoc(doc(db,"deposits",Date.now()+""),{
user:localStorage.getItem("user"),
utr:get("utr").value,
status:"Pending"
});
showMsg("Deposit Submitted");
loadDeposits();
};

async function loadDeposits(){
let snap=await getDocs(collection(db,"deposits"));
depositList.innerHTML="";
snap.forEach(d=>{
let data=d.data();
if(data.user===localStorage.getItem("user")){
depositList.innerHTML+=`<div>${data.utr}</div>`;
}
});
}

window.openBank=()=>get("bankBox").classList.add("active");
window.closeBank=()=>get("bankBox").classList.remove("active");

window.saveBank=async()=>{
await setDoc(doc(db,"bank",localStorage.getItem("user")),{
name:get("bankName").value,
account:get("bankAcc").value,
ifsc:get("bankIfsc").value
});
showMsg("Bank Saved");
loadBank();
};

async function loadBank(){
let snap=await getDoc(doc(db,"bank",localStorage.getItem("user")));
if(snap.exists()){
let d=snap.data();
bankList.innerHTML=`<div>${d.name}<br>${d.account}</div>`;
}
}

window.openWithdraw=()=>get("withdrawBox").classList.add("active");
window.closeWithdraw=()=>get("withdrawBox").classList.remove("active");

window.submitWithdraw=async()=>{
let amt=Number(get("wAmount").value);

let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let bal=snap.data().balance||0;

if(bal<200) return showMsg("Minimum ₹200 required");
if(amt>bal) return showMsg("Insufficient balance");

await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
amount:amt
});

showMsg("Withdraw Submitted");
};

window.changePassword=async()=>{
let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
let user=snap.data();

if(user.password!==get("oldPass").value){
return showMsg("Wrong old password");
}

if(get("newPass").value!==get("confirmPass").value){
return showMsg("Password mismatch");
}

await updateDoc(doc(db,"users",localStorage.getItem("user")),{
password:get("newPass").value
});

showMsg("Password Changed");
};

window.logout=()=>{
localStorage.clear();
location.reload();
};