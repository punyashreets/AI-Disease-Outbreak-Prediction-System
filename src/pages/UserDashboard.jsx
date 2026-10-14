import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Layout from '../components/Layout'
import GlobalMonitor from '../components/GlobalMonitor'
import RiskMap from '../components/RiskMap'
import HospitalMap from '../components/HospitalMap'
import { StatCard, RiskBadge, GaugeChart, SectionCard } from '../components/Shared'
import { motion } from 'framer-motion'
import api from '../services/api'
import { useGeolocation, sendEmailAlert } from '../services/geoServices'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter
} from 'recharts'
import {
  Warning, Thermostat, WaterDrop, Air, BugReport, SentimentVeryDissatisfied,
  TipsAndUpdates, LocalHospital, Restaurant, Phone, Email, CheckCircle,
  ExpandMore, TrendingUp, Shield, WbCloudy, Psychology, Share, Timeline,
  BubbleChart, Lightbulb, Inventory, HealthAndSafety, ArrowUpward, ArrowDownward,
  CalendarMonth, Speed, People, Medication, BedOutlined, AutoAwesome, Delete
} from '@mui/icons-material'

const DISEASES = ['Dengue', 'Malaria', 'Cholera', 'Typhoid', 'Influenza', 'COVID-19', 'Leptospirosis']

const TREND_DATA = [
  { month: 'Jan', Dengue: 45, Malaria: 120, Cholera: 30, Typhoid: 65, Influenza: 200 },
  { month: 'Feb', Dengue: 38, Malaria: 95, Cholera: 25, Typhoid: 55, Influenza: 180 },
  { month: 'Mar', Dengue: 62, Malaria: 110, Cholera: 42, Typhoid: 78, Influenza: 150 },
  { month: 'Apr', Dengue: 85, Malaria: 145, Cholera: 58, Typhoid: 92, Influenza: 90 },
  { month: 'May', Dengue: 130, Malaria: 190, Cholera: 85, Typhoid: 110, Influenza: 60 },
  { month: 'Jun', Dengue: 210, Malaria: 280, Cholera: 150, Typhoid: 145, Influenza: 40 },
  { month: 'Jul', Dengue: 340, Malaria: 350, Cholera: 220, Typhoid: 180, Influenza: 35 },
  { month: 'Aug', Dengue: 420, Malaria: 380, Cholera: 280, Typhoid: 200, Influenza: 30 },
  { month: 'Sep', Dengue: 380, Malaria: 320, Cholera: 240, Typhoid: 170, Influenza: 55 },
  { month: 'Oct', Dengue: 250, Malaria: 240, Cholera: 160, Typhoid: 130, Influenza: 120 },
  { month: 'Nov', Dengue: 120, Malaria: 160, Cholera: 70, Typhoid: 85, Influenza: 175 },
  { month: 'Dec', Dengue: 55, Malaria: 100, Cholera: 35, Typhoid: 60, Influenza: 220 },
]

const ADVISORY_DATA = {
  Dengue: {
    prevention: ['Remove stagnant water around your home', 'Use mosquito repellents (DEET-based)', 'Wear full-sleeve clothing', 'Install window/door screens', 'Use mosquito nets while sleeping'],
    symptoms: ['High fever (104°F)', 'Severe headache', 'Pain behind eyes', 'Joint & muscle pain', 'Skin rash'],
    doAndDont: { do: ['Drink plenty of fluids', 'Take paracetamol for fever', 'Rest adequately', 'Monitor platelet count'], dont: ['Take aspirin or ibuprofen', 'Ignore symptoms', 'Allow water stagnation', 'Self-medicate heavily'] }
  },
  Malaria: {
    prevention: ['Sleep under insecticide-treated mosquito nets', 'Apply mosquito repellent creams', 'Wear long-sleeved clothing at dusk', 'Spray insecticides indoors', 'Take prophylactic medication if traveling'],
    symptoms: ['Recurring fever with chills', 'Profuse sweating', 'Headache', 'Nausea & vomiting', 'Body ache'],
    doAndDont: { do: ['Seek immediate medical help', 'Complete full medication course', 'Stay hydrated', 'Use mosquito nets'], dont: ['Skip medication doses', 'Delay treatment', 'Ignore recurring fever', 'Travel to endemic areas'] }
  },
  Cholera: {
    prevention: ['Drink only boiled or purified water', 'Wash hands thoroughly before eating', 'Eat freshly cooked food', 'Avoid raw vegetables and salads', 'Maintain proper sanitation'],
    symptoms: ['Severe watery diarrhea', 'Vomiting', 'Leg cramps', 'Rapid dehydration', 'Sunken eyes'],
    doAndDont: { do: ['Start ORS immediately', 'Seek medical attention fast', 'Drink clean water frequently', 'Maintain hygiene'], dont: ['Eat street food', 'Drink unboiled water', 'Ignore dehydration signs', 'Delay treatment'] }
  },
  Typhoid: {
    prevention: ['Get vaccinated', 'Drink purified water only', 'Wash hands before meals', 'Avoid eating from unhygienic vendors', 'Ensure food is properly cooked'],
    symptoms: ['Prolonged high fever', 'Headache', 'Abdominal pain', 'Constipation or diarrhea', 'Rose-colored spots on chest'],
    doAndDont: { do: ['Take complete antibiotic course', 'Eat soft, easily digestible food', 'Stay hydrated', 'Rest adequately'], dont: ['Eat spicy/oily food', 'Skip medications', 'Consume raw vegetables', 'Return to work too early'] }
  },
  Influenza: {
    prevention: ['Get annual flu vaccination', 'Cover mouth while coughing/sneezing', 'Wash hands frequently', 'Avoid close contact with sick people', 'Maintain good ventilation'],
    symptoms: ['Sudden high fever', 'Dry cough', 'Sore throat', 'Body aches', 'Extreme fatigue'],
    doAndDont: { do: ['Rest and stay home', 'Drink warm fluids', 'Take antiviral medication if prescribed', 'Wear a mask'], dont: ['Go to work/school when sick', 'Take antibiotics unnecessarily', 'Ignore worsening symptoms', 'Skip flu vaccine'] }
  },
  'COVID-19': {
    prevention: ['Get vaccinated and boosted', 'Wear masks in crowded places', 'Maintain hand hygiene', 'Ensure proper ventilation', 'Follow local health guidelines'],
    symptoms: ['Fever or chills', 'Persistent dry cough', 'Loss of taste/smell', 'Shortness of breath', 'Fatigue'],
    doAndDont: { do: ['Isolate if positive', 'Monitor oxygen levels', 'Stay hydrated', 'Seek medical help if SpO2 < 94%'], dont: ['Ignore symptoms', 'Self-medicate with steroids', 'Attend gatherings when symptomatic', 'Panic'] }
  },
  Leptospirosis: {
    prevention: ['Avoid wading in floodwater', 'Wear protective boots and gloves', 'Cover open wounds', 'Control rodents around home', 'Vaccinate pets'],
    symptoms: ['High fever', 'Severe headache', 'Muscle pain (especially calves)', 'Red eyes', 'Jaundice in severe cases'],
    doAndDont: { do: ['Seek medical help early', 'Take doxycycline if prescribed', 'Rest and hydrate', 'Protect wounds from contaminated water'], dont: ['Walk barefoot in flooded areas', 'Ignore muscle pain', 'Delay treatment', 'Swim in contaminated water'] }
  }
}

const FOOD_RECOMMENDATIONS = {
  Fever: {
    recommended: [
      { name: 'Fresh Fruits', desc: 'Oranges, bananas, apples - rich in vitamins', icon: '🍊' },
      { name: 'Clear Soups', desc: 'Chicken soup, vegetable broth for hydration', icon: '🍜' },
      { name: 'Fluids', desc: 'Coconut water, ORS, fresh juices', icon: '🥥' },
      { name: 'Khichdi', desc: 'Easy to digest, provides energy', icon: '🍚' },
      { name: 'Yogurt', desc: 'Probiotics for gut health', icon: '🥛' },
    ],
    avoid: ['Oily & fried foods', 'Spicy dishes', 'Heavy meats', 'Caffeine', 'Alcohol']
  },
  Diarrhea: {
    recommended: [
      { name: 'ORS Solution', desc: 'Essential for rehydration', icon: '💧' },
      { name: 'White Rice', desc: 'Bland and easy to digest', icon: '🍚' },
      { name: 'Curd/Yogurt', desc: 'Restores gut bacteria', icon: '🥛' },
      { name: 'Bananas', desc: 'Rich in potassium', icon: '🍌' },
      { name: 'Toast', desc: 'Bland carbs for energy', icon: '🍞' },
    ],
    avoid: ['Dairy (except yogurt)', 'High-fiber foods', 'Spicy food', 'Sugary drinks', 'Fried food']
  },
  Flu: {
    recommended: [
      { name: 'Warm Soup', desc: 'Chicken soup reduces inflammation', icon: '🍲' },
      { name: 'Citrus Fruits', desc: 'Vitamin C boosts immunity', icon: '🍋' },
      { name: 'Ginger Tea', desc: 'Anti-inflammatory, soothes throat', icon: '🍵' },
      { name: 'Honey', desc: 'Natural cough suppressant', icon: '🍯' },
      { name: 'Garlic', desc: 'Immune-boosting properties', icon: '🧄' },
    ],
    avoid: ['Cold beverages', 'Processed food', 'Dairy products', 'Sugar', 'Alcohol']
  },
  Dengue: {
    recommended: [
      { name: 'Papaya Leaf Juice', desc: 'Known to increase platelet count', icon: '🥬' },
      { name: 'Coconut Water', desc: 'Electrolytes and hydration', icon: '🥥' },
      { name: 'Pomegranate', desc: 'Rich in iron and antioxidants', icon: '🍎' },
      { name: 'Kiwi', desc: 'High in Vitamin C and K', icon: '🥝' },
      { name: 'Leafy Greens', desc: 'Iron and mineral rich', icon: '🥗' },
    ],
    avoid: ['Dark colored foods', 'Oily food', 'Spicy items', 'Aspirin', 'Caffeine']
  },
}

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '112', desc: 'All emergencies' },
  { name: 'Ambulance', number: '108', desc: 'Medical emergencies' },
  { name: 'Health Helpline', number: '104', desc: 'Medical advice' },
  { name: 'Women Helpline', number: '1091', desc: 'Women safety' },
  { name: 'Child Helpline', number: '1098', desc: 'Child protection' },
  { name: 'Disaster Management', number: '1078', desc: 'Natural disasters' },
]

