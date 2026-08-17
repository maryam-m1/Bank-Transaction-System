const mongoose=require("mongoose")

const transcationSchema=new mongoose.Schema({

fromAccount:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"Transcation must be associated from an account."],
    index:true
},
toAccount:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"Transcation must be associated with a to account."],
    index:true
},
status:{
    type:String,
    enum:{
        values:["Pending","Completed","Failed","Reversed"],
        message:"Status must be Pending,Completed,Failed or Reversed"
    },
    default:"Pending"
},
amount:{
    type:Number,
    required:[true,"Amount is required for creating a transcation"],
    min:[0,"Amount cannot be negative"]
},
idemPotencyKey:{
    type:String ,
    required:[true,"Idem potency key is necessary"],
    unique:[true],
    index:true
}
},
{
    timestamps:true
})

const transcationModel= mongoose.model("transaction",transcationSchema)

module.exports=transcationModel