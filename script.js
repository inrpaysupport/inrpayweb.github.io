import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

// Custom Message Popup
window.showMsg = (t) => {
    get("msgText").innerText = t;
    get("msgBox").classList.add("active");
};
window.closeMsg = () => get("msgBox").classList.remove("active");

// Bank History Logic (Inside Popup)
function renderBankPopupHistory() {
    let list = get("bankHistoryList");
    let history = JSON.parse(localStorage.getItem("bank_history") || "[]");
    if (history.length === 0) {
        list.innerHTML = `<div class="no-data-box" style="padding: 10px; font-size: 10px;">No history available</div>`;
    } else {
        list.innerHTML = history.reverse().map(item => `
            <div class="bank-hist-item">
                <b>Bank:</b> ${item.bank}<br>
                <b>A/C:</b> ${item.acc}<br>
                <small style="color:#888;">${item.date}</small>
            </div>
        `).join('');
    }
}

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const bank = get("homeBankName").value;
    const acc = get("homeBankAcc").value;
    const ifsc = get("homeBankIfsc").value;
    const now = new Date().toLocaleString();

    if(!bank || !acc) return window.showMsg("Please fill all details!");

    const data = { bank, acc, ifsc, date: now };
    
    try {
        await setDoc(doc(db, "bank_home", user), data); // Firebase
        
        let history = JSON.parse(localStorage.getItem("bank_history") || "[]");
        history.push(data);
        localStorage.setItem("bank_history", JSON.stringify(history));
        
        window.showMsg("Bank Details Saved!");
        renderBankPopupHistory();
    } catch (e) { window.showMsg("Error saving data"); }
};

window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const data = { 
        bank: get("earnBankName").value, 
        acc: get("earnBankAcc").value, 
        ifsc: get("earnBankIfsc").value 
    };
    if(!data.bank || !data.acc) return window.showMsg("Fill withdrawal bank details!");
    
    try {
        await setDoc(doc(db, "bank_earning", user), data); // Firebase save fix
        window.showMsg("Withdraw Bank Updated in Database!");
    } catch (e) { window.showMsg("Database Error!"); }
};

// Auth & App Logic
window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    const userRef = doc(db, "users", num);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            location.reload();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("User not found!"); }
};

window.register = async () => {
    let name = get("name").value;
    let num = get("number").value;
    let email = get("email").value;
    let pass = get("password").value;
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", num), { name, email, balance: 0, uid: Date.now() });
        window.showMsg("Account Created! Please Login.");
        showLogin();
    } catch (e) { window.showMsg(e.message); }
};

window.openBank = () => { renderBankPopupHistory(); get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");
window.deposit = () => get("depositBox").classList.add("active");
window.closeDeposit = () => get("depositBox").classList.remove("active");
window.showPage = (id) => { document.querySelectorAll(".page").forEach(p => p.style.display="none"); get(id).style.display="block"; };
window.logout = () => { localStorage.clear(); location.reload(); };

// Initialization
onAuthStateChanged(auth, async (user) => {
    let u = localStorage.getItem("user");
    if (user && u) {
        get("auth").style.display = "none";
        get("app").style.display = "block";
        const s = await getDoc(doc(db, "users", u));
        if(s.exists()){
            get("usernameHome").innerText = "Hello, " + s.data().name;
            get("balance").innerText = "₹" + s.data().balance;
            get("username2").innerText = s.data().name;
            get("userid").innerText = "UID: " + s.data().uid;
        }
    }
});
