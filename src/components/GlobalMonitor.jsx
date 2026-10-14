import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionCard, StatCard } from './Shared'
import {
  Public, TrendingUp, Healing, Warning, BugReport,
  Science, LocalHospital, Refresh, ArrowUpward, ArrowDownward,
  Newspaper, FilterList, Explore, Timeline, Flag,
  WbSunny, Air, WaterDrop, Visibility, Shield
} from '@mui/icons-material'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── Disease Surveillance Database (WHO/CDC curated) ───
const DISEASE_DB = [
  { id: 'covid', name: 'COVID-19', family: 'Coronaviridae', icon: <BugReport />, color: '#ef4444', severity: 'High',
    transmission: 'Respiratory droplets, aerosols', incubation: '2-14 days',
    symptoms: ['Fever', 'Dry cough', 'Loss of taste/smell', 'Shortness of breath', 'Fatigue'],
    prevention: ['Vaccination', 'Mask wearing', 'Hand hygiene', 'Ventilation'],
    regions: ['Global'], status: 'Pandemic' },
  { id: 'dengue', name: 'Dengue', family: 'Flaviviridae', icon: <BugReport />, color: '#f59e0b', severity: 'High',
    transmission: 'Aedes mosquito bites', incubation: '4-10 days',
    symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Skin rash', 'Bleeding'],
    prevention: ['Remove stagnant water', 'Mosquito repellent', 'Window screens', 'Protective clothing'],
    regions: ['Southeast Asia', 'Latin America', 'Africa'], status: 'Endemic' },
  { id: 'malaria', name: 'Malaria', family: 'Plasmodiidae', icon: <BugReport />, color: '#10b981', severity: 'High',
    transmission: 'Anopheles mosquito bites', incubation: '10-15 days',
    symptoms: ['Recurring fever', 'Chills', 'Sweating', 'Headache', 'Nausea'],
    prevention: ['Insecticide-treated nets', 'Indoor spraying', 'Prophylactic drugs'],
    regions: ['Sub-Saharan Africa', 'South Asia', 'Latin America'], status: 'Endemic' },
  { id: 'ebola', name: 'Ebola', family: 'Filoviridae', icon: <Warning />, color: '#dc2626', severity: 'Critical',
    transmission: 'Direct contact with bodily fluids', incubation: '2-21 days',
    symptoms: ['Sudden fever', 'Intense weakness', 'Muscle pain', 'Vomiting', 'Unexplained bleeding'],
    prevention: ['Avoid contact with infected persons', 'Safe burial practices', 'Vaccination (rVSV-ZEBOV)'],
    regions: ['Central Africa', 'West Africa'], status: 'Outbreak' },
  { id: 'h5n1', name: 'H5N1 (Bird Flu)', family: 'Orthomyxoviridae', icon: <Air />, color: '#8b5cf6', severity: 'Critical',
    transmission: 'Contact with infected poultry', incubation: '2-8 days',
    symptoms: ['High fever', 'Cough', 'Sore throat', 'Eye infection', 'Pneumonia'],
    prevention: ['Avoid live poultry markets', 'Cook poultry thoroughly', 'Report sick birds'],
    regions: ['Southeast Asia', 'Europe', 'Americas'], status: 'Active Monitoring' },
  { id: 'mpox', name: 'Mpox', family: 'Poxviridae', icon: <Healing />, color: '#ec4899', severity: 'Medium',
    transmission: 'Close contact with lesions, respiratory droplets', incubation: '5-21 days',
    symptoms: ['Fever', 'Headache', 'Muscle aches', 'Swollen lymph nodes', 'Skin lesions'],
    prevention: ['Vaccination', 'Avoid close contact', 'Hand hygiene'],
    regions: ['Central Africa', 'Global (2022+)'], status: 'Outbreak' },
  { id: 'nipah', name: 'Nipah Virus', family: 'Paramyxoviridae', icon: <Science />, color: '#6366f1', severity: 'Critical',
    transmission: 'Contact with bats, contaminated food', incubation: '4-14 days',
    symptoms: ['Fever', 'Headache', 'Drowsiness', 'Disorientation', 'Encephalitis'],
    prevention: ['Avoid bat habitats', 'Wash fruits thoroughly', 'Avoid date palm sap'],
    regions: ['South Asia', 'Southeast Asia'], status: 'Active Monitoring' },
  { id: 'zika', name: 'Zika', family: 'Flaviviridae', icon: <BugReport />, color: '#14b8a6', severity: 'Medium',
    transmission: 'Aedes mosquito bites, sexual contact', incubation: '3-14 days',
    symptoms: ['Mild fever', 'Rash', 'Conjunctivitis', 'Muscle pain', 'Headache'],
    prevention: ['Mosquito repellent', 'Remove breeding sites', 'Safe sex practices'],
    regions: ['Latin America', 'Africa', 'Asia'], status: 'Endemic' },
  { id: 'cholera', name: 'Cholera', family: 'Vibrionaceae', icon: <WaterDrop />, color: '#0ea5e9', severity: 'High',
    transmission: 'Contaminated water and food', incubation: '12 hours - 5 days',
    symptoms: ['Severe watery diarrhea', 'Vomiting', 'Leg cramps', 'Rapid dehydration'],
    prevention: ['Clean water', 'Proper sanitation', 'Oral cholera vaccine', 'Hand washing'],
    regions: ['Africa', 'South Asia', 'Haiti'], status: 'Endemic' },
  { id: 'influenza', name: 'Influenza', family: 'Orthomyxoviridae', icon: <Air />, color: '#f97316', severity: 'Medium',
    transmission: 'Respiratory droplets', incubation: '1-4 days',
    symptoms: ['Sudden fever', 'Dry cough', 'Sore throat', 'Body aches', 'Fatigue'],
    prevention: ['Annual vaccination', 'Hand hygiene', 'Cover coughs', 'Stay home when sick'],
    regions: ['Global (seasonal)'], status: 'Seasonal' },
  { id: 'tb', name: 'Tuberculosis', family: 'Mycobacteriaceae', icon: <LocalHospital />, color: '#a855f7', severity: 'High',
    transmission: 'Airborne (Mycobacterium tuberculosis)', incubation: 'Weeks to years',
    symptoms: ['Persistent cough', 'Weight loss', 'Night sweats', 'Fever', 'Chest pain'],
    prevention: ['BCG vaccination', 'Early detection', 'Complete treatment course'],
    regions: ['South Asia', 'Africa', 'Southeast Asia'], status: 'Endemic' },
  { id: 'measles', name: 'Measles', family: 'Paramyxoviridae', icon: <Warning />, color: '#e11d48', severity: 'High',
    transmission: 'Respiratory droplets (highly contagious)', incubation: '10-14 days',
    symptoms: ['High fever', 'Koplik spots', 'Skin rash', 'Cough', 'Conjunctivitis'],
    prevention: ['MMR vaccination', 'Herd immunity', 'Isolation of cases'],
    regions: ['Global (resurgence)'], status: 'Outbreak' },
]

