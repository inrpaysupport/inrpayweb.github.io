function register(){
    let u = username.value;
    let p = password.value;

    if(!u || !p) return alert("Fill all");

    localStorage.setItem("user_"+u, p);
    alert("Account Created");
}

function login(){
    let u = username.value;
    let p = password.value;

    if(localStorage.getItem("user_"+u) === p){
        localStorage.setItem("loggedUser", u);
        showDashboard();
    } else {
        alert("Wrong Login");
    }
}

function showDashboard(){
    let user = localStorage.getItem("loggedUser");

    if(user){
        authBox.style.display="none";
        dashboard.style.display="block";
        userNameShow.innerText=user;

        let bal = localStorage.getItem("bal_"+user) || 0;
        balance.innerText="₹"+bal;
    }
}

function logout(){
    localStorage.removeItem("loggedUser");
    location.reload();
}

function openPopup(){
    popup.style.display="flex";
}

function closePopup(){
    popup.style.display="none";
}

function copyUPI(){
    let upi=upiText.innerText;
    navigator.clipboard.writeText(upi);
    alert("UPI Copied");
}

// 🔥 SECURITY DEPOSIT FIX ₹1000
function submitDeposit(){
    let utr = document.getElementById("utr").value;
    let user = localStorage.getItem("loggedUser");

    if(!utr) return alert("Enter UTR");

    let bal = parseInt(localStorage.getItem("bal_"+user) || 0);

    bal += 1000; // fixed deposit

    localStorage.setItem("bal_"+user, bal);
    balance.innerText="₹"+bal;

    alert("₹1000 Deposit Submitted");
    closePopup();
}

function openSupport(){
    window.open("https://wa.me/919999999999?text=INRPay Support");
}

showDashboard();
