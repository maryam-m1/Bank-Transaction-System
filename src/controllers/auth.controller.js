const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcryptjs=require("bcryptjs")
const emailService=require("../services/email.service")

/**
 * - user registration controller 
 * - POST /api/auth/register
 */
async function userRegistrationController(req, res) {
    try {
        const { email, password, name } = req.body

        // Check if user already exists
        const isExists = await userModel.findOne({ email }).select("+password")
        if (isExists) {
            return res.status(422).json({
                message: "User with this email already exists!",
                success: false,
                status: "failed"
            })
        }

        // Create the new user 
        const user = await userModel.create({
            email,
            password,
            name
        })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
        
        res.cookie("token", token, { httpOnly: true })
                        await emailService.sendRegisterationEmail(user.email,user.name)

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

/**
 * - user login controller 
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        // Find the user by email
        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({
                message: "Email is Invalid!",
                success: false
            })
        }

        // Validate password 
        const validPassword = await user.comparePassword(password)
        if (!validPassword) {
            return res.status(401).json({
                message: "Password is Invalid!",
                success: false
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
        
        res.cookie("token", token, { httpOnly: true })
        
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

module.exports = { userRegistrationController, userLoginController }