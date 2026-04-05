import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'

import SignupPage from './pages/SignupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OTPpage from './pages/OTPpage.jsx'
import ProfileSetupPage from './pages/ProfileSetupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import MatchesPage from './pages/MatchesPage.jsx'
import ChatPage from './pages/ChatPage.jsx'

function App() {
    const { authUser, checkAuth, isLoading } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    if(isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <p className="text-red-400 text-xl font-dancingscript">HeartBites...</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <Routes>
                <Route path='/' element={authUser ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path='/verify-otp' element={<OTPpage />} />
                <Route path='/profile-setup' element={authUser ? <ProfileSetupPage /> : <Navigate to="/login" />} />
                <Route path='/matches' element={authUser ? <MatchesPage /> : <Navigate to="/login" />} />
                <Route path='/chat/:id' element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
            </Routes>
        </div>
    )
}

export default App