import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DataSources from './pages/DataSources'
import HealthFood from './pages/HealthFood'
import MyOrders from './pages/MyOrders'
import Architecture from './pages/Architecture'
import Documentation from './pages/Documentation'
import DatasetManager from './pages/DatasetManager'

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path="/data-sources" element={<PrivateRoute><DataSources /></PrivateRoute>} />
      <Route path="/health-food" element={<PrivateRoute><HealthFood /></PrivateRoute>} />
      <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
      <Route path="/architecture" element={<PrivateRoute><Architecture /></PrivateRoute>} />
      <Route path="/documentation" element={<PrivateRoute><Documentation /></PrivateRoute>} />
      <Route path="/dataset-manager" element={<PrivateRoute><DatasetManager /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