// ─── Country coordinates for map ───
const COUNTRY_COORDS = {
  'USA': [37.09, -95.71], 'India': [20.59, 78.96], 'Brazil': [-14.24, -51.93],
  'France': [46.23, 2.21], 'Germany': [51.17, 10.45], 'UK': [55.38, -3.44],
  'Russia': [61.52, 105.32], 'Turkey': [38.96, 35.24], 'Italy': [41.87, 12.57],
  'Spain': [40.46, -3.75], 'Argentina': [-38.42, -63.62], 'Colombia': [4.57, -74.30],
  'Mexico': [23.63, -102.55], 'Poland': [51.92, 19.15], 'Iran': [32.43, 53.69],
  'South Africa': [-30.56, 22.94], 'Indonesia': [-0.79, 113.92], 'Philippines': [12.88, 121.77],
  'Japan': [36.20, 138.25], 'South Korea': [35.91, 127.77], 'Peru': [-9.19, -75.02],
  'Nigeria': [9.08, 8.68], 'DRC': [-4.04, 21.76], 'Kenya': [-0.02, 37.91],
  'Thailand': [15.87, 100.99], 'Vietnam': [14.06, 108.28], 'Australia': [-25.27, 133.78],
  'Canada': [56.13, -106.35], 'China': [35.86, 104.20], 'Pakistan': [30.38, 69.35],
  'Bangladesh': [23.68, 90.36], 'Egypt': [26.82, 30.80],
}

