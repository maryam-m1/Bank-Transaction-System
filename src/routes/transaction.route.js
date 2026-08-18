const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middelwares/auth.middleware")

/**  create a new transaction
* - /api/transactions/
*/
router.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)



/**
 * -POST/api/transactions/system/initial-funds
 * -Create initial Funds transaction from System user
 */
router.post("/systems/initial-funds",authMiddleware.authSystemMiddleware,transactionController.createInitialFunds)

module.exports = router