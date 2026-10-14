import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Layout from '../components/Layout'
import RiskMap from '../components/RiskMap'
import { StatCard, SectionCard, RiskBadge } from '../components/Shared'
import { motion } from 'framer-motion'
import api from '../services/api'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter
} from 'recharts'
import {
  Warning, People, BugReport, Assessment, Storage, CloudDone,
  Satellite, Add, Edit, Delete, Publish, CloudUpload, CheckCircle,
  TrendingUp, Settings, Description, MonitorHeart, Speed,
  Timeline, BubbleChart, Lightbulb, Inventory, ArrowUpward, ArrowDownward,
  CalendarMonth, Medication, BedOutlined, HealthAndSafety,
  PersonAdd, Block, Lock, Search, History, Backup, Key, Cloud,
  Thermostat, WaterDrop, Air, Visibility, Tune, ListAlt,
  Email, Sms, AppShortcut, Refresh, PlayArrow, StopCircle,
  AccountCircle, Logout, Save, Download, Upload, Psychology, AutoAwesome
} from '@mui/icons-material'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const section = searchParams.get('section') || 'overview'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/dashboard')
        setStats(res.data.stats)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const renderSection = () => {
    switch (section) {
      case 'monitoring': return <MonitoringSection />
      case 'users': return <UserManagementSection />
      case 'data': return <DataCenterSection />
      case 'predict': return <PredictionSection user={user} />
      case 'forecast': return <AdminForecastSection />
      case 'spread': return <AdminSpreadSection />
      case 'explain': return <AdminExplainSection />
      case 'satellite': return <SatelliteMonitoringSection />
      case 'weather': return <WeatherManagementSection />
      case 'heatmap': return <HeatmapSection />
      case 'alerts': return <AlertManagementSection />
      case 'dataset': return <DatasetManagementSection />
      case 'analytics': return <AdvancedAnalyticsSection />
      case 'reports': return <ReportsSection user={user} />
      case 'healthcare': return <AdminResourceSection />
      case 'logs': return <ActivityLogsSection />
      case 'settings': return <SettingsSection user={user} />
      case 'system': return <SystemMonitorSection />
      case 'ml': return <AdminMLModelsSection />
      case 'insights': return <AdminAIInsightsSection />
      case 'food-mgmt': return <AdminFoodManagementSection />
      case 'order-mgmt': return <AdminOrderManagementSection />
      case 'community-reports': return <AdminCommunityReportsSection />
      case 'health-camps': return <AdminHealthCampsSection />
      case 'demo': return <DemoModeSection />
      default: return <OverviewSection stats={stats} />
    }
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : renderSection()}
    </Layout>
  )
}

