const userModel = require("../models/user.model")
const tokenBlackListModel = require("../models/blackList.model")

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
 // check > if it's not Blacklisted
 const isBlackListed=await tokenBlackListModel.findOne({
    token:token
 })
 //if token found in blacklist > means it is invalid > and already blackListed > so 
 if(isBlackListed){
    return res.status(401).json({
        message:"UnAuthorized Access!"
    })
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


/**
 * - for system user
 */
async function authSystemMiddleware(req, res, next){
  try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        console.log("Received Token:", token); // <-- Check whether token is receiving or not

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access! Token is missing."
            });
        }
       // check > if it's not Blacklisted (Yahan spelling theek kar di hai)
 const isBlackListed=await tokenBlackListModel.findOne({
    token:token
 })
 //if token found in blacklist > means it is invalid > and already blackListed > so 
 if(isBlackListed){
    return res.status(401).json({
        message:"UnAuthorized Access!"
    })
 }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Data:", decode); // what is decoded data

      const user = await userModel.findById(decode.userId).select("+systemUser");      
      console.log("Found User:", user); //is user existing in dataBase or not
      
     //Check user exist or not  
      if (!user) {
            return res.status(401).json({
                message: "Unauthorized access! User not found."
            });
        }
      
      //Check user.systemUser flag  
      if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden Access!You are not a system user."
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





module.exports = { authMiddleware,authSystemMiddleware}