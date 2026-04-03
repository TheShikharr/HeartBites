import express from "express"
import { login, logout, signup, updateProfile, checkAuth, verifyOTP, resendOTP } from "../controllers/auth.controllers.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/verify-OTP', verifyOTP)
router.post('/resend-OTP', resendOTP)
router.post('/login', login)
router.post('/logout', logout)

router.put('/update-profile', protectRoute, updateProfile)

router.get('/check', protectRoute, checkAuth)

export default router