function OverviewSection({ stats }) {
  const { t } = useLanguage()
  const [foodOrders, setFoodOrders] = useState(0)
  const [communityReports, setCommunityReports] = useState(0)
  const [recentLogs, setRecentLogs] = useState([])

  const defaultStats = stats || {
    total_cases: 12456, active_alerts: 7, high_risk_regions: 5,
    total_predictions: 342, registered_users: 189, disease_records: 2340,
    weather_records: 456, satellite_records: 120, population_records: 89, data_sources_connected: 4
  }

  useEffect(() => {
    api.get('/api/food/admin/orders').then(r => setFoodOrders(r.data.total_orders || 0)).catch(() => {})
    api.get('/api/community/reports').then(r => setCommunityReports(r.data.total || 0)).catch(() => {})
    api.get('/api/admin-ext/activity-logs', { params: { limit: 8 } }).then(r => setRecentLogs(r.data.logs || [])).catch(() => {})
  }, [])

  const systemHealth = [
    { name: 'API Server', status: 'online', uptime: '99.9%' },
    { name: 'ML Pipeline', status: 'online', uptime: '98.7%' },
    { name: 'Database', status: 'online', uptime: '99.5%' },
    { name: 'Weather API', status: 'online', uptime: '97.2%' },
    { name: 'Satellite Feed', status: 'online', uptime: '95.8%' },
    { name: 'News API', status: 'degraded', uptime: '89.1%' },
  ]

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{t('nav.overview')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.overviewSub')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold">{t('dash.allOperational')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={<BugReport />} label={t('dash.totalCases')} value={defaultStats.total_cases} color="red" trend={12} />
        <StatCard icon={<Warning />} label={t('dash.activeAlerts')} value={defaultStats.active_alerts} color="yellow" trend={-5} />
        <StatCard icon={<Speed />} label={t('dash.highRiskRegions')} value={defaultStats.high_risk_regions} color="red" trend={3} />
        <StatCard icon={<Assessment />} label={t('dash.predictions')} value={defaultStats.total_predictions} color="blue" trend={18} />
        <StatCard icon={<People />} label={t('dash.registeredUsers')} value={defaultStats.registered_users} color="green" trend={8} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Storage />} label={t('dash.dataSources')} value={defaultStats.data_sources_connected} color="teal" />
        <StatCard icon={<Description />} label={t('dash.foodOrders')} value={foodOrders} color="orange" />
        <StatCard icon={<ListAlt />} label={t('dash.communityReports')} value={communityReports} color="purple" />
        <StatCard icon={<HealthAndSafety />} label={t('admin.diseaseRecords')} value={defaultStats.disease_records} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Disease Case Distribution" subtitle="Total cases by disease type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Dengue', cases: 3420, deaths: 89 },
              { name: 'Malaria', cases: 4200, deaths: 156 },
              { name: 'Cholera', cases: 1890, deaths: 67 },
              { name: 'Typhoid', cases: 1560, deaths: 34 },
              { name: 'Influenza', cases: 2100, deaths: 23 },
              { name: 'COVID-19', cases: 8500, deaths: 420 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="cases" fill="#3b82f6" radius={[6,6,0,0]} />
              <Bar dataKey="deaths" fill="#ef4444" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Monthly Outbreak Trend" subtitle="12-month case trajectory">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { month: 'Jan', cases: 450, predictions: 420 },
              { month: 'Feb', cases: 380, predictions: 400 },
              { month: 'Mar', cases: 520, predictions: 490 },
              { month: 'Apr', cases: 680, predictions: 650 },
              { month: 'May', cases: 890, predictions: 860 },
              { month: 'Jun', cases: 1240, predictions: 1180 },
              { month: 'Jul', cases: 1650, predictions: 1580 },
              { month: 'Aug', cases: 1890, predictions: 1920 },
              { month: 'Sep', cases: 1520, predictions: 1600 },
              { month: 'Oct', cases: 1100, predictions: 1150 },
              { month: 'Nov', cases: 780, predictions: 800 },
              { month: 'Dec', cases: 520, predictions: 540 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Legend />
              <defs>
                <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cases" stroke="#3b82f6" fill="url(#caseGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="predictions" stroke="#10b981" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* System Health */}
      <SectionCard title="System Health Monitor" subtitle="Real-time infrastructure status">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {systemHealth.map(s => (
            <motion.div key={s.name} whileHover={{ y: -2 }}
              className={`p-4 rounded-xl text-center ${
                s.status === 'online' ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-amber-500/5 border border-amber-500/20'
              }`}>
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${s.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <p className="text-xs font-semibold dark:text-gray-300">{s.name}</p>
              <p className="text-lg font-bold dark:text-white mt-1">{s.uptime}</p>
              <p className={`text-[10px] font-medium mt-0.5 ${s.status === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>{s.status.toUpperCase()}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Recent Activity & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Activity" subtitle="Latest system events">
          {recentLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.slice(0, 6).map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 dark:bg-white/[0.02]">
                  <span className="text-lg">{log.type === 'login' ? '🔐' : log.type === 'prediction' ? '🤖' : log.type === 'alert' ? '🚨' : log.type === 'dataset' ? '📂' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{log.message || log.type}</p>
                    <p className="text-[10px] text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Weather Summary" subtitle="Current conditions in Bengaluru">
          <div className="space-y-3">
            {[
              { label: 'Temperature', value: '28°C', icon: '🌡️', color: 'text-orange-500' },
              { label: 'Humidity', value: '72%', icon: '💧', color: 'text-blue-500' },
              { label: 'Wind Speed', value: '12 km/h', icon: '🌬️', color: 'text-cyan-500' },
              { label: 'Condition', value: 'Partly Cloudy', icon: '⛅', color: 'text-gray-500' },
              { label: 'Rain Probability', value: '35%', icon: '🌧️', color: 'text-indigo-500' },
            ].map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{w.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{w.label}</span>
                </div>
                <span className={`text-sm font-bold ${w.color}`}>{w.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Risk Map Overview">
        <RiskMap height="400px" showHeatmap />
      </SectionCard>
    </div>
  )
}

function MonitoringSection() {
  const { t } = useLanguage()
  const [stateData] = useState([
    { state: 'Maharashtra', dengue: 520, malaria: 780, cholera: 340, total: 1640 },
    { state: 'Delhi', dengue: 342, malaria: 290, cholera: 180, total: 812 },
    { state: 'Karnataka', dengue: 180, malaria: 220, cholera: 90, total: 490 },
    { state: 'Tamil Nadu', dengue: 290, malaria: 310, cholera: 250, total: 850 },
    { state: 'West Bengal', dengue: 410, malaria: 520, cholera: 380, total: 1310 },
    { state: 'Uttar Pradesh', dengue: 350, malaria: 480, cholera: 290, total: 1120 },
    { state: 'Gujarat', dengue: 180, malaria: 250, cholera: 120, total: 550 },
    { state: 'Kerala', dengue: 220, malaria: 340, cholera: 180, total: 740 },
  ])

  return (
    <div className="space-y-6">
      <SectionCard title={t('monitor.title')} subtitle={t('monitor.title')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold dark:text-white">State</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-blue-600">Dengue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-red-600">Malaria</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-amber-600">Cholera</th>
                <th className="text-right py-3 px-4 text-sm font-semibold dark:text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {stateData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 px-4 font-medium dark:text-white">{row.state}</td>
                  <td className="py-3 px-4 text-right text-blue-600">{row.dengue}</td>
                  <td className="py-3 px-4 text-right text-red-600">{row.malaria}</td>
                  <td className="py-3 px-4 text-right text-amber-600">{row.cholera}</td>
                  <td className="py-3 px-4 text-right font-bold dark:text-white">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="State-wise Cases">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="state" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="dengue" fill="#3b82f6" radius={[2,2,0,0]} />
              <Bar dataKey="malaria" fill="#ef4444" radius={[2,2,0,0]} />
              <Bar dataKey="cholera" fill="#f59e0b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Disease Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[
                { name: 'Dengue', value: 2492 }, { name: 'Malaria', value: 3190 },
                { name: 'Cholera', value: 1830 }, { name: 'Typhoid', value: 1560 },
                { name: 'Influenza', value: 2100 }
              ]} cx="50%" cy="50%" outerRadius={100} label>
                {[0,1,2,3,4].map(i => <Cell key={i} fill={['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6'][i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  )
}

function DataCenterSection() {
  const { t } = useLanguage()
  const [sources, setSources] = useState(null)

  useEffect(() => {
    api.get('/api/admin/data-sources').then(res => setSources(res.data.data_sources)).catch(console.error)
  }, [])

  const sourceList = sources || {
    weather: { status: 'active', records: 456, last_sync: '2026-06-13T10:00:00', source: 'OpenWeatherMap' },
    satellite: { status: 'active', records: 120, last_sync: '2026-06-13T08:00:00', source: 'Google Earth Engine' },
    population: { status: 'active', records: 89, last_sync: '2026-06-12T00:00:00', source: 'Census of India' },
    historical: { status: 'active', records: 2340, last_sync: '2026-06-13T06:00:00', source: 'National Health Portal' },
  }

  const icons = { weather: <CloudDone className="text-blue-500" />, satellite: <Satellite className="text-teal-500" />, population: <People className="text-purple-500" />, historical: <BugReport className="text-red-500" /> }

  return (
    <div className="space-y-6">
      <SectionCard title={t('data.title')} subtitle={t('data.source')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sourceList).map(([key, src]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {icons[key]}
                  </div>
                  <div>
                    <h4 className="font-semibold dark:text-white capitalize">{key} Data</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{src.source}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${src.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                  {src.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Records</p>
                  <p className="text-lg font-bold dark:text-white">{src.records.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
                  <p className="text-sm font-medium dark:text-white">{new Date(src.last_sync).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function PredictionSection({ user }) {
  const { t } = useLanguage()
  const [predictionResult, setPredictionResult] = useState(null)
  const [formData, setFormData] = useState({
    state: user?.state || 'Delhi', district: user?.district || 'New Delhi',
    disease: 'Dengue', temperature: 32, humidity: 75, rainfall: 50,
    ndvi: 0.5, land_surface_temp: 35, water_bodies: 0.3,
    population_density: 8000, urbanization: 0.8, historical_cases: 100
  })
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/predict/disease', formData)
      setPredictionResult(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const featureImportance = [
    { feature: 'Rainfall', importance: 0.22 }, { feature: 'Humidity', importance: 0.18 },
    { feature: 'Historical Cases', importance: 0.16 }, { feature: 'Population Density', importance: 0.14 },
    { feature: 'Temperature', importance: 0.12 }, { feature: 'NDVI', importance: 0.08 },
    { feature: 'Water Bodies', importance: 0.05 }, { feature: 'Urbanization', importance: 0.03 },
    { feature: 'Land Surface Temp', importance: 0.02 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="AI Prediction Input" subtitle="Enter environmental features">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">State</label>
                <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">District</label>
                <input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Disease</label>
              <select value={formData.disease} onChange={e => setFormData({...formData, disease: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm">
                {['Dengue','Malaria','Cholera','Typhoid','Influenza','COVID-19','Leptospirosis'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {[
              { key: 'temperature', label: 'Temperature (°C)', min: 0, max: 50, step: 0.5 },
              { key: 'humidity', label: 'Humidity (%)', min: 0, max: 100, step: 1 },
              { key: 'rainfall', label: 'Rainfall (mm)', min: 0, max: 500, step: 5 },
              { key: 'ndvi', label: 'NDVI', min: 0, max: 1, step: 0.01 },
              { key: 'population_density', label: 'Population Density', min: 0, max: 30000, step: 100 },
              { key: 'historical_cases', label: 'Historical Cases', min: 0, max: 1000, step: 10 },
            ].map(field => (
              <div key={field.key}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">{field.label}</label>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{formData[field.key]}</span>
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step}
                  value={formData[field.key]} onChange={e => setFormData({...formData, [field.key]: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
            ))}
            <button onClick={handlePredict} disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:shadow-lg transition disabled:opacity-50">
              {loading ? 'Processing...' : 'Run AI Prediction'}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          {predictionResult ? (
            <SectionCard title="Prediction Result">
              <div className="text-center py-6">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-lg font-bold ${
                  predictionResult.prediction.risk_level === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  predictionResult.prediction.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {predictionResult.prediction.risk_level} Risk
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Probability</p>
                    <p className="text-2xl font-bold dark:text-white">{Math.round(predictionResult.prediction.probability * 100)}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                    <p className="text-2xl font-bold dark:text-white">{Math.round(predictionResult.prediction.confidence * 100)}%</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                  {predictionResult.prediction.explanation}
                </p>
                <p className="mt-2 text-xs text-gray-400">Model: {predictionResult.prediction.model_used}</p>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Model Metrics" subtitle="Random Forest Classifier Performance">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Accuracy', value: '87.4%', color: 'blue' },
                  { label: 'Precision', value: '85.2%', color: 'green' },
                  { label: 'Recall', value: '89.1%', color: 'purple' },
                  { label: 'F1 Score', value: '87.1%', color: 'teal' },
                ].map((m, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                    <p className={`text-xl font-bold text-${m.color}-600 dark:text-${m.color}-400`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Feature Importance" subtitle="Random Forest feature weights">
            <div className="space-y-3">
              {featureImportance.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{f.feature}</span>
                    <span className="text-sm font-medium dark:text-white">{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${f.importance * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-2.5 rounded-full gradient-primary" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function HeatmapSection() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <SectionCard title={t('riskMap.interactive')} subtitle={t('riskMap.interactiveSub')}>
        <RiskMap height="600px" showHeatmap />
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'High Risk Zones', count: 5, color: 'bg-red-500' },
          { label: 'Medium Risk Zones', count: 5, color: 'bg-yellow-500' },
          { label: 'Low Risk Zones', count: 5, color: 'bg-green-500' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${item.color}`} />
            <div>
              <p className="font-medium dark:text-white">{item.label}</p>
              <p className="text-sm text-gray-500">{item.count} regions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertManagementSection() {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState({ title: '', message: '', risk_level: 'Medium', region: '', disease_name: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { api.get('/api/alerts').then(res => setAlerts(res.data.alerts || [])).catch(console.error) }, [])

  const handleCreate = async () => {
    try {
      await api.post('/api/alerts/', form)
      const res = await api.get('/api/alerts')
      setAlerts(res.data.alerts || [])
      setShowForm(false)
      setForm({ title: '', message: '', risk_level: 'Medium', region: '', disease_name: '' })
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/alerts/${id}`)
      setAlerts(alerts.filter(a => a.id !== id))
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{t('alertMgmt.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} total alerts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg transition">
          <Add /> Create Alert
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6">
          <h4 className="font-semibold dark:text-white mb-4">New Alert</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Alert Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="Region (e.g., Maharashtra)" value={form.region} onChange={e => setForm({...form, region: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" />
            <select value={form.risk_level} onChange={e => setForm({...form, risk_level: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <input placeholder="Disease Name (optional)" value={form.disease_name} onChange={e => setForm({...form, disease_name: e.target.value})}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" />
            <textarea placeholder="Alert Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})}
              className="md:col-span-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white h-24 resize-none" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="px-6 py-2 rounded-xl gradient-primary text-white font-medium text-sm">Publish Alert</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RiskBadge level={alert.risk_level} />
              <div>
                <h4 className="font-medium dark:text-white">{alert.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{alert.region} - {alert.message?.substring(0, 80)}...</p>
              </div>
            </div>
            <button onClick={() => handleDelete(alert.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition">
              <Delete />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DatasetManagementSection() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('disease')
  const [records, setRecords] = useState([])
  const [uploading, setUploading] = useState(false)
  const tabs = ['disease', 'weather', 'satellite', 'population']

  useEffect(() => {
    api.get(`/api/data/${activeTab}`).then(res => setRecords(res.data.records || [])).catch(console.error)
  }, [activeTab])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post(`/api/data/upload/${activeTab}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert(res.data.message)
      const dataRes = await api.get(`/api/data/${activeTab}`)
      setRecords(dataRes.data.records || [])
    } catch (err) { alert('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSeed = async () => {
    try {
      await api.post('/api/data/seed')
      alert('Database seeded with sample data!')
      const res = await api.get(`/api/data/${activeTab}`)
      setRecords(res.data.records || [])
    } catch (err) { alert('Seeding failed') }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Dataset Management" subtitle="Upload, view, and manage datasets"
        action={
          <div className="flex gap-2">
            <label className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-100 transition">
              <CloudUpload className="text-lg" /> {uploading ? 'Uploading...' : 'Upload CSV'}
              <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            </label>
            <button onClick={handleSeed} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-100 transition">
              <Add /> Seed Data
            </button>
          </div>
        }>
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${activeTab === tab ? 'gradient-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400">#</th>
                {records[0] && Object.keys(records[0]).filter(k => k !== 'id' && k !== 'created_at').map(k => (
                  <th key={k} className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 capitalize">{k.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 20).map((record, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-700/30">
                  <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                  {Object.entries(record).filter(([k]) => k !== 'id' && k !== 'created_at').map(([k, v]) => (
                    <td key={k} className="py-2 px-3 dark:text-white truncate max-w-[150px]">{typeof v === 'number' ? v.toLocaleString() : String(v).substring(0, 30)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No records found. Upload CSV or seed data.</p>}
        </div>
      </SectionCard>
    </div>
  )
}

function AdvancedAnalyticsSection() {
  const { t } = useLanguage()
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6']
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Historical Trends">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { year: '2020', cases: 8500 }, { year: '2021', cases: 12400 },
              { year: '2022', cases: 9800 }, { year: '2023', cases: 11200 },
              { year: '2024', cases: 10500 }, { year: '2025', cases: 12456 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="cases" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Regional Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { region: 'North', cases: 2800 }, { region: 'South', cases: 3200 },
              { region: 'East', cases: 2100 }, { region: 'West', cases: 2900 },
              { region: 'Central', cases: 1456 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="region" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="cases" radius={[4,4,0,0]}>
                {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[
                { name: 'Low Risk', value: 45 }, { name: 'Medium Risk', value: 35 }, { name: 'High Risk', value: 20 }
              ]} cx="50%" cy="50%" outerRadius={100} label>
                <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Outbreak Forecast (Next 6 Months)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jul', predicted: 1650, upper: 1900, lower: 1400 },
              { month: 'Aug', predicted: 1890, upper: 2200, lower: 1580 },
              { month: 'Sep', predicted: 1520, upper: 1800, lower: 1240 },
              { month: 'Oct', predicted: 1100, upper: 1400, lower: 800 },
              { month: 'Nov', predicted: 780, upper: 1000, lower: 560 },
              { month: 'Dec', predicted: 520, upper: 700, lower: 340 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="upper" stroke="#93c5fd" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="lower" stroke="#93c5fd" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  )
}

function ReportsSection({ user }) {
  const { t } = useLanguage()
  const [generating, setGenerating] = useState('')

  const generateReport = async (type) => {
    setGenerating(type)
    try {
      const res = await api.post('/api/reports/generate', { type, state: user?.state, district: user?.district })
      if (type === 'json') {
        const blob = new Blob([JSON.stringify(res.data.report, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `report_${Date.now()}.json`; a.click()
      } else {
        const blob = new Blob([res.data], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `report_${Date.now()}.${type}`; a.click()
      }
    } catch (err) { console.error(err); alert('Report generation failed') }
    finally { setGenerating('') }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Report Generation" subtitle="Download comprehensive disease reports">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'pdf', icon: '📄', title: 'PDF Report', desc: 'Formatted report with charts, predictions, and statistics. Suitable for printing and sharing.' },
            { type: 'csv', icon: '📊', title: 'CSV Report', desc: 'Raw data in CSV format. Import into Excel or other tools for custom analysis.' },
            { type: 'json', icon: '🔧', title: 'JSON Report', desc: 'Structured data in JSON format. Ideal for developers and API integration.' },
          ].map((report, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 text-center">
              <div className="text-5xl mb-4">{report.icon}</div>
              <h4 className="font-semibold dark:text-white text-lg">{report.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">{report.desc}</p>
              <button onClick={() => generateReport(report.type)} disabled={generating === report.type}
                className="w-full py-2 rounded-xl gradient-primary text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50">
                {generating === report.type ? 'Generating...' : 'Generate Report'}
              </button>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Report Contents">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Disease Statistics', 'Risk Levels', 'Prediction Summary', 'Weather Conditions', 'Analytics Charts', 'Alert History', 'Regional Data', 'Model Metrics'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <CheckCircle className="text-green-500 text-lg" />
              <span className="text-sm dark:text-white">{item}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function SystemMonitorSection() {
  const { t } = useLanguage()
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.get('/api/admin/system-status').then(res => setStatus(res.data.system)).catch(console.error)
  }, [])

  const defaultStatus = status || {
    api: { status: 'running', uptime: '99.9%', version: '1.0.0' },
    database: { status: 'connected', type: 'MongoDB Atlas' },
    ml_model: { status: 'loaded', type: 'Random Forest', accuracy: 0.87 },
    server: { status: 'healthy', cpu: '23%', memory: '45%' }
  }

  return (
    <div className="space-y-6">
      <SectionCard title={t('nav.system')} subtitle={t('dash.systemOnline')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(defaultStatus).map(([key, val]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold dark:text-white capitalize">{key.replace('_', ' ')}</h4>
                <span className={`w-3 h-3 rounded-full ${val.status === 'running' || val.status === 'connected' || val.status === 'loaded' || val.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
              <div className="space-y-2">
                {Object.entries(val).filter(([k]) => k !== 'status').map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{k}</span>
                    <span className="text-xs font-medium dark:text-white">{typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${val.status === 'running' || val.status === 'connected' || val.status === 'loaded' || val.status === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                  {val.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── ADMIN: OUTBREAK FORECASTING ───
const ADMIN_DISEASES = ['Dengue', 'Malaria', 'Cholera', 'Typhoid', 'Influenza', 'COVID-19', 'Leptospirosis']

function AdminForecastSection() {
  const { t } = useLanguage()
  const [period, setPeriod] = useState('30')
  const [disease, setDisease] = useState('Dengue')
  const [forecast, setForecast] = useState(null)
  const [loadingFc, setLoadingFc] = useState(false)

  useEffect(() => {
    const fetchForecast = async () => {
      setLoadingFc(true)
      try {
        const res = await api.post('/api/advanced/forecast', { disease, state: 'Delhi', district: 'Delhi', period })
        setForecast(res.data)
      } catch (err) { console.error(err) }
      finally { setLoadingFc(false) }
    }
    fetchForecast()
  }, [period, disease])

  const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }

  return (
    <div className="space-y-6">
      <SectionCard title={t('forecast.title')} subtitle={t('forecast.seasonal')}>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {ADMIN_DISEASES.map(d => (
              <button key={d} onClick={() => setDisease(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {[{v:'7',l:'7 Days'},{v:'30',l:'30 Days'},{v:'90',l:'3 Months'}].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.v ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {p.l}
              </button>
            ))}
          </div>
        </div>

        {loadingFc ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : forecast ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">High Risk Days</p>
                <p className="text-2xl font-bold text-red-500">{forecast.summary?.high_risk_days || 0}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peak Date</p>
                <p className="text-lg font-bold text-orange-500">{forecast.summary?.peak_date}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Probability</p>
                <p className="text-2xl font-bold text-amber-500">{Math.round((forecast.summary?.average_probability || 0) * 100)}%</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Est. Total Cases</p>
                <p className="text-2xl font-bold text-blue-500">{forecast.summary?.total_estimated_cases || 0}</p>
              </div>
            </div>
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Probability Forecast</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecast.forecast}>
                  <defs><linearGradient id="adminFcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${Math.round(v*100)}%`} domain={[0,1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(v) => [`${Math.round(v*100)}%`, 'Probability']} />
                  <Area type="monotone" dataKey="probability" stroke="#3b82f6" fill="url(#adminFcGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Estimated Cases by Day</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={forecast.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="estimated_cases" radius={[4,4,0,0]}>
                    {forecast.forecast?.map((entry, idx) => <Cell key={idx} fill={COLORS[entry.risk_level] || '#3b82f6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="text-center text-gray-500 py-8">No forecast data</p>}
      </SectionCard>
    </div>
  )
}

// ─── ADMIN: SPREAD SIMULATION ───
function AdminSpreadSection() {
  const { t } = useLanguage()
  const [disease, setDisease] = useState('Dengue')
  const [spread, setSpread] = useState(null)
  const [loadingSpread, setLoadingSpread] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoadingSpread(true)
      try {
        const res = await api.post('/api/advanced/spread-simulation', { disease, state: 'Delhi', district: 'Delhi' })
        setSpread(res.data)
      } catch (err) { console.error(err) }
      finally { setLoadingSpread(false) }
    }
    fetch()
  }, [disease])

  return (
    <div className="space-y-6">
      <SectionCard title={t('spread.title')} subtitle={t('spread.title')}>
        <div className="flex flex-wrap gap-2 mb-6">
          {ADMIN_DISEASES.map(d => (
            <button key={d} onClick={() => setDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>
        {loadingSpread ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div></div>
        ) : spread ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">Source</p><p className="text-lg font-bold text-blue-500">{spread.source_district}</p></div>
              <div className="glass-card p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">Probability</p><p className="text-2xl font-bold text-red-500">{Math.round(spread.source_probability*100)}%</p></div>
              <div className="glass-card p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">Districts</p><p className="text-2xl font-bold text-orange-500">{spread.total_districts_affected}</p></div>
              <div className="glass-card p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">Total Cases</p><p className="text-2xl font-bold text-amber-500">{spread.estimated_total_cases}</p></div>
            </div>
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Spread Risk by District</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spread.spread_simulation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${Math.round(v*100)}%`} domain={[0,1]} />
                  <YAxis dataKey="district" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(v) => [`${Math.round(v*100)}%`, 'Probability']} />
                  <Bar dataKey="probability" radius={[0,4,4,0]}>
                    {spread.spread_simulation?.map((e, i) => <Cell key={i} fill={e.risk_level === 'High' ? '#ef4444' : e.risk_level === 'Medium' ? '#f59e0b' : '#10b981'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="text-center text-gray-500 py-8">No data</p>}
      </SectionCard>
    </div>
  )
}

// ─── ADMIN: EXPLAINABLE AI ───
function AdminExplainSection() {
  const { t } = useLanguage()
  const [disease, setDisease] = useState('Dengue')
  const [explanation, setExplanation] = useState(null)
  const [loadingEx, setLoadingEx] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoadingEx(true)
      try {
        const res = await api.post('/api/advanced/explain', { disease, state: 'Delhi', district: 'Delhi' })
        setExplanation(res.data)
      } catch (err) { console.error(err) }
      finally { setLoadingEx(false) }
    }
    fetch()
  }, [disease])

  return (
    <div className="space-y-6">
      <SectionCard title={t('xai.title')} subtitle={t('xai.subtitle')}>
        <div className="flex flex-wrap gap-2 mb-6">
          {ADMIN_DISEASES.map(d => (
            <button key={d} onClick={() => setDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>
        {loadingEx ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div></div>
        ) : explanation ? (
          <>
            <div className={`glass-card p-6 mb-4 border-l-4 ${explanation.probability > 0.7 ? 'border-l-red-500' : explanation.probability > 0.35 ? 'border-l-amber-500' : 'border-l-green-500'}`}>
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-xl font-bold dark:text-white">{explanation.disease}</h3><p className="text-sm text-gray-500">{explanation.state}, {explanation.district}</p></div>
                <div className="text-right"><p className="text-4xl font-bold">{Math.round(explanation.probability * 100)}%</p><RiskBadge level={explanation.probability > 0.7 ? 'High' : explanation.probability > 0.35 ? 'Medium' : 'Low'} /></div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4"><p className="text-sm dark:text-gray-300 whitespace-pre-line">{explanation.explanation?.summary}</p></div>
            </div>
            {explanation.explanation?.top_reasons?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {explanation.explanation.top_reasons.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                    className="glass-card p-4 border-l-4 border-l-red-500">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <h5 className="font-bold text-sm dark:text-white">{r.label} ↑</h5>
                    <p className="text-xs text-gray-500 mt-1">{r.value}{r.unit} (threshold: {r.threshold}{r.unit})</p>
                    <p className="text-xs text-red-500 font-medium mt-1">Impact: {r.contribution}</p>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Feature Impact Radar</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={explanation.explanation?.feature_explanations?.slice(0, 6)}>
                  <PolarGrid stroke="#374151" opacity={0.3} />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <PolarRadiusAxis tick={{ fontSize: 8, fill: '#9ca3af' }} />
                  <Radar name="Impact" dataKey="impact_score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="text-center text-gray-500 py-8">No data</p>}
      </SectionCard>
    </div>
  )
}

// ─── ADMIN: RESOURCE PREDICTION ───
function AdminResourceSection() {
  const { t } = useLanguage()
  const [disease, setDisease] = useState('Dengue')
  const [resources, setResources] = useState(null)
  const [recs, setRecs] = useState(null)
  const [loadingRes, setLoadingRes] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoadingRes(true)
      try {
        const [r1, r2] = await Promise.allSettled([
          api.post('/api/advanced/resource-prediction', { disease, state: 'Delhi', district: 'Delhi' }),
          api.post('/api/advanced/health-recommendations', { disease, state: 'Delhi', district: 'Delhi', risk_level: 'Medium' }),
        ])
        if (r1.status === 'fulfilled') setResources(r1.value.data)
        if (r2.status === 'fulfilled') setRecs(r2.value.data)
      } catch (err) { console.error(err) }
      finally { setLoadingRes(false) }
    }
    fetch()
  }, [disease])

  return (
    <div className="space-y-6">
      <SectionCard title="🏥 Resource Prediction & Health Recommendations">
        <div className="flex flex-wrap gap-2 mb-6">
          {ADMIN_DISEASES.map(d => (
            <button key={d} onClick={() => setDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>
        {loadingRes ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>
        ) : (
          <>
            {resources && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="glass-card p-4 text-center"><BedOutlined className="text-blue-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Beds</p><p className="text-2xl font-bold text-blue-500">{resources.resources?.beds_needed || 0}</p></div>
                  <div className="glass-card p-4 text-center"><LocalHospital className="text-red-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">ICU</p><p className="text-2xl font-bold text-red-500">{resources.resources?.icu_beds || 0}</p></div>
                  <div className="glass-card p-4 text-center"><Medication className="text-orange-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Ventilators</p><p className="text-2xl font-bold text-orange-500">{resources.resources?.ventilators || 0}</p></div>
                  <div className="glass-card p-4 text-center"><People className="text-purple-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Staff</p><p className="text-2xl font-bold text-purple-500">{resources.resources?.staff?.total || 0}</p></div>
                  <div className="glass-card p-4 text-center"><HealthAndSafety className="text-teal-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Cases</p><p className="text-2xl font-bold text-teal-500">{resources.resources?.estimated_cases || 0}</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="glass-card p-5">
                    <h4 className="font-semibold dark:text-white mb-4">Staff Breakdown</h4>
                    {[
                      { label: 'Doctors', value: resources.resources?.staff?.doctors, icon: '👨‍⚕️' },
                      { label: 'Nurses', value: resources.resources?.staff?.nurses, icon: '👩‍⚕️' },
                      { label: 'Lab Techs', value: resources.resources?.staff?.lab_technicians, icon: '🔬' },
                      { label: 'Paramedics', value: resources.resources?.staff?.paramedics, icon: '🚑' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm dark:text-white">{s.icon} {s.label}</span>
                        <span className="font-bold text-blue-500">{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-semibold dark:text-white mb-4">Medicine Demand</h4>
                    {resources.resources?.medicines?.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm dark:text-white">💊 {m.name}</span>
                        <span className="font-bold text-teal-500">{m.units.toLocaleString()} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {recs?.recommendations && (
              <div className="space-y-4">
                {recs.recommendations.immediate?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-red-500">
                    <h5 className="font-bold text-red-500 mb-3">🚨 Immediate Actions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recs.recommendations.immediate.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                          <span className="text-xl">{r.icon}</span>
                          <div><p className="text-sm font-medium dark:text-white">{r.action}</p><p className="text-[10px] text-gray-500 mt-1">🎯 {r.target} · ⏰ {r.deadline}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recs.recommendations.preventive?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-amber-500">
                    <h5 className="font-bold text-amber-500 mb-3">🛡️ Preventive Measures</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recs.recommendations.preventive.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl">
                          <span className="text-xl">{r.icon}</span>
                          <div><p className="text-sm font-medium dark:text-white">{r.action}</p><p className="text-[10px] text-gray-500 mt-1">🎯 {r.target}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {recs.recommendations.policy?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-blue-500">
                    <h5 className="font-bold text-blue-500 mb-3">📋 Policy Recommendations</h5>
                    <ul className="space-y-2">
                      {recs.recommendations.policy.map((p, i) => <li key={i} className="flex items-center gap-2 text-sm dark:text-gray-300"><CheckCircle className="text-blue-500" style={{fontSize:16}} />{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  )
}

// ─── USER MANAGEMENT ───
function UserManagementSection() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingRole, setEditingRole] = useState(null)

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const params = { limit: 50 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const res = await api.get('/api/admin-ext/users', { params })
      setUsers(res.data.users || [])
    } catch (err) { console.error(err) }
    finally { setLoadingUsers(false) }
  }

  useEffect(() => { fetchUsers() }, [search, roleFilter])

  const handleBlock = async (uid) => {
    try { await api.put(`/api/admin-ext/users/${uid}/block`); fetchUsers() } catch { alert('Failed') }
  }
  const handleRole = async (uid, role) => {
    try { await api.put(`/api/admin-ext/users/${uid}/role`, { role }); setEditingRole(null); fetchUsers() } catch { alert('Failed') }
  }
  const handleDel = async (uid) => {
    if (!window.confirm('Delete this user?')) return
    try { await api.delete(`/api/admin-ext/users/${uid}`); fetchUsers() } catch { alert('Failed') }
  }

  const ROLES = ['citizen','admin','health_officer','analyst','viewer']

  return (
    <div className="space-y-6">
      <SectionCard title={t('users.title')} subtitle={t('users.title')}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize:20}} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
          </select>
          <button onClick={fetchUsers} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1"><Refresh style={{fontSize:18}} /> Refresh</button>
        </div>
        {loadingUsers ? <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"><th className="pb-3">User</th><th className="pb-3">Role</th><th className="pb-3">Location</th><th className="pb-3">Status</th><th className="pb-3">Last Login</th><th className="pb-3">Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/30 dark:hover:bg-gray-700/30">
                    <td className="py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{u.full_name?.charAt(0)||'U'}</div><div><p className="font-medium dark:text-white">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div></div></td>
                    <td className="py-3">
                      {editingRole === u.id ? (
                        <select defaultValue={u.role} onBlur={() => setEditingRole(null)} onChange={e => handleRole(u.id, e.target.value)} className="px-2 py-1 rounded-lg border text-xs dark:bg-gray-700 dark:text-white">
                          {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingRole(u.id)} className={`text-xs px-2 py-1 rounded-full font-medium ${u.role==='admin'?'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400':u.role==='health_officer'?'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role?.replace('_',' ')}</button>
                      )}
                    </td>
                    <td className="py-3 text-xs text-gray-500 dark:text-gray-400">{u.city}, {u.state}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.is_blocked?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{u.is_blocked?'Blocked':'Active'}</span></td>
                    <td className="py-3 text-xs text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    <td className="py-3"><div className="flex gap-1">
                      <button onClick={() => handleBlock(u.id)} title={u.is_blocked?'Unblock':'Block'} className={`p-1.5 rounded-lg ${u.is_blocked?'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20':'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}><Block style={{fontSize:16}} /></button>
                      <button onClick={() => handleDel(u.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Delete style={{fontSize:16}} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center py-8 text-gray-500">No users found</p>}
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">Showing {users.length} users</p>
      </SectionCard>
    </div>
  )
}

// ─── SATELLITE MONITORING ───
function SatelliteMonitoringSection() {
  const [data, setData] = useState(null)
  const [loadingSat, setLoadingSat] = useState(true)
  useEffect(() => { api.get('/api/admin-ext/satellite-overview').then(r => { setData(r.data); setLoadingSat(false) }).catch(() => setLoadingSat(false)) }, [])

  if (loadingSat) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent"></div></div>

  return (
    <div className="space-y-6">
      <SectionCard title="🛰️ Satellite Data Monitoring" subtitle="Vegetation, water bodies, and environmental monitoring">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 text-center"><Satellite className="text-teal-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Records</p><p className="text-2xl font-bold text-teal-500">{data?.total_records||0}</p></div>
          <div className="glass-card p-4 text-center"><Cloud className="text-blue-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Sources</p><p className="text-2xl font-bold text-blue-500">{data?.satellite_sources?.length||0}</p></div>
          <div className="glass-card p-4 text-center"><Warning className="text-red-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">High Risk</p><p className="text-2xl font-bold text-red-500">{data?.cities?.filter(c=>c.risk==='High').length||0}</p></div>
          <div className="glass-card p-4 text-center"><CheckCircle className="text-green-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Cities</p><p className="text-2xl font-bold text-green-500">{data?.cities?.length||0}</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4"><h4 className="font-semibold dark:text-white mb-4">NDVI (Vegetation)</h4><ResponsiveContainer width="100%" height={280}><BarChart data={data?.cities}><CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} /><XAxis dataKey="city" tick={{fontSize:10,fill:'#9ca3af'}} angle={-45} textAnchor="end" height={60} /><YAxis tick={{fontSize:10,fill:'#9ca3af'}} domain={[0,1]} /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:12,color:'#fff'}} /><Bar dataKey="ndvi" fill="#10b981" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
          <div className="glass-card p-4"><h4 className="font-semibold dark:text-white mb-4">Land Surface Temp</h4><ResponsiveContainer width="100%" height={280}><BarChart data={data?.cities}><CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} /><XAxis dataKey="city" tick={{fontSize:10,fill:'#9ca3af'}} angle={-45} textAnchor="end" height={60} /><YAxis tick={{fontSize:10,fill:'#9ca3af'}} /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:12,color:'#fff'}} /><Bar dataKey="lst" fill="#ef4444" radius={[4,4,0,0]} name="LST (°C)" /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="glass-card p-5"><h4 className="font-semibold dark:text-white mb-4">Satellite Sources</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{data?.satellite_sources?.map((s,i) => (<div key={i} className="glass-card p-4 text-center"><Satellite className="text-teal-500 mb-2" /><h5 className="font-bold text-sm dark:text-white">{s.name}</h5><p className="text-xs text-gray-500 mt-1">{s.resolution} | {s.revisit}</p><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mt-2 inline-block">{s.status}</span></div>))}</div></div>
      </SectionCard>
    </div>
  )
}

// ─── WEATHER MANAGEMENT ───
function WeatherManagementSection() {
  const [data, setData] = useState(null)
  const [loadingW, setLoadingW] = useState(true)
  useEffect(() => { api.get('/api/admin-ext/weather-overview').then(r => { setData(r.data); setLoadingW(false) }).catch(() => setLoadingW(false)) }, [])

  if (loadingW) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>

  return (
    <div className="space-y-6">
      <SectionCard title="🌤️ Weather Data Management" subtitle="Live weather, historical data, and trend analysis">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center"><Thermostat className="text-red-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Avg Temperature</p><p className="text-2xl font-bold text-red-500">{data?.cities?.[0]?.temp || '--'}°C</p></div>
          <div className="glass-card p-4 text-center"><WaterDrop className="text-blue-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Avg Humidity</p><p className="text-2xl font-bold text-blue-500">{data?.cities?.[0]?.humidity || '--'}%</p></div>
          <div className="glass-card p-4 text-center"><Air className="text-teal-500 mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Weather Records</p><p className="text-2xl font-bold text-teal-500">{data?.total_records||0}</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4"><h4 className="font-semibold dark:text-white mb-4">Monthly Temperature Trend</h4><ResponsiveContainer width="100%" height={280}><LineChart data={data?.historical_trend}><CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} /><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} /><YAxis tick={{fontSize:10,fill:'#9ca3af'}} /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:12,color:'#fff'}} /><Line type="monotone" dataKey="avg_temp" stroke="#ef4444" strokeWidth={2} name="Temp (°C)" /></LineChart></ResponsiveContainer></div>
          <div className="glass-card p-4"><h4 className="font-semibold dark:text-white mb-4">Monthly Rainfall</h4><ResponsiveContainer width="100%" height={280}><BarChart data={data?.historical_trend}><CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} /><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} /><YAxis tick={{fontSize:10,fill:'#9ca3af'}} /><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'none',borderRadius:12,color:'#fff'}} /><Bar dataKey="avg_rainfall" fill="#3b82f6" radius={[4,4,0,0]} name="Rainfall (mm)" /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="glass-card p-4 overflow-x-auto"><h4 className="font-semibold dark:text-white mb-4">City Weather Overview</h4><table className="w-full text-sm"><thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"><th className="pb-2">City</th><th className="pb-2">Temp</th><th className="pb-2">Humidity</th><th className="pb-2">Rainfall</th><th className="pb-2">Wind</th><th className="pb-2">AQI</th></tr></thead><tbody>{data?.cities?.map((c,i) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-medium dark:text-white">{c.city}</td><td className="py-2 text-red-500">{c.temp}°C</td><td className="py-2 text-blue-500">{c.humidity}%</td><td className="py-2 text-teal-500">{c.rainfall}mm</td><td className="py-2 text-gray-500">{c.wind} km/h</td><td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${c.aqi > 150 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : c.aqi > 100 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{c.aqi}</span></td></tr>))}</tbody></table></div>
      </SectionCard>
    </div>
  )
}

// ─── ACTIVITY LOGS ───
function ActivityLogsSection() {
  const [logs, setLogs] = useState([])
  const [loadingL, setLoadingL] = useState(true)
  const [filterType, setFilterType] = useState('')

  const fetchLogs = async () => {
    setLoadingL(true)
    try {
      const params = { limit: 50 }
      if (filterType) params.type = filterType
      const res = await api.get('/api/admin-ext/activity-logs', { params })
      setLogs(res.data.logs || [])
    } catch (err) { console.error(err) }
    finally { setLoadingL(false) }
  }

  useEffect(() => { fetchLogs() }, [filterType])

  const seedLogs = async () => {
    try { await api.post('/api/admin-ext/activity-logs/seed'); fetchLogs() } catch { alert('Seed failed') }
  }

  const TYPES = ['login','prediction','dataset','alert','user_management','settings']
  const TYPE_ICONS = { login: '🔐', prediction: '🤖', dataset: '📂', alert: '🚨', user_management: '👤', settings: '⚙️' }

  return (
    <div className="space-y-6">
      <SectionCard title="📜 Activity Logs" subtitle="System audit trail and user activity tracking">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!filterType?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>All</button>
            {TYPES.map(t => <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterType===t?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{TYPE_ICONS[t]} {t.replace('_',' ')}</button>)}
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={seedLogs} className="px-3 py-1.5 rounded-lg text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">Seed Sample Logs</button>
            <button onClick={fetchLogs} className="px-3 py-1.5 rounded-lg text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"><Refresh style={{fontSize:14}} /></button>
          </div>
        </div>
        {loadingL ? <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div> : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div key={i} initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: i*0.03}}
                className="flex items-center gap-4 p-3 glass-card">
                <span className="text-xl">{TYPE_ICONS[log.type] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.user_email}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{log.type?.replace('_',' ')}</span>
              </motion.div>
            ))}
            {logs.length === 0 && <p className="text-center py-8 text-gray-500">No activity logs found. Click "Seed Sample Logs" to populate.</p>}
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">{logs.length} log entries</p>
      </SectionCard>
    </div>
  )
}

// ─── SETTINGS ───
function SettingsSection({ user }) {
  const [settings, setSettings] = useState(null)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [backupMsg, setBackupMsg] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    api.get('/api/admin-ext/settings').then(r => setSettings(r.data.settings)).catch(console.error)
  }, [])

  const changePassword = async () => {
    setPwMsg('')
    if (pwForm.new_password !== pwForm.confirm) { setPwMsg('Passwords do not match'); return }
    if (pwForm.new_password.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    try {
      const res = await api.put('/api/admin-ext/settings/change-password', pwForm)
      setPwMsg(res.data.message)
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) { setPwMsg(err.response?.data?.error || 'Failed') }
  }

  const doBackup = async () => {
    setBackupMsg('Creating backup...')
    try {
      const res = await api.post('/api/admin-ext/settings/backup')
      setBackupMsg(`Backup created: ${Object.entries(res.data.backup).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
    } catch { setBackupMsg('Backup failed') }
  }

  const tabs = ['general','api_keys','thresholds','profile']

  return (
    <div className="space-y-6">
      <SectionCard title="⚙️ Settings" subtitle="System configuration, API keys, thresholds, and profile management">
        <div className="flex gap-2 mb-6">
          {tabs.map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${activeTab===t?'gradient-primary text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{t.replace('_',' ')}</button>)}
        </div>

        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h4 className="font-semibold dark:text-white mb-4">System Information</h4>
              {[
                {label:'App Name', value: settings?.system?.app_name},
                {label:'Version', value: settings?.system?.version},
                {label:'Auto Backup', value: settings?.system?.auto_backup ? 'Enabled' : 'Disabled'},
                {label:'Dark Mode Default', value: settings?.system?.dark_mode_default ? 'Yes' : 'No'},
                {label:'Max Predictions/Hour', value: settings?.system?.max_predictions_per_hour},
              ].map((s,i) => (<div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">{s.label}</span><span className="text-sm font-medium dark:text-white">{s.value}</span></div>))}
            </div>
            <div className="glass-card p-5">
              <h4 className="font-semibold dark:text-white mb-4">Backup & Restore</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create a backup of all database collections.</p>
              <button onClick={doBackup} className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-2"><Backup style={{fontSize:18}} /> Create Backup</button>
              {backupMsg && <p className="mt-3 text-sm text-green-600 dark:text-green-400">{backupMsg}</p>}
            </div>
          </div>
        )}

        {activeTab === 'api_keys' && (
          <div className="glass-card p-5">
            <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><Key style={{fontSize:18}} /> Configured API Keys</h4>
            {[
              {label:'OpenWeatherMap', value: settings?.api_keys?.openweathermap, icon:'🌤️'},
              {label:'EmailJS Service ID', value: settings?.api_keys?.emailjs_service, icon:'📧'},
              {label:'EmailJS Template ID', value: settings?.api_keys?.emailjs_template, icon:'📝'},
            ].map((k,i) => (<div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-xl">{k.icon}</span><span className="text-sm text-gray-500 w-40">{k.label}</span><span className="text-sm font-mono dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">{k.value}</span></div>))}
            <p className="mt-4 text-xs text-gray-500">To update API keys, edit the .env file and restart the server.</p>
          </div>
        )}

        {activeTab === 'thresholds' && (
          <div className="glass-card p-5">
            <h4 className="font-semibold dark:text-white mb-4">Alert Thresholds</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {label:'High Risk Threshold', value: settings?.alert_thresholds?.high_risk_probability, desc:'Probability above which risk is High'},
                {label:'Medium Risk Threshold', value: settings?.alert_thresholds?.medium_risk_probability, desc:'Probability above which risk is Medium'},
              ].map((t,i) => (<div key={i} className="glass-card p-4"><p className="text-sm font-medium dark:text-white">{t.label}</p><p className="text-2xl font-bold text-blue-500">{(t.value * 100)}%</p><p className="text-xs text-gray-500 mt-1">{t.desc}</p></div>))}
              <div className="glass-card p-4"><p className="text-sm font-medium dark:text-white">Auto Email Alerts</p><span className={`text-sm font-bold ${settings?.alert_thresholds?.auto_email_alerts?'text-green-500':'text-red-500'}`}>{settings?.alert_thresholds?.auto_email_alerts?'Enabled':'Disabled'}</span></div>
              <div className="glass-card p-4"><p className="text-sm font-medium dark:text-white">Auto SMS Alerts</p><span className={`text-sm font-bold ${settings?.alert_thresholds?.auto_sms_alerts?'text-green-500':'text-red-500'}`}>{settings?.alert_thresholds?.auto_sms_alerts?'Enabled':'Disabled'}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><AccountCircle style={{fontSize:18}} /> Admin Profile</h4>
              <div className="flex items-center gap-4 mb-4"><div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">{user?.full_name?.charAt(0)||'A'}</div><div><p className="font-bold dark:text-white">{user?.full_name}</p><p className="text-sm text-gray-500">{user?.email}</p><span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{user?.role}</span></div></div>
              {[
                {label:'State', value: user?.state},
                {label:'District', value: user?.district},
                {label:'City', value: user?.city},
              ].map((p,i) => (<div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">{p.label}</span><span className="text-sm dark:text-white">{p.value}</span></div>))}
            </div>
            <div className="glass-card p-5">
              <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><Lock style={{fontSize:18}} /> Change Password</h4>
              <div className="space-y-3">
                <input type="password" placeholder="Current Password" value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                <input type="password" placeholder="New Password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                <input type="password" placeholder="Confirm New Password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm" />
                {pwMsg && <p className="text-sm text-blue-500">{pwMsg}</p>}
                <button onClick={changePassword} className="w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2"><Lock style={{fontSize:16}} /> Change Password</button>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}


// ═══════════════════════════════════════════════════════
// ADMIN ML MODELS SECTION
// ═══════════════════════════════════════════════════════

const MODEL_COLORS = {
  'Random Forest': '#3b82f6',
  'XGBoost': '#10b981',
  'Logistic Regression': '#f59e0b',
  'Decision Tree': '#8b5cf6',
}

function AdminMLModelsSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedDisease, setSelectedDisease] = useState('Dengue')
  const [activeTab, setActiveTab] = useState('comparison')

  useEffect(() => {
    setLoading(true)
    api.get(`/api/advanced/ml-models?disease=${selectedDisease}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedDisease])

  if (loading) return <SectionCard title="ML Model Comparison"><div className="h-40 shimmer rounded-xl dark:bg-slate-700/30" /></SectionCard>
  if (!data) return <SectionCard title="ML Model Comparison"><p className="text-gray-500">Failed to load</p></SectionCard>

  const models = Object.values(data.models)
  const bestModel = data.best_model
  const bestModelData = data.models[bestModel.name]

  const comparisonData = models.map(m => ({
    name: m.name.length > 10 ? m.name.split(' ').map(w => w[0]).join('') : m.name.split(' ')[0],
    fullName: m.name,
    Accuracy: (m.accuracy * 100).toFixed(1),
    Precision: (m.precision * 100).toFixed(1),
    Recall: (m.recall * 100).toFixed(1),
    'F1-Score': (m.f1_score * 100).toFixed(1),
    'AUC-ROC': (m.auc_roc * 100).toFixed(1),
  }))

  const radarData = [
    { metric: 'Accuracy', ...Object.fromEntries(models.map(m => [m.name, m.accuracy * 100])) },
    { metric: 'Precision', ...Object.fromEntries(models.map(m => [m.name, m.precision * 100])) },
    { metric: 'Recall', ...Object.fromEntries(models.map(m => [m.name, m.recall * 100])) },
    { metric: 'F1-Score', ...Object.fromEntries(models.map(m => [m.name, m.f1_score * 100])) },
    { metric: 'AUC-ROC', ...Object.fromEntries(models.map(m => [m.name, m.auc_roc * 100])) },
  ]

  const cm = bestModelData?.confusion_matrix || [[0,0],[0,0]]
  const featureData = bestModelData?.feature_importance || []

  const tabs = [
    { id: 'comparison', label: 'Model Comparison' },
    { id: 'confusion', label: 'Confusion Matrix' },
    { id: 'roc', label: 'ROC Curve' },
    { id: 'features', label: 'Feature Importance' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Psychology className="text-purple-500" /> ML Model Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare 4 ML models for disease prediction accuracy</p>
        </div>
        <div className="flex gap-2">
          {ADMIN_DISEASES.map(d => (
            <button key={d} onClick={() => setSelectedDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDisease === d ? 'gradient-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>{d}</button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-l-4 border-l-emerald-500 border-glow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-2xl shadow-lg">🏆</div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Best Performing Model</p>
            <h3 className="text-lg font-bold dark:text-white">{bestModel.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{bestModel.reason}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-500">{(bestModel.f1_score * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">F1-Score</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-white shadow-md' : 'text-gray-500 dark:text-gray-400'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Performance Metrics" subtitle="All models compared">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Precision" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="Recall" fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="F1-Score" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Radar Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={90} domain={[70, 100]} stroke="#475569" fontSize={10} />
                {models.map(m => (
                  <Radar key={m.name} name={m.name} dataKey={m.name} stroke={MODEL_COLORS[m.name]} fill={MODEL_COLORS[m.name]} fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Legend /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map(m => (
              <motion.div key={m.name} whileHover={{ y: -4 }}
                className={`kpi-card kpi-${m.name === 'XGBoost' ? 'green' : m.name === 'Random Forest' ? 'blue' : m.name === 'Logistic Regression' ? 'amber' : 'purple'} border-glow`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                  <p className="text-xs font-semibold dark:text-gray-300">{m.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-lg font-bold dark:text-white">{(m.accuracy * 100).toFixed(1)}%</p><p className="text-[10px] text-gray-500">Accuracy</p></div>
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-lg font-bold dark:text-white">{(m.f1_score * 100).toFixed(1)}%</p><p className="text-[10px] text-gray-500">F1-Score</p></div>
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-lg font-bold dark:text-white">{(m.auc_roc * 100).toFixed(1)}%</p><p className="text-[10px] text-gray-500">AUC-ROC</p></div>
                  <div className="bg-white/5 rounded-lg p-2"><p className="text-lg font-bold dark:text-white">{m.train_time_seconds}s</p><p className="text-[10px] text-gray-500">Train Time</p></div>
                </div>
                {bestModel.name === m.name && <div className="mt-3 text-xs text-emerald-500 font-semibold">🏆 Recommended Model</div>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'confusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title={`Confusion Matrix — ${bestModel.name}`}>
            <div className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"><p className="text-3xl font-bold text-emerald-500">{cm[0][0]}</p><p className="text-xs text-gray-500 mt-1">True Negative</p></div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"><p className="text-3xl font-bold text-red-500">{cm[0][1]}</p><p className="text-xs text-gray-500 mt-1">False Positive</p></div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center"><p className="text-3xl font-bold text-red-500">{cm[1][0]}</p><p className="text-xs text-gray-500 mt-1">False Negative</p></div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"><p className="text-3xl font-bold text-emerald-500">{cm[1][1]}</p><p className="text-xs text-gray-500 mt-1">True Positive</p></div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="All Models Accuracy">
            <div className="space-y-3">
              {models.map(m => {
                const c = m.confusion_matrix; const total = c[0][0]+c[0][1]+c[1][0]+c[1][1]; const correct = c[0][0]+c[1][1]; const pct = ((correct/total)*100).toFixed(1)
                return (
                  <div key={m.name} className="flex items-center gap-4 p-3 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                    <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                    <p className="text-sm font-semibold dark:text-gray-300 w-36">{m.name}</p>
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: MODEL_COLORS[m.name] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
                    </div>
                    <p className="text-sm font-bold dark:text-white w-16 text-right">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'roc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="ROC Curves — All Models" subtitle="TPR vs FPR">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend />
                {models.map(m => (
                  <Area key={m.name} name={m.name} data={m.roc_curve} dataKey="tpr" stroke={MODEL_COLORS[m.name]} fill={MODEL_COLORS[m.name]} fillOpacity={0.05} strokeWidth={2.5} dot={false} />
                ))}
                <Area name="Random Baseline" data={[{fpr:0,tpr:0},{fpr:1,tpr:1}]} dataKey="tpr" stroke="#475569" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
          <SectionCard title="AUC-ROC Ranking">
            <div className="space-y-4">
              {models.sort((a,b) => b.auc_roc - a.auc_roc).map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
                  <span className="text-lg font-bold dark:text-gray-500 w-6">#{i+1}</span>
                  <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                  <p className="text-sm font-semibold dark:text-gray-300 w-40">{m.name}</p>
                  <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: MODEL_COLORS[m.name] }} initial={{ width: 0 }} animate={{ width: `${m.auc_roc * 100}%` }} transition={{ duration: 1.2 }} />
                  </div>
                  <p className="text-sm font-bold dark:text-white w-16 text-right">{(m.auc_roc * 100).toFixed(1)}%</p>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Feature Importance" subtitle={`Based on ${bestModel.name}`}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={featureData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} formatter={v => `${(v*100).toFixed(1)}%`} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                  {featureData.map((_, i) => <Cell key={i} fill={['#3b82f6','#10b981','#06b6d4','#8b5cf6','#f59e0b','#ec4899','#ef4444','#6366f1'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
          <SectionCard title="Training Configuration">
            <div className="space-y-3">
              {Object.entries(bestModelData.hyperparameters).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-3 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                  <p className="text-sm font-medium dark:text-gray-300">{k}</p>
                  <p className="text-sm font-mono text-blue-400">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
                </div>
              ))}
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl mt-4">
                <p className="text-xs text-purple-400 font-semibold mb-2">📊 Training Info</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="text-gray-400">Samples: <span className="text-white font-semibold">{data.training_info.dataset_size}</span></p>
                  <p className="text-gray-400">Features: <span className="text-white font-semibold">{data.training_info.features}</span></p>
                  <p className="text-gray-400">Split: <span className="text-white font-semibold">{data.training_info.train_test_split}</span></p>
                  <p className="text-gray-400">CV Folds: <span className="text-white font-semibold">{bestModelData.cross_validation_folds}</span></p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════
// ADMIN AI INSIGHTS SECTION
// ═══════════════════════════════════════════════════════

function AdminAIInsightsSection() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/advanced/ml-insights').then(r => setInsights(r.data.insights || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const tc = { warning: { border: 'border-l-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' }, success: { border: 'border-l-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' }, info: { border: 'border-l-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' }, alert: { border: 'border-l-red-500', text: 'text-red-500', bg: 'bg-red-500/10' } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><AutoAwesome className="text-amber-500" /> AI Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">System-generated intelligence and recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Auto-Generated
        </div>
      </div>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 shimmer rounded-2xl dark:bg-slate-700/30" />)}</div>
      ) : (
        <div className="space-y-4">
          {insights.map((ins, i) => {
            const c = tc[ins.type] || tc.info
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 border-l-4 ${c.border} border-glow`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{ins.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold dark:text-white">{ins.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>{ins.confidence}% confidence</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{ins.description}</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                      <span className="text-xs">⚡</span>
                      <p className="text-xs font-medium dark:text-gray-300">Action: {ins.action}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ ADMIN FOOD MANAGEMENT SECTION ============
function AdminFoodManagementSection() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newFood, setNewFood] = useState({ name: '', category: 'Soups', description: '', price: 0, image: '🍽️', popular: false })

  const fetchFoods = async () => {
    try {
      const res = await api.get('/api/food/admin/foods')
      setFoods(res.data.foods || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchFoods() }, [])

  const addFood = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/food/foods', newFood)
      setShowAdd(false)
      setNewFood({ name: '', category: 'Soups', description: '', price: 0, image: '🍽️', popular: false })
      fetchFoods()
    } catch (err) { console.error(err) }
  }

  const toggleActive = async (food) => {
    try {
      await api.put(`/api/food/foods/${food.id}`, { is_active: !food.is_active })
      fetchFoods()
    } catch (err) { console.error(err) }
  }

  const deleteFood = async (food) => {
    if (!window.confirm(`Delete ${food.name}?`)) return
    try {
      await api.delete(`/api/food/foods/${food.id}`)
      fetchFoods()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Food Catalog Management">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{foods.length} food items in catalog</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg">
            <Add style={{ fontSize: 18 }} /> Add Food
          </motion.button>
        </div>

        {showAdd && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={addFood}
            className="mb-6 p-5 rounded-xl bg-white/5 dark:bg-white/[0.03] border border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required placeholder="Food Name" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
              <select value={newFood.category} onChange={e => setNewFood({...newFood, category: e.target.value})}
                className="px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-white outline-none">
                {['Soups','Healthy Meals','Fruits','Juices','Herbal Drinks','Recovery Foods'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Price" value={newFood.price} onChange={e => setNewFood({...newFood, price: Number(e.target.value)})}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            <input placeholder="Description" value={newFood.description} onChange={e => setNewFood({...newFood, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
            <div className="flex items-center gap-4">
              <input placeholder="Emoji Icon (e.g. 🍲)" value={newFood.image} onChange={e => setNewFood({...newFood, image: e.target.value})}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none w-48" />
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={newFood.popular} onChange={e => setNewFood({...newFood, popular: e.target.checked})} className="rounded" />
                Mark as Popular
              </label>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} className="ml-auto px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold">Save Food</motion.button>
            </div>
          </motion.form>
        )}

        {loading ? (
          <div className="h-40 shimmer rounded-xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-white/10">
                  <th className="pb-3 pl-4">Food</th><th className="pb-3">Category</th><th className="pb-3">Price</th><th className="pb-3">Status</th><th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {foods.map(food => (
                  <tr key={food.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-4"><div className="flex items-center gap-3"><span className="text-2xl">{food.image}</span><span className="font-semibold text-gray-800 dark:text-white">{food.name}</span></div></td>
                    <td className="py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">{food.category}</span></td>
                    <td className="py-3 font-bold text-emerald-500">₹{food.price}</td>
                    <td className="py-3">
                      <button onClick={() => toggleActive(food)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${food.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {food.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button onClick={() => deleteFood(food)} className="p-2 rounded-lg hover:bg-red-500/10 transition"><Delete style={{ fontSize: 16 }} className="text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ============ ADMIN ORDER MANAGEMENT SECTION ============
function AdminOrderManagementSection() {
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/food/admin/orders', { params: { search } })
      setOrders(res.data.orders || [])
      setOrderStats(res.data.stats || {})
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [search])

  const updateStatus = async (orderId, status) => {
    try {
      await api.put('/api/food/order/status', { order_id: orderId, status })
      fetchOrders()
    } catch (err) { console.error(err) }
  }

  const statusColors = {
    'Order Received': 'bg-blue-500/10 text-blue-500',
    'Preparing Food': 'bg-amber-500/10 text-amber-500',
    'Packed': 'bg-purple-500/10 text-purple-500',
    'Out For Delivery': 'bg-cyan-500/10 text-cyan-500',
    'Delivered': 'bg-emerald-500/10 text-emerald-500',
    'Cancelled': 'bg-red-500/10 text-red-500',
  }

  const nextStatus = {
    'Order Received': 'Preparing Food',
    'Preparing Food': 'Packed',
    'Packed': 'Out For Delivery',
    'Out For Delivery': 'Delivered',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orderStats.total_orders || 0, color: 'from-blue-500 to-cyan-500', icon: '📦' },
          { label: 'Revenue', value: `₹${orderStats.total_revenue || 0}`, color: 'from-emerald-500 to-teal-500', icon: '💰' },
          { label: 'Active Deliveries', value: orderStats.active_deliveries || 0, color: 'from-amber-500 to-orange-500', icon: '🚚' },
          { label: 'Delivered', value: orderStats.delivered || 0, color: 'from-violet-500 to-purple-500', icon: '✅' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} text-white`}>
            <div className="flex items-center justify-between mb-2"><span className="text-2xl">{s.icon}</span></div>
            <p className="text-white/80 text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <SectionCard title="Order Management">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search orders by ID or customer name..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        {loading ? (
          <div className="h-40 shimmer rounded-xl" />
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><p className="text-lg font-semibold">No orders found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-white/10">
                  <th className="pb-3 pl-4">Order ID</th><th className="pb-3">Customer</th><th className="pb-3">Items</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-4"><span className="font-bold text-gray-800 dark:text-white">{order.order_number}</span><br/><span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span></td>
                    <td className="py-3"><span className="text-sm text-gray-600 dark:text-gray-300">{order.customer_info?.name || 'N/A'}</span></td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{order.items?.length || 0} items</td>
                    <td className="py-3 font-bold text-emerald-500">₹{order.grand_total}</td>
                    <td className="py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-500/10 text-gray-500'}`}>{order.status}</span></td>
                    <td className="py-3 pr-4 text-right">
                      {nextStatus[order.status] && (
                        <button onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition">
                          → {nextStatus[order.status]}
                        </button>
                      )}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button onClick={() => updateStatus(order.id, 'Cancelled')}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ============ ADMIN COMMUNITY REPORTS SECTION ============
function AdminCommunityReportsSection() {
  const { t } = useLanguage()
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    try {
      const [r, s] = await Promise.all([
        api.get('/api/community/reports', { params: { status: filter } }),
        api.get('/api/community/reports/stats')
      ])
      setReports(r.data.reports || [])
      setStats(s.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/community/reports/${id}/status`, { status })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const severityColors = { low: 'bg-green-500/10 text-green-500', medium: 'bg-amber-500/10 text-amber-500', high: 'bg-orange-500/10 text-orange-500', critical: 'bg-red-500/10 text-red-500' }
  const statusColors = { pending: 'bg-yellow-500/10 text-yellow-500', reviewing: 'bg-blue-500/10 text-blue-500', resolved: 'bg-emerald-500/10 text-emerald-500', dismissed: 'bg-gray-500/10 text-gray-500' }
  const typeLabels = { fever_cluster: '🤒 Fever Cluster', water_contamination: '💧 Water Contamination', mosquito_breeding: '🦟 Mosquito Breeding', health_hazard: '⚠️ Health Hazard', other: '📝 Other' }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-800 dark:text-white">📢 Community Health Reports</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total || 0, color: 'from-blue-500 to-cyan-500', icon: '📋' },
          { label: 'Pending', value: stats.pending || 0, color: 'from-amber-500 to-orange-500', icon: '⏳' },
          { label: 'Resolved', value: stats.resolved || 0, color: 'from-emerald-500 to-teal-500', icon: '✅' },
          { label: 'Critical', value: (stats.by_severity || {}).critical || 0, color: 'from-red-500 to-pink-500', icon: '🚨' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} text-white`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-white/80 text-xs font-medium mt-2">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === s ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <SectionCard title="All Reports" subtitle={`${reports.length} reports`}>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No reports found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 pl-4">Type</th><th className="pb-3">Title</th><th className="pb-3">Severity</th><th className="pb-3">Status</th><th className="pb-3">Votes</th><th className="pb-3">Location</th><th className="pb-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {reports.map((report, i) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-4 text-sm">{typeLabels[report.type] || report.type}</td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-white text-sm max-w-[200px] truncate">{report.title}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${severityColors[report.severity]}`}>{report.severity}</span></td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[report.status]}`}>{report.status}</span></td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">👍 {report.votes}</td>
                    <td className="py-3 text-xs text-gray-500 dark:text-gray-400">{report.location?.address}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        {report.status !== 'reviewing' && (
                          <button onClick={() => updateStatus(report.id, 'reviewing')} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20">Review</button>
                        )}
                        {report.status !== 'resolved' && (
                          <button onClick={() => updateStatus(report.id, 'resolved')} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20">Resolve</button>
                        )}
                        {report.status !== 'dismissed' && (
                          <button onClick={() => updateStatus(report.id, 'dismissed')} className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-500 text-xs font-bold hover:bg-gray-500/20">Dismiss</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ============ ADMIN HEALTH CAMPS SECTION ============
function AdminHealthCampsSection() {
  const { t } = useLanguage()
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'health_camp', description: '', event_date: '', location: '', city: '', state: '', organizer: '', capacity: 100, contact: '' })

  const fetchCamps = async () => {
    try {
      const res = await api.get('/api/community/camps')
      setCamps(res.data.camps || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCamps() }, [])

  const createCamp = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/community/camps', form)
      setShowForm(false)
      setForm({ title: '', type: 'health_camp', description: '', event_date: '', location: '', city: '', state: '', organizer: '', capacity: 100, contact: '' })
      fetchCamps()
    } catch (err) { console.error(err) }
  }

  const deleteCamp = async (id) => {
    try {
      await api.delete(`/api/community/camps/${id}`)
      fetchCamps()
    } catch (err) { console.error(err) }
  }

  const toggleCamp = async (id, isActive) => {
    try {
      await api.put(`/api/community/camps/${id}`, { is_active: !isActive })
      fetchCamps()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">🏥 Health Camps & Events</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg">
          ➕ Create Event
        </motion.button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={createCamp}
          className="glass-card p-6 border-glow space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">Create New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input required placeholder="Event Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="health_camp">Health Camp</option>
              <option value="blood_donation">Blood Donation Drive</option>
              <option value="awareness_program">Awareness Program</option>
            </select>
            <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input required placeholder="Location / Venue" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="Organizer" value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="Contact Number" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
          </div>
          <textarea placeholder="Event Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none resize-none" />
          <div className="flex gap-3">
            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">Create Event</motion.button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-semibold">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* Camps Table */}
      <SectionCard title="All Events" subtitle={`${camps.length} events`}>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
        ) : camps.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No events created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 pl-4">Type</th><th className="pb-3">Title</th><th className="pb-3">Date</th><th className="pb-3">Location</th><th className="pb-3">Registrations</th><th className="pb-3">Status</th><th className="pb-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {camps.map((camp, i) => (
                  <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3 pl-4 text-sm">{camp.type === 'blood_donation' ? '🩸' : camp.type === 'awareness_program' ? '📢' : '🏥'} <span className="capitalize">{camp.type.replace('_', ' ')}</span></td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-white text-sm">{camp.title}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(camp.event_date).toLocaleDateString()}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{camp.location}, {camp.city}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{camp.registrations}/{camp.capacity}</td>
                    <td className="py-3">
                      <button onClick={() => toggleCamp(camp.id, camp.is_active)}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${camp.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {camp.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <button onClick={() => deleteCamp(camp.id)} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ============ DEMO MODE SECTION ============
function DemoModeSection() {
  const { t } = useLanguage()
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState(null)
  const [seeded, setSeeded] = useState(false)

  const seedDemo = async () => {
    setSeeding(true)
    setResult(null)
    try {
      const res = await api.post('/api/community/seed-demo')
      setResult(res.data)
      setSeeded(true)
    } catch (err) {
      setResult({ message: 'Failed to seed demo data', error: err.message })
    } finally {
      setSeeding(false)
    }
  }

  const demoItems = [
    { label: 'Community Reports', count: result?.seeded?.community_reports || 0, icon: '📝', color: 'from-red-500 to-orange-500' },
    { label: 'Vaccination Records', count: result?.seeded?.vaccination_records || 0, icon: '💉', color: 'from-violet-500 to-purple-500' },
    { label: 'Health Camps', count: result?.seeded?.health_camps || 0, icon: '🏥', color: 'from-blue-500 to-cyan-500' },
    { label: 'Food Orders', count: result?.seeded?.food_orders || 0, icon: '🍽️', color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">🎮 Project Presentation Mode</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Load demo data for project demonstrations and evaluations</p>
      </div>

      {/* Seed Button */}
      <div className="glass-card p-8 border-glow text-center">
        <div className="text-5xl mb-4">{seeded ? '✅' : '🎯'}</div>
        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">
          {seeded ? 'Demo Data Loaded!' : 'Load Demo Data'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-lg mx-auto">
          {seeded
            ? 'Sample data has been seeded across all modules. Navigate to different sections to explore the demo data.'
            : 'Click below to populate the system with sample data including community reports, vaccination records, health camps, and food orders. This is perfect for project presentations.'}
        </p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={seedDemo} disabled={seeding}
          className={`px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition ${
            seeding
              ? 'bg-gray-400 cursor-not-allowed'
              : seeded
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/20'
          }`}>
          {seeding ? 'Seeding Data...' : seeded ? '🔄 Re-seed Demo Data' : '🚀 Load Demo Data'}
        </motion.button>
      </div>

      {/* Result Cards */}
      {seeded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} text-white`}>
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white/80 text-xs font-medium mt-2">{item.label}</p>
              <p className="text-3xl font-black">{item.count}</p>
              <p className="text-white/60 text-[10px] mt-1">records seeded</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Demo Data Summary */}
      <SectionCard title="Demo Data Summary" subtitle="What gets loaded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Community Reports', items: ['Fever cluster in Koramangala', 'Mosquito breeding at HSR Layout', 'Water contamination in Jayanagar', 'Garbage pile near school'] },
            { title: 'Vaccinations', items: ['BCG, COVID-19 Booster', 'Influenza (Annual)', 'Typhoid, Hepatitis A'] },
            { title: 'Health Camps', items: ['Free Dengue Screening Camp', 'Blood Donation Drive', 'Monsoon Health Awareness Program'] },
            { title: 'Food Orders', items: ['Vegetable Soup + Coconut Water', 'Khichdi + Banana + ORS', 'Papaya Leaf Juice + Orange Juice'] },
          ].map((section, si) => (
            <div key={si} className="p-4 rounded-xl bg-white/50 dark:bg-white/[0.03]">
              <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-2">{section.title}</h4>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