const FIRST_AID = [
  { condition: 'High Fever', steps: ['Apply cold compress', 'Give paracetamol', 'Keep hydrated', 'Monitor temperature every 30 min'] },
  { condition: 'Severe Dehydration', steps: ['Give ORS solution', 'Sip water frequently', 'Avoid caffeine', 'Seek immediate medical help'] },
  { condition: 'Breathing Difficulty', steps: ['Sit upright', 'Loosen tight clothing', 'Use inhaler if available', 'Call ambulance immediately'] },
  { condition: 'Severe Allergic Reaction', steps: ['Use epinephrine if available', 'Call emergency services', 'Lie down with legs elevated', 'Monitor breathing'] },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const section = searchParams.get('section') || 'overview'
  
  const [predictions, setPredictions] = useState([])
  const [weather, setWeather] = useState(null)
  const [satellite, setSatellite] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDisease, setSelectedDisease] = useState('Dengue')
  const [selectedFoodDisease, setSelectedFoodDisease] = useState('Fever')
  const [socialSignals, setSocialSignals] = useState([])

  // Browser Geolocation API - gets user's real-time location
  const geoLocation = useGeolocation()

  useEffect(() => {
    const fetchData = async () => {
      // Use geolocation data if available, fallback to user profile location
      const state = geoLocation.state || user?.state
      const district = geoLocation.district || user?.district
      const city = geoLocation.city || user?.city

      try {
        const [predRes, weatherRes, satelliteRes, alertRes, socialRes] = await Promise.allSettled([
          api.post('/api/predict/all-diseases', { state, district, city }),
          api.get('/api/weather/current', { params: { state, district, city } }),
          api.get('/api/satellite/current', { params: { state, district, city } }),
          api.get('/api/alerts', { params: { region: state } }),
          api.get('/api/chatbot/outbreak-signals', { params: { region: state } }),
        ])
        if (predRes.status === 'fulfilled') setPredictions(predRes.value.data.predictions || [])
        if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data.weather)
        if (satelliteRes.status === 'fulfilled') setSatellite(satelliteRes.value.data.satellite)
        if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data.alerts || [])
        if (socialRes.status === 'fulfilled') setSocialSignals(socialRes.value.data.signals || [])
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user && !geoLocation.loading) fetchData()
  }, [user, geoLocation.loading, geoLocation.state, geoLocation.city])

  const topPrediction = predictions[0] || { risk_level: 'Low', probability: 0.12, disease: 'Dengue' }
  const activeAlertCount = alerts.length

  const renderSection = () => {
    switch (section) {
      case 'global': return <GlobalMonitor />
      case 'predictions': return <PredictionsSection predictions={predictions} onSelectDisease={setSelectedDisease} selectedDisease={selectedDisease} />
      case 'map': return <MapSection />
      case 'hospitals': return <HospitalSection geoLocation={geoLocation} user={user} />
      case 'analytics': return <AnalyticsSection />
      case 'social': return <SocialSection signals={socialSignals} />
      case 'forecast': return <ForecastSection user={user} geoLocation={geoLocation} />
      case 'spread': return <SpreadSection user={user} geoLocation={geoLocation} />
      case 'explain': return <ExplainSection user={user} geoLocation={geoLocation} selectedDisease={selectedDisease} onSelectDisease={setSelectedDisease} />
      case 'resources': return <ResourceSection user={user} geoLocation={geoLocation} selectedDisease={selectedDisease} onSelectDisease={setSelectedDisease} />
      case 'ml': return <MLModelsSection selectedDisease={selectedDisease} onSelectDisease={setSelectedDisease} />
      case 'insights': return <AIInsightsSection />
      case 'alerts': return <AlertsSection alerts={alerts} user={user} />
      case 'advisory': return <AdvisorySection selectedDisease={selectedDisease} onSelectDisease={setSelectedDisease} />
      case 'food': return <FoodSection selectedDisease={selectedFoodDisease} onSelectDisease={setSelectedFoodDisease} />
      case 'emergency': return <EmergencySection />
      case 'profile': return <ProfileSection user={user} />
      case 'community': return <CommunityReportSection user={user} />
      case 'vaccination': return <VaccinationSection />
      case 'camps': return <HealthCampsSection />
      case 'knowledge': return <KnowledgeGraphSection />
      case 'history': return <PredictionHistorySection />
      default: return <OverviewSection predictions={predictions} weather={weather} alerts={alerts} user={user} topPrediction={topPrediction} geoLocation={geoLocation} />
    }
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      ) : renderSection()}
    </Layout>
  )
}

