const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status: {
        type: String, 
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

/***
 * - Aggregate PipeLine
 */
accountSchema.methods.getBalance = async function() {
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Debit"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Credit"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ]);

    // if first transaction from account and no ledger entry is made yet
    if (!balanceData || balanceData.length === 0) {
        return 0;
    }

    return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;