body{
margin:0;
font-family:Arial;
background:linear-gradient(135deg,#2b0a4a,#6a11cb);
color:white;
}

/* REMOVE BLUE TOUCH */
*{
-webkit-tap-highlight-color: transparent;
outline:none;
}

/* CARD */
.card{
margin:15px;
padding:20px;
border-radius:20px;
background:#ffffff20;
}

/* SERVICES */
.services{
display:flex;
justify-content:space-around;
margin:20px;
}

.services div{
background:#ffffff20;
padding:15px;
border-radius:15px;
width:40%;
text-align:center;
cursor:pointer;
}

/* TRANSACTION */
.txRow{
display:flex;
justify-content:space-between;
}

.txRight{
display:flex;
gap:6px;
}

.dot{
width:8px;
height:8px;
border-radius:50%;
background:red;
}

/* POPUP */
.popup{
display:none;
position:fixed;
width:100%;
height:100%;
background:#00000080;
justify-content:center;
align-items:center;
}

.popup.active{
display:flex;
}

/* WITHDRAW */
.withdrawUI{
background:#f5f5f5;
color:black;
padding:15px;
border-radius:20px;
width:90%;
}

.withdrawCard{
background:white;
padding:15px;
border-radius:15px;
}

.withdrawForm input{
width:100%;
padding:12px;
border-radius:10px;
margin-bottom:10px;
}

.withdrawForm button{
width:100%;
padding:12px;
background:#b084f5;
border:none;
border-radius:20px;
color:white;
}

/* NAV */
.bottomNav{
position:fixed;
bottom:0;
width:100%;
display:flex;
justify-content:space-around;
background:#111;
padding:10px;
}

/* LIST */
.listItem{
background:white;
color:black;
margin:5px;
padding:10px;
border-radius:10px;
}