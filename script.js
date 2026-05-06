import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyBh-J9LAYeCfxNoKw9C94gbCqVhELofuoo",
    authDomain: "inrpay-44413.firebaseapp.com",
    projectId: "inrpay-44413"
});

const db = getFirestore(app);
const get = id => document.getElementById(id);

// ... (Auth & Page Functions Same) ...

/* ================= SETTINGS & QR LOAD FIX ================= */
async function loadSettings() {
    try {
        const snap = await getDoc(doc(db, "settings", "main"));
        if(snap.exists()) {
            const d = snap.data();
            
            // Notice update
            if(get("scrollingNotice")) get("scrollingNotice").innerText = d.notice || "Welcome to INRPAY";
            
            // Amount Update
            if(get("amountText")) get("amountText").innerText = "₹" + (d.amount || "0");

            // UPI ID Update
            if(get("upiText")) get("upiText").innerText = "UPI ID: " + (d.upi || "N/A");

            // QR Image Display Logic
            const qrImgElement = get("qrImage");
            if(d.qr && d.qr !== "") {
                qrImgElement.src = d.qr;
                qrImgElement.style.display = "block"; // Show if URL exists
            } else {
                qrImgElement.style.display = "none"; // Hide if no URL
                console.log("No QR found in database");
            }
        }
    } catch (err) {
        console.error("Error loading settings:", err);
    }
}

/* ================= LOGIN UPDATED TO LOAD SETTINGS ================= */
window.login = async () => {
    let num = get("number").value;
    let pass = get("password").value;
    let snap = await getDoc(doc(db, "users", num));

    if (snap.exists() && snap.data().password === pass) {
        localStorage.setItem("user", num);
        get("auth").style.display = "none";
        get("app").style.display = "block";
        
        // Data Load functions
        loadUserData(snap.data(), num);
        await loadSettings(); // Settings (QR) load pehle karein
        loadBankData(); 
    } else {
        window.showMsg("Invalid credentials!");
    }
};

// ... (Rest of functions saveBank, submitWithdraw same) ...

window.onload = () => {
    if(localStorage.getItem("user")) {
        // Agar pehle se login hai toh settings load karein
        get("auth").style.display = "none";
        get("app").style.display = "block";
        loadSettings();
    } else {
        window.showRegister();
    }
};
