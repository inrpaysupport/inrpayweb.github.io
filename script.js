function openPopup(){
document.getElementById("popup").style.display="block";
}

function closePopup(){
document.getElementById("popup").style.display="none";
}

function copyUPI(){
let upi=document.getElementById("upiText").innerText;
navigator.clipboard.writeText(upi);
alert("UPI Copied");
}

function submitDeposit(){
let amt=document.getElementById("amount").value;
let utr=document.getElementById("utr").value;

alert("Deposit Submitted\nAmount: ₹"+amt+"\nUTR: "+utr);

// demo update balance
let balance=document.getElementById("balance");
balance.innerText="₹"+(parseInt(balance.innerText.replace("₹",""))+parseInt(amt||0));
}
