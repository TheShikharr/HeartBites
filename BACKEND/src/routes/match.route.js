import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { getUserProfiles, getMatches, swipeRight, swipeLeft } from "../controllers/match.controllers.js"

const router = express.Router()

router.get('/', protectRoute, getUserProfiles)
router.get('/matches', protectRoute, getMatches)

router.post('/swipe-right/:id', protectRoute, swipeRight)
router.post('/swipe-left/:id', protectRoute, swipeLeft)


export default router