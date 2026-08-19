const express=require("express")
const router= express.Router()
const authMiddleware = require("../middelwares/auth.middleware");
const accountController=require("../controllers/account.controller")
/** POST "/api/accounts/"
 * - create new account
 * - protected route 
 */
router.post("/",authMiddleware.authMiddleware,accountController.createAccount)

/**
 * - Get /api/accounts/
 * get all accounts of logged-in users
 * - Protected routes
 */
router.get("/",authMiddleware.authMiddleware,accountController.getAllAccountsController)

/**
 * - Get /api/accounts/balance/:accountId
 * get Balance of an account
 * - Protected routes
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalance)


module.exports=router