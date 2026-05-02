import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { 
getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { 
getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
  authDomain: "inrpay-44413.firebaseapp.com",
  projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);

// ================= MESSAGE =================
function showMsg(t){
msgText.innerText=t;
msgBox.style.display="flex";
}
window.closeMsg=()=>msgBox.style.display="none";

// ================= REGISTER =================
window.register = async ()=>{

let email = number.value + "@app.com";

let res = await createUserWithEmailAndPassword(auth,email,password.value);

await setDoc(doc(db,"users",res.user.uid),{
name:name.value,
balance:0
});

showMsg("Account Created ✅");
}

// ================= LOGIN =================
window.login = async ()=>{

let email = number.value + "@app.com";

try{
let res = await signInWithEmailAndPassword(auth,email,password.value);

localStorage.setItem("uid",res.user.uid);

authBox.style.display="none";
app.style.display="block";

loadUser(res.user.uid);
listenDeposits(res.user.uid);

}catch(e){
showMsg("Login Failed");
}
}

// ================= LOAD USER =================
async function loadUser(uid){

let snap = await getDoc(doc(db,"users",uid));

let user = snap.data();

username.innerText=user.name;
balance.innerText="₹"+user.balance;
}

// ================= AUTO LOGIN =================
window.onload = async ()=>{

let uid = localStorage.getItem("uid");
if(!uid) return;

authBox.style.display="none";
app.style.display="block";

loadUser(uid);
listenDeposits(uid);
}

// ================= LOGOUT =================
window.logout = ()=>{
localStorage.clear();
location.reload();
}

// ================= DEPOSIT =================
window.submitDeposit = async ()=>{

let uid = localStorage.getItem("uid");

await setDoc(doc(db,"deposits",Date.now()+""),{
user:uid,
utr:utr.value,
status:"Pending"
});

showMsg("Deposit Submitted");
}

// ================= REALTIME =================
function listenDeposits(uid){

onSnapshot(collection(db,"deposits"),snap=>{

snap.forEach(async d=>{
let data=d.data();

if(data.user===uid && data.status==="approved"){
showMsg("Deposit Approved");

let userRef = doc(db,"users",uid);
let snap = await getDoc(userRef);

balance.innerText="₹"+snap.data().balance;
}
});
});
}