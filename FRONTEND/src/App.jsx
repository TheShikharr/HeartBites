import { Routes, Route, Navigate } from "react-router-dom"

import SignupPage from './pages/SignupPage.jsx'
import LoginPage from "./pages/LoginPage.jsx"
import OTPpage from "./pages/OTPpage.jsx"
import ProfileSetupPage from "./pages/ProfileSetupPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import MatchesPage from "./pages/MatchesPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"


function App() {
  return (
    <>
    <div className="min-h-screen bg-gray-100">

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OTPpage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>

    </div>
    </>
  )
}

export default App
