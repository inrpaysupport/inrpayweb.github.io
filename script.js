import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});
const db = getFirestore(app);
const get = id => document.getElementById(id);

/* ================= UTILS ================= */
function showMsg(t){ get("msgText").innerText=t; get("msgBox").classList.add("active"); }
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p=get("password"); p.type=p.type==="password"?"text":"password"; };

/* ================= AUTH ================= */
window.showLogin = () => { get("authTitle").innerText="Sign In"; get("name").style.display="none"; get("registerBtn").style.display="none"; get("loginBtn").style.display="block"; };

window.register = async() => {
    await setDoc(doc(db,"users",get("number").value), { name:get("name").value, password:get("password").value, balance:0 });
    showMsg("Account Created"); showLogin();
};

window.login = async() => {
    let snap = await getDoc(doc(db,"users",get("number").value));
    if(!snap.exists()) return showMsg("User not found");
    let user = snap.data();
    if(user.password !== get("password").value) return showMsg("Wrong password");

    get("auth").style.display="none"; get("app").style.display="block";
    get("usernameHome").innerText = "Hello, " + user.name;
    localStorage.setItem("user", get("number").value);
    loadUser();
    loadSettings();
};

/* ================= SYSTEM LOAD ================= */
async function loadUser(){
    let snap = await getDoc(doc(db,"users",localStorage.getItem("user")));
    if(snap.exists()){
        let bal = snap.data().balance || 0;
        get("balance").innerText = "₹" + bal;
        get("earnBalance").innerText = bal;
    }
}

async function loadSettings(){
    let snap = await getDoc(doc(db,"settings","main"));
    if(snap.exists()){
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        get("qrImage").src = d.qr || "";
        get("upiText").innerText = d.upi || "upi@id";
        get("amountText").innerText = "₹" + (d.amount || 1000);
    }
}

/* ================= SUPPORT ================= */
window.openSupport = () => get("supportBox").classList.add("active");
window.closeSupport = () => get("supportBox").classList.remove("active");
window.supportMsg = (type) => {
    let msg = type === 'rep' ? "Our representative will contact you in 5 minutes." : "Our manager will contact you in 5 minutes.";
    closeSupport();
    showMsg(msg);
};

/* ================= DEPOSIT/WITHDRAW ================= */
window.deposit = () => { get("depositBox").classList.add("active"); loadSettings(); };
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async() => {
    if(!get("utr").value) return showMsg("Enter UTR Number");
    await setDoc(doc(db,"deposits",Date.now()+""), { user:localStorage.getItem("user"), utr:get("utr").value, status:"Pending" });
    showMsg("Deposit Submitted"); closeDeposit();
};

window.showPage = (id) => { document.querySelectorAll(".page").forEach(p=>p.style.display="none"); get(id).style.display="block"; };
window.logout = () => { localStorage.clear(); location.reload(); };
