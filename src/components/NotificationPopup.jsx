import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Close, Warning, TrendingUp, WaterDrop, Restaurant, Campaign, Vaccines, PestControl, LocalDrink, ChevronRight, NotificationsActive } from '@mui/icons-material'
import api from '../services/api'

const ICON_MAP = {
  warning: <Warning className="text-red-500" />,
  trending_up: <TrendingUp className="text-orange-500" />,
  water_drop: <WaterDrop className="text-blue-500" />,
  restaurant: <Restaurant className="text-amber-500" />,
  campaign: <Campaign className="text-purple-500" />,
  vaccines: <Vaccines className="text-green-500" />,
  pest_control: <PestControl className="text-teal-500" />,
  local_drink: <LocalDrink className="text-cyan-500" />,
}

const TYPE_STYLES = {
  high_risk: { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/20', badge: 'bg-red-500' },
  prediction: { border: 'border-l-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', badge: 'bg-orange-500' },
  announcement: { border: 'border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-500' },
  health_tip: { border: 'border-l-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', badge: 'bg-teal-500' },
}

export default function NotificationPopup() {
  const [notifications, setNotifications] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/popup')
      const data = res.data.notifications || []
      if (data.length > 0) {
        // Only show notifications that haven't been dismissed in this session
        const stored = sessionStorage.getItem('dismissedNotifications')
        const prevDismissed = stored ? JSON.parse(stored) : []
        const newNotifs = data.filter(n => !prevDismissed.includes(n.id))
        
        if (newNotifs.length > 0) {
          setNotifications(newNotifs)
          setIsVisible(true)
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      // Show fallback notification
      setNotifications([{
        id: 'fallback',
        type: 'announcement',
        title: 'Welcome to Disease Outbreak Prediction System',
        message: 'Your AI-powered health companion is ready. Check risk predictions and health advisories.',
        icon: 'campaign',
        priority: 3,
      }])
      setIsVisible(true)
    }
  }

  const handleDismiss = (notifId) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(notifId)
    setDismissed(newDismissed)
    
    // Save to session storage
    const arr = Array.from(newDismissed)
    sessionStorage.setItem('dismissedNotifications', JSON.stringify(arr))

    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsVisible(false)
    }
  }

  const handleDismissAll = () => {
    const allIds = notifications.map(n => n.id)
    sessionStorage.setItem('dismissedNotifications', JSON.stringify(allIds))
    setIsVisible(false)
  }

  const currentNotif = notifications[currentIndex]
  if (!isVisible || !currentNotif) return null

  const style = TYPE_STYLES[currentNotif.type] || TYPE_STYLES.announcement
  const remaining = notifications.length - currentIndex

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-end p-4 pt-20 pointer-events-none"
      >
        {/* Notification Card */}
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`pointer-events-auto w-full max-w-sm glass-card overflow-hidden shadow-2xl border-l-4 ${style.border}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <NotificationsActive className="text-blue-500 text-lg" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Notification {remaining > 1 ? `(${remaining} new)` : ''}
              </span>
            </div>
            <button onClick={handleDismissAll} className="text-xs text-gray-500 hover:text-red-500 transition font-medium">
              Dismiss All
            </button>
          </div>

          {/* Content */}
          <div className={`p-4 ${style.bg}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                {ICON_MAP[currentNotif.icon] || <Campaign className="text-purple-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{currentNotif.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{currentNotif.message}</p>
              </div>
              <button onClick={() => handleDismiss(currentNotif.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition flex-shrink-0">
                <Close className="text-lg" />
              </button>
            </div>

            {/* Action button */}
            {currentNotif.action_url && (
              <a
                href={currentNotif.action_url}
                onClick={() => handleDismiss(currentNotif.id)}
                className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition py-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
              >
                View Details <ChevronRight className="text-sm" />
              </a>
            )}
          </div>

          {/* Progress dots */}
          {notifications.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-gray-800/50">
              {notifications.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-blue-500' : i < currentIndex ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
