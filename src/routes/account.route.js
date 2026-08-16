const express=require("express")
const router= express.Router()
const authMiddleware = require("../middelwares/auth.middleware");
const accountController=require("../controllers/account.controller")
/** POST "/api/accounts/"
 * - create new account
 * - protected route 
 */
router.post("/",authMiddleware.authMiddleware,accountController.createAccount)



module.exports=router