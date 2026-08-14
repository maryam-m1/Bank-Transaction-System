const mongoose=require("mongoose")


function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Server is connected to DataBase!")
    })
    .catch(error=>{
        console.error("DataBase can't be connected because > ",error)
        process.exit(1)
    })
}

module.exports=connectToDB;