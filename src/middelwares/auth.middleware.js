const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        console.log("Received Token:", token); // <-- Check karein token mil raha hai ya nahi

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access! Token is missing."
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Data:", decode); // what is decoded data

      const user = await userModel.findById(decode.userId);      
      console.log("Found User:", user); //is user existing in dataBase or not
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access! User not found."
            });
        }

        req.user = user;
        return next();

    } catch (error) {
        console.log("Auth Error:", error.message); //JWT error
        return res.status(401).json({
            message: "Unauthorized access! Token is invalid.",
            error: error.message
        });
    }
}

module.exports = { authMiddleware }