const accountModel=require("../models/account.model")

async function createAccount(req,res){
const user=req.user
const account= await accountModel.create({
    userID:user._id
})
res.status(201).json({
    message:"Account is created successfully!",
    account
})
} 

/**
 * to get all Accounts
 */
async function getAllAccountsController(req,res){
const accounts=await accountModel.find({
    userID:req.user._id
})
return res.status(200).json({
    accounts
})
}


/**
 * - To get Balance of an Account 
 */
async function getAccountBalance(req, res) {
    try {
        const { accountId } = req.params;
        
        const account = await accountModel.findOne({
            _id: accountId,
            userID: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not Found!"
            });
        }

        const balance = await account.getBalance();
        return res.status(200).json({
            account_ID: account._id,
            balance: balance
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}
module.exports={createAccount,getAllAccountsController,getAccountBalance}