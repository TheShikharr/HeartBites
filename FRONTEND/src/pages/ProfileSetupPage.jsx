import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "../store/useAuthStore"

const ProfileSetupPage = () => {
    const { authUser } = useAuthStore()
    const location = useLocation()
    const isUpdate = location.pathname === "/update-profile"

    const [formData, setFormData] = useState({
        gender: authUser?.gender || "",
        dob: authUser?.dob ? new Date(authUser.dob).toISOString().split('T')[0] : "",
        bio: authUser?.bio || "",
        genderPreference: authUser?.genderPreference || ""
    })

    const [profilePic, setProfilePic] = useState(null)
    const [preview, setPreview] = useState(authUser?.profilePic || null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if(file) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                setProfilePic(reader.result)
                setPreview(reader.result)
            }
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {

            await axiosInstance.put("/auth/update-profile", { ...formData, profilePic })

            navigate("/")

        } catch (error) {

            console.log("Full error:", error)
            setError(error.response?.data?.message || "Something went wrong")

        } finally {

            setLoading(false)
            
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-lobster text-purple-700 mb-2">HeartBites</h1>
                    <h2 className="text-xl text-gray-700 mb-1 font-semibold">
                        {isUpdate ? "Update Your Profile" : "Setup Your Profile"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isUpdate ? "Make changes to your profile" : "Tell us about yourself"}
                    </p>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Profile Picture */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 mb-3">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                                    👤
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-100 transition">
                            {isUpdate ? "Change Photo" : "Upload Photo"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                            required
                        >
                            <option value="">Select Your Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell others about yourself..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                            required
                        />
                    </div>

                    {/* Gender Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I want to see
                        </label>
                        <select
                            name="genderPreference"
                            value={formData.genderPreference}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                            required
                        >
                            <option value="">Select Preference</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="everyone">Everyone</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-semibold rounded-full text-white bg-purple-700 hover:bg-purple-800 py-3 transition duration-200 disabled:opacity-50 mt-2"
                    >
                        {loading
                            ? (isUpdate ? "Updating..." : "Saving...")
                            : (isUpdate ? "Update Profile" : "Save & Continue")
                        }
                    </button>

                    {/* Cancel button — only on update */}
                    {isUpdate && (
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="w-full font-medium rounded-full text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 py-3 transition duration-200"
                        >
                            Cancel
                        </button>
                    )}

                </form>
            </div>
        </div>
    )
}

export default ProfileSetupPage