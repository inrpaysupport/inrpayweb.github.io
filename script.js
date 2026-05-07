import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const auth = getAuth(app);
const get = id => document.getElementById(id);

/* ================= UI UTILS ================= */
window.showMsg = (t) => { get("msgText").innerText = t; get("msgBox").classList.add("active"); };
window.closeMsg = () => get("msgBox").classList.remove("active");
window.togglePass = () => { let p = get("password"); p.type = p.type === "password" ? "text" : "password"; };

/* ================= AUTH ================= */
window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    const snap = await getDoc(doc(db, "users", num));
    if (snap.exists()) {
        try {
            await signInWithEmailAndPassword(auth, snap.data().email, pass);
            localStorage.setItem("user", num);
            location.reload();
        } catch (e) { window.showMsg("Wrong Password!"); }
    } else { window.showMsg("User not found!"); }
};

/* ================= SETTINGS: PASSWORD CLEAR ================= */
window.changePassword = async () => {
    const user = auth.currentUser;
    const oldP = get("oldPass");
    const newP = get("newPass");
    if (!oldP.value || !newP.value) return window.showMsg("Fill both fields!");
    try {
        const cred = EmailAuthProvider.credential(user.email, oldP.value);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newP.value);
        await updateDoc(doc(db, "users", localStorage.getItem("user")), { password: newP.value });
        window.showMsg("Password Updated!");
        // Clear password inputs
        oldP.value = ""; newP.value = "";
    } catch (e) { window.showMsg("Error: " + e.message); }
};

/* ================= BANK HISTORY & CLEAR INPUTS ================= */
window.openBank = () => { renderBankHistory(); get("bankBox").classList.add("active"); };
window.closeBank = () => get("bankBox").classList.remove("active");

async function renderBankHistory() {
    const user = localStorage.getItem("user");
    const list = get("bankHistoryList");
    const actBtn = get("activateAccBtn");
    const snap = await getDoc(doc(db, "bank_home", user));
    if(snap.exists()) {
        const d = snap.data();
        list.innerHTML = `<div class="bank-history-item"><b>Holder:</b> ${d.bank}<br><b>A/C:</b> ${d.acc}<br><b>IFSC:</b> ${d.ifsc}</div>`;
        actBtn.style.display = "block";
    } else {
        list.innerHTML = `<p style="font-size:12px; color:#666;">No bank bound yet.</p>`;
        actBtn.style.display = "none";
    }
}

window.saveHomeBank = async () => {
    const user = localStorage.getItem("user");
    const nameInput = get("homeBankName");
    const accInput = get("homeBankAcc");
    const ifscInput = get("homeBankIfsc");

    const data = { bank: nameInput.value, acc: accInput.value, ifsc: ifscInput.value };
    if(!data.bank || !data.acc || !data.ifsc) return window.showMsg("Fill all fields!");

    try {
        await setDoc(doc(db, "bank_home", user), data);
        window.showMsg("Bank Saved!");
        
        // Yahan boxes khali ho jayenge
        nameInput.value = ""; 
        accInput.value = ""; 
        ifscInput.value = "";

        renderBankHistory();
    } catch (e) { window.showMsg("Error!"); }
};

window.triggerActivate = () => {
    get("bankBox").classList.remove("active");
    window.showMsg("Please deposit security amount first");
};

/* ================= WITHDRAW BANK (ALAG COLLECTION) ================= */
window.saveWithdrawBank = async () => {
    const user = localStorage.getItem("user");
    const data = { bank: get("earnBankName").value, acc: get("earnBankAcc").value, ifsc: get("earnBankIfsc").value };
    if(!data.bank || !data.acc) return window.showMsg("Fill details!");
    
    // Alag firebase collection: bank_earning
    await setDoc(doc(db, "bank_earning", user), data);
    window.showMsg("Withdraw Bank Updated!");
};

/* ================= LOAD DATA ================= */
window.onload = () => {
    onAuthStateChanged(auth, async (user) => {
        let u = localStorage.getItem("user");
        if (user && u) {
            const s = await getDoc(doc(db, "users", u));
            if(s.exists()){
                get("auth").style.display = "none"; get("app").style.display = "block";
                get("usernameHome").innerText = "Hello, " + s.data().name;
                get("balance").innerText = "₹" + (s.data().balance || 0);
                get("username2").innerText = s.data().name;
                get("userid").innerText = "UID: " + s.data().uid;
            }
        }
    });
};

window.showPage = (id) => {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    get(id).style.display = "block";
};
window.logout = () => { localStorage.clear(); location.reload(); };
