const express=require("express")
const authController=require("../controllers/auth.controller")
const router= express.Router()


router.post("/register",authController.userRegistrationController)
router.post("/login",authController.userLoginController)

module.exports=router