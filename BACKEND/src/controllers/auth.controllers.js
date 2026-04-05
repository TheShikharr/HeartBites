import bcrypt from "bcryptjs"
import crypto, { verify } from "crypto"
import User from "../models/user.model.js"
import { generateTokens } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"
import { sendEmailOTP } from "../lib/nodemailer.js"

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}


export const signup = async (req, res) => {

    const {fullName, email, password} = req.body

    try {

        if(!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if(password.length < 6) { 
            return res.status(400).json({ message: "Password must be atleast 6 Characters" })
        }

        const user = await User.findOne({ email })

        if(user) return res.status(400).json({ message: "Email already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Generate OTP
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false,
        })

        await newUser.save()

        await sendEmailOTP(email, otp)

        res.status(201).json({ 
            message: "OTP sent to your email. Please verify to continue.",
            email,
        })


    } catch (error) {

        console.log("Error in SignUP Controllers: ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}


export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body

    try {

        if(!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        const user = await User.findOne({ email })

        if(!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if(user.isVerified) {
            return res.status(400).json({ message: "Email already verified" })
        }

        // check if OTP is expired
        if(user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." })
        }

        // check if OTP matches
        if(user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        // mark user as verified and clear OTP
        user.isVerified = true
        user.otp = null
        user.otpExpiry = null
        await user.save()

        // generate token and login user
        generateTokens(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
        })
        
    } catch (error) {
        
        console.log("Error in verifyOTP Controllers: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }

}


export const resendOTP = async (req, res) => {
    const { email } = req.body

    try {

        if(!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email })

        if(!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if(user.isVerified) {
            return res.status(400).json({ message: "Email already verified" })
        }

        // generate new OTP
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        user.otp = otp
        user.otpExpiry = otpExpiry
        await user.save()

        await sendEmailOTP(email, otp)

        res.status(200).json({ message: "New OTP sent to your email" })

    } catch (error) {
        console.log("Error in resendOTP Controllers: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const login = async (req, res) => {

    const { email, password } = req.body
    try {

        const user = await User.findOne({ email })

        if(!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        if(!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email first" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
           return res.status(400).json({ message: "Invalid Credentials" })
        }

        generateTokens(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
        })
        
    } catch (error) {

        console.log("Error during login: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}


export const logout = (req, res) => {
    try {

        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged Out Successfully" })

    } catch (error) {

        console.log("Error during logout: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}


export const updateProfile = async (req, res) => {

    try {
        
        const { profilePic, gender, dob, bio, genderPreference } = req.body
        const userID = req.user._id

        if( !gender ||
            !dob ||
            !bio ||
            !genderPreference
        ) {
            return res.status(400).json({ message: "All feilds are required" })
        }


        let updatedFields = { gender, dob, bio, genderPreference }

        if(profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic)
            updatedFields.profilePic = uploadResponse.secure_url
        }

        const updatedUser = await User.findByIdAndUpdate(userID, updatedFields, { new: true })

        res.status(200).json(updatedUser)

    } catch (error) {
        
        console.log("Error during Profile Update: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}


export const checkAuth = (req, res) => {
    try {

        res.status(200).json(req.user)
        
    } catch (error) {

        console.log("Error in checkAuth Controllers ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
       
    }
}