import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "../store/useAuthStore"


const MatchesPage = () => {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    const { authUser, logout } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {
        try {

            const res = await axiosInstance.get("/match/matches")

            setMatches(res.data.matches)

        } catch (error) {

            console.log("Error fetching matches: ", error.message)

        } finally {

            setLoading(false)
            
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-[#f5f0eb]">

            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100 shadow-sm">
                <h1 className="text-4xl font-lobster text-purple-700">
                    HeartBites
                </h1>
                <div className="flex items-center gap-4">
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

                    <div className="w-px h-5 bg-gray-200"></div>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-purple-700 text-sm font-medium transition"
                    >
                        
                        Discover
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-full transition"
                    >
                        
                        Logout
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Title */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">Your Matches</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {matches.length} {matches.length === 1 ? "person" : "people"} liked you back.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                ) : matches.length === 0 ? (
                    <div className="text-center mt-20">
                        <p className="text-5xl mb-4">🌸</p>
                        <p className="text-gray-700 text-lg font-semibold mb-1">No matches yet!</p>
                        <p className="text-gray-400 text-sm mb-6">Keep swiping to find your match!</p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-6 py-2.5 rounded-full transition"
                        >
                            Start Swiping
                        </button>
                    </div>

                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {matches.map((match) => {

                            // ✅ fixed ObjectId comparison
                            const otherUser = match.users.find(
                                u => u._id.toString() !== authUser._id.toString()
                            ) || match.users[0]

                            return (
                                <div
                                    key={match._id}
                                    onClick={() => navigate(`/chat/${otherUser._id}`)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                                >
                                    {/* Profile Picture */}
                                    <div className="relative h-48">
                                        <img
                                            src={otherUser.profilePic || "https://via.placeholder.com/200x200?text=No+Photo"}
                                            alt={otherUser.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                                            {otherUser.fullName}
                                        </h3>
                                        <p className="text-purple-600 text-xs mt-0.5">
                                            {otherUser.age} years old
                                        </p>
                                        <p className="text-gray-400 text-xs truncate mt-0.5">
                                            {otherUser.bio || "No bio yet..."}
                                        </p>
                                        <button className="mt-3 w-full flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium py-2 rounded-full transition">
                                            
                                            Message
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MatchesPage