import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Visibility, VisibilityOff, Shield, Psychology } from '@mui/icons-material'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (isAdmin) {
      if (!adminCode.trim()) {
        setError('Please enter the admin access code')
        return
      }
      if (adminCode.trim().toUpperCase() !== 'ADMIN2024') {
        setError('Invalid admin access code. Hint: ADMIN2024')
        return
      }
    }
    
    setLoading(true)
    try {
      const user = await login(form.email, form.password, isAdmin)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div key={i} 
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-blue-500/8' : i % 3 === 1 ? 'bg-cyan-500/8' : 'bg-violet-500/8'}`}
            style={{ width: Math.random() * 400 + 100, height: Math.random() * 400 + 100, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, filter: 'blur(60px)' }}
            animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0.05, 0.2, 0.05] }} 
            transition={{ duration: Math.random() * 8 + 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.07) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-5 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Health Command Center</h1>
          <p className="text-gray-500 mt-1 text-sm">AI-Based Disease Outbreak Prediction & Early Warning</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">System Online</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 border-glow">
          {/* Admin/Citizen Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl mb-6">
            <button type="button" onClick={() => setIsAdmin(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isAdmin ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-300'
              }`}>
              <Psychology style={{fontSize:18}} /> Citizen
            </button>
            <button type="button" onClick={() => setIsAdmin(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isAdmin ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-300'
              }`}>
              <Shield style={{fontSize:18}} /> Admin
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isAdmin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Admin Access Code</label>
                <input type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/5 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/30 outline-none transition text-white placeholder:text-gray-600"
                  placeholder="Enter admin code" />
                <p className="text-[11px] text-gray-600 mt-1.5">Demo: ADMIN2024</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition text-white placeholder:text-gray-600" 
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition text-white placeholder:text-gray-600 pr-12" 
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPassword ? <VisibilityOff style={{fontSize:20}} /> : <Visibility style={{fontSize:20}} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 shadow-lg ${
                isAdmin 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-500 hover:shadow-violet-500/30' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-blue-500/30'
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : isAdmin ? 'Sign In as Admin' : 'Sign In'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Don't have an account? <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition">Create Account</Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-gray-600">AI-Powered Disease Surveillance & Early Warning Platform</p>
        </div>
      </motion.div>
    </div>
  )
}
