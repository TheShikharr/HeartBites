import express from "express"
import dotenv from "dotenv"
import {connectdb} from "./lib/db.js"

import authRoutes from "./routes/auth.route.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT


// MIDDLEWARES
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`)
    connectdb()
})