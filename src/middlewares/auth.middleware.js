import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = asyncHandler(async (req, res, next) =>{
    try {
        // get the user from the session or jwt token and add id to req object
        const token = req.cookies?.authToken || req.header("auth-token")
        
        if(!token){
            return res
            .status(401)
            .json(new ApiError(401, "Please authenticate using a valid token"))
        }
    
        // verify token 
        const decodedToken = Jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decodedToken
        
        next();

    } 
    catch(error){
        return res
        .status(500)
        .json(new ApiError(500, "Some error has occured or Please authenticate using a valid token ", error))
    }
})

export {verifyToken}