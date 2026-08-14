const express=require("express");
const authRouter=require("./routes/auth.routes")
const cookieParser = require('cookie-parser');
const app=express();

//Middlewares
app.use(express.json())
app.use(cookieParser())


//APis
app.use("/api/auth",authRouter) 

module.exports=app