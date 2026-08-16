const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status: {
        type: String, // <--- Type yahan dena lazmi hai
        enum: {
            values: ["Active", "Frozen", "Closed"],
            message: "Account status can be either Active, Frozen or Closed."
        },
        default: "Active" 
    },
    currency: {
        type: String,
        required: [true, "Currency is required."],
        default: "PKR"
    }
}, { timestamps: true }); 

accountSchema.index({ userID: 1, status: 1 });

const accountModel = mongoose.model("accountModel", accountSchema);

module.exports = accountModel;