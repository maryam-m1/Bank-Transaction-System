const transcationModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const { default: mongoose } = require("mongoose")

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

async function createTransaction(req, res) {
    try {
        // validate Request
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body
        
        // check whether all parameters came with request 
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount and idempotencyKey are Required!"
            })
        }

        // now check do both given accounts exists in dataBase
        const fromUserAccount = await accountModel.findOne({
            _id: fromAccount
        })
        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        })

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Valid toAccount and fromAccounts are Required!"
            }) 
        }

        /**
         * - validate idemPotencyKey >> if transaction with this idempotency already done or not
         */
        const transactionAlreadyDone = await transcationModel.findOne({
            idemPotencyKey: idempotencyKey
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
        if (fromUserAccount.status != "Active" || toUserAccount.status != "Active") {
            return res.status(400).json({
                message: "FromAccount and ToAccount must be Active!"
            })
        }

        /**
         * 4-Derieve sender Balance from Ledger
         */
        const balance = await fromUserAccount.getBalance()

        if (amount > balance) {
            return res.status(400).json({
                message: `There is Insufficient Balance in the account. The current balance is ${balance} and the requested is ${amount}`
            })
        }

        /**
         * 5-Create Transaction (Pending)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await transcationModel.create([{
            fromAccount,
            toAccount,
            amount,
            idemPotencyKey: idempotencyKey,
            status: "Pending"
        }], { session })

        const createdTransaction = transaction[0];

        await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transcation: createdTransaction._id,
            type: "Debit"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transcation: createdTransaction._id,
            type: "Credit"
        }], { session })

        // complete > save > commit
        createdTransaction.status = "Completed"
        await createdTransaction.save({ session })
        await session.commitTransaction()
        session.endSession()

        /**
         * 10-Send email notification
         */
        await emailService.sendSuccessfulTransactionEmail(req.user.email, req.user.name, amount, toAccount)
        
        return res.status(200).json({
            message: "Transaction Completed Successfully!",
            transaction: createdTransaction
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}



/**
 * -Create initial Funds transaction from System user
 * used by the system/admin to inject the very first starting balance into a newly created bank account 
 * (since a new account starts with zero balance and has no sender account).
 * - HANDLED BY SYSTEM/ADMIN >  SO NO NEED OF [FROM ACCOUNT] , ONLY NEED [TO ACCOUNT] OF (NEWLY CREATED USER)
 */
async function createInitialFunds(req, res) {
    try {
        const { toAccount, amount, idempotencyKey } = req.body
        
        // check whether all parameters came with request 
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are Required!"
            })
        }
        
        // TO ACCOUNT
        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        })

        if (!toUserAccount) {
            return res.status(400).json({
                message: "Valid toAccount is Required!"
            }) 
        }

        // FROM ACCOUNT (System User - checking req.body.fromAccount or finding system user)
        const fromUserAccount = await accountModel.findOne({
            systemUser: true,
            user: req.body.fromAccount || toUserAccount.user
        })
        
        if (!fromUserAccount) {
            return res.status(400).json({
                message: "System user Account not Found!"
            }) 
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await transcationModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idemPotencyKey: idempotencyKey,
            status: "Pending"
        }], { session })

        const createdTransaction = transaction[0];

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transcation: createdTransaction._id,
            type: "Debit"
        }], { session })

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transcation: createdTransaction._id,
            type: "Credit"
        }], { session })

        createdTransaction.status = "Completed"
        await createdTransaction.save({ session })
        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: "Initial Fund Transaction Completed successfully!",
            transaction: createdTransaction
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}





module.exports = { createTransaction, createInitialFunds }