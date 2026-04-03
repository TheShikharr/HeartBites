import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:9000",
        credentials:true,
    }
})

// To store online Users
const onlineUsers = {}

export const getReceiverSocketID = (receiverID) => {
    return onlineUsers[receiverID]
}

io.on("connection", (socket) => {

    console.log("A User Connected: ", socket.id)

    const userID = socket.handshake.query.userID

    // add users to online Users
    if(userID) {
        onlineUsers[userID] = socket.id
    }

    // brodcast online users to all connected clients
    io.emit("onlineUsers", Object.keys(onlineUsers))

    // handle disconnect
    socket.on("disconnect", () => {

        console.log("A User Disconnected: ", socket.id)
        delete onlineUsers[userID]
        io.emit("onlineUsers", Object.keys(onlineUsers))

    })
    
})

export { app, server, io }