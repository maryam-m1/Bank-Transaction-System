const express=require("express")
const router= express.Router()
const transactionController=require("../controllers/transaction.controller")

const authMiddleware=require("../middelwares/auth.middleware")


/**  create a new transaction
* - /api/transactions/
*/
routes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)





module.exports=router