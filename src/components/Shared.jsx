import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

// ─── Animated Counter Hook ───
function useCountUp(target, duration = 1.5) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const [value, setValue] = useState(0)

  useEffect(() => {
    const controls = animate(count, target, {
      duration, ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [target, duration])

  return value
}

// ─── Gauge Chart ───
export function GaugeChart({ value, label, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = circumference * (1 - value)
  const animatedValue = useCountUp(Math.round(value * 100))

  const color = value < 0.35 ? '#10b981' : value < 0.70 ? '#f59e0b' : '#ef4444'
  const glowColor = value < 0.35 ? 'rgba(16,185,129,0.3)' : value < 0.70 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="rgba(148,163,184,0.1)" strokeWidth={strokeWidth} />
          <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
            initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold dark:text-white" style={{ color }}>{animatedValue}%</span>
        </div>
      </div>
      {label && <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">{label}</span>}
    </div>
  )
}

// ─── Risk Badge ───
export function RiskBadge({ level }) {
  const config = {
    'Low': { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', glow: 'shadow-green-500/20' },
    'Medium': { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', glow: 'shadow-amber-500/20' },
    'High': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', glow: 'shadow-red-500/20' },
    'Critical': { bg: 'bg-red-200 dark:bg-red-500/20', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-600', glow: 'shadow-red-600/30' },
  }
  const c = config[level] || config['Low']
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} shadow-lg ${c.glow}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {level}
    </span>
  )
}

// ─── Animated KPI Stat Card ───
export function StatCard({ icon, label, value, color = 'blue', trend, suffix = '' }) {
  const colorMap = {
    blue: { grad: 'from-blue-500 to-cyan-400', kpi: 'kpi-blue', ring: 'ring-blue-500/20' },
    teal: { grad: 'from-teal-500 to-emerald-400', kpi: 'kpi-teal', ring: 'ring-teal-500/20' },
    red: { grad: 'from-red-500 to-orange-400', kpi: 'kpi-red', ring: 'ring-red-500/20' },
    yellow: { grad: 'from-amber-500 to-yellow-400', kpi: 'kpi-amber', ring: 'ring-amber-500/20' },
    green: { grad: 'from-emerald-500 to-green-400', kpi: 'kpi-green', ring: 'ring-green-500/20' },
    purple: { grad: 'from-violet-500 to-purple-400', kpi: 'kpi-purple', ring: 'ring-violet-500/20' },
  }
  const c = colorMap[color] || colorMap.blue
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0
  const animatedVal = useCountUp(numericValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className={`kpi-card ${c.kpi} border-glow`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold dark:text-white count-animation">
            {typeof value === 'number' ? animatedVal.toLocaleString() : value}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              <span>{trend > 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white shadow-lg ring-4 ${c.ring}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section Card ───
export function SectionCard({ title, subtitle, children, className = '', action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`glass-card p-6 border-glow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

// ─── Loading Skeleton ───
export function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 rounded shimmer dark:bg-slate-700/50 bg-gray-200"
          style={{ width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  )
}

// ─── Trend Indicator ───
export function TrendIndicator({ value, label }) {
  const isUp = value > 0
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isUp ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400' 
             : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
        <span>{isUp ? '▲' : '▼'}</span>
        <span>{Math.abs(value)}%</span>
      </div>
      {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
    </div>
  )
}

// ─── Progress Ring ───
export function ProgressRing({ value, max = 100, size = 48, strokeWidth = 4, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth={strokeWidth} />
      <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - pct) }}
        transition={{ duration: 1.2, ease: 'easeOut' }} />
    </svg>
  )
}
