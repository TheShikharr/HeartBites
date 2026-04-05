import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { useAuthStore } from "../store/useAuthStore"

const OTPpage = () => {
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState("")

    const navigate = useNavigate()
    const location = useLocation()
    const { authUser } = useAuthStore()  

    // ✅ get setAuthUser from store
    const setAuthUser = useAuthStore((state) => state.setAuthUser)

    const email = location.state?.email

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await axios.post(
                "http://localhost:9000/api/auth/verify-otp",
                { email, otp },
                { withCredentials: true }
            )

            // ✅ set user in zustand store
            setAuthUser(res.data)

            navigate("/profile-setup")

        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async() => {
        setError("")
        setResendMessage("")
        setResendLoading(true)

        try {
            await axios.post(
                "http://localhost:9000/api/auth/resend-otp",
                { email },
                { withCredentials: true }
            )
            setResendMessage("New OTP sent to your Email")
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong")
        } finally {
            setResendLoading(false)
        }
    }

    useEffect(() => {
        if(!email) {
            navigate("/signup")
        }
    }, [email, navigate])

    return(
        <>
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-lobster text-red-500 mb-2">HeartBites</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-1">Verify your Email</h2>
                    <p className="text-gray-500 text-sm">
                        We sent a 6-digit OTP to <br />
                        <span className="font-semibold text-red-400">{email}</span>
                    </p>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {/* RESEND SUCCESS MESSAGE */}
                {resendMessage && (
                    <div className="bg-green-50 text-green-500 p-3 mb-4 rounded-lg text-sm text-center">
                        {resendMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-center text-2xl tracking-widest"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 mt-4"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm mb-2">Didn't receive the OTP?</p>
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-red-500 font-semibold hover:underline disabled:opacity-50"
                    >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                </div>

            </div>
        </div>
        </>
    )
}

export default OTPpage