function OverviewSection({ predictions, weather, alerts, user, topPrediction, geoLocation }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{t('dash.welcome')}, {user?.full_name?.split(' ')[0] || 'User'}!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dash.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              topPrediction.risk_level === 'High' ? 'bg-red-500/10 text-red-500' : topPrediction.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                topPrediction.risk_level === 'High' ? 'bg-red-500' : topPrediction.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              {topPrediction.risk_level} Risk Area
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BugReport />} label={t('common.riskLevel')} value={topPrediction.risk_level} 
          color={topPrediction.risk_level === 'High' ? 'red' : topPrediction.risk_level === 'Medium' ? 'yellow' : 'green'} />
        <StatCard icon={<Warning />} label={t('dash.activeAlerts')} value={alerts.length} color="yellow" trend={12} />
        <StatCard icon={<Thermostat />} label="Temperature" value={weather ? `${weather.temperature}°C` : '28°C'} color="teal" />
        <StatCard icon={<SentimentVeryDissatisfied />} label="Cases Nearby" value={247} color="purple" trend={-8} />
      </div>

      {/* Environmental Metrics */}
      <SectionCard title="Environmental Conditions" subtitle={`${user?.city || 'Your'}, ${user?.district || ''}, ${user?.state || 'Location'}`}
        action={
          geoLocation.lat ? (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              GPS Active
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Detecting location...</span>
          )
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Thermostat className="text-red-400" />, label: 'Temperature', value: weather?.temperature || 28, unit: '°C', color: 'from-red-500/20 to-red-500/5' },
            { icon: <WaterDrop className="text-blue-400" />, label: 'Humidity', value: weather?.humidity || 72, unit: '%', color: 'from-blue-500/20 to-blue-500/5' },
            { icon: <WbCloudy className="text-teal-400" />, label: 'Rainfall', value: weather?.rainfall || 12, unit: 'mm', color: 'from-teal-500/20 to-teal-500/5' },
            { icon: <Psychology className="text-purple-400" />, label: 'Risk Score', value: Math.round(topPrediction.probability * 100), unit: '/100', color: 'from-purple-500/20 to-purple-500/5' },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -2 }}
              className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center border border-white/5`}>
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="text-2xl font-bold dark:text-white count-animation">{item.value}<span className="text-sm text-gray-500">{item.unit}</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Top Predictions */}
      <SectionCard title={t('pred.allPredictions')} subtitle={t('overview.subtitle')}>
        <div className="space-y-3">
          {predictions.slice(0, 5).map((pred, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:dark:bg-white/[0.06] transition">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${pred.risk_level === 'High' ? 'bg-red-500' : pred.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="font-semibold dark:text-white text-sm">{pred.disease}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-gray-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <motion.div className={`h-full rounded-full ${pred.risk_level === 'High' ? 'bg-red-500' : pred.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                    initial={{ width: 0 }} animate={{ width: `${pred.probability * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                </div>
                <RiskBadge level={pred.risk_level} />
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Map Preview */}
      <SectionCard title={t('riskMap.title')} subtitle={t('riskMap.subtitle')}>
        <RiskMap height="400px" />
      </SectionCard>

      {/* Recent Alerts */}
      <SectionCard title={t('alerts.recentTitle')} subtitle={t('alerts.recentSub')}>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">{t('overview.noAlerts')}</p>
            <p className="text-sm">{t('overview.safe')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border-l-4 ${alert.risk_level === 'High' ? 'border-red-500 bg-red-500/5' : alert.risk_level === 'Medium' ? 'border-yellow-500 bg-yellow-500/5' : 'border-green-500 bg-green-500/5'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold dark:text-white">{alert.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                  </div>
                  <RiskBadge level={alert.risk_level} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function PredictionsSection({ predictions, selectedDisease, onSelectDisease }) {
  const { t } = useLanguage()
  const selected = predictions.find(p => p.disease === selectedDisease) || predictions[0] || { disease: 'Dengue', risk_level: 'Medium', probability: 0.52, confidence: 0.85, explanation: 'Moderate risk based on environmental factors', features: {} }
  const advisory = ADVISORY_DATA[selectedDisease] || ADVISORY_DATA.Dengue

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {DISEASES.map(d => (
          <button key={d} onClick={() => onSelectDisease(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDisease === d ? 'gradient-primary text-white shadow-lg' : 'glass-card hover:bg-blue-50 dark:hover:bg-gray-700'}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title={t('pred.riskAssessment')} className="flex flex-col items-center text-center">
          <div className="relative">
            <GaugeChart value={selected.probability} label={t('pred.outbreakProb')} size={160} strokeWidth={12} />
          </div>
          <div className="mt-4">
            <RiskBadge level={selected.risk_level} />
          </div>
          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('pred.confidence')}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round((selected.confidence || 0.75) * 100)}%</p>
          </div>
        </SectionCard>

        <SectionCard title={t('pred.details')} className="lg:col-span-2">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">{t('pred.explanation')}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selected.explanation || t('pred.explanationText')}</p>
            </div>

            <div>
              <h4 className="font-semibold dark:text-white mb-3">{t('pred.keySymptoms')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(advisory.symptoms || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Warning className="text-amber-500 text-base" /> {s}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold dark:text-white mb-3">{t('pred.prevention')}</h4>
              <div className="grid grid-cols-1 gap-2">
                {(advisory.prevention || []).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="text-green-500 text-base" /> {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t('pred.allPredictions')}>
        <div className="space-y-2">
          {predictions.map((pred, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition ${pred.disease === selectedDisease ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => onSelectDisease(pred.disease)}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${pred.risk_level === 'High' ? 'bg-red-500' : pred.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="font-medium dark:text-white">{pred.disease}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">{Math.round(pred.probability * 100)}% probability</span>
                <RiskBadge level={pred.risk_level} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function MapSection() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <SectionCard title={t('riskMap.interactive')} subtitle={t('riskMap.interactiveSub')}>
        <RiskMap height="600px" showHeatmap />
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { color: 'red', label: 'High Risk Zones', count: 5 },
          { color: 'yellow', label: 'Medium Risk Zones', count: 5 },
          { color: 'green', label: 'Low Risk Zones', count: 5 },
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full bg-${item.color}-500`} />
            <div>
              <p className="font-medium dark:text-white">{item.label}</p>
              <p className="text-sm text-gray-500">{item.count} regions identified</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsSection() {
  const { t } = useLanguage()
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6']

  const pieData = DISEASES.map((d, i) => ({
    name: d, value: TREND_DATA.reduce((acc, m) => acc + (m[d] || 0), 0)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={t('analytics.trend')} subtitle={t('analytics.trendSub')}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              {DISEASES.slice(0, 5).map((d, i) => (
                <Line key={d} type="monotone" dataKey={d} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('analytics.distribution')} subtitle={t('analytics.distribSub')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('analytics.outbreakHist')} subtitle={t('analytics.outbreakSub')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Dengue" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="Malaria" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="Cholera" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={t('analytics.radar')} subtitle={t('analytics.radarSub')}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { factor: 'Temperature', Dengue: 80, Malaria: 70, Cholera: 60 },
              { factor: 'Humidity', Dengue: 90, Malaria: 85, Cholera: 50 },
              { factor: 'Rainfall', Dengue: 75, Malaria: 65, Cholera: 80 },
              { factor: 'Population', Dengue: 70, Malaria: 50, Cholera: 60 },
              { factor: 'Sanitation', Dengue: 40, Malaria: 30, Cholera: 85 },
              { factor: 'Healthcare', Dengue: 60, Malaria: 55, Cholera: 50 },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="factor" />
              <PolarRadiusAxis />
              <Radar name="Dengue" dataKey="Dengue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Malaria" dataKey="Malaria" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              <Radar name="Cholera" dataKey="Cholera" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  )
}

function AlertsSection({ alerts, user }) {
  const { t } = useLanguage()
  const [emailSent, setEmailSent] = useState(false)
  const [emailStatus, setEmailStatus] = useState('')
  const [sending, setSending] = useState(false)

  const handleEmailAlerts = async () => {
    setSending(true)
    setEmailStatus('')
    
    // Get the highest risk alert to send
    const highRiskAlerts = alerts.filter(a => a.risk_level === 'High')
    const topAlert = highRiskAlerts[0] || alerts[0]
    
    if (!topAlert) {
      setEmailStatus('No alerts to send')
      setSending(false)
      return
    }

    const result = await sendEmailAlert({
      toEmail: user?.email,
      userName: user?.full_name,
      alertTitle: topAlert.title || 'Disease Outbreak Alert',
      alertMessage: topAlert.message || 'New health alerts in your region.',
      riskLevel: topAlert.risk_level || 'Medium',
    })

    if (result.success) {
      setEmailSent(true)
      setEmailStatus('Email sent successfully!')
      setTimeout(() => { setEmailSent(false); setEmailStatus('') }, 4000)
    } else {
      setEmailStatus(result.error || 'Failed to send email')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">{t('alerts.center')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} {t('alerts.activeCount')}</p>
        </div>
        <button onClick={handleEmailAlerts} disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg transition disabled:opacity-50">
          <Email className="text-lg" />
          {sending ? t('alerts.sending') : emailSent ? t('alerts.emailSent') : t('alerts.sendEmail')}
        </button>
        {emailStatus && <p className={`text-sm mt-1 ${emailSent ? 'text-green-500' : 'text-red-500'}`}>{emailStatus}</p>}
      </div>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-bold dark:text-white mb-2">{t('alerts.allClear')}</h4>
          <p className="text-gray-500 dark:text-gray-400">{t('alerts.noAlertsMsg')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 border-l-4 ${alert.risk_level === 'High' ? 'border-red-500' : alert.risk_level === 'Medium' ? 'border-yellow-500' : 'border-green-500'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Warning className={alert.risk_level === 'High' ? 'text-red-500' : 'text-yellow-500'} />
                    <h4 className="font-semibold dark:text-white">{alert.title}</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Region: {alert.region}</span>
                    {alert.disease_name && <span>Disease: {alert.disease_name}</span>}
                    <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <RiskBadge level={alert.risk_level} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdvisorySection({ selectedDisease, onSelectDisease }) {
  const { t } = useLanguage()
  const advisory = ADVISORY_DATA[selectedDisease] || ADVISORY_DATA.Dengue

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {DISEASES.map(d => (
          <button key={d} onClick={() => onSelectDisease(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDisease === d ? 'gradient-primary text-white shadow-lg' : 'glass-card hover:bg-blue-50 dark:hover:bg-gray-700'}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={`Prevention Guidelines - ${selectedDisease}`}>
          <div className="space-y-3">
            {(advisory.prevention || []).map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{p}</span>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={`Symptoms - ${selectedDisease}`}>
          <div className="space-y-3">
            {(advisory.symptoms || []).map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <Warning className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Do's">
          <div className="space-y-2">
            {(advisory.doAndDont?.do || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Don'ts">
          <div className="space-y-2">
            {(advisory.doAndDont?.dont || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <span className="text-red-500 font-bold text-lg">✗</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function FoodSection({ selectedDisease, onSelectDisease }) {
  const { t } = useLanguage()
  const foodData = FOOD_RECOMMENDATIONS[selectedDisease] || FOOD_RECOMMENDATIONS.Fever
  const foodDiseases = Object.keys(FOOD_RECOMMENDATIONS)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {foodDiseases.map(d => (
          <button key={d} onClick={() => onSelectDisease(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDisease === d ? 'gradient-primary text-white shadow-lg' : 'glass-card hover:bg-blue-50 dark:hover:bg-gray-700'}`}>
            {d}
          </button>
        ))}
      </div>

      <SectionCard title={`Recommended Foods for ${selectedDisease}`} subtitle="Nutrition to help fight illness">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodData.recommended.map((food, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-4">
              <div className="text-4xl mb-3">{food.icon}</div>
              <h4 className="font-semibold dark:text-white">{food.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{food.desc}</p>
              <Link to="/health-food" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition">
                🛒 Order Now
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Foods to Avoid" subtitle="These may worsen your condition">
        <div className="flex flex-wrap gap-3">
          {foodData.avoid.map((food, i) => (
            <div key={i} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <span className="text-red-500">✗</span> {food}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Daily Nutrition Tips">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tip: 'Stay Hydrated', desc: 'Drink at least 8-10 glasses of water daily. Include coconut water and fresh juices.', icon: '💧' },
            { tip: 'Eat Small Meals', desc: 'Have 5-6 small meals instead of 3 large ones. Easy digestion helps recovery.', icon: '🍽️' },
            { tip: 'Vitamin Rich Foods', desc: 'Include fruits and vegetables rich in Vitamin C, A, and zinc for immunity.', icon: '🥗' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-semibold dark:text-white">{item.tip}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function EmergencySection() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <SectionCard title={t('emergency.title')} subtitle={t('emergency.subtitle')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMERGENCY_CONTACTS.map((contact, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-danger flex items-center justify-center flex-shrink-0">
                <Phone className="text-white text-2xl" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">{contact.name}</h4>
                <p className="text-2xl font-bold text-red-500">{contact.number}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('emergency.firstAid')} subtitle={t('emergency.firstAidSub')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIRST_AID.map((item, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <LocalHospital className="text-red-500" />
                <h4 className="font-semibold dark:text-white">{item.condition}</h4>
              </div>
              <ol className="space-y-2">
                {item.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('emergency.healthcare')} subtitle={t('emergency.healthcareSub')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Nearest Health Centers', desc: 'Use Google Maps to find the nearest Primary Health Center (PHC) or Community Health Center (CHC).', icon: '🏥' },
            { title: 'Telemedicine Services', desc: 'Access online consultations through eSanjeevani OPD - India\'s national telemedicine service.', icon: '💻' },
            { title: 'Government Schemes', desc: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY) for health insurance coverage up to Rs. 5 lakh.', icon: '🏛️' },
            { title: 'Blood Bank Locator', desc: 'Use eRaktkosh to find the nearest blood bank and check blood availability in real-time.', icon: '🩸' },
          ].map((item, i) => (
            <div key={i} className="glass-card-hover p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-semibold dark:text-white mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function ProfileSection({ user }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <SectionCard title={t('nav.profile')}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white text-4xl font-bold mb-4">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <h3 className="text-xl font-bold dark:text-white">{user?.full_name}</h3>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Full Name', value: user?.full_name },
            { label: 'Email', value: user?.email },
            { label: 'State', value: user?.state },
            { label: 'District', value: user?.district },
            { label: 'City', value: user?.city },
            { label: 'Role', value: user?.role },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="font-medium dark:text-white mt-1 capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Alert Preferences">
        <div className="space-y-4 max-w-lg">
          {[
            { label: 'Email Notifications', desc: 'Receive alerts via email', defaultChecked: true },
            { label: 'SMS Notifications', desc: 'Receive alerts via SMS', defaultChecked: false },
            { label: 'Push Notifications', desc: 'Browser push notifications', defaultChecked: true },
            { label: 'High Risk Alerts Only', desc: 'Only receive high-priority alerts', defaultChecked: false },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium dark:text-white">{pref.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.defaultChecked} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function HospitalSection({ geoLocation, user }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <SectionCard title={t('hosp.title')} subtitle={t('hosp.subtitle')}>
        <HospitalMap
          userLat={geoLocation.lat}
          userLon={geoLocation.lng}
          city={geoLocation.city || user?.city}
        />
      </SectionCard>
    </div>
  )
}

function SocialSection({ signals }) {
  const { t } = useLanguage()
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']
  
  return (
    <div className="space-y-6">
      <SectionCard title={t('nav.social')} subtitle={t('social.subtitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <h4 className="font-bold dark:text-white">{signal.disease}</h4>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  signal.trend === 'rising' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  signal.trend === 'declining' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {signal.trend === 'rising' ? '📈' : signal.trend === 'declining' ? '📉' : '➡️'} {signal.trend}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Platform</span>
                  <span className="text-xs font-medium dark:text-white">{signal.platform}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Mentions</span>
                  <span className="text-sm font-bold dark:text-white">{signal.mentions?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sentiment</span>
                  <span className={`text-xs font-medium ${
                    signal.sentiment === 'negative' ? 'text-red-500' :
                    signal.sentiment === 'concerned' ? 'text-amber-500' : 'text-green-500'
                  }`}>
                    {signal.sentiment === 'negative' ? '⚠️' : signal.sentiment === 'concerned' ? '😟' : '😐'} {signal.sentiment}
                  </span>
                </div>
              </div>
              
              {signal.top_keywords && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {signal.top_keywords.map((kw, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="How Social Media Monitoring Works">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Data Collection', desc: 'Monitor Twitter/X, Facebook, Reddit for disease-related keywords', icon: '🌐' },
            { step: '2', title: 'NLP Analysis', desc: 'Natural Language Processing extracts sentiment and outbreak signals', icon: '🧠' },
            { step: '3', title: 'Trend Detection', desc: 'Track mention trends over time to identify rising outbreaks', icon: '📈' },
            { step: '4', title: 'Alert Generation', desc: 'Generate alerts when disease mentions exceed normal thresholds', icon: '🚨' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-sm dark:text-white">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── OUTBREAK FORECASTING ───
function ForecastSection({ user, geoLocation }) {
  const [period, setPeriod] = useState('7')
  const [disease, setDisease] = useState('Dengue')
  const [forecast, setForecast] = useState(null)
  const [loadingForecast, setLoadingForecast] = useState(false)

  useEffect(() => {
    const fetchForecast = async () => {
      setLoadingForecast(true)
      try {
        const state = geoLocation?.state || user?.state
        const district = geoLocation?.district || user?.district
        const res = await api.post('/api/advanced/forecast', { disease, state, district, period })
        setForecast(res.data)
      } catch (err) { console.error('Forecast error:', err) }
      finally { setLoadingForecast(false) }
    }
    fetchForecast()
  }, [period, disease, user, geoLocation?.state, geoLocation?.district])

  const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }

  return (
    <div className="space-y-6">
      <SectionCard title="🔮 Outbreak Forecasting" subtitle="AI-powered disease outbreak predictions for multiple time horizons">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {DISEASES.map(d => (
              <button key={d} onClick={() => setDisease(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {[{v:'7',l:'7 Days'},{v:'30',l:'30 Days'},{v:'90',l:'3 Months'}].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.v ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                <CalendarMonth className="text-xs mr-1" style={{fontSize:14}} />{p.l}
              </button>
            ))}
          </div>
        </div>

        {loadingForecast ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : forecast ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">High Risk Days</p>
                <p className="text-2xl font-bold text-red-500">{forecast.summary?.high_risk_days || 0}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peak Date</p>
                <p className="text-lg font-bold text-orange-500">{forecast.summary?.peak_date || 'N/A'}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peak Probability</p>
                <p className="text-2xl font-bold text-amber-500">{Math.round((forecast.summary?.peak_probability || 0) * 100)}%</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Est. Total Cases</p>
                <p className="text-2xl font-bold text-blue-500">{forecast.summary?.total_estimated_cases || 0}</p>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Probability Over Time</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecast.forecast}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${Math.round(v*100)}%`} domain={[0,1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }}
                    formatter={(v) => [`${Math.round(v*100)}%`, 'Probability']}
                    labelFormatter={l => `Date: ${l}`} />
                  <Area type="monotone" dataKey="probability" stroke="#3b82f6" fill="url(#forecastGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Level Timeline */}
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">Risk Level Timeline</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={forecast.forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="estimated_cases" radius={[4,4,0,0]}>
                    {forecast.forecast?.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[entry.risk_level] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Forecast Table (7-day only) */}
            {period === '7' && (
              <div className="glass-card p-4 overflow-x-auto">
                <h4 className="font-semibold dark:text-white mb-4">Day-by-Day Forecast</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2">Date</th><th className="pb-2">Day</th><th className="pb-2">Probability</th><th className="pb-2">Risk</th><th className="pb-2">Est. Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.forecast.map((day, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 dark:text-white">{day.date}</td>
                        <td className="py-2 dark:text-gray-300">{day.day}</td>
                        <td className="py-2 font-medium dark:text-white">{Math.round(day.probability * 100)}%</td>
                        <td className="py-2"><RiskBadge level={day.risk_level} /></td>
                        <td className="py-2 dark:text-gray-300">{day.estimated_cases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No forecast data available</p>}
      </SectionCard>
    </div>
  )
}

// ─── DISEASE SPREAD SIMULATION ───
function SpreadSection({ user, geoLocation }) {
  const [disease, setDisease] = useState('Dengue')
  const [spread, setSpread] = useState(null)
  const [loadingSpread, setLoadingSpread] = useState(false)

  useEffect(() => {
    const fetchSpread = async () => {
      setLoadingSpread(true)
      try {
        const state = geoLocation?.state || user?.state
        const district = geoLocation?.district || user?.district
        const res = await api.post('/api/advanced/spread-simulation', { disease, state, district })
        setSpread(res.data)
      } catch (err) { console.error('Spread error:', err) }
      finally { setLoadingSpread(false) }
    }
    fetchSpread()
  }, [disease, user, geoLocation?.state, geoLocation?.district])

  const riskColor = (level) => level === 'High' ? 'bg-red-500' : level === 'Medium' ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="space-y-6">
      <SectionCard title="🌐 Disease Spread Simulation" subtitle="Visualize how disease may spread across neighboring districts">
        <div className="flex flex-wrap gap-2 mb-6">
          {DISEASES.map(d => (
            <button key={d} onClick={() => setDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${disease === d ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>

        {loadingSpread ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
          </div>
        ) : spread ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Source District</p>
                <p className="text-lg font-bold text-blue-500">{spread.source_district}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Source Probability</p>
                <p className="text-2xl font-bold text-red-500">{Math.round(spread.source_probability * 100)}%</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Districts Affected</p>
                <p className="text-2xl font-bold text-orange-500">{spread.total_districts_affected}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Est. Total Cases</p>
                <p className="text-2xl font-bold text-amber-500">{spread.estimated_total_cases}</p>
              </div>
            </div>

            {/* Spread Visualization */}
            <div className="glass-card p-6">
              <h4 className="font-semibold dark:text-white mb-6">Spread Pattern</h4>
              <div className="space-y-4">
                {spread.spread_simulation?.map((district, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium dark:text-white truncate">
                        {district.is_source && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded mr-1">SRC</span>}
                        {district.district}
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${district.probability * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                            className={`h-full rounded-full flex items-center justify-end pr-2 ${riskColor(district.risk_level)}`}>
                            <span className="text-xs text-white font-bold">{Math.round(district.probability * 100)}%</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${district.risk_level === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : district.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {district.risk_level}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 ml-32 mt-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">📍 {district.distance_km} km</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">⏱️ ~{district.estimated_spread_days} days to spread</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">👥 ~{district.estimated_cases} cases</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Spread Bar Chart */}
            <div className="glass-card p-4">
              <h4 className="font-semibold dark:text-white mb-4">District Risk Comparison</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={spread.spread_simulation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${Math.round(v*100)}%`} domain={[0,1]} />
                  <YAxis dataKey="district" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 12, color: '#fff' }}
                    formatter={(v) => [`${Math.round(v*100)}%`, 'Probability']} />
                  <Bar dataKey="probability" radius={[0,4,4,0]}>
                    {spread.spread_simulation?.map((entry, idx) => (
                      <Cell key={idx} fill={entry.risk_level === 'High' ? '#ef4444' : entry.risk_level === 'Medium' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No spread data available</p>}
      </SectionCard>
    </div>
  )
}

// ─── EXPLAINABLE AI ───
function ExplainSection({ user, geoLocation, selectedDisease, onSelectDisease }) {
  const [explanation, setExplanation] = useState(null)
  const [loadingExplain, setLoadingExplain] = useState(false)

  useEffect(() => {
    const fetchExplain = async () => {
      setLoadingExplain(true)
      try {
        const state = geoLocation?.state || user?.state
        const district = geoLocation?.district || user?.district
        const res = await api.post('/api/advanced/explain', { disease: selectedDisease, state, district })
        setExplanation(res.data)
      } catch (err) { console.error('Explain error:', err) }
      finally { setLoadingExplain(false) }
    }
    fetchExplain()
  }, [selectedDisease, user, geoLocation?.state, geoLocation?.district])

  return (
    <div className="space-y-6">
      <SectionCard title="🧠 Explainable AI" subtitle="Understand why the AI made each prediction — transparent and interpretable results">
        <div className="flex flex-wrap gap-2 mb-6">
          {DISEASES.map(d => (
            <button key={d} onClick={() => onSelectDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDisease === d ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>

        {loadingExplain ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          </div>
        ) : explanation ? (
          <>
            {/* Main Result Card */}
            <div className={`glass-card p-6 mb-6 border-l-4 ${explanation.probability > 0.7 ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : explanation.probability > 0.35 ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{explanation.disease} Risk Assessment</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{explanation.state}, {explanation.district}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{Math.round(explanation.probability * 100)}%</p>
                  <RiskBadge level={explanation.probability > 0.7 ? 'High' : explanation.probability > 0.35 ? 'Medium' : 'Low'} />
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm dark:text-gray-300 whitespace-pre-line">{explanation.explanation?.summary}</p>
              </div>
              <div className="flex gap-4 mt-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">🤖 Model: {explanation.explanation?.model_type}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">📊 Confidence: {Math.round((explanation.explanation?.confidence || 0) * 100)}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">📱 Social Impact: {explanation.explanation?.social_media_impact}%</span>
              </div>
            </div>

            {/* Top Risk Reasons */}
            {explanation.explanation?.top_reasons?.length > 0 && (
              <div className="glass-card p-5 mb-4">
                <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-red-500" /> Top Risk Factors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {explanation.explanation.top_reasons.map((reason, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                      className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-800/50">
                      <div className="text-3xl mb-2">{reason.icon}</div>
                      <h5 className="font-bold text-sm dark:text-white">{reason.label} ↑</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{reason.value}{reason.unit} (threshold: {reason.threshold}{reason.unit})</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">Impact: {reason.contribution}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All Feature Explanations */}
            <div className="glass-card p-5">
              <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Speed className="text-blue-500" /> Feature Impact Analysis
              </h4>
              <div className="space-y-3">
                {explanation.explanation?.feature_explanations?.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl w-8">{feat.icon}</span>
                    <div className="w-32 text-sm dark:text-white font-medium truncate">{feat.label}</div>
                    <div className="flex-1 relative">
                      <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(feat.impact_score * 5, 100)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className={`h-full rounded-full ${feat.is_risk_factor ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-teal-500'}`} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium w-16 text-right ${feat.is_risk_factor ? 'text-red-500' : 'text-green-500'}`}>
                      {feat.contribution}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right">{feat.value}{feat.unit}</span>
                    {feat.is_risk_factor ? <ArrowUpward className="text-red-500" style={{fontSize:16}} /> : <ArrowDownward className="text-green-500" style={{fontSize:16}} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Importance Radar */}
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
        ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No explanation data available</p>}
      </SectionCard>
    </div>
  )
}

// ─── HOSPITAL RESOURCE PREDICTION ───
function ResourceSection({ user, geoLocation, selectedDisease, onSelectDisease }) {
  const [resources, setResources] = useState(null)
  const [loadingRes, setLoadingRes] = useState(false)
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingRes(true)
      try {
        const state = geoLocation?.state || user?.state
        const district = geoLocation?.district || user?.district
        const [resRec, recRec] = await Promise.allSettled([
          api.post('/api/advanced/resource-prediction', { disease: selectedDisease, state, district }),
          api.post('/api/advanced/health-recommendations', { disease: selectedDisease, state, district, risk_level: 'Medium' }),
        ])
        if (resRec.status === 'fulfilled') setResources(resRec.value.data)
        if (recRec.status === 'fulfilled') setRecommendations(recRec.value.data)
      } catch (err) { console.error('Resource error:', err) }
      finally { setLoadingRes(false) }
    }
    fetchResources()
  }, [selectedDisease, user, geoLocation?.state, geoLocation?.district])

  return (
    <div className="space-y-6">
      <SectionCard title="🏥 Hospital Resource Prediction & Health Recommendations" subtitle="AI-predicted bed requirements, medicine demand, staff needs, and public health actions">
        <div className="flex flex-wrap gap-2 mb-6">
          {DISEASES.map(d => (
            <button key={d} onClick={() => onSelectDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDisease === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {d}
            </button>
          ))}
        </div>

        {loadingRes ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Resource Summary */}
            {resources && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="glass-card p-4 text-center">
                    <BedOutlined className="text-blue-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Beds Needed</p>
                    <p className="text-2xl font-bold text-blue-500">{resources.resources?.beds_needed || 0}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <LocalHospital className="text-red-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">ICU Beds</p>
                    <p className="text-2xl font-bold text-red-500">{resources.resources?.icu_beds || 0}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Medication className="text-orange-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ventilators</p>
                    <p className="text-2xl font-bold text-orange-500">{resources.resources?.ventilators || 0}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <People className="text-purple-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
                    <p className="text-2xl font-bold text-purple-500">{resources.resources?.staff?.total || 0}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Medication className="text-teal-500 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Est. Cases</p>
                    <p className="text-2xl font-bold text-teal-500">{resources.resources?.estimated_cases || 0}</p>
                  </div>
                </div>

                {/* Staff Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="glass-card p-5">
                    <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><People className="text-purple-500" /> Staff Requirements</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Doctors', value: resources.resources?.staff?.doctors, color: 'bg-blue-500', icon: '👨‍⚕️' },
                        { label: 'Nurses', value: resources.resources?.staff?.nurses, color: 'bg-green-500', icon: '👩‍⚕️' },
                        { label: 'Lab Technicians', value: resources.resources?.staff?.lab_technicians, color: 'bg-amber-500', icon: '🔬' },
                        { label: 'Paramedics', value: resources.resources?.staff?.paramedics, color: 'bg-red-500', icon: '🚑' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-lg">{s.icon}</span>
                          <span className="text-sm dark:text-white w-28">{s.label}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((s.value / 20) * 100, 100)}%` }}
                              className={`h-full ${s.color} rounded-full`} transition={{ duration: 0.8, delay: i * 0.1 }} />
                          </div>
                          <span className="text-sm font-bold dark:text-white w-10 text-right">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medicine Demand */}
                  <div className="glass-card p-5">
                    <h4 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><Medication className="text-teal-500" /> Medicine Demand</h4>
                    <div className="space-y-3">
                      {resources.resources?.medicines?.map((med, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm dark:text-white">💊 {med.name}</span>
                          <span className="text-sm font-bold text-teal-500">{med.units.toLocaleString()} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Severity Gauge */}
                <div className="glass-card p-4 mb-6">
                  <h4 className="font-semibold dark:text-white mb-4">Severity Index</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${resources.resources?.severity_index || 0}%` }}
                        className={`h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${resources.risk_level === 'High' ? 'bg-red-500' : resources.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                        transition={{ duration: 1 }}>
                        {resources.resources?.severity_index}%
                      </motion.div>
                    </div>
                    <RiskBadge level={resources.risk_level} />
                  </div>
                </div>
              </>
            )}

            {/* Public Health Recommendations */}
            {recommendations && (
              <div className="space-y-4">
                <h4 className="font-semibold dark:text-white flex items-center gap-2">
                  <HealthAndSafety className="text-green-500" /> AI-Generated Public Health Recommendations
                </h4>

                {/* Immediate Actions */}
                {recommendations.recommendations?.immediate?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-red-500">
                    <h5 className="font-bold text-red-500 mb-3">🚨 Immediate Actions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.recommendations.immediate.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                          <span className="text-xl">{rec.icon}</span>
                          <div>
                            <p className="text-sm font-medium dark:text-white">{rec.action}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">{rec.priority}</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">🎯 {rec.target}</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">⏰ {rec.deadline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preventive Measures */}
                {recommendations.recommendations?.preventive?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-amber-500">
                    <h5 className="font-bold text-amber-500 mb-3">🛡️ Preventive Measures</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendations.recommendations.preventive.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl">
                          <span className="text-xl">{rec.icon}</span>
                          <div>
                            <p className="text-sm font-medium dark:text-white">{rec.action}</p>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">🎯 {rec.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Policy Recommendations */}
                {recommendations.recommendations?.policy?.length > 0 && (
                  <div className="glass-card p-5 border-l-4 border-l-blue-500">
                    <h5 className="font-bold text-blue-500 mb-3">📋 Policy Recommendations</h5>
                    <ul className="space-y-2">
                      {recommendations.recommendations.policy.map((pol, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm dark:text-gray-300">
                          <CheckCircle className="text-blue-500" style={{fontSize:16}} /> {pol}
                        </li>
                      ))}
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

// ═══════════════════════════════════════════════════════
// ML MODELS DASHBOARD SECTION
// ═══════════════════════════════════════════════════════

const MODEL_COLORS = {
  'Random Forest': '#3b82f6',
  'XGBoost': '#10b981',
  'Logistic Regression': '#f59e0b',
  'Decision Tree': '#8b5cf6',
}

function MLModelsSection({ selectedDisease, onSelectDisease }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('comparison')

  useEffect(() => {
    setLoading(true)
    api.get(`/api/advanced/ml-models?disease=${selectedDisease || 'Dengue'}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedDisease])

  if (loading) return <SectionCard title="ML Model Comparison"><div className="h-40 shimmer rounded-xl dark:bg-slate-700/30" /></SectionCard>
  if (!data) return <SectionCard title="ML Model Comparison"><p className="text-gray-500">Failed to load ML data</p></SectionCard>

  const models = Object.values(data.models)
  const bestModel = data.best_model

  const comparisonData = models.map(m => ({
    name: m.name.split(' ')[0] === 'Logistic' ? 'Log. Reg.' : m.name.split(' ')[0] === 'Decision' ? 'Dec. Tree' : m.name.split(' ')[0] === 'Random' ? 'Rand. Forest' : m.name,
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

  const bestModelData = data.models[bestModel.name]
  const cm = bestModelData?.confusion_matrix || [[0,0],[0,0]]
  const rocPoints = bestModelData?.roc_curve || []
  const featureData = bestModelData?.feature_importance || []

  const tabs = [
    { id: 'comparison', label: 'Model Comparison' },
    { id: 'confusion', label: 'Confusion Matrix' },
    { id: 'roc', label: 'ROC Curve' },
    { id: 'features', label: 'Feature Importance' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Psychology className="text-purple-500" /> ML Model Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare 4 machine learning models for disease prediction</p>
        </div>
        <div className="flex gap-2">
          {DISEASES.map(d => (
            <button key={d} onClick={() => onSelectDisease(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                (selectedDisease || 'Dengue') === d
                  ? 'gradient-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}>{d}</button>
          ))}
        </div>
      </div>

      {/* Best Model Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-l-4 border-l-emerald-500 border-glow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-2xl shadow-lg">
            🏆
          </div>
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metrics Comparison Chart */}
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

          {/* Radar Chart */}
          <SectionCard title="Radar Comparison" subtitle="Multi-metric visualization">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={90} domain={[70, 100]} stroke="#475569" fontSize={10} />
                {models.map(m => (
                  <Radar key={m.name} name={m.name} dataKey={m.name}
                    stroke={MODEL_COLORS[m.name]} fill={MODEL_COLORS[m.name]} fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Legend />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Model Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map(m => (
              <motion.div key={m.name} whileHover={{ y: -4 }}
                className={`kpi-card kpi-${m.name === 'XGBoost' ? 'green' : m.name === 'Random Forest' ? 'blue' : m.name === 'Logistic Regression' ? 'amber' : 'purple'} border-glow`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                  <p className="text-xs font-semibold dark:text-gray-300">{m.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-lg font-bold dark:text-white">{(m.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">Accuracy</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-lg font-bold dark:text-white">{(m.f1_score * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">F1-Score</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-lg font-bold dark:text-white">{(m.auc_roc * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">AUC-ROC</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-lg font-bold dark:text-white">{m.train_time_seconds}s</p>
                    <p className="text-[10px] text-gray-500">Train Time</p>
                  </div>
                </div>
                {bestModel.name === m.name && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                    <span>🏆</span> Recommended Model
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'confusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title={`Confusion Matrix — ${bestModel.name}`} subtitle="Best model predictions">
            <div className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-emerald-500">{cm[0][0]}</p>
                  <p className="text-xs text-gray-500 mt-1">True Negative</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-red-500">{cm[0][1]}</p>
                  <p className="text-xs text-gray-500 mt-1">False Positive</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-red-500">{cm[1][0]}</p>
                  <p className="text-xs text-gray-500 mt-1">False Negative</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-emerald-500">{cm[1][1]}</p>
                  <p className="text-xs text-gray-500 mt-1">True Positive</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" /> Correct</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500" /> Incorrect</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="All Models Confusion Matrix">
            <div className="space-y-3">
              {models.map(m => {
                const c = m.confusion_matrix
                const total = c[0][0] + c[0][1] + c[1][0] + c[1][1]
                const correct = c[0][0] + c[1][1]
                const pct = ((correct / total) * 100).toFixed(1)
                return (
                  <div key={m.name} className="flex items-center gap-4 p-3 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                    <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                    <p className="text-sm font-semibold dark:text-gray-300 w-36">{m.name}</p>
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: MODEL_COLORS[m.name] }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
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
          <SectionCard title="ROC Curves — All Models" subtitle="True Positive Rate vs False Positive Rate">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#94a3b8" fontSize={11} label={{ value: 'False Positive Rate', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#94a3b8" fontSize={11} label={{ value: 'True Positive Rate', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend />
                {models.map(m => (
                  <Area key={m.name} name={m.name} data={m.roc_curve} dataKey="tpr"
                    stroke={MODEL_COLORS[m.name]} fill={MODEL_COLORS[m.name]} fillOpacity={0.05} strokeWidth={2.5} dot={false} />
                ))}
                <Area name="Random (Baseline)" data={[{fpr:0,tpr:0},{fpr:1,tpr:1}]} dataKey="tpr"
                  stroke="#475569" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="AUC-ROC Scores">
            <div className="space-y-4">
              {models.sort((a,b) => b.auc_roc - a.auc_roc).map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4">
                  <span className="text-lg font-bold dark:text-gray-500 w-6">#{i + 1}</span>
                  <div className="w-3 h-3 rounded-full" style={{ background: MODEL_COLORS[m.name] }} />
                  <p className="text-sm font-semibold dark:text-gray-300 w-40">{m.name}</p>
                  <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${MODEL_COLORS[m.name]}, ${MODEL_COLORS[m.name]}88)` }}
                      initial={{ width: 0 }} animate={{ width: `${m.auc_roc * 100}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                  </div>
                  <p className="text-sm font-bold dark:text-white w-16 text-right">{(m.auc_roc * 100).toFixed(1)}%</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-xs text-blue-500 font-semibold mb-1">ℹ️ About AUC-ROC</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Area Under the ROC Curve measures the model's ability to distinguish between classes.
                A perfect score is 1.0 (100%), while random guessing scores 0.5 (50%).
              </p>
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
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                  {featureData.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#6366f1'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Training Details">
            <div className="space-y-3">
              {Object.entries(bestModelData.hyperparameters).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-3 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                  <p className="text-sm font-medium dark:text-gray-300">{k}</p>
                  <p className="text-sm font-mono text-blue-400">{typeof v === 'object' ? JSON.stringify(v) : v}</p>
                </div>
              ))}
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl mt-4">
                <p className="text-xs text-purple-400 font-semibold mb-2">📊 Training Configuration</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="text-gray-400">Samples: <span className="text-white font-semibold">{data.training_info.dataset_size}</span></p>
                  <p className="text-gray-400">Features: <span className="text-white font-semibold">{data.training_info.features}</span></p>
                  <p className="text-gray-400">Split: <span className="text-white font-semibold">{data.training_info.train_test_split}</span></p>
                  <p className="text-gray-400">CV Folds: <span className="text-white font-semibold">{bestModelData.cross_validation_folds}</span></p>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-xs text-emerald-400 font-semibold mb-2">🔧 Preprocessing Pipeline</p>
                <div className="flex flex-wrap gap-2">
                  {data.training_info.preprocessing.map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-semibold">{p}</span>
                  ))}
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
// AI INSIGHTS SECTION
// ═══════════════════════════════════════════════════════

function AIInsightsSection() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/advanced/ml-insights')
      .then(r => setInsights(r.data.insights || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const typeColors = {
    warning: { bg: 'bg-amber-500/10', border: 'border-l-amber-500', text: 'text-amber-500' },
    success: { bg: 'bg-emerald-500/10', border: 'border-l-emerald-500', text: 'text-emerald-500' },
    info: { bg: 'bg-blue-500/10', border: 'border-l-blue-500', text: 'text-blue-500' },
    alert: { bg: 'bg-red-500/10', border: 'border-l-red-500', text: 'text-red-500' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <AutoAwesome className="text-amber-500" /> AI Insights Panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-generated insights from disease prediction system</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Auto-Generated
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-2xl dark:bg-slate-700/30" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const tc = typeColors[insight.type] || typeColors.info
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 border-l-4 ${tc.border} border-glow`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold dark:text-white">{insight.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.bg} ${tc.text}`}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{insight.description}</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 dark:bg-white/[0.03] rounded-xl">
                      <span className="text-xs">⚡</span>
                      <p className="text-xs font-medium dark:text-gray-300">Recommended Action: {insight.action}</p>
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

// ============ COMMUNITY HEALTH REPORTING SECTION ============
function CommunityReportSection({ user }) {
  const { t } = useLanguage()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'fever_cluster', title: '', description: '', address: '', severity: 'medium' })

  const reportTypes = [
    { value: 'fever_cluster', label: '🤒 Fever Cluster', color: 'bg-red-500/10 text-red-500' },
    { value: 'water_contamination', label: '💧 Water Contamination', color: 'bg-blue-500/10 text-blue-500' },
    { value: 'mosquito_breeding', label: '🦟 Mosquito Breeding', color: 'bg-amber-500/10 text-amber-500' },
    { value: 'health_hazard', label: '⚠️ Health Hazard', color: 'bg-orange-500/10 text-orange-500' },
    { value: 'other', label: '📝 Other', color: 'bg-gray-500/10 text-gray-500' },
  ]

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/community/reports')
      setReports(res.data.reports || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReports() }, [])

  const submitReport = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/community/reports', {
        ...form, city: user?.city, district: user?.district, state: user?.state
      })
      setShowForm(false)
      setForm({ type: 'fever_cluster', title: '', description: '', address: '', severity: 'medium' })
      fetchReports()
    } catch (err) { console.error(err) }
  }

  const voteReport = async (id) => {
    try {
      await api.post(`/api/community/reports/${id}/vote`)
      fetchReports()
    } catch (err) { console.error(err) }
  }

  const severityColors = { low: 'bg-green-500/10 text-green-500', medium: 'bg-amber-500/10 text-amber-500', high: 'bg-orange-500/10 text-orange-500', critical: 'bg-red-500/10 text-red-500' }
  const statusColors = { pending: 'bg-yellow-500/10 text-yellow-500', reviewing: 'bg-blue-500/10 text-blue-500', resolved: 'bg-emerald-500/10 text-emerald-500', dismissed: 'bg-gray-500/10 text-gray-500' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">{t('comm.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.subtitle') || t('comm.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-red-500/20">
          {showForm ? `❌ ${t('common.cancel')}` : `✍️ ${t('comm.submitReport')}`}
        </motion.button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={submitReport}
          className="glass-card p-6 border-glow space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">New Community Report</h3>
          <div className="flex flex-wrap gap-2">
            {reportTypes.map(rt => (
              <button key={rt.value} type="button" onClick={() => setForm({...form, type: rt.value})}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${form.type === rt.value ? rt.color + ' ring-2 ring-current' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                {rt.label}
              </button>
            ))}
          </div>
          <input required placeholder="Title (e.g., Mosquito breeding near park)" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
          <textarea required placeholder="Describe the issue in detail..." rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none resize-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Address / Location" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="low">Low Severity</option><option value="medium">Medium Severity</option>
              <option value="high">High Severity</option><option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3">
            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold">Submit Report</motion.button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-semibold">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-semibold">No reports yet</p>
          <p className="text-sm">Be the first to report a health hazard in your area</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => {
            const rt = reportTypes.find(r => r.value === report.type) || reportTypes[4]
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5 border-glow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rt.color}`}>{rt.label}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${severityColors[report.severity]}`}>{report.severity}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[report.status]}`}>{report.status}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">{report.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{report.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">📍 {report.location?.address} • {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => voteReport(report.id)}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition">
                    <span className="text-sm font-black text-blue-500">{report.votes}</span>
                    <span className="text-[10px] text-blue-400 font-medium">votes</span>
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ VACCINATION TRACKER SECTION ============
function VaccinationSection() {
  const { t } = useLanguage()
  const [schedule, setSchedule] = useState([])
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ vaccine_name: '', disease: '', date_taken: '', hospital: '', batch_number: '' })

  const fetchData = async () => {
    try {
      const [s, r, st] = await Promise.all([
        api.get('/api/community/vaccinations/schedule'),
        api.get('/api/community/vaccinations/records'),
        api.get('/api/community/vaccinations/stats')
      ])
      setSchedule(s.data.schedule || [])
      setRecords(r.data.records || [])
      setStats(st.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const addRecord = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/community/vaccinations/records', form)
      setShowAdd(false)
      setForm({ vaccine_name: '', disease: '', date_taken: '', hospital: '', batch_number: '' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const deleteRecord = async (id) => {
    try {
      await api.delete(`/api/community/vaccinations/records/${id}`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const takenNames = new Set(records.map(r => r.vaccine_name))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">💉 Vaccination Tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your immunization records and upcoming vaccines</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg">
          ➕ Add Record
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Coverage', value: `${stats.coverage_pct || 0}%`, color: 'from-emerald-500 to-teal-500', icon: '🛡️' },
          { label: 'Mandatory Done', value: `${stats.mandatory_done || 0}/${stats.mandatory_total || 13}`, color: 'from-blue-500 to-cyan-500', icon: '✅' },
          { label: 'Pending', value: stats.mandatory_pending || 0, color: 'from-amber-500 to-orange-500', icon: '⏳' },
          { label: 'Total Records', value: stats.total_records || 0, color: 'from-violet-500 to-purple-500', icon: '📋' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} text-white`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-white/80 text-xs font-medium mt-2">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Record Form */}
      {showAdd && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={addRecord}
          className="glass-card p-6 border-glow space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white">Add Vaccination Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Vaccine Name" value={form.vaccine_name} onChange={e => setForm({...form, vaccine_name: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="Disease" value={form.disease} onChange={e => setForm({...form, disease: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input type="date" value={form.date_taken} onChange={e => setForm({...form, date_taken: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
            <input placeholder="Hospital / Clinic" value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none" />
          </div>
          <div className="flex gap-3">
            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">Save Record</motion.button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-semibold">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* My Records */}
      <SectionCard title="My Vaccination Records" subtitle={`${records.length} records logged`}>
        {records.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No vaccination records yet. Add your first vaccine!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((rec, i) => (
              <motion.div key={rec.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{rec.vaccine_name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{rec.disease}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📅 {new Date(rec.date_taken).toLocaleDateString()}</p>
                    {rec.hospital && <p className="text-xs text-gray-500 dark:text-gray-400">🏥 {rec.hospital}</p>}
                  </div>
                  <button onClick={() => deleteRecord(rec.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition">
                    <Delete style={{ fontSize: 16 }} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Vaccine Schedule */}
      <SectionCard title="National Immunization Schedule" subtitle="Recommended vaccines for all ages">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                <th className="pb-3 pl-4">Vaccine</th><th className="pb-3">Disease</th><th className="pb-3">Age</th><th className="pb-3">Type</th><th className="pb-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {schedule.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                  <td className="py-3 pl-4 font-semibold text-gray-800 dark:text-white">{v.name}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{v.disease}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{v.age}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${v.importance === 'Mandatory' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{v.importance}</span></td>
                  <td className="py-3 pr-4">
                    {takenNames.has(v.name) ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">✅ Done</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-500">⏳ Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

// ============ HEALTH CAMPS & EVENTS SECTION ============
function HealthCampsSection() {
  const { t } = useLanguage()
  const [camps, setCamps] = useState([])
  const [myRegs, setMyRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const campTypes = [
    { value: 'all', label: 'All Events', icon: '📋' },
    { value: 'health_camp', label: 'Health Camps', icon: '🏥' },
    { value: 'blood_donation', label: 'Blood Donation', icon: '🩸' },
    { value: 'awareness_program', label: 'Awareness', icon: '📢' },
  ]

  const fetchData = async () => {
    try {
      const [c, r] = await Promise.all([
        api.get('/api/community/camps', { params: { type: filter } }),
        api.get('/api/community/camps/my-registrations')
      ])
      setCamps(c.data.camps || [])
      setMyRegs(r.data.registrations || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filter])

  const register = async (campId) => {
    try {
      await api.post(`/api/community/camps/${campId}/register`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const registeredCampIds = new Set(myRegs.map(r => r.camp_id))
  const typeColors = { health_camp: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20', blood_donation: 'from-red-500/10 to-pink-500/10 border-red-500/20', awareness_program: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">🏥 {t('camps.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('camps.upcoming')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {campTypes.map(ct => (
          <button key={ct.value} onClick={() => setFilter(ct.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === ct.value ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
            {ct.icon} {ct.label}
          </button>
        ))}
      </div>

      {/* My Registrations */}
      {myRegs.length > 0 && (
        <SectionCard title="My Registrations" subtitle={`${myRegs.length} upcoming events`}>
          <div className="flex flex-wrap gap-3">
            {myRegs.map((reg, i) => (
              <div key={reg.id} className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{reg.camp_title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">📅 {new Date(reg.event_date).toLocaleDateString()} • ✅ Registered</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Camps List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 shimmer rounded-2xl" />)}
        </div>
      ) : camps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏕️</p>
          <p className="font-semibold">No camps available</p>
          <p className="text-sm">Check back later for upcoming health events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp, i) => {
            const isRegistered = registeredCampIds.has(camp.id)
            const spotsLeft = camp.capacity - camp.registrations
            return (
              <motion.div key={camp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 bg-gradient-to-br ${typeColors[camp.type] || 'from-gray-500/10 to-gray-500/10 border-gray-500/20'} border backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{camp.type === 'blood_donation' ? '🩸' : camp.type === 'awareness_program' ? '📢' : '🏥'}</span>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">{spotsLeft} spots left</span>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">{camp.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{camp.description}</p>
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p>📅 {new Date(camp.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>📍 {camp.location}, {camp.city}</p>
                  <p>👥 {camp.organizer}</p>
                </div>
                {camp.benefits?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {camp.benefits.slice(0, 3).map((b, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300">{b}</span>
                    ))}
                  </div>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => register(camp.id)} disabled={isRegistered}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${isRegistered
                    ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'}`}>
                  {isRegistered ? '✅ Registered' : 'Register Now'}
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ DISEASE KNOWLEDGE GRAPH SECTION ============
function KnowledgeGraphSection() {
  const { t } = useLanguage()
  const [selectedDisease, setSelectedDisease] = useState('Dengue')

  const KNOWLEDGE = {
    Dengue: {
      symptoms: ['High Fever', 'Severe Headache', 'Pain Behind Eyes', 'Joint Pain', 'Rash'],
      weather: ['Rainfall', 'Humidity >80%', 'Temp 25-30°C', 'Stagnant Water'],
      prevention: ['Mosquito Nets', 'Remove Stagnant Water', 'Wear Full Sleeves', 'Use Repellents'],
      foods: ['Papaya Leaf Juice', 'Coconut Water', 'Orange Juice', 'Vegetable Soup', 'Khichdi']
    },
    Malaria: {
      symptoms: ['Fever with Chills', 'Sweating', 'Headache', 'Nausea', 'Body Ache'],
      weather: ['Rainy Season', 'Warm Climate', 'High Humidity', 'Mosquito Breeding'],
      prevention: ['Insecticide Treated Nets', 'Indoor Spraying', 'Anti-Malarial Drugs', 'Cover Skin'],
      foods: ['Coconut Water', 'ORS Solution', 'Vegetable Soup', 'Khichdi', 'Fresh Banana']
    },
    Cholera: {
      symptoms: ['Watery Diarrhea', 'Vomiting', 'Dehydration', 'Leg Cramps', 'Rapid Heart Rate'],
      weather: ['Flooding', 'Contaminated Water', 'Poor Sanitation', 'High Temperature'],
      prevention: ['Clean Drinking Water', 'Hand Washing', 'Proper Sanitation', 'Oral Cholera Vaccine'],
      foods: ['ORS Solution', 'Rice Water', 'Banana', 'Boiled Vegetables', 'Clear Soup']
    },
    Typhoid: {
      symptoms: ['Prolonged Fever', 'Weakness', 'Stomach Pain', 'Headache', 'Loss of Appetite'],
      weather: ['Contaminated Food', 'Poor Hygiene', 'Monsoon Season', 'Crowded Areas'],
      prevention: ['Typhoid Vaccine', 'Boiled Water', 'Cooked Food', 'Hand Hygiene'],
      foods: ['Porridge', 'Boiled Rice', 'Yogurt', 'Banana', 'Clear Soup']
    },
    Influenza: {
      symptoms: ['Fever', 'Cough', 'Sore Throat', 'Body Aches', 'Fatigue'],
      weather: ['Cold Weather', 'Low Humidity', 'Winter Season', 'Indoor Crowding'],
      prevention: ['Annual Flu Vaccine', 'Hand Washing', 'Face Mask', 'Avoid Crowds'],
      foods: ['Chicken Soup', 'Ginger Tea', 'Citrus Fruits', 'Honey Water', 'Garlic Soup']
    },
    'COVID-19': {
      symptoms: ['Fever', 'Dry Cough', 'Breathing Difficulty', 'Loss of Taste/Smell', 'Fatigue'],
      weather: ['Cold Climate', 'Low Humidity', 'Indoor Crowding', 'Air Pollution'],
      prevention: ['Vaccination', 'Face Mask', 'Social Distancing', 'Hand Sanitizer'],
      foods: ['Vitamin C Fruits', 'Turmeric Milk', 'Steam Inhalation', 'Protein-rich Diet', 'Warm Water']
    }
  }

  const diseases = Object.keys(KNOWLEDGE)
  const data = KNOWLEDGE[selectedDisease] || KNOWLEDGE.Dengue

  const nodeTypes = [
    { key: 'symptoms', label: 'Symptoms', color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
    { key: 'weather', label: 'Weather Factors', color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
    { key: 'prevention', label: 'Prevention', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
    { key: 'foods', label: 'Recommended Foods', color: '#8b5cf6', bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">🧬 {t('nav.knowledge')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('kg.subtitle')}</p>
      </div>

      {/* Disease Selector */}
      <div className="flex flex-wrap gap-2">
        {diseases.map(d => (
          <button key={d} onClick={() => setSelectedDisease(d)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedDisease === d
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* Central Disease Node */}
      <div className="flex flex-col items-center">
        <motion.div
          key={selectedDisease}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl shadow-red-500/30 mb-6"
        >
          <div className="text-center">
            <p className="text-white font-black text-lg">{selectedDisease}</p>
            <p className="text-white/70 text-xs">Disease</p>
          </div>
        </motion.div>

        {/* Connection Lines (SVG) */}
        <svg width="100%" height="40" className="overflow-visible">
          {[0, 1, 2, 3].map(i => (
            <motion.line key={i}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              x1="50%" y1="0"
              x2={`${15 + i * 23}%`} y2="40"
              stroke={nodeTypes[i].color}
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          ))}
        </svg>

        {/* Category Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-2">
          {nodeTypes.map((nt, idx) => (
            <motion.div key={nt.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}>
              <div className={`p-4 rounded-2xl ${nt.bg} border ${nt.border} backdrop-blur-xl`}>
                <h4 className={`font-bold ${nt.text} text-sm mb-3 flex items-center gap-2`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: nt.color }} />
                  {nt.label}
                </h4>
                <div className="space-y-2">
                  {(data[nt.key] || []).map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.05]">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: nt.color }} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Relationship Legend */}
      <div className="glass-card p-4 border-glow">
        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3">Relationship Flow</h4>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 font-bold">Disease</span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">Symptoms</span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-bold">Weather</span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Prevention</span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-500 font-bold">Foods</span>
        </div>
      </div>
    </div>
  )
}

// ============ PREDICTION HISTORY SECTION ============
function PredictionHistorySection() {
  const { t } = useLanguage()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/prediction/history')
      .then(res => setPredictions(res.data.predictions || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const chartData = predictions.slice(0, 20).reverse().map((p, i) => ({
    idx: i + 1,
    risk: p.risk_score || p.risk_level === 'High' ? 80 : p.risk_level === 'Medium' ? 50 : 20,
    disease: p.disease || 'Unknown'
  }))

  const riskColor = (level) => {
    if (level === 'High') return 'bg-red-500/10 text-red-500 border-red-500/30'
    if (level === 'Medium') return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">📜 {t('nav.history')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('hist.subtitle')}</p>
      </div>

      {/* Risk Trend Chart */}
      {chartData.length > 1 && (
        <SectionCard title={t('hist.trend')} subtitle={t('hist.subtitle')}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="idx" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
              <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* Prediction List */}
      <SectionCard title={t('hist.yourHistory')} subtitle={`${predictions.length} predictions recorded`}>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold">No predictions yet</p>
            <p className="text-sm">Use the Predictions section to generate your first risk assessment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 rounded-xl border ${riskColor(pred.risk_level)} backdrop-blur-xl`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/[0.03] flex items-center justify-center">
                      <span className="text-lg">{pred.disease === 'Dengue' ? '🦟' : pred.disease === 'Malaria' ? '🦠' : pred.disease === 'Cholera' ? '💧' : '🧬'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm">{pred.disease || 'Unknown Disease'}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pred.state || 'N/A'} {pred.district ? `• ${pred.district}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Risk Level</p>
                      <p className={`text-sm font-bold ${pred.risk_level === 'High' ? 'text-red-500' : pred.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {pred.risk_level || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{pred.risk_score || '—'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
