const mongoose = require('mongoose');
const bcryptjs=require("bcryptjs")
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: [true,"Email already exist!"],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
    name: {
    type: String,
    required: [true, 'Name is required'],
    // Allows letters, spaces, hyphens, and apostrophes; 2 to 50 characters
    match: [/^[a-zA-Z\s'-]{2,50}$/, 'Please enter a valid name']
  },
    password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function (value) {
        // Regex for: 1+ uppercase, 1+ lowercase, 1+ digit, 1+ special char, 8+ total chars
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },
  systemUser:{
   type:Boolean,
   default:false,
   immutable:true,
   select:false 
  }
});

userSchema.pre("save",async function(next){

if(!this.isModified("password")){
  return 
}
const hash= await bcryptjs.hash(this.password,10)
this.password=hash
return
})

userSchema.methods.comparePassword= async function(password){
  return await bcryptjs.compare(password,this.password)
}

const userModel = mongoose.model("User", userSchema);
module.exports=userModel