const transcationModel=require("../models/transaction.model")
const ledgerModel=require("../models/ledger.model")
const accountModel=require("../models/account.model")
const emailService=require("../services/email.service")

/** 
 * Create a new Transaction 
 * 
 * >>>>>>>>> STEPS TO CREATE NEW TRANSACTION (10) >>>>>> 10 steps Transfer Flow
 * 1-Validate Request
 * 2-Vaidate IdemPotency key
 * 3-Check account status 
 * 4-Derieve sender Balance from Ledger
 * 5-Create Transaction (Pending)
 * 6-Create Debit Ledger entry
 * 7-Create Credit Ledger entry
 * 8-Mark transaction Completed
 * 9-Commit MongoDB session
 * 10-Send email notification
 * 
 * */ 

async function createTransaction(req,res){
    // validate Request
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body
    //check whether > all parameters came with request 
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount,toAccount,amount and idempotencyKey are Required!"
        })
    }

    //now check > do both given accounts exists in dataBase >>>  are they registered or not 
    const fromUserAccount= await accountModel.findOne({
        _id: fromAccount
    })
     const toUserAccount= await accountModel.findOne({
        _id: toAccount
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Valid toAccount and fromAccounts are Required!"
        }) 
    }

 /**
  * - validate idemPotencyKey >> if transaction with this idempotency already done or not
  */
 const transactionAlreadyDone= await transcationModel.findone({
    idempotencyKey: idempotencyKey
 })

  if (transactionAlreadyDone) {
  if (transactionAlreadyDone.status == "Completed") {
    return res.status(200).json({
      message: "Transaction is already Done!",
      transactionAlreadyDone
    });
  }

  if (transactionAlreadyDone.status == "Pending") {
    return res.status(202).json({
      message: "Transaction is still in process!",
      transactionAlreadyDone
    });
  }

  if (transactionAlreadyDone.status == "Reversed") {
    return res.status(500).json({
      message: "Transaction was Reversed!",
      transactionAlreadyDone
    });
  }

  if (transactionAlreadyDone.status == "Failed") {
    return res.status(500).json({
      message: "Transaction is Failed! Please Try Again!",
      transactionAlreadyDone
    });
  }
}

/**
 * - CHECK account status
 */
if(fromAccount.status!="Active" || toActive.status!="Active"){
return res.status(400).json({
    message:"FromAccount and ToAccount must be Active!"
})
}
}

/**
  * 4-Derieve sender Balance from Ledger
 */

const balance= await fromAccount.getBalance()

if(amount>balance){
    return res.status(400).json({
        message:`There is Insufficient Balance in the account.The current balance is ${balance} and the requested is ${amount}`
    })
}


