// 🔥 अपना Render URL डालो
const API = "http://localhost:3000";

function register(){
fetch(API+"/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name:name.value,
number:number.value,
password:password.value
})
})
.then(r=>r.json())
.then(d=>alert(d.status=="ok"?"Registered":"User exists"));
}

function login(){
fetch(API+"/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
number:number.value,
password:password.value
})
})
.then(r=>r.json())
.then(d=>{
if(d.status=="ok"){
auth.style.display="none";
dash.style.display="block";

username.innerText=d.user.name;
balance.innerText="₹"+d.user.balance;

localStorage.setItem("user", JSON.stringify(d.user));
}else alert("Wrong login");
});
}

function deposit(){
let user = JSON.parse(localStorage.getItem("user"));

fetch(API+"/deposit",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({number:user.number})
})
.then(r=>r.json())
.then(d=>{
balance.innerText="₹"+d.balance;
});
}

function logout(){
localStorage.clear();
location.reload();
}