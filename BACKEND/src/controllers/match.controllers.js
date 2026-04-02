import User from "../models/user.model.js"
import Match from "../models/match.model.js"


const calculatedAge = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if(monthDiff<0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}


export const getUserProfiles = async (req, res) => {
    try {
        
        const currentUser = await User.findById(req.user._id)

        const existingMatches = await Match.find({ users: req.user._id })

        const matchedUserIDs = existingMatches.map((match) =>
                match.users.find(id => id.toString() !== req.user._id.toString())
        )

        const users = await User.find({
            $and: [
                { _id: { $ne: currentUser._id } },
                { id: { $nin: currentUser.likes } },
                { id: { $nin: currentUser.dislikes } },
                { id: { $nin: matchedUserIDs } },
                { gender: currentUser.genderPreference === "everyone"
                    ? { $in: ["male", "female", "other"] } : currentUser.genderPreference
                 }
            ]
        }).select("fullName profilePic bio gender dob")

        const filteredUsers = users
        .filter( u => u._id.toString() !== req.user._id.toString() )
        .map(u => ({
            _id: u._id,
            fullName: u.fullName,
            profilePic: u.profilePic,
            gender: u.gender,
            bio: u.bio,
            age: calculatedAge(u.dob)
        }))

        res.status(200).json({ users: filteredUsers })

    } catch (error) {

        console.log("Error in getUserProfiles controller: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}

export const getMatches = async (req, res) => {
    try {

        const matches = await Match.find({ users: req.user._id }).populate("users", "fullName profilePic dob gender")

        const formattedMatches = matches.map( match => ({
            _id: match._id,
            users: match.users.map( u => ({
                _id: u._id,
                fullName: u.fullName,
                profilePic: u.profilePic,
                gender: u.gender,
                bio: u.bio,
                age: calculatedAge(u.dob), 
            }))
        }))

        res.status(200).json({ matches: formattedMatches })
        
    } catch (error) {

        console.log("Error in getMatches controller: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}

export const swipeRight = async(req, res) => {
    try {

        const currentUser = await User.findById(req.user._id)
        const likedUser = await User.findById(req.params.id)

        if(!likedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        if(currentUser.likes.includes(likedUser._id)) {
            return res.status(400).json({ message: "User already liked" })
        }

        // add to likes
        currentUser.likes.push(likedUser._id)
        await currentUser.save()

        if(likedUser.likes.includes(currentUser._id)) {
            await Match.create({
                users: [currentUser._id, likedUser._id]
            })
            return res.status(200).json({ message: "It's a Match", isMatch: true })
        }

        res.status(200).json({ message: "Liked Successfully", isMatch: false })
        
    } catch (error) {
        
        console.log("Error in swipeRight controller: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}

export const swipeLeft = async(req, res) => {
    try {
        
        const currentUser = await User.findById(req.user._id)
        const passedUser = await User.findById(req.params.id)

        if(!passedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        if(currentUser.dislikes.includes(passedUser._id)) {
            return res.status(400).json({ message: "User already passed" })
        }

        currentUser.dislikes.push(passedUser._id)
        await currentUser.save()

        res.status(200).json({ message: "Passed Successfully" })

    } catch (error) {

        console.log("Error in swipeLeft controller: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })

    }
}