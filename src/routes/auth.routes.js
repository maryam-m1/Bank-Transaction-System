const express=require("express")
const authController=require("../controllers/auth.controller")
const router= express.Router()

// Register API
router.post("/register",authController.userRegistrationController)
// Login API
router.post("/login",authController.userLoginController)
// Logout API
router.post("/logout",authController.userLogoutController)


module.exports=router