import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"


import {connectdb} from "./lib/db.js"

import authRoutes from "./routes/auth.route.js"
import matchRoutes from "./routes/match.route.js"
import messageRoutes from "./routes/message.route.js"

import { app, server } from "./lib/socket.js"


dotenv.config()

const PORT = process.env.PORT || 8080
const __dirname = path.resolve()


// MIDDLEWARES

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use(cookieParser())
app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "https://heartbites.vercel.app"],
    credentials: true
}))


// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/messages', messageRoutes)



server.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`)
    connectdb()
})