const DISEASE_FILTERS = ['All', 'COVID-19', 'Dengue', 'Malaria', 'Ebola', 'H5N1', 'Mpox', 'Nipah', 'Zika', 'Cholera', 'Influenza']

// ─── Animated Counter ───
function useAnimatedCount(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n?.toLocaleString() || '—'
}

// ─── Globe Auto-Rotate Component ───
function MapAutoRotate() {
  return null // Static map, no rotation needed for Leaflet
}

// ═══════════════════════════════════════════════════════
// Main GlobalMonitor Component
// ═══════════════════════════════════════════════════════
export default function GlobalMonitor() {
  const [tab, setTab] = useState('overview')
  const [globalStats, setGlobalStats] = useState(null)
  const [countries, setCountries] = useState([])
  const [histData, setHistData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  // India-specific data
  const [indiaData, setIndiaData] = useState({ who: null, covid: null, southAsia: [], weather: null })

  // Fetch live data from disease.sh (free, no API key)
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [globalRes, countryRes, histRes] = await Promise.allSettled([
        fetch('https://disease.sh/v3/covid-19/all').then(r => r.json()),
        fetch('https://disease.sh/v3/covid-19/countries?sort=cases').then(r => r.json()),
        fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=30').then(r => r.json()),
      ])
      if (globalRes.status === 'fulfilled') setGlobalStats(globalRes.value)
      if (countryRes.status === 'fulfilled') setCountries(countryRes.value?.slice(0, 30) || [])
      if (histRes.status === 'fulfilled' && histRes.value?.timeline) {
        const t = histRes.value.timeline
        const days = Object.keys(t.cases || {}).slice(-14)
        const chart = days.map(d => ({
          date: d.slice(5),
          cases: t.cases?.[d] || 0,
          deaths: t.deaths?.[d] || 0,
          recovered: t.recovered?.[d] || 0,
        }))
        setHistData(chart)
      }

      // India-specific: WHO GHO (via backend proxy) + disease.sh India + Bengaluru weather
      try {
        const [indiaHealthR, blrWeatherR] = await Promise.allSettled([
          fetch(`${API_BASE}/api/india-health`).then(r => r.json()),
          fetch('https://api.openweathermap.org/data/2.5/weather?q=Bengaluru,IN&appid=3fabef6d53714a0166f190b26d9a62bc&units=metric').then(r => r.json()),
        ])
        const ih = indiaHealthR.status === 'fulfilled' ? indiaHealthR.value : {}
        const whoMalaria = ih?.who?.malaria_cases?.history || []
        const whoMort = ih?.who?.malaria_mortality?.history || []
        setIndiaData({
          who: {
            malariaCases: ih?.who?.malaria_cases?.value,
            malariaYear: ih?.who?.malaria_cases?.year,
            malariaHistory: whoMalaria,
            mortality: ih?.who?.malaria_mortality?.value,
            mortYear: ih?.who?.malaria_mortality?.year,
            mortHistory: whoMort,
          },
          covid: ih?.covid || null,
          southAsia: ih?.south_asia || [],
          weather: blrWeatherR.status === 'fulfilled' ? blrWeatherR.value : null,
        })
      } catch (e) { console.warn('India data fetch failed:', e) }

      setLastUpdated(new Date().toLocaleString())
    } catch (e) { console.error('GlobalMonitor fetch error:', e) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredDiseases = filter === 'All'
    ? DISEASE_DB
    : DISEASE_DB.filter(d => d.name === filter || d.id === filter.toLowerCase())

  const topByCases = [...countries].sort((a, b) => (b.cases || 0) - (a.cases || 0)).slice(0, 8)
  const topByDeaths = [...countries].sort((a, b) => (b.deaths || 0) - (a.deaths || 0)).slice(0, 8)

  const severityColor = (s) => s === 'Critical' ? '#ef4444' : s === 'High' ? '#f59e0b' : s === 'Medium' ? '#3b82f6' : '#10b981'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Public /> },
    { id: 'india', label: 'India & Bengaluru', icon: <Flag /> },
    { id: 'surveillance', label: 'Surveillance', icon: <Visibility /> },
    { id: 'burden', label: 'Country Burden', icon: <Public /> },
    { id: 'trends', label: 'Trends', icon: <Timeline /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
              <Public className="text-white" />
            </div>
            Global Outbreak Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live data from WHO, CDC & disease.sh · {lastUpdated || 'Loading...'}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50">
          <Refresh className={`text-sm ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${tab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Live Global Stats */}
            {globalStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlobalStatCard icon={<BugReport />} label="Global Cases" value={globalStats.cases} color="red" trend={globalStats.todayCases} />
                <GlobalStatCard icon={<Warning />} label="Total Deaths" value={globalStats.deaths} color="purple" trend={globalStats.todayDeaths} />
                <GlobalStatCard icon={<Healing />} label="Recovered" value={globalStats.recovered} color="green" trend={globalStats.todayRecovered} />
                <GlobalStatCard icon={<LocalHospital />} label="Active Cases" value={globalStats.active} color="blue" />
              </div>
            )}
            {loading && !globalStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="glass-card p-6 animate-pulse h-28" />)}
              </div>
            )}

            {/* World Map */}
            <SectionCard title="Outbreak Atlas" subtitle="Active surveillance regions — hover a marker to see details"
              action={<span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live</span>}>
              <div className="h-[400px] rounded-xl overflow-hidden border border-white/[0.06]">
                <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" scrollWheelZoom={false}
                  style={{ background: '#0F172A' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CartoDB' />
                  {DISEASE_DB.filter(d => d.status !== 'Seasonal').map(disease => {
                    const regions = disease.regions.filter(r => r !== 'Global')
                    return regions.map((region, ri) => {
                      const coords = getRegionCoords(region, ri)
                      if (!coords) return null
                      return (
                        <CircleMarker key={`${disease.id}-${ri}`} center={coords} radius={8}
                          pathOptions={{ color: disease.color, fillColor: disease.color, fillOpacity: 0.5, weight: 1 }}>
                          <Tooltip className="dark-tooltip">
                            <div className="text-xs">
                              <div className="font-bold text-white">{disease.name}</div>
                              <div className="text-gray-400">{region} · {disease.status}</div>
                            </div>
                          </Tooltip>
                          <Popup className="dark-popup">
                            <div className="p-1 text-xs min-w-[160px]">
                              <div className="font-bold text-sm mb-1" style={{ color: disease.color }}>{disease.name}</div>
                              <div className="text-gray-500 mb-2">{region}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className="font-medium">{disease.status}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Severity:</span><span className="font-medium" style={{ color: severityColor(disease.severity) }}>{disease.severity}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Transmission:</span><span className="text-gray-300 text-right max-w-[100px]">{disease.transmission}</span></div>
                              </div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      )
                    })
                  })}
                  {/* Country markers from live data */}
                  {countries.slice(0, 20).map(c => {
                    const coords = COUNTRY_COORDS[c.country]
                    if (!coords) return null
                    const radius = Math.max(3, Math.min(15, Math.log10(c.cases || 1) * 2))
                    return (
                      <CircleMarker key={c.country} center={coords} radius={radius}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, weight: 1 }}>
                        <Tooltip className="dark-tooltip">
                          <div className="text-xs">
                            <div className="font-bold text-white">{c.country}</div>
                            <div className="text-red-400">{formatNum(c.cases)} cases · {formatNum(c.deaths)} deaths</div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    )
                  })}
                </MapContainer>
              </div>
            </SectionCard>

            {/* Quick Surveillance Grid */}
            <SectionCard title="Diseases Under Active Monitoring" subtitle={`${DISEASE_DB.length} diseases tracked — curated from WHO and CDC sources`}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {DISEASE_DB.slice(0, 8).map(d => (
                  <motion.button key={d.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedDisease(d); setTab('surveillance') }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 text-left transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}>
                        <span style={{ color: d.color }}>{d.icon}</span>
                      </div>
                      <span className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: severityColor(d.severity) + '20', color: severityColor(d.severity) }}>
                        {d.severity}
                      </span>
                      <span className="text-[10px] text-gray-500">{d.status}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setTab('surveillance')} className="mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                View all {DISEASE_DB.length} diseases →
              </button>
            </SectionCard>
          </motion.div>
        )}

        {/* ═══ INDIA & BENGALURU TAB ═══ */}
        {tab === 'india' && (
          <motion.div key="india" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* India COVID-19 Live Stats */}
            {indiaData.covid && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="text-orange-400" />
                  <h3 className="text-base font-bold text-white">India — COVID-19 Live Data</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">LIVE · disease.sh</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <GlobalStatCard icon={<BugReport />} label="Total Cases" value={indiaData.covid.cases} color="red" trend={indiaData.covid.todayCases} />
                  <GlobalStatCard icon={<Warning />} label="Total Deaths" value={indiaData.covid.deaths} color="purple" trend={indiaData.covid.todayDeaths} />
                  <GlobalStatCard icon={<LocalHospital />} label="Active Cases" value={indiaData.covid.active} color="blue" />
                  <GlobalStatCard icon={<LocalHospital />} label="Critical" value={indiaData.covid.critical || 0} color="yellow" />
                </div>
              </div>
            )}

            {/* WHO India Data */}
            {indiaData.who && (
              <SectionCard title="WHO GHO — India Disease Indicators" subtitle="Official World Health Organization Global Health Observatory data"
                action={<span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">WHO GHO API</span>}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Malaria Cases */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">Malaria Total Cases (India)</h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-amber-400">{formatNum(indiaData.who.malariaCases)}</span>
                      <span className="text-xs text-gray-500">WHO {indiaData.who.malariaYear}</span>
                    </div>
                    {indiaData.who.malariaHistory?.length > 0 && (
                      <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={indiaData.who.malariaHistory.map(v => ({ year: String(v.TimeDim), cases: v.NumericValue }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatNum} />
                            <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e5e7eb' }} />
                            <Bar dataKey="cases" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Malaria Cases" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  {/* Malaria Mortality */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">Malaria Mortality Rate (per 100K)</h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-red-400">{indiaData.who.mortality?.toFixed(3)}</span>
                      <span className="text-xs text-gray-500">per 100K · WHO {indiaData.who.mortYear}</span>
                    </div>
                    {indiaData.who.mortHistory?.length > 0 && (
                      <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={indiaData.who.mortHistory.map(v => ({ year: String(v.TimeDim), rate: v.NumericValue }))}>
                            <defs>
                              <linearGradient id="gradMort" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e5e7eb' }} />
                            <Area type="monotone" dataKey="rate" stroke="#ef4444" fill="url(#gradMort)" strokeWidth={2} name="Mortality Rate" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Bengaluru Weather */}
            {indiaData.weather && (
              <SectionCard title="Bengaluru — Live Weather Conditions" subtitle="Real-time weather data used for disease risk modeling"
                action={<span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">OpenWeatherMap</span>}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Temperature', value: `${Math.round(indiaData.weather.main?.temp)}°C`, color: '#ef4444' },
                    { label: 'Feels Like', value: `${Math.round(indiaData.weather.main?.feels_like)}°C`, color: '#f59e0b' },
                    { label: 'Humidity', value: `${indiaData.weather.main?.humidity}%`, color: '#3b82f6' },
                    { label: 'Pressure', value: `${indiaData.weather.main?.pressure} hPa`, color: '#8b5cf6' },
                    { label: 'Wind Speed', value: `${indiaData.weather.wind?.speed} m/s`, color: '#10b981' },
                    { label: 'Condition', value: indiaData.weather.weather?.[0]?.description || '—', color: '#0ea5e9' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-lg font-bold capitalize" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* South Asia Regional Comparison */}
            {indiaData.southAsia?.length > 0 && (
              <SectionCard title="South Asia — Regional COVID-19 Comparison" subtitle="Disease burden across neighboring countries"
                action={<span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">LIVE · disease.sh</span>}>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={indiaData.southAsia.map(c => ({
                      name: c.country, cases: c.cases || 0, deaths: c.deaths || 0, active: c.active || 0,
                    }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatNum} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                      <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e5e7eb' }}
                        formatter={(v) => formatNum(v)} />
                      <Bar dataKey="cases" fill="#ef4444" radius={[0, 4, 4, 0]} name="Cases" />
                      <Bar dataKey="deaths" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Deaths" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid md:grid-cols-4 gap-3">
                  {indiaData.southAsia.slice(0, 4).map(c => (
                    <div key={c.country} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-2">
                        {c.countryInfo?.flag && <img src={c.countryInfo.flag} alt="" className="w-5 h-3 rounded object-cover" />}
                        <span className="text-xs font-semibold text-white">{c.country}</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-gray-400"><span>Cases:</span><span className="text-red-400 font-medium">{formatNum(c.cases)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>Deaths:</span><span className="text-purple-400 font-medium">{formatNum(c.deaths)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>Active:</span><span className="text-blue-400 font-medium">{formatNum(c.active)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Data Sources Attribution */}
            <SectionCard title="Data Source Attribution" subtitle="Where does the India data come from?">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-blue-400">W</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">WHO GHO API</h4>
                  <p className="text-xs text-gray-500 mt-1">World Health Organization Global Health Observatory. Official country-level disease indicators (Malaria incidence, mortality rates).</p>
                  <p className="text-[10px] text-blue-400 mt-2">ghoapi.azureedge.net</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-emerald-400">D</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">disease.sh API</h4>
                  <p className="text-xs text-gray-500 mt-1">Open-source disease data aggregator sourcing from Johns Hopkins CSSE, WHO, CDC, ECDC, and worldometers.info.</p>
                  <p className="text-[10px] text-emerald-400 mt-2">disease.sh (free, no key)</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-amber-400">O</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">OpenWeatherMap</h4>
                  <p className="text-xs text-gray-500 mt-1">Real-time weather data for Bengaluru and Indian cities. Temperature, humidity, and rainfall feed into disease risk models.</p>
                  <p className="text-[10px] text-amber-400 mt-2">openweathermap.org</p>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {tab === 'surveillance' && (
          <motion.div key="surveillance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Disease Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <FilterList className="text-gray-500 flex-shrink-0" />
              {DISEASE_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                    ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {f}
                </button>
              ))}
            </div>

            {/* Disease Detail Panel */}
            {selectedDisease && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 border-l-4" style={{ borderColor: selectedDisease.color }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedDisease.color + '20' }}>
                      <span style={{ color: selectedDisease.color, fontSize: 24 }}>{selectedDisease.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedDisease.name}</h3>
                      <p className="text-sm text-gray-500">{selectedDisease.family} · {selectedDisease.status}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDisease(null)} className="text-gray-500 hover:text-white transition-colors text-xl">×</button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Symptoms</h4>
                    <ul className="space-y-1">
                      {selectedDisease.symptoms.map(s => <li key={s} className="text-sm text-gray-300 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-red-500" />{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Prevention</h4>
                    <ul className="space-y-1">
                      {selectedDisease.prevention.map(p => <li key={p} className="text-sm text-gray-300 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" />{p}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Transmission</h4>
                      <p className="text-sm text-gray-300">{selectedDisease.transmission}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Incubation</h4>
                      <p className="text-sm text-gray-300">{selectedDisease.incubation}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Active Regions</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedDisease.regions.map(r => <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{r}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ backgroundColor: severityColor(selectedDisease.severity) + '20', color: severityColor(selectedDisease.severity) }}>
                        {selectedDisease.severity} Severity
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Disease Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiseases.map(d => (
                <motion.div key={d.id} whileHover={{ y: -3 }} onClick={() => setSelectedDisease(d)}
                  className="glass-card p-5 cursor-pointer border-l-4 transition-all hover:border-opacity-100"
                  style={{ borderLeftColor: d.color }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: d.color + '15' }}>
                        <span style={{ color: d.color, fontSize: 20 }}>{d.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{d.name}</h4>
                        <p className="text-xs text-gray-500">{d.family}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: severityColor(d.severity) + '20', color: severityColor(d.severity) }}>
                      {d.severity}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2"><span className="text-gray-600">Transmission:</span>{d.transmission}</div>
                    <div className="flex items-center gap-2"><span className="text-gray-600">Status:</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300">{d.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.regions.slice(0, 3).map(r => <span key={r} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">{r}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'burden' && (
          <motion.div key="burden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top by Cases */}
              <SectionCard title="Top Countries by Cases" subtitle="Cumulative reported cases">
                <div className="space-y-2">
                  {topByCases.map((c, i) => (
                    <div key={c.country} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                      <span className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {c.countryInfo?.flag && <img src={c.countryInfo.flag} alt="" className="w-6 h-4 rounded object-cover" />}
                      <span className="text-sm text-white font-medium flex-1">{c.country}</span>
                      <span className="text-sm font-bold text-red-400">{formatNum(c.cases)}</span>
                      {c.todayCases > 0 && <span className="text-[10px] text-red-500">+{formatNum(c.todayCases)}</span>}
                    </div>
                  ))}
                  {loading && !countries.length && [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.02] animate-pulse" />)}
                </div>
              </SectionCard>

              {/* Top by Deaths */}
              <SectionCard title="Top Countries by Deaths" subtitle="Cumulative reported deaths">
                <div className="space-y-2">
                  {topByDeaths.map((c, i) => (
                    <div key={c.country} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {c.countryInfo?.flag && <img src={c.countryInfo.flag} alt="" className="w-6 h-4 rounded object-cover" />}
                      <span className="text-sm text-white font-medium flex-1">{c.country}</span>
                      <span className="text-sm font-bold text-purple-400">{formatNum(c.deaths)}</span>
                      {c.todayDeaths > 0 && <span className="text-[10px] text-purple-500">+{formatNum(c.todayDeaths)}</span>}
                    </div>
                  ))}
                  {loading && !countries.length && [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.02] animate-pulse" />)}
                </div>
              </SectionCard>
            </div>

            {/* Bar chart comparison */}
            {topByCases.length > 0 && (
              <SectionCard title="Cases vs Deaths — Top 10 Countries" subtitle="Comparative burden analysis">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topByCases.slice(0, 10).map(c => ({
                      name: c.country?.length > 8 ? c.country.slice(0, 8) + '…' : c.country,
                      cases: c.cases || 0, deaths: c.deaths || 0, recovered: c.recovered || 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatNum} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                      <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e5e7eb' }}
                        formatter={(v) => formatNum(v)} />
                      <Bar dataKey="cases" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cases" />
                      <Bar dataKey="deaths" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Deaths" />
                      <Bar dataKey="recovered" fill="#10b981" radius={[4, 4, 0, 0]} name="Recovered" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}
          </motion.div>
        )}

        {tab === 'trends' && (
          <motion.div key="trends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Trend Area Chart */}
            {histData.length > 0 && (
              <SectionCard title="Global Trend — Last 14 Days" subtitle="Daily cumulative totals (COVID-19)">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={histData}>
                      <defs>
                        <linearGradient id="gradCases" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRecovered" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradDeaths" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatNum} axisLine={{ stroke: 'rgba(148,163,184,0.1)' }} />
                      <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e5e7eb' }}
                        formatter={(v) => formatNum(v)} />
                      <Area type="monotone" dataKey="cases" stroke="#ef4444" fill="url(#gradCases)" strokeWidth={2} name="Cases" />
                      <Area type="monotone" dataKey="recovered" stroke="#10b981" fill="url(#gradRecovered)" strokeWidth={2} name="Recovered" />
                      <Area type="monotone" dataKey="deaths" stroke="#8b5cf6" fill="url(#gradDeaths)" strokeWidth={2} name="Deaths" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}

            {/* Pie chart of current global distribution */}
            {globalStats && (
              <SectionCard title="Global Distribution" subtitle="Current status breakdown">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Active', value: globalStats.active || 0 },
                        { name: 'Recovered', value: globalStats.recovered || 0 },
                        { name: 'Deaths', value: globalStats.deaths || 0 },
                      ]} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <RTooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e5e7eb' }}
                        formatter={(v) => formatNum(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}

            {/* Data Sources Info */}
            <SectionCard title="Data Sources" subtitle="Official health authority feeds">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'WHO', desc: 'World Health Organization situation reports', color: '#3b82f6' },
                  { name: 'CDC', desc: 'Centers for Disease Control and Prevention', color: '#10b981' },
                  { name: 'disease.sh', desc: 'Open-source disease data aggregator', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color + '20' }}>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.name.charAt(0)}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Global Stat Card Component ───
function GlobalStatCard({ icon, label, value, color, trend }) {
  const animatedValue = useAnimatedCount(value)
  const colorMap = {
    red: { gradient: 'from-red-500/20 to-red-500/5', iconBg: 'bg-red-500/10', iconColor: 'text-red-500', valueColor: 'text-red-400' },
    purple: { gradient: 'from-purple-500/20 to-purple-500/5', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', valueColor: 'text-purple-400' },
    green: { gradient: 'from-emerald-500/20 to-emerald-500/5', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', valueColor: 'text-emerald-400' },
    blue: { gradient: 'from-blue-500/20 to-blue-500/5', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', valueColor: 'text-blue-400' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div whileHover={{ y: -3 }}
      className={`glass-card p-5 bg-gradient-to-br ${c.gradient} border-glow`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className={`text-2xl font-bold text-white`}>{formatNum(animatedValue)}</p>
          {trend > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-red-400">
              <ArrowUpward style={{ fontSize: 12 }} /> +{formatNum(trend)} today
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center ${c.iconColor}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Region coordinate mapping ───
function getRegionCoords(region, index) {
  const map = {
    'Southeast Asia': [5, 110],
    'Latin America': [-15, -55],
    'Africa': [5, 25],
    'Sub-Saharan Africa': [-5, 30],
    'Central Africa': [0, 22],
    'West Africa': [10, -5],
    'South Asia': [22, 78],
    'East Asia': [35, 115],
    'Europe': [50, 15],
    'Americas': [10, -80],
    'Global': null,
  }
  const base = map[region]
  if (!base) return null
  // Offset slightly for multiple markers in same region
  return [base[0] + index * 3, base[1] + index * 5]
}
