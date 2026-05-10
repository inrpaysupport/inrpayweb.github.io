import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app-check.js";

const firebaseConfig = {
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
};

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY_HERE'),
    isTokenAutoRefreshEnabled: true
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= SPLASH & UTILITY ================= */
window.hideSplash = () => {
    const splash = get('splash');
    if (splash) {
        splash.classList.add('hide-splash');
        setTimeout(() => splash.remove(), 800);
    }
};

window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

window.togglePass = () => {
    let p = get("password");
    p.type = p.type === "password" ? "text" : "password";
};

/* ================= LIVE TRANSACTIONS LOGIC ================= */
function startLiveTransactions() {
    const txContainer = document.querySelector('.card .no-data-box');
    if (!txContainer) return;

    // Initialize list UI
    txContainer.parentElement.innerHTML = `<h4 style="margin:0 0 10px 0;">Recent Transactions</h4><div id="liveTxList"></div>`;
    
    const generateTx = () => {
        const list = document.getElementById('liveTxList');
        const amount = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // 1000 to 5000 range
        const type = Math.random() > 0.5 ? 'Deposit' : 'Credit';
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const txHtml = `
            <div class="history-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0; display:flex; justify-content:space-between;">
                <span>${type} <small style="color:#aaa; font-size:10px;">${timeStr}</small></span>
                <span style="color: #4caf50; font-weight:bold;">+₹${amount}</span>
            </div>`;
        
        list.insertAdjacentHTML('afterbegin', txHtml);
        if (list.children.length > 5) list.lastElementChild.remove();

        // 5% Balance Credit Logic
        let currentBal = parseInt(localStorage.getItem("currentBalance") || 0);
        let bonus = Math.floor(amount * 0.05);
        let newBal = currentBal + bonus;
        
        localStorage.setItem("currentBalance", newBal);
        get("balance").innerText = "₹" + newBal;

        // Random Interval: 4 to 25 seconds
        const nextInterval = (Math.floor(Math.random() * (25 - 4 + 1)) + 4) * 1000;
        setTimeout(generateTx, nextInterval);
    };
    generateTx();
}

/* ================= AUTH ACTIONS ================= */
window.register = async () => {
    let num = get("number").value;
    let name = get("name").value;
    let email = get("email").value;
    let pass = get("password").value;
    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref') || "none";

    if(!name || num.length < 10 || !pass || !email) return window.showMsg("Fill all details correctly");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        let generatedUID = Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, "users", num), {
            name: name, email: email, password: pass, balance: 0,
            uid: generatedUID, referredBy: refBy, accountStatus: "Deactivated"
        });
        window.showMsg("Account Created Successfully!");
        window.showLogin();
    } catch (error) { window.showMsg("Error during registration."); }
};

window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    if(!num || !pass) return window.showMsg("Enter Number & Password");
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            get("auth").style.display = "none";
            get("app").style.display = "block";
            loadUserData(snap.data(), num);
            loadSettings();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("Not registered!"); }
};

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + (data.name || "User");
    get("username2").innerText = data.name;
    get("useremail").innerText = "Email: " + data.email;
    get("usernumber").innerText = "Mobile: " + num;
    get("userid").innerText = "UID: " + data.uid;
    get("balance").innerText = "₹" + (data.balance || 0);
    
    localStorage.setItem("currentBalance", data.balance || 0);
    localStorage.setItem("userUID", data.uid);

    // Update Account Status UI
    const statusBox = document.querySelector('.card span[style*="color:red"]');
    if (statusBox) {
        if (data.accountStatus === "Active") {
            statusBox.parentElement.innerHTML = `Account Bind Status <span style="color:#00ff00; font-weight:bold;">● <span style="color:white; font-weight:normal;">Activated</span></span>`;
        } else {
            statusBox.parentElement.innerHTML = `Account Bind Status <span style="color:red; font-weight:bold;">● <span style="color:white; font-weight:normal;">Deactivate</span></span>`;
        }
    }

    startLiveTransactions();
    renderReferrals();
}

/* ================= REFERRAL SYSTEM ================= */
async function renderReferrals() {
    const list = get("referralList");
    const userUID = localStorage.getItem("userUID");
    
    const q = query(collection(db, "users"), where("referredBy", "==", userUID));
    const snap = await getDocs(q);
    
    if(snap.empty) {
        list.innerHTML = `<div class="no-data-box">No referrals yet</div>`;
        return;
    }

    let html = "";
    snap.forEach(doc => {
        const d = doc.data();
        html += `<div class="history-item">
                    <span>UID: ${d.uid} (${d.name})</span>
                    <span style="color:#00d4ff;">+₹250</span>
                 </div>`;
    });
    list.innerHTML = html;
}

window.shareReferLink = async () => {
    const userUID = localStorage.getItem("userUID");
    const link = window.location.origin + window.location.pathname + "?ref=" + userUID;
    const shareText = `Join INRPAY! Start earning with my ID: ${userUID}`;

    if (navigator.share) {
        await navigator.share({ title: 'INRPAY', text: shareText, url: link });
    } else {
        navigator.clipboard.writeText(`${shareText} ${link}`);
        window.showMsg("Link Copied!");
    }
};

/* ================= SYSTEM INITIALIZATION ================= */
async function loadSettings() {
    let snap = await getDoc(doc(db, "settings", "main"));
    if(snap.exists()) {
        let d = snap.data();
        get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
        if(d.qr) get("qrImage").src = d.qr;
        get("upiText").innerText = d.upi || "N/A";
        get("amountText").innerText = "₹" + (d.amount || "0");
    }
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.logout = () => { localStorage.clear(); location.reload(); };

window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            getDoc(doc(db, "users", u)).then(s => {
                if(s.exists()){ 
                    get("auth").style.display = "none"; 
                    get("app").style.display = "block"; 
                    loadUserData(s.data(), u); 
                    loadSettings(); 
                }
                setTimeout(window.hideSplash, 2000);
            });
        } else {
            setTimeout(window.hideSplash, 2000);
        }
    });
};
