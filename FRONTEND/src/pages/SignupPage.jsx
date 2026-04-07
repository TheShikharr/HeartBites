import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore.js"

const SignupPage = () => {
    const { signup } = useAuthStore()

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    })

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const result = await signup(formData)

        if (result.success) {
            navigate("/profile-setup")
        } else {
            setError(result.message)
        }

        setLoading(false)
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                    {/* HEADER */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-lobster text-red-500 mb-2">HeartBites</h1>
                        <p className="text-gray-400">Find your perfect match</p>
                    </div>

                    {/* ERROR MESSAGE*/}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* FORM DATA */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* FULLNAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your Full Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                                required />
                        </div>


                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                                required />
                        </div>


                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                                required />
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an Account? {" "}
                        <Link to="/login" className="text-red-500 font-semibold hover:underline">
                            login
                        </Link>
                    </p>

                </div>

            </div>
        </>
    )
}

export default SignupPage