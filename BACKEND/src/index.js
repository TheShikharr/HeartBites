import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"


import {connectdb} from "./lib/db.js"
import authRoutes from "./routes/auth.route.js"
import matchRoutes from "./routes/match.route.js"
import messageRoutes from "./routes/message.route.js"


dotenv.config()
const app = express()
const PORT = process.env.PORT


// MIDDLEWARES
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:9000",
    credentials: true
}))


// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/messages', messageRoutes)



app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`)
    connectdb()
})