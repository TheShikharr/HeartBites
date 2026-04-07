import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.MODE === "production"
    ? "https://heartbites-production.up.railway.app"
    : "http://localhost:9000"

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
})

socket.on("connect", () => {
    console.log("Socket connected:", socket.id)
})

socket.on("disconnect", () => {
    console.log("Socket disconnected")
})

socket.on("connect_error", (err) => {
    console.log("Socket connection error:", err.message)
})