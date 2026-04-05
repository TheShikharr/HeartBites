import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuthStore } from "../store/useAuthStore"
import { X, Heart, Star, ThumbsUp, ThumbsDown } from "lucide-react"

const DashboardPage = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [swipeDirection, setSwipeDirection] = useState(null)

    const { authUser, logout } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get(
                "http://localhost:9000/api/match",
                { withCredentials: true }
            )
            setUsers(res.data.users)
        } catch (error) {
            console.log("Error fetching users: ", error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSwipeRight = async (userId) => {
        setSwipeDirection("right")
        setTimeout(async () => {
            try {
                const res = await axios.post(
                    `http://localhost:9000/api/match/swipe-right/${userId}`,
                    {},
                    { withCredentials: true }
                )
                if (res.data.isMatch) {
                    alert("🎉 It's a Match!")
                }
            } catch (error) {
                console.log("Error swiping right: ", error.message)
            }
            setCurrentIndex((prev) => prev + 1)
            setSwipeDirection(null)
        }, 500)
    }

    const handleSwipeLeft = async (userId) => {
        setSwipeDirection("left")
        setTimeout(async () => {
            try {
                await axios.post(
                    `http://localhost:9000/api/match/swipe-left/${userId}`,
                    {},
                    { withCredentials: true }
                )
            } catch (error) {
                console.log("Error swiping left: ", error.message)
            }
            setCurrentIndex((prev) => prev + 1)
            setSwipeDirection(null)
        }, 500)
    }

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    const currentUser = users[currentIndex]

    return (
        <div className="min-h-screen bg-[#f5f0eb]">

            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100 shadow-sm">
                <h1 className="text-4xl font-dancingscript text-purple-600">
                    HeartBites
                </h1>
                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                        <img
                            src={authUser?.profilePic || "https://via.placeholder.com/32"}
                            alt="profile"
                            className="w-8 h-8 rounded-full object-cover border-2 border-purple-200"
                        />
                        <span className="text-gray-500 text-sm hidden sm:block">
                            {authUser?.fullName}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-200"></div>

                    <button
                        onClick={() => navigate("/matches")}
                        className="text-gray-500 hover:text-purple-600 text-sm font-medium transition"
                    >
                        Matches
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-full transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-74px)] px-4 py-8">

                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm">Finding profiles...</p>
                    </div>

                ) : !currentUser ? (
                    <div className="text-center">
                        <p className="text-6xl mb-4">🌸</p>
                        <p className="text-gray-800 text-xl font-semibold mb-1">All caught up!</p>
                        <p className="text-gray-400 text-sm mb-6">No more profiles for now. Check back later.</p>
                        <button
                            onClick={() => { setCurrentIndex(0); fetchUsers() }}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition"
                        >
                            Refresh
                        </button>
                    </div>

                ) : (
                    <div className="flex flex-col items-center gap-6 w-full">

                        {/* Counter */}
                        <p className="text-gray-300 text-xs tracking-widest uppercase">
                            {currentIndex + 1} / {users.length}
                        </p>

                        {/* Floating Card */}
                        <div
                            className={`relative w-full max-w-xs transition-all duration-500 ease-in-out ${swipeDirection === "right"
                                ? "translate-x-[150%] rotate-12 opacity-0"
                                : swipeDirection === "left"
                                    ? "-translate-x-[150%] -rotate-12 opacity-0"
                                    : "translate-x-0 rotate-0 opacity-100"
                                }`}
                        >
                            {/* Card */}
                            <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">

                                {/* Profile Image */}
                                <div className="relative h-[420px]">
                                    <img
                                        src={currentUser.profilePic || "https://via.placeholder.com/400x420?text=No+Photo"}
                                        alt={currentUser.fullName}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* LIKE stamp */}
                                    {swipeDirection === "right" && (
                                        <div className="absolute top-6 left-5 flex items-center gap-1.5 border-2 border-purple-500 text-purple-500 text-sm font-bold px-3 py-1.5 rounded-xl rotate-[-20deg] bg-white/90">
                                            <Heart size={16} className="fill-purple-500" strokeWidth={0} />
                                            LIKE
                                        </div>
                                    )}

                                    {/* NOPE stamp */}
                                    {swipeDirection === "left" && (
                                        <div className="absolute top-6 right-5 flex items-center gap-1.5 border-2 border-gray-400 text-gray-400 text-sm font-bold px-3 py-1.5 rounded-xl rotate-[20deg] bg-white/90">
                                            <X size={16} strokeWidth={2.5} />
                                            NOPE
                                        </div>
                                    )}

                                    {/* Bottom overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                                        <h2 className="text-white text-2xl font-semibold">
                                            {currentUser.fullName}
                                        </h2>
                                        <p className="text-white/70 text-sm mt-0.5">
                                            {currentUser.age} years old
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* Subtle card stack */}
                            <div className="absolute -z-10 top-2 left-2 right-2 h-full bg-white rounded-3xl shadow-sm border border-gray-100"></div>
                            <div className="absolute -z-20 top-4 left-4 right-4 h-full bg-gray-50 rounded-3xl"></div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-8 mt-2">

                            {/* Pass Button */}
                            <button
                                onClick={() => handleSwipeLeft(currentUser._id)}
                                className="w-14 h-14 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 group"
                            >
                                <X
                                    size={22}
                                    className="text-gray-400 group-hover:text-red-400 transition-colors"
                                    strokeWidth={2.5}
                                />
                            </button>

                            {/* Like Button */}
                            <button
                                onClick={() => handleSwipeRight(currentUser._id)}
                                className="w-16 h-16 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 group"
                            >
                                <Heart
                                    size={26}
                                    className="text-white fill-white"
                                    strokeWidth={0}
                                />
                            </button>

                            {/* Super Like */}
                            <button
                                onClick={() => handleSwipeRight(currentUser._id)}
                                className="w-14 h-14 bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 group"
                            >
                                <Star
                                    size={22}
                                    className="text-gray-400 group-hover:text-yellow-400 transition-colors"
                                    strokeWidth={2}
                                />
                            </button>

                        </div>

                        {/* Hint */}
                        <p className="text-gray-500 text-xs tracking-wide">
                            Pass &nbsp;•&nbsp; Like &nbsp;•&nbsp; Super Like
                        </p>

                    </div>
                )}

            </div>
        </div>
    )
}

export default DashboardPage