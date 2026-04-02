import User from "../models/user.model.js"
import Match from "../models/match.model.js"
import Message from "../models/message.model.js"

export const sendMessage = async(req, res) => {
    try {

        const { content } = req.body
        const senderID = req.user._id
        const receiverID = req.params.id

        if(!content) {
            return res.status(400).json({ message: "Message Content required" })
        }

        // Check if Both users are match
        const match = await Match.findOne({
            users: { $all: [senderID, receiverID] }
        })

        if(!match) {
            return res.status(403).json({ message: "You can only message matched User" })
        }

        const newMessage = await Message.create({
            senderID,
            receiverID,
            content,
        })

        res.status(201).json({ message: newMessage })


    } catch (error) {

        console.log("Error in sendMessage Controllers: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}

export const getMessage = async(req, res) => {
    try {

        const senderID = req.user._id
        const receiverID = req.params.id 
        
        // Check if Both users are match
        const match = await Match.findOne({
            users: { $all: [senderID, receiverID] }
        })

        if(!match) {
            return res.status(403).json({ message: "You can only message matched User" })
        }

        const messages = await Message.find({
            $or: [
                { senderID: senderID, receiverID: receiverID },
                { senderID: receiverID, receiverID: senderID },
            ]
        }).sort({ createdAt: 1 })

        res.status(200).json({ messages })
        
    } catch (error) {

        console.log("Error in getMessage Controllers: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
        
    }
}