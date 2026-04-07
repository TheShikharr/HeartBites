import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "production"
        ? "https://heartbites-production.up.railway.app/api"  // ✅ replace with your render URL
        : "http://localhost:8080/api",
    withCredentials: true,
})  