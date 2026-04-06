import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials:true,
    }
})

// To store online Users
const onlineUsers = {}

export const getReceiverSocketID = (receiverID) => {
    return onlineUsers[receiverID]
}

io.on("connection", (socket) => {

    // handle userConnected event
    socket.on("userConnected", (userID) => {
        if(userID) {
            onlineUsers[userID] = socket.id
        }
        io.emit("onlineUsers", Object.keys(onlineUsers))
    })

    socket.on("disconnect", () => {
        // remove from online users
        const userID = Object.keys(onlineUsers).find(
            key => onlineUsers[key] === socket.id
        )
        if(userID) delete onlineUsers[userID]
        io.emit("onlineUsers", Object.keys(onlineUsers))
    })
})

export { app, server, io }