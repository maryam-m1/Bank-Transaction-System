require("dotenv").config()

const dns=require("dns")
dns.setServers(['8.8.8.8','8.8.4.4'])

const app=require("./src/app")
const connectToDb=require("./src/config/db")

connectToDb()
app.listen(3000,'0.0.0.0',()=>{
    try{
    console.log("Server is running on port 3000!")
    }
    catch(error){
        console.error("Server is not running because of this error >",error)
    }
})
