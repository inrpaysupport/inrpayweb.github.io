import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});
const db = getFirestore(app);
const get = id => document.getElementById(id);

/* ================= LOGIN LOGIC ================= */
window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));

    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        loadUserData(snap.data(), num);
        loadHomeBank(); // Home bank load
        loadWithdrawBank(); // Earning bank load
        loadSettings();
    } else { window.showMsg("Invalid Credentials!"); }
};

/* ================= BANK ACCOUNT LOGIC (ALAG ALAG) ================= */
window.saveHomeBank = async () => {
    await setDoc(doc(db, "home_bank", localStorage.getItem("user")), {
        bank: get("homeBankName").value,
        acc: get("homeBankAcc").value,
        ifsc: get("homeBankIfsc").value
    });
    window.showMsg("Home Bank Saved!");
};

window.saveWithdrawBank = async () => {
    await setDoc(doc(db, "withdraw_bank", localStorage.getItem("user")), {
        bank: get("earnBankName").value,
        acc: get("earnBankAcc").value,
        ifsc: get("earnBankIfsc").value
    });
    window.showMsg("Withdrawal Bank Updated!");
};

/* ================= WITHDRAWAL LOGIC ================= */
window.submitWithdraw = async () => {
    let amt = Number(get("withdrawAmount").value);
    let bal = Number(localStorage.getItem("currentBalance") || 0);

    if(bal < 200) return window.showMsg("Failed: Minimum ₹200 Balance Required.");
    if(!amt || amt < 100) return window.showMsg("Minimum withdraw is ₹100");

    await setDoc(doc(db, "withdraw", Date.now().toString()), {
        user: localStorage.getItem("user"),
        amount: amt,
        status: "Pending"
    });
    window.showMsg("Request Submitted!");
};

async function loadHomeBank() {
    let snap = await getDoc(doc(db, "home_bank", localStorage.getItem("user")));
    if(snap.exists()){
        get("homeBankName").value = snap.data().bank;
        get("homeBankAcc").value = snap.data().acc;
        get("homeBankIfsc").value = snap.data().ifsc;
    }
}

async function loadWithdrawBank() {
    let snap = await getDoc(doc(db, "withdraw_bank", localStorage.getItem("user")));
    if(snap.exists()){
        get("earnBankName").value = snap.data().bank;
        get("earnBankAcc").value = snap.data().acc;
        get("earnBankIfsc").value = snap.data().ifsc;
    }
}

function loadUserData(data, num) {
    get("usernameHome").innerText = "Hello, " + data.name;
    get("balance").innerText = "₹" + (data.balance || 0);
    localStorage.setItem("currentBalance", data.balance || 0);
}

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};

window.onload = () => { window.showLogin(); };
