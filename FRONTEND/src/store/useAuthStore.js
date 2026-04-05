import { create } from "zustand"
import axios from "axios"

export const useAuthStore = create((set) => ({
    authUser: null,
    isLoading: false,
    error: null,

    setAuthUser: (user) => set({ authUser: user }),

    checkAuth: async () => {
        set({ isLoading: true })
        try {
            const res = await axios.get(
                "http://localhost:9000/api/auth/check",
                { withCredentials: true }
            )
            set({ authUser: res.data, isLoading: false })
        } catch (error) {
            set({ authUser: null, isLoading: false })
        }
    },

    // ✅ add login function
    login: async (formData) => {
        set({ isLoading: true })
        try {
            const res = await axios.post(
                "http://localhost:9000/api/auth/login",
                formData,
                { withCredentials: true }
            )
            set({ authUser: res.data, isLoading: false })
            return { success: true }
        } catch (error) {
            set({ isLoading: false })
            return { success: false, message: error.response?.data?.message || "Something went wrong" }
        }
    },

    // ✅ add signup function
    signup: async (formData) => {
        set({ isLoading: true })
        try {
            const res = await axios.post(
                "http://localhost:9000/api/auth/signup",
                formData,
                { withCredentials: true }
            )
            set({ isLoading: false })
            return { success: true }
        } catch (error) {
            set({ isLoading: false })
            return { success: false, message: error.response?.data?.message || "Something went wrong" }
        }
    },

    logout: async () => {
        try {
            await axios.post(
                "http://localhost:9000/api/auth/logout",
                {},
                { withCredentials: true }
            )
            set({ authUser: null })
        } catch (error) {
            console.log("Logout error: ", error.message)
        }
    },
}))