import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true,
        unique: true,
    },

    fullName: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    profilePic: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },

    dob: {
        type: Date,
    },

    bio: {
        type: String,
        default: ""
    },

    genderPreference: {
        type: String,
        enum: ["male", "female", "other", "everyone"],
        default: "everyone"
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User