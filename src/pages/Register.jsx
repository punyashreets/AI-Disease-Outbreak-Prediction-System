import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material'

const STATES = ['Andhra Pradesh','Bihar','Delhi','Gujarat','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal']

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '', state: '', district: '', city: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register({ full_name: form.full_name, email: form.email, password: form.password, state: form.state, district: form.district, city: form.city })
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition text-white placeholder:text-gray-600"

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div key={i} className={`absolute rounded-full ${i % 2 === 0 ? 'bg-blue-500/8' : 'bg-violet-500/8'}`}
            style={{ width: Math.random() * 400 + 100, height: Math.random() * 400 + 100, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, filter: 'blur(60px)' }}
            animate={{ y: [0, -30, 0], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: Math.random() * 8 + 5, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.07) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10">
        
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <PersonAdd className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join the AI Disease Outbreak Prediction System</p>
        </div>

        <div className="glass-card p-8 border-glow">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
              <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className={inputClass} placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className={`${inputClass} pr-12`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                    {showPassword ? <VisibilityOff style={{fontSize:20}} /> : <Visibility style={{fontSize:20}} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  className={inputClass} placeholder="••••••••" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">State</label>
                <select value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                  className={`${inputClass} text-sm`} required>
                  <option value="" className="bg-slate-800">Select</option>
                  {STATES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">District</label>
                <input type="text" required value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                  className={`${inputClass} text-sm`} placeholder="District" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">City</label>
                <input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  className={`${inputClass} text-sm`} placeholder="City" />
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-gray-500 text-sm">
            Already have an account? <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
