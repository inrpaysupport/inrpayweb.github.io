// REGISTER
function register(){
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    if(!u || !p) return alert("Fill all fields");

    localStorage.setItem("user_"+u, p);
    alert("Account Created");
}

// LOGIN
function login(){
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    let saved = localStorage.getItem("user_"+u);

    if(saved === p){
        localStorage.setItem("loggedUser", u);
        showDashboard();
    } else {
        alert("Wrong Login");
    }
}

// SHOW DASHBOARD
function showDashboard(){
    let user = localStorage.getItem("loggedUser");

    if(user){
        document.getElementById("authBox").style.display="none";
        document.getElementById("dashboard").style.display="block";
        document.getElementById("userNameShow").innerText=user;

        // balance default 0
        let bal = localStorage.getItem("bal_"+user) || 0;
        document.getElementById("balance").innerText="₹"+bal;
    }
}

// LOGOUT
function logout(){
    localStorage.removeItem("loggedUser");
    location.reload();
}

// POPUP
function openPopup(){
    document.getElementById("popup").style.display="block";
}
function closePopup(){
    document.getElementById("popup").style.display="none";
}

// COPY UPI
function copyUPI(){
    let upi=document.getElementById("upiText").innerText;
    navigator.clipboard.writeText(upi);
    alert("UPI Copied");
}

// DEPOSIT (DEMO)
function submitDeposit(){
    let amt = parseInt(document.getElementById("amount").value || 0);
    let user = localStorage.getItem("loggedUser");

    let bal = parseInt(localStorage.getItem("bal_"+user) || 0);
    bal += amt;

    localStorage.setItem("bal_"+user, bal);
    document.getElementById("balance").innerText="₹"+bal;

    alert("Deposit Submitted");
}

// SUPPORT (AUTO)
function openSupport(){
    window.open("https://wa.me/919999999999?text=Hello%20INRPay%20Support");
}

// AUTO LOGIN CHECK
showDashboard();
