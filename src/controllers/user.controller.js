import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";


const registerUser = asyncHandler(async (req, res) => {
    // take user detail and check every feild
    const { username, email, password } = req.body

    if ([username, email, password].some((field) => field.trim() === "")) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }

    try {
        // check if email already exist or not
        const existedUserByEmail = await User.findOne({ email: email })
        if (existedUserByEmail) {
            return res
                .status(409)
                .json(new ApiError(409, "User with this email already exists"))
        }

        // check if username already exist or not
        const existedUserByUsername = await User.findOne({ username: username })
        if (existedUserByUsername) {
            return res
                .status(409)
                .json(new ApiError(409, "User with this username already exists"))
        }

        // create user object - create entry in db
        const user = await User.create({
            username,
            email,
            password
        })

        // check for user creation
        const createdUser = await User.findById(user._id).select("-password")
        if (!createdUser) {
            return res
                .status(500)
                .json(new ApiError(500, "User registration failed"))
        }

        // Generate JWT token with user ID
        const authToken = Jwt.sign(
            { 
                _id: user._id,
                username: user.username,
                email: user.email 
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.JWT_SECRET_KEY_EXPIRY
            }
        )

        // send cookie
        const options = {
            httpOnly: true,
            secure: true, 
            maxAge: 1000 * 60 * 60 * 24 // 1 day expiry
        }

        // send response
        return res
            .status(201)
            .cookie("authToken", authToken, options)
            .json(new ApiResponse(201, createdUser, "User registered successfully"))

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }

})


const loginUser = asyncHandler(async (req, res) => {
    // take email and password
    const { email, password } = req.body

    if (!email && !password) {
        return res
            .status(400)
            .json(new ApiError(400, "Email and Password both required"))
    }

    try {
        // check user email exist or not
        const user = await User.findOne({ email })
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, "User not found"))
        }

        // compare password
        const verifyPassword = await user.verifyPassword(password)
        if (!verifyPassword) {
            return res
                .status(400)
                .json(new ApiError(400, "Invalid password"))
        }

        const loggedInUser = await User.findById(user._id).select("-password")

        // Generate JWT token with user ID
        const authToken = Jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.JWT_SECRET_KEY_EXPIRY
            }
        )

        // send cookie
        const options = {
            httpOnly: true,
            secure: true, 
            maxAge: 1000 * 60 * 60 * 24 // 1 day expiry
        }
        
        // send response
        return res
            .status(200)
            .cookie("authToken", authToken, options)
            .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "An unexpected error occurred. Please try again later", error))
    }

})


const logoutUser = asyncHandler(async (req, res)=> {

    // send cookie
    const options = {
        httpOnly: true,
        secure: true, 
        maxAge: 0 
    }

    return res
    .status(200)
    .clearCookie("authToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
}
