import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "../store/useAuthStore"
import { ArrowLeft, Send } from "lucide-react"
import { socket } from "../lib/socket.js"

const ChatPage = () => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [matchedUser, setMatchedUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const { authUser } = useAuthStore()
    const { id } = useParams()
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchMatchedUser()
        fetchMessages()

        // ✅ listen for new messages in real time
        socket.on("newMessage", (message) => {
            setMessages((prev) => [...prev, message])
        })

        // ✅ cleanup on unmount
        return () => {
            socket.off("newMessage")
        }

    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchMatchedUser = async () => {
        try {

            const res = await axiosInstance.get("/match/matches")

            const matches = res.data.matches

            let found = null
            matches.forEach(match => {
                const user = match.users.find(
                    u => u._id.toString() === id.toString()
                )
                if (user) found = user
            })

            setMatchedUser(found)

        } catch (error) {

            console.log("Error fetching matched user: ", error.message)

        }
    }

    const fetchMessages = async () => {
        setLoading(true)
        try {

            const res = await axiosInstance.get(`/messages/${id}`)

            setMessages(res.data.messages)

        } catch (error) {
            console.log("Error fetching messages: ", error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        setSending(true)

        try {

            const res = await axiosInstance.post(`/messages/send/${id}`, { content: newMessage })

            setMessages((prev) => [...prev, res.data.message])
            setNewMessage("")

        } catch (error) {
            console.log("Error sending message: ", error.message)
        } finally {
            setSending(false)
        }
    }

    // safe sender check helper
    const isSentByMe = (msg) => {
        if (!authUser || !msg.senderID) return false
        const senderId = msg.senderID?._id
            ? msg.senderID._id.toString()
            : msg.senderID.toString()

        return senderId === authUser._id.toString()
    }

    return (
        <div className="min-h-screen bg-[#f5f0eb] flex flex-col">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4 flex items-center gap-4">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/matches")}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>

                {/* User Info */}
                {matchedUser ? (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={matchedUser.profilePic || "https://via.placeholder.com/40"}
                                alt={matchedUser.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h2 className="text-gray-800 font-semibold text-sm">
                                {matchedUser.fullName}
                            </h2>
                            <p className="text-green-500 text-xs">Online</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                        <div className="w-24 h-3 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                )}

                {/* Logo */}
                <h1 className="text-4xl font-lobster text-purple-700 ml-auto">
                    HeartBites
                </h1>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">

                {loading || !matchedUser ? (
                    <div className="flex justify-center mt-20">
                        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 gap-3">
                        <p className="text-4xl">💌</p>
                        <p className="text-gray-400 text-sm">No messages yet</p>
                        <p className="text-gray-300 text-xs">
                            Say hello to {matchedUser.fullName}!
                        </p>
                    </div>

                ) : (
                    messages.map((msg) => {
                        const isMe = isSentByMe(msg)  // ✅ use helper

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                {!isMe && (
                                    <img
                                        src={matchedUser.profilePic || "https://via.placeholder.com/32"}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover mr-2 self-end border border-gray-100"
                                    />
                                )}

                                <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                            ? "bg-purple-700 text-white rounded-br-sm"
                                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <p className="text-gray-300 text-xs px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}

                <div ref={messagesEndRef}></div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-3"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${matchedUser?.fullName || ""}...`}
                        className="flex-1 bg-[#f5f0eb] text-gray-800 placeholder-gray-300 text-sm px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-purple-200 transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-11 h-11 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                        <Send size={16} className="text-white ml-0.5" />
                    </button>
                </form>
            </div>

        </div>
    )
}

export default ChatPage