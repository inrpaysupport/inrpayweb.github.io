import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey:"AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain:"inrpay-44413.firebaseapp.com",
    projectId:"inrpay-44413"
});

const db=getFirestore(app);
const get=id=>document.getElementById(id);

/* ================= MSG ================= */
function showMsg(t){
    get("msgText").innerText=t;
    get("msgBox").classList.add("active");
}
window.closeMsg=()=>get("msgBox").classList.remove("active");

/* ================= PASSWORD TOGGLE ================= */
window.togglePass=()=>{
    let p=get("password");
    p.type=p.type==="password"?"text":"password";
};

/* ================= AUTH SWITCH FIX ================= */
window.showRegister=()=>{
    get("authTitle").innerText="Create Account";
    get("name").style.display="block";
    get("registerBtn").style.display="block";
    get("loginBtn").style.display="none";
    get("forgotText").style.display="none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin=()=>{
    get("authTitle").innerText="Sign In";
    get("name").style.display="none";
    get("registerBtn").style.display="none";
    get("loginBtn").style.display="block";
    get("forgotText").style.display="block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

/* ================= REGISTER ================= */
window.register=async()=>{
    if(!get("name").value || !get("number").value || !get("password").value) return showMsg("Please fill all fields");
    await setDoc(doc(db,"users",get("number").value),{
        name:get("name").value,
        password:get("password").value,
        balance:0
    });
    showMsg("Account Created Successfully");
    showLogin();
};

/* ================= LOGIN ================= */
window.login=async()=>{
    let snap=await getDoc(doc(db,"users",get("number").value));
    if(!snap.exists()) return showMsg("User not found");

    let user=snap.data();
    if(user.password!==get("password").value) return showMsg("Wrong password");

    get("auth").style.display="none";
    get("app").style.display="block";

    get("usernameHome").innerText= "Hello, " + user.name;
    get("username2").innerText= user.name;
    get("usernumber").innerText= "Mobile: " + get("number").value;
    get("userid").innerText= "UID: " + (user.uid || Math.floor(100000 + Math.random() * 900000));

    localStorage.setItem("user",get("number").value);

    loadUser();
    loadSettings();
};

/* ================= SUPPORT ================= */
window.openSupport = () => get("supportBox").classList.add("active");
window.closeSupport = () => get("supportBox").classList.remove("active");
window.supportMsg = (type) => {
    let msg = type === 'rep' ? "Our representative will contact you in 5 minutes." : "Our manager will contact you in 5 minutes.";
    closeSupport();
    showMsg(msg);
};

/* ================= LOAD USER ================= */
async function loadUser(){
    let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
    if(snap.exists()){
        let bal=snap.data().balance||0;
        get("walletBalance").innerText=bal;
        get("earnBalance").innerText=bal;
        get("balance").innerText="₹"+bal;
    }
}

/* ================= SETTINGS & NOTICE SYNC ================= */
async function loadSettings(){
    let snap=await getDoc(doc(db,"settings","main"));
    if(snap.exists()){
        let d=snap.data();
        if(d.notice) get("scrollingNotice").innerText = d.notice;
        get("qrImage").src=d.qr || "";
        get("upiText").innerText=d.upi || "upi@id";
        get("amountText").innerText="₹"+(d.amount || 1000);
    }
}

/* ================= NAVIGATION ================= */
window.showPage=(id)=>{
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    get(id).style.display="block";
};

/* ================= DEPOSIT ================= */
window.deposit=()=>{
    get("depositBox").classList.add("active");
    loadSettings();
};
window.closeDeposit=()=>get("depositBox").classList.remove("active");

window.submitDeposit=async()=>{
    let utr=get("utr").value;
    if(!utr) return showMsg("Enter UTR Number");
    await setDoc(doc(db,"deposits",Date.now()+""),{
        user:localStorage.getItem("user"),
        utr:utr,
        status:"Pending"
    });
    showMsg("Deposit Submitted");
    closeDeposit();
};

/* ================= WITHDRAW ================= */
window.openWithdraw=()=>get("withdrawBox").classList.add("active");
window.closeWithdraw=()=>get("withdrawBox").classList.remove("active");

window.submitWithdraw=async()=>{
    let amt=Number(get("wAmount").value);
    let snap=await getDoc(doc(db,"users",localStorage.getItem("user")));
    let bal=snap.data().balance||0;

    if(amt < 200) return showMsg("Minimum withdrawal ₹200");
    if(amt > bal) return showMsg("Insufficient balance");

    await setDoc(doc(db,"withdraw",Date.now()+""),{
        user:localStorage.getItem("user"),
        amount:amt,
        status:"Pending"
    });
    showMsg("Withdrawal request submitted");
    closeWithdraw();
};

/* ================= BANK ================= */
window.openBank=()=>get("bankBox").classList.add("active");
window.closeBank=()=>get("bankBox").classList.remove("active");
window.saveBank=async()=>{
    await setDoc(doc(db,"bank",localStorage.getItem("user")),{
        name:get("bankName").value,
        account:get("bankAcc").value,
        ifsc:get("bankIfsc").value
    });
    showMsg("Bank details saved");
    closeBank();
};

/* ================= LOGOUT ================= */
window.logout=()=>{
    localStorage.clear();
    location.reload();
};
