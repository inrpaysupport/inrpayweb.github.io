import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Firebase Configuration
const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= UTILITY ================= */
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= AUTH LOGIC ================= */
window.showRegister = () => {
    get("authTitle").innerText = "Create Account";
    get("name").style.setProperty("display", "block", "important");
    get("email").style.setProperty("display", "block", "important");
    get("registerBtn").style.display = "block";
    get("loginBtn").style.display = "none";
    get("forgotText").style.display = "none";
    get("toggleText").innerHTML = `Already have account? <button class="linkBtn" onclick="showLogin()">Sign In</button>`;
};

window.showLogin = () => {
    get("authTitle").innerText = "Sign In";
    get("name").style.setProperty("display", "none", "important");
    get("email").style.setProperty("display", "none", "important");
    get("registerBtn").style.display = "none";
    get("loginBtn").style.display = "block";
    get("forgotText").style.display = "block";
    get("toggleText").innerHTML = `Don't have an account? <button class="linkBtn" onclick="showRegister()">Sign Up</button>`;
};

window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: Math.floor(100000 + Math.random() * 900000)
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Error: " + error.message); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const email = snap.data().email;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
            loadBankData();
        } catch (e) { window.showMsg("Invalid Password!"); }
    } else { window.showMsg("Not registered!"); }
};

/* ================= QR DOWNLOAD LOGIC ================= */
window.downloadQR = () => {
    const qrImg = get("qrImage");
    if (!qrImg.src) return window.showMsg("No QR Image found!");
    
    const link = document.createElement("a");
    link.href = qrImg.src;
    link.download = "Payment_QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/* ================= MOBILE NATIVE SHARE ================= */
window.shareReferLink = async () => {
    const user = localStorage.getItem("user");
    const link = window.location.origin + window.location.pathname + "?signup=true&ref=" + user;
    const shareData = {
        title: 'Join INRPAY',
        text: 'Join INRPAY and start earning rewards daily!',
        url: link
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback to copy if Web Share API is not supported
            navigator.clipboard.writeText(link);
            window.showMsg("Link Copied to Clipboard!");
        }
    } catch (err) {
        console.log("Error sharing:", err);
    }
};

/* ================= APP LOGIC ================= */
function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + (data.email || "N/A");
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    localStorage.setItem("currentBalance", data.balance || 0);
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");

window.submitDeposit = async () => {
    let utr = get("utr").value;
    if(!utr) return window.showMsg("Enter UTR!");
    await setDoc(doc(db, "deposits", Date.now().toString()), {
        user: localStorage.getItem("user"), utr: utr, status: "Pending"
    });
    window.showMsg("Submitted!"); closeDeposit();
};

window.openBank = () => get("bankBox").classList.add("active");
window.closeBank = () => get("bankBox").classList.remove("active");

window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "bank", localStorage.getItem("user")), {
        bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value
    });
    window.showMsg("Bank Updated!");
};

window.submitWithdraw = async () => {
    let amt = get("withdrawAmount").value;
    let bal = parseInt(localStorage.getItem("currentBalance"));
    if(!amt || amt < 100) return window.showMsg("Min ₹100 required!");
    if(amt > bal) return window.showMsg("Insufficient Balance!");
    await setDoc(doc(db, "withdrawals", Date.now().toString()), {
        user: localStorage.getItem("user"), amount: amt, status: "Pending", date: new Date().toLocaleString()
    });
    window.showMsg("Withdrawal Requested!");
    get("withdrawAmount").value = "";
};

async function loadBankData() {
    let user = localStorage.getItem("user");
    if(!user) return;
    let snap = await getDoc(doc(db, "bank", user));
    if(snap.exists()) {
        const d = snap.data();
        get("earnBankName").value = d.bank || "";
        get("earnBankAcc").value = d.acc || "";
        get("earnBankIfsc").value = d.ifsc || "";
    }
}

async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome";
        if(d.qr) { 
            get("qrImage").src = d.qr; 
            get("qrImage").style.display = "block"; 
            get("downloadQrBtn").style.display = "inline-block";
        }
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    let u = localStorage.getItem("user");
    if(u) {
        getDoc(doc(db, "users", u)).then(s => {
            if(s.exists()){
                get("auth").style.display = "none"; get("app").style.display = "block";
                loadUserData(s.data(), u); loadSettings(); loadBankData();
            }
        });
    } else {
        if(params.get("signup") === "true") window.showRegister(); else window.showLogin();
    }
};
