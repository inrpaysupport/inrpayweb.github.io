// AUTH
function register(){
let u=username.value,p=password.value;
if(!u||!p)return alert("Fill all");
localStorage.setItem("user_"+u,p);
alert("Account Created");
}

function login(){
let u=username.value,p=password.value;
if(localStorage.getItem("user_"+u)===p){
localStorage.setItem("loggedUser",u);
showDashboard();
}else alert("Wrong Login");
}

function showDashboard(){
let u=localStorage.getItem("loggedUser");
if(u){
authBox.style.display="none";
dashboard.style.display="block";
userNameShow.innerText=u;
balance.innerText="₹"+(localStorage.getItem("bal_"+u)||0);
drawChart();
startLiveTx();
}
}

function logout(){
localStorage.removeItem("loggedUser");
location.reload();
}

// POPUP
function openPopup(){popup.style.display="flex";}
function closePopup(){popup.style.display="none";}

// COPY
function copyUPI(){
navigator.clipboard.writeText(upiText.innerText);
alert("UPI Copied");
}

// PAYMENT FLOW
function submitDeposit(){
let utr=document.getElementById("utr").value;
if(!utr)return alert("Enter UTR");

popup.style.display="none";
loader.style.display="flex";

setTimeout(()=>{
loader.style.display="none";
showSuccess();
},2000);
}

function showSuccess(){
let u=localStorage.getItem("loggedUser");
let bal=parseInt(localStorage.getItem("bal_"+u)||0);
bal+=1000;
localStorage.setItem("bal_"+u,bal);
balance.innerText="₹"+bal;
success.style.display="flex";
}

function closeSuccess(){success.style.display="none";}

// SUPPORT
function openSupport(){
window.open("https://wa.me/919999999999?text=INRPay Support");
}

// 📊 GRAPH
function drawChart(){
let c=document.getElementById("chart");
let ctx=c.getContext("2d");
ctx.beginPath();
[0,200,500,1000].forEach((v,i)=>{
ctx.lineTo(i*80,150-v/10);
});
ctx.strokeStyle="white";
ctx.stroke();
}

// 🔥 FAKE LIVE TRANSACTIONS
function startLiveTx(){
setInterval(()=>{
let names=["Rahul","Aman","Vikas","Rohit","Ali","John"];
let name=names[Math.floor(Math.random()*names.length)];
let amt=[1000,500,2000][Math.floor(Math.random()*3)];

let div=document.createElement("div");
div.className="tx";
div.innerText=name+" deposited ₹"+amt;

liveTx.prepend(div);

// limit list
if(liveTx.children.length>10){
liveTx.removeChild(liveTx.lastChild);
}

},2000);
}

// INIT
showDashboard();
