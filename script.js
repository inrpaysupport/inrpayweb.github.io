// ===== ADD NEW DOM =====
const useridText = document.getElementById("userid");

const forgotBox = document.getElementById("forgotBox");

// ===== MESSAGE =====
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}

// ===== REGISTER =====
window.register = async () => {

let name = nameInput.value.trim();
let number = numberInput.value.trim();
let password = passwordInput.value.trim();

if(!name || !number || !password){
return showMsg("Fill all fields");
}

// 🔥 random ID
let userId = Math.floor(100000 + Math.random()*900000);

await setDoc(doc(db,"users",number),{
name,
password,
balance:0,
userId:userId
});

showMsg("Account Created");
showLogin();
}

// ===== LOGIN =====
window.login = async () => {

let snap = await getDoc(doc(db,"users",numberInput.value));

if(!snap.exists()) return showMsg("User not found");

let user = snap.data();

if(user.password !== passwordInput.value){
return showMsg("Wrong password");
}

auth.style.display="none";
appDiv.style.display="block";

usernameHome.innerText=user.name;
username2.innerText=user.name;
usernumber.innerText=numberInput.value;

// 🔥 SHOW USER ID
useridText.innerText = "User ID: " + user.userId;

localStorage.setItem("user",numberInput.value);

loadEarnings();
loadWithdraw();
}

// ===== EARNINGS (FINAL FIX) =====
async function loadEarnings(){

let user = localStorage.getItem("user");
let snap = await getDocs(collection(db,"withdraw"));

earningList.innerHTML="";

snap.forEach(d=>{
let data=d.data();

if(data.user===user && data.status==="Done"){
earningList.innerHTML+=`
<div style="background:white;color:black;margin:5px;padding:10px;border-radius:10px;display:flex;justify-content:space-between;">
<span>${data.date}</span>
<span>₹${data.amount}</span>
</div>`;
}
});
}

// ===== WITHDRAW =====
window.submitWithdraw = async ()=>{

await setDoc(doc(db,"withdraw",Date.now()+""),{
user:localStorage.getItem("user"),
name:document.getElementById("wName").value,
account:document.getElementById("wAcc").value,
ifsc:document.getElementById("wIfsc").value,
amount:1000,
status:"Process",
date:new Date().toLocaleDateString()
});

showMsg("Withdraw Submitted");
loadWithdraw();
}

// ===== FORGOT PASSWORD =====
window.openForgot = ()=> forgotBox.style.display="flex";
window.closeForgot = ()=> forgotBox.style.display="none";

// fake OTP system
let otp = "";

window.sendOtp = ()=>{
otp = Math.floor(1000 + Math.random()*9000);
showMsg("OTP: " + otp); // demo
}

window.resetPass = async ()=>{

let num = document.getElementById("fNumber").value;
let userOtp = document.getElementById("fOtp").value;
let newPass = document.getElementById("fNewPass").value;

if(userOtp != otp){
return showMsg("Wrong OTP");
}

await updateDoc(doc(db,"users",num),{
password:newPass
});

showMsg("Password Updated");
closeForgot();
}