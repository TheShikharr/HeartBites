import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import { socket } from "../lib/socket.js"

const connectSocket = (userId) => {
    if(!socket.connected) {
        socket.connect()
    }
    // ✅ wait for connection before emitting
    socket.on("connect", () => {
        socket.emit("userConnected", userId)
    })
    // ✅ if already connected just emit directly
    if(socket.connected) {
        socket.emit("userConnected", userId)
    }
}

export const useAuthStore = create((set) => ({
    authUser: null,
    isLoading: false,
    error: null,

    setAuthUser: (user) => set({ authUser: user }),

    checkAuth: async () => {
        set({ isLoading: true })

        try {

            const res = await axiosInstance.get("/auth/check")

            set({ authUser: res.data, isLoading: false })

            connectSocket(res.data._id)  // ✅ use helper

        } catch (error) {

            set({ authUser: null, isLoading: false })

        }
    },

    login: async (formData) => {
        set({ isLoading: true })

        try {

            const res = await axiosInstance.post("/auth/login", formData)

            set({ authUser: res.data, isLoading: false })

            connectSocket(res.data._id)  // ✅ use helper
            return { success: true }

        } catch (error) {

            set({ isLoading: false })

            return { 
                success: false, 
                message: error.response?.data?.message || "Something went wrong" 
            }
        }
    },

    signup: async (formData) => {
        set({ isLoading: true })
        try {

            await axiosInstance.post("/auth/signup", formData)

            set({ isLoading: false })
            return { success: true }

        } catch (error) {

            set({ isLoading: false })
            return { 
                success: false, 
                message: error.response?.data?.message || "Something went wrong" 
            }
        }
    },

    logout: async () => {
        try {

            await axiosInstance.post("/auth/logout", {})

            set({ authUser: null })
            socket.disconnect()

        } catch (error) {

            console.log("Logout error: ", error.message)

        }
    },
}))