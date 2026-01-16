import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Chatbot from './components/Chatbot'
import ToastContainer from './components/Toast'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/Dashboard'
import MemberDashboard from './pages/member/Dashboard'
import AdminMembers from './pages/admin/Members'
import AdminAmenities from './pages/admin/Amenities'
import AdminBookings from './pages/admin/Bookings'
import AdminEvents from './pages/admin/Events'
import MemberBookings from './pages/member/Bookings'
import MemberEvents from './pages/member/Events'
import MemberProfile from './pages/member/Profile'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute requireAdmin>
              <AdminMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/amenities"
          element={
            <ProtectedRoute requireAdmin>
              <AdminAmenities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requireAdmin>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        
        {/* Member Routes */}
        <Route
          path="/member"
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/bookings"
          element={
            <ProtectedRoute>
              <MemberBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/events"
          element={
            <ProtectedRoute>
              <MemberEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/profile"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Chatbot />
      <ToastContainer />
    </AuthProvider>
  )
}

export default App
