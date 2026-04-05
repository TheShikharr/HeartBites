import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const ProfileSetupPage = () => {
    const [formData, setFormData] = useState({
        gender: "",
        dob: "",
        bio: "",
        genderPreference: ""
    })

    const [profilePic, setProfilePic] = useState(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]:e.target.value })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if(file) {
            // convert to base64 for cloudinary for upload
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

            const res = await axios.put(
                "http://localhost:9000/api/auth/update-profile",
                { ...formData, profilePic },
                { withCredentials: true }
            )
            navigate('/')
            
        } catch (error) {
             console.log("Full error:", error)
    console.log("Response error:", error.response?.data)
            
            setError( error.response?.data?.message || "Something went wrong" )

        } finally {

            setLoading(false)

        }
    }

    return (
        <>

        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-8">

            {/* HEADER */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-lobster text-red-500 mb-2">HeartBites</h1>
                <h2 className="text-xl text-gray-700 mb-1 font-semibold">Setup Your Profile</h2>
                <p className="text-gray-500 text-sm">Tell us about yourself</p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-lg text-sm text-center">
                {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">

                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-300 mb-3">
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                                    👤
                                </div>
                            )}
                        </div>
                        <label className="cursor-pointer bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                            Upload Photo
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                        >
                        <option value="">Select Your Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">other</option>
                        </select>
                    </div>

                    {/* DATE OF BIRTH */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                        type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                            required
                        />
                            
                    </div>

                    {/* BIO */}
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                            required
                        />
                            
                    </div>

                    {/* GENDER PREFERENCE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I want to see
                        </label>
                        <select 
                        name="genderPreference"
                        value={formData.genderPreference}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                        >
                        <option value="">Select Preference</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">other</option>
                        <option value="everyone">everyone</option>
                        </select>
                            
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full text-semibold rounded-lg text-white bg-red-500 hover:bg-red-600 py-3 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? "Saving...": "Save & Continue"}
                    </button>
            </form>

            </div>
        </div>

        </>
    )

}

export default ProfileSetupPage