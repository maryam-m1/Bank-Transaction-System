const mongoose = require("mongoose")
const transcationModel = require("./transaction.model")

const ledgerSchema = new mongoose.Schema({
   account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with account"],
        index: true,
        immutable: true
   },
   amount: {
        type: Number,
        required: [true, "Amount is required for creating a transcation"],
        immutable: true,
        min: [0, "Amount cannot be negative"]
    },
    transcation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with transaction"],
        index: true,
        immutable: true 
    },
    type: {
      type: String,
      enum: {
        values: ["Credit", "Debit"],
        message: "Must be Credit or Debit"
      },
      required: [true, "Ledger Type must be given"],
      immutable: true
    }
})

// Hook > so no one will modify ledger 
function preventledgerModification() {
    throw new Error("Ledger cannot be modified!")
}

ledgerSchema.pre("findOneAndUpdate", preventledgerModification)
ledgerSchema.pre("remove", preventledgerModification)
ledgerSchema.pre("updateOne", preventledgerModification)
ledgerSchema.pre("deleteOne", preventledgerModification)
ledgerSchema.pre("deleteMany", preventledgerModification)
ledgerSchema.pre("findOneAndDelete", preventledgerModification)
ledgerSchema.pre("findOneAndReplace", preventledgerModification)

const ledgerModel = mongoose.model("ledger", ledgerSchema)

module.exports = ledgerModel