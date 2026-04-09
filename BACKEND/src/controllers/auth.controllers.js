import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateTokens } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body

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

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })

        await newUser.save()

        generateTokens(newUser._id, res)

        res.status(201).json({ 
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        })

    } catch (error) {
        console.log("Error in SignUP Controllers: ", error.message)
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
        })
        
    } catch (error) {

        console.log("Error during login: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}


export const logout = (req, res) => {
    try {

        res.cookie("jwt", "", { 
            maxAge: 0,
            httpOnly: true,
            sameSite: "None",
            secure: true,
        })
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
            return res.status(400).json({ message: "All fields are required" })
        }

        // Age validation
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return res.status(400).json({ message: "You must be at least 18 years old" });
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