import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationPopup from './NotificationPopup'
import Chatbot from './Chatbot'
import {
  Dashboard, Map, Assessment, Notifications, AccountCircle,
  Menu, DarkMode, LightMode, Logout, Shield, Science,
  Storage, Settings, Description, MonitorHeart, Home, Restaurant, PhoneInTalk,
  LocalHospital, Chat, Share, Timeline, BubbleChart, Lightbulb, Inventory,
  People, Satellite, Cloud, ListAlt, Tune, Psychology, Memory, AutoAwesome,
  RestaurantMenu, ShoppingCart, Storefront, Receipt, Campaign, Vaccines, Event, HowToVote,
  AccountTree, History, Architecture as ArchIcon, MenuBook, VideogameAsset, Public,
  FolderOpen
} from '@mui/icons-material'

const citizenLinks = [
  { path: '/', icon: <Dashboard />, label: 'Dashboard' },
  { path: '/?section=global', icon: <Public />, label: 'Global Monitor' },
  { path: '/?section=predictions', icon: <Science />, label: 'Predictions' },
  { path: '/?section=map', icon: <Map />, label: 'Risk Map' },
  { path: '/?section=hospitals', icon: <LocalHospital />, label: 'Nearby Hospitals' },
  { path: '/?section=forecast', icon: <Timeline />, label: 'Forecasting' },
  { path: '/?section=spread', icon: <BubbleChart />, label: 'Spread Simulation' },
  { path: '/?section=explain', icon: <Lightbulb />, label: 'Explainable AI' },
  { path: '/?section=ml', icon: <Psychology />, label: 'ML Models' },
  { path: '/?section=insights', icon: <AutoAwesome />, label: 'AI Insights' },
  { path: '/?section=resources', icon: <Inventory />, label: 'Resources & Health' },
  { path: '/?section=analytics', icon: <Assessment />, label: 'Analytics' },
  { path: '/?section=social', icon: <Share />, label: 'Social Signals' },
  { path: '/?section=alerts', icon: <Notifications />, label: 'Alerts' },
  { path: '/?section=community', icon: <Campaign />, label: 'Community Reports' },
  { path: '/?section=vaccination', icon: <Vaccines />, label: 'Vaccination' },
  { path: '/?section=camps', icon: <Event />, label: 'Health Camps' },
  { path: '/?section=advisory', icon: <Home />, label: 'Health Advisory' },
  { path: '/?section=food', icon: <Restaurant />, label: 'Food Guide' },
  { path: '/health-food', icon: <RestaurantMenu />, label: 'Health Food' },
  { path: '/my-orders', icon: <ShoppingCart />, label: 'My Orders' },
  { path: '/?section=emergency', icon: <PhoneInTalk />, label: 'Emergency' },
  { path: '/?section=knowledge', icon: <AccountTree />, label: 'Knowledge Graph' },
  { path: '/?section=history', icon: <History />, label: 'Prediction History' },
  { path: '/data-sources', icon: <Storage />, label: 'Data Sources' },
  { path: '/dataset-manager', icon: <FolderOpen />, label: 'Dataset Manager' },
  { path: '/?section=profile', icon: <AccountCircle />, label: 'Profile' },
]

const adminLinks = [
  { path: '/admin', icon: <Dashboard />, label: 'Overview' },
  { path: '/admin?section=users', icon: <People />, label: 'User Management' },
  { path: '/admin?section=monitoring', icon: <MonitorHeart />, label: 'Disease Monitoring' },
  { path: '/admin?section=data', icon: <Storage />, label: 'Data Center' },
  { path: '/admin?section=predict', icon: <Science />, label: 'AI Predictions' },
  { path: '/admin?section=forecast', icon: <Timeline />, label: 'Forecasting' },
  { path: '/admin?section=spread', icon: <BubbleChart />, label: 'Spread Simulation' },
  { path: '/admin?section=explain', icon: <Lightbulb />, label: 'Explainable AI' },
  { path: '/admin?section=ml', icon: <Psychology />, label: 'ML Models' },
  { path: '/admin?section=insights', icon: <AutoAwesome />, label: 'AI Insights' },
  { path: '/admin?section=satellite', icon: <Satellite />, label: 'Satellite Data' },
  { path: '/admin?section=weather', icon: <Cloud />, label: 'Weather Data' },
  { path: '/admin?section=heatmap', icon: <Map />, label: 'Hotspot Map' },
  { path: '/data-sources', icon: <Storage />, label: 'Data Sources' },
  { path: '/dataset-manager', icon: <FolderOpen />, label: 'Dataset Manager (ML)' },
  { path: '/admin?section=food-mgmt', icon: <Storefront />, label: 'Food Management' },
  { path: '/admin?section=order-mgmt', icon: <Receipt />, label: 'Order Management' },
  { path: '/admin?section=community-reports', icon: <Campaign />, label: 'Community Reports' },
  { path: '/admin?section=health-camps', icon: <Event />, label: 'Health Camps' },
  { path: '/admin?section=alerts', icon: <Notifications />, label: 'Alert Management' },
  { path: '/admin?section=dataset', icon: <Storage />, label: 'Dataset Manager' },
  { path: '/admin?section=analytics', icon: <Assessment />, label: 'Reports & Analytics' },
  { path: '/admin?section=reports', icon: <Description />, label: 'Reports' },
  { path: '/admin?section=healthcare', icon: <LocalHospital />, label: 'Healthcare Resources' },
  { path: '/admin?section=logs', icon: <ListAlt />, label: 'Activity Logs' },
  { path: '/admin?section=settings', icon: <Tune />, label: 'Settings' },
  { path: '/admin?section=system', icon: <MonitorHeart />, label: 'System Monitor' },
  { path: '/admin?section=demo', icon: <VideogameAsset />, label: 'Demo Mode' },
  { path: '/architecture', icon: <ArchIcon />, label: 'Architecture' },
  { path: '/documentation', icon: <MenuBook />, label: 'Documentation' },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? adminLinks : citizenLinks

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Global Components */}
      <NotificationPopup />
      <Chatbot />
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto
        bg-[#111827] border-r border-white/[0.06]`}>
        
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shield className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">{t('layout.healthCommand')}</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 font-medium">{isAdmin ? t('layout.adminControl') : t('layout.citizenPortal')}</p>
              </div>
            </div>
          </div>

          {/* Nav Section Label */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3 px-4">
            {t('layout.navigation')}
          </p>

          <nav className="space-y-0.5">
            {links.map(link => {
              const isActive = location.pathname + location.search === link.path || 
                (link.path === '/' && location.pathname === '/' && !location.search) ||
                (link.path === '/admin' && location.pathname === '/admin' && !location.search)
              return (
                <Link key={link.path} to={link.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}>
                  <span className="text-lg flex-shrink-0">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-4 mt-auto sticky bottom-0 bg-[#111827]/80 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-xl transition">
              <Logout className="text-base" /> {t('nav.signOut')}
            </button>
            <button onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
              {darkMode ? <LightMode className="text-yellow-400 text-lg" /> : <DarkMode className="text-gray-600 text-lg" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5">
                <Menu className="text-gray-300" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-white">{isAdmin ? t('layout.adminDashboard') : t('layout.citizenDashboard')}</h2>
                <p className="text-xs text-gray-500">
                  {user?.city && `${user.city}, ${user.district}, ${user.state}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition">
                  <Home className="text-base" /> {t('nav.citizenView')}
                </Link>
              )}
              {/* Language Switcher */}
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="px-2 py-1.5 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold border-none outline-none cursor-pointer hover:bg-white/10 transition">
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold">{t('dash.systemOnline')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname + location.search}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
