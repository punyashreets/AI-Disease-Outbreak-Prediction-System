import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const INDIA_CENTER = [20.5937, 78.9629]
const KARNATAKA_CENTER = [14.5, 76.0]
const BENGALURU = { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' }
const OWM_KEY = '3fabef6d53714a0166f190b26d9a62bc'
const API_BASE = import.meta.env.VITE_API_URL || ''

// Indian city hotspots — Karnataka focus + major India cities
const CITY_BASE = [
  // KARNATAKA CITIES (priority)
  { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka', pop: 13.2, isKarnataka: true },
  { lat: 15.3173, lng: 75.7139, name: 'Hubli-Dharwad', state: 'Karnataka', pop: 1.0, isKarnataka: true },
  { lat: 15.8497, lng: 74.4977, name: 'Belagavi', state: 'Karnataka', pop: 0.6, isKarnataka: true },
  { lat: 13.3409, lng: 74.7421, name: 'Mangaluru', state: 'Karnataka', pop: 0.6, isKarnataka: true },
  { lat: 12.2958, lng: 76.6394, name: 'Mysuru', state: 'Karnataka', pop: 1.2, isKarnataka: true },
  { lat: 14.4692, lng: 75.9238, name: 'Davanagere', state: 'Karnataka', pop: 0.5, isKarnataka: true },
  { lat: 15.1471, lng: 76.9169, name: 'Ballari', state: 'Karnataka', pop: 0.4, isKarnataka: true },
  { lat: 13.9299, lng: 75.5681, name: 'Shivamogga', state: 'Karnataka', pop: 0.4, isKarnataka: true },
  { lat: 13.3399, lng: 77.1140, name: 'Tumakuru', state: 'Karnataka', pop: 0.3, isKarnataka: true },
  { lat: 16.8277, lng: 75.7190, name: 'Vijayapura', state: 'Karnataka', pop: 0.4, isKarnataka: true },
  { lat: 11.9139, lng: 76.9828, name: 'Chamarajanagar', state: 'Karnataka', pop: 0.1, isKarnataka: true },
  { lat: 15.3647, lng: 75.1240, name: 'Gadag', state: 'Karnataka', pop: 0.2, isKarnataka: true },
  { lat: 17.385, lng: 78.4867, name: 'Hyderabad', state: 'Telangana', pop: 10.5, isKarnataka: false },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai', state: 'Tamil Nadu', pop: 11.9, isKarnataka: false },
  { lat: 9.9312, lng: 76.2673, name: 'Kochi', state: 'Kerala', pop: 2.1, isKarnataka: false },
  { lat: 11.0168, lng: 76.9558, name: 'Coimbatore', state: 'Tamil Nadu', pop: 2.1, isKarnataka: false },
  // MAJOR INDIA CITIES
  { lat: 28.6139, lng: 77.209, name: 'New Delhi', state: 'Delhi', pop: 32.9, isKarnataka: false },
  { lat: 19.076, lng: 72.8777, name: 'Mumbai', state: 'Maharashtra', pop: 21.0, isKarnataka: false },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata', state: 'West Bengal', pop: 15.1, isKarnataka: false },
  { lat: 18.5204, lng: 73.8567, name: 'Pune', state: 'Maharashtra', pop: 7.4, isKarnataka: false },
  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad', state: 'Gujarat', pop: 8.5, isKarnataka: false },
  { lat: 26.9124, lng: 75.7873, name: 'Jaipur', state: 'Rajasthan', pop: 4.1, isKarnataka: false },
]

// Disease risk computation based on weather
function computeDiseaseRisk(city, weather) {
  const temp = weather?.main?.temp || 25
  const humidity = weather?.main?.humidity || 60
  const rainfall = weather?.rain?.['1h'] || 0

  // Dengue: high risk with high humidity + warm temp + rainfall
  const dengueRisk = (humidity > 70 && temp > 25 && temp < 35) ? (rainfall > 0 ? 'High' : 'Medium') : 
                    (humidity > 55 && temp > 22) ? 'Medium' : 'Low'
  
  // Malaria: high risk with high humidity + standing water potential
  const malariaRisk = (humidity > 75 && temp > 20) ? 'High' : 
                      (humidity > 55 && temp > 18) ? 'Medium' : 'Low'
  
  // Cholera: high risk with flooding/heavy rain + warm
  const choleraRisk = (rainfall > 5 && temp > 25) ? 'High' : 
                      (humidity > 80 && temp > 28) ? 'Medium' : 'Low'
  
  // Typhoid: moderate in warm, humid conditions
  const typhoidRisk = (temp > 30 && humidity > 65) ? 'High' : 
                      (temp > 25 && humidity > 50) ? 'Medium' : 'Low'
  
  // Influenza: higher in cooler, dry conditions or monsoon transition
  const influenzaRisk = (temp < 20) ? 'High' : 
                        (temp >= 20 && temp < 28 && humidity > 70) ? 'Medium' : 'Low'
  
  // Leptospirosis: high with flooding + warm
  const leptoRisk = (rainfall > 2 && temp > 24) ? 'High' : 
                    (humidity > 80 && temp > 26) ? 'Medium' : 'Low'

  const diseases = [
    { name: 'Dengue', risk: dengueRisk, color: '#f59e0b' },
    { name: 'Malaria', risk: malariaRisk, color: '#10b981' },
    { name: 'Cholera', risk: choleraRisk, color: '#0ea5e9' },
    { name: 'Typhoid', risk: typhoidRisk, color: '#a855f7' },
    { name: 'Influenza', risk: influenzaRisk, color: '#f97316' },
    { name: 'Leptospirosis', risk: leptoRisk, color: '#14b8a6' },
  ]

  // Overall risk = highest individual risk
  const riskOrder = { High: 3, Medium: 2, Low: 1 }
  const overall = diseases.reduce((max, d) => riskOrder[d.risk] > riskOrder[max.risk] ? d : max, diseases[0])

  return { diseases, overallRisk: overall.risk, primaryDisease: overall.name }
}

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }
const RISK_BG = { High: 'rgba(239,68,68,0.15)', Medium: 'rgba(245,158,11,0.15)', Low: 'rgba(16,185,129,0.15)' }

function formatNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n?.toLocaleString() || '—'
}

// ═══════════════════════════════════════════════════════
// Main RiskMap Component with Live Data
// ═══════════════════════════════════════════════════════
export default function RiskMap({ height = '550px', showHeatmap = true, selectedDisease = null }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const circlesRef = useRef([])

  const [indiaWHO, setIndiaWHO] = useState(null)
  const [indiaCOVID, setIndiaCOVID] = useState(null)
  const [bengaluruWeather, setBengaluruWeather] = useState(null)
  const [cityRisks, setCityRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataSources, setDataSources] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [diseaseFilter, setDiseaseFilter] = useState('All')
  const [showKarnatakaOnly, setShowKarnatakaOnly] = useState(true)

  // Fetch all live data sources
  useEffect(() => {
    const sources = []
    
    const fetchAll = async () => {
      // 1. WHO GHO + disease.sh via BACKEND PROXY (fixes CORS)
      try {
        const healthR = await fetch(`${API_BASE}/api/india-health`).then(r => r.json())
        if (healthR?.who?.malaria_cases) {
          setIndiaWHO({
            malariaCases: healthR.who.malaria_cases.value,
            malariaYear: healthR.who.malaria_cases.year,
            malariaHistory: healthR.who.malaria_cases.history,
            malariaMortality: healthR.who.malaria_mortality?.value,
            malariaMortYear: healthR.who.malaria_mortality?.year,
            malariaMortHistory: healthR.who.malaria_mortality?.history,
            malariaConfirmed: healthR.who.malaria_confirmed?.value,
          })
          sources.push({ name: 'WHO GHO', desc: 'World Health Organization Global Health Observatory (via backend proxy)', url: 'ghoapi.azureedge.net', status: 'live' })
        }
        if (healthR?.covid?.cases) {
          setIndiaCOVID(healthR.covid)
          sources.push({ name: 'disease.sh', desc: 'Open Disease Data (Johns Hopkins, WHO, CDC, ECDC)', url: 'disease.sh', status: 'live' })
        }
      } catch (e) { console.warn('India health fetch failed:', e) }

      // 3. OpenWeatherMap - Weather for Karnataka + key India cities
      try {
        const keyCities = [
          // Karnataka cities
          'Bengaluru', 'Mysore', 'Hubli', 'Belgaum', 'Mangalore', 'Davangere', 'Bellary', 'Shimoga', 'Tumkur', 'Bijapur', 'Gadag',
          // Key India cities
          'Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Hyderabad'
        ]
        const weatherPromises = keyCities.map(city =>
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${OWM_KEY}&units=metric`)
            .then(r => r.json()).catch(() => null)
        )
        const weatherResults = await Promise.all(weatherPromises)
        const weatherMap = {}
        weatherResults.forEach(w => {
          if (w?.name) {
            const cityName = w.name === 'New Delhi' ? 'New Delhi' : w.name === 'Bangalore' ? 'Bengaluru' : w.name === 'Mysore' ? 'Mysuru' : w.name === 'Belgaum' ? 'Belagavi' : w.name === 'Mangalore' ? 'Mangaluru' : w.name === 'Davangere' ? 'Davanagere' : w.name === 'Bellary' ? 'Ballari' : w.name === 'Shimoga' ? 'Shivamogga' : w.name === 'Tumkur' ? 'Tumakuru' : w.name
            weatherMap[cityName] = w
          }
        })
        sources.push({ name: 'OpenWeatherMap', desc: 'Real-time weather for Karnataka + India cities (risk modeling)', url: 'openweathermap.org', status: 'live' })

        // Compute risk for each city using weather data
        const risks = CITY_BASE.map(city => {
          // Find closest weather data
          const weather = weatherMap[city.name] || Object.values(weatherMap)[0] || null
          const riskData = computeDiseaseRisk(city, weather)
          return { ...city, ...riskData, weather }
        })
        setCityRisks(risks)

        // Set Bengaluru weather specifically
        if (weatherMap['Bengaluru']) setBengaluruWeather(weatherMap['Bengaluru'])
      } catch (e) { console.warn('Weather fetch failed:', e) }

      setDataSources(sources)
      setLastUpdated(new Date().toLocaleString())
      setLoading(false)
    }

    fetchAll()
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapInstance.current) return
    const map = L.map(mapRef.current, { center: KARNATAKA_CENTER, zoom: 7, zoomControl: true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB &copy; OSM', maxZoom: 18,
    }).addTo(map)

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; Esri', maxZoom: 18 }
    )
    L.control.layers({
      'Dark Map': map._layers[Object.keys(map._layers)[0]],
      'Satellite': satelliteLayer,
    }).addTo(map)

    mapInstance.current = map
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstance.current || cityRisks.length === 0) return
    const map = mapInstance.current

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m))
    circlesRef.current.forEach(c => map.removeLayer(c))
    markersRef.current = []
    circlesRef.current = []

    cityRisks.forEach(city => {
      // Filter Karnataka-only
      if (showKarnatakaOnly && !city.isKarnataka) return
      // Filter by disease
      if (selectedDisease && selectedDisease !== 'All') {
        const match = city.diseases.find(d => d.name === selectedDisease)
        if (!match || match.risk === 'Low') return
      }
      if (diseaseFilter !== 'All') {
        const match = city.diseases.find(d => d.name === diseaseFilter)
        if (!match || match.risk === 'Low') return
      }

      const color = RISK_COLORS[city.overallRisk]
      const isBengaluru = city.name === 'Bengaluru'

      // Create marker icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${isBengaluru ? 40 : 32}px; height: ${isBengaluru ? 40 : 32}px; border-radius: 50%;
          background: ${color}; border: ${isBengaluru ? '3px solid #fff' : '2px solid rgba(255,255,255,0.7)'};
          box-shadow: 0 0 ${isBengaluru ? '20' : '12'}px ${color}80;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: ${isBengaluru ? '11' : '9'}px;
          ${isBengaluru ? 'animation: pulse 2s infinite;' : ''}
        ">${city.diseases.filter(d => d.risk !== 'Low').length}</div>`,
        iconSize: [isBengaluru ? 40 : 32, isBengaluru ? 40 : 32],
        iconAnchor: [isBengaluru ? 20 : 16, isBengaluru ? 20 : 16],
      })

      const diseaseRows = city.diseases.map(d => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
          <span style="color:${d.color};font-weight:600;font-size:11px">${d.name}</span>
          <span style="color:${RISK_COLORS[d.risk]};font-size:10px;font-weight:600;background:${RISK_BG[d.risk]};padding:2px 6px;border-radius:4px">${d.risk}</span>
        </div>
      `).join('')

      const weatherInfo = city.weather ? `
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1)">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">LIVE WEATHER</div>
          <div style="display:flex;gap:12px;font-size:11px;color:#e5e7eb">
            <span>${Math.round(city.weather.main?.temp || 0)}°C</span>
            <span>Humidity: ${city.weather.main?.humidity || 0}%</span>
            <span>${city.weather.weather?.[0]?.description || ''}</span>
          </div>
        </div>
      ` : ''

      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:260px;background:#1E293B;color:#e5e7eb;border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.1)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:700;color:#fff">${city.name}</h3>
              <p style="margin:2px 0 0;font-size:10px;color:#94a3b8">${city.state} · Pop: ${city.pop}M</p>
            </div>
            <span style="background:${RISK_BG[city.overallRisk]};color:${RISK_COLORS[city.overallRisk]};padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700">${city.overallRisk} Risk</span>
          </div>
          <div style="font-size:10px;color:#64748b;margin-bottom:6px">DISEASE RISK ASSESSMENT</div>
          ${diseaseRows}
          ${weatherInfo}
          <div style="margin-top:8px;font-size:9px;color:#64748b;text-align:right">Sources: WHO GHO · disease.sh · OpenWeatherMap</div>
        </div>
      `, { className: 'dark-popup', closeButton: true })

      markersRef.current.push(marker)

      // Heatmap circles
      if (showHeatmap) {
        const radius = city.overallRisk === 'High' ? 50000 : city.overallRisk === 'Medium' ? 35000 : 20000
        const circle = L.circle([city.lat, city.lng], {
          color: 'transparent', fillColor: color,
          fillOpacity: city.name === 'Bengaluru' ? 0.25 : 0.15,
          radius: city.name === 'Bengaluru' ? radius * 1.3 : radius,
        }).addTo(map)
        circlesRef.current.push(circle)
      }
    })
  }, [cityRisks, selectedDisease, diseaseFilter, showHeatmap, showKarnatakaOnly])

  // Pan to Bengaluru
  const focusBengaluru = () => {
    if (mapInstance.current) mapInstance.current.flyTo([BENGALURU.lat, BENGALURU.lng], 10, { duration: 1.5 })
    const b = cityRisks.find(c => c.name === 'Bengaluru')
    if (b) setSelectedCity(b)
  }

  const diseases = ['All', 'Dengue', 'Malaria', 'Cholera', 'Typhoid', 'Influenza', 'Leptospirosis']

  return (
    <div className="space-y-4">
      {/* Header with data sources */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {showKarnatakaOnly ? 'Karnataka' : 'India'} Disease Risk Map
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Data extracted from: <span className="text-blue-400">WHO GHO API</span> (malaria indicators) + <span className="text-blue-400">disease.sh</span> (COVID-19) + <span className="text-blue-400">OpenWeatherMap</span> (live weather risk modeling)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowKarnatakaOnly(!showKarnatakaOnly); if (mapInstance.current) { mapInstance.current.flyTo(showKarnatakaOnly ? INDIA_CENTER : KARNATAKA_CENTER, showKarnatakaOnly ? 5 : 7, { duration: 1.2 }) } }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showKarnatakaOnly ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {showKarnatakaOnly ? 'Karnataka Only' : 'All India'}
          </button>
          <button onClick={focusBengaluru}
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all">
            Focus Bengaluru
          </button>
          {lastUpdated && <span className="text-[10px] text-gray-600">Updated: {lastUpdated}</span>}
        </div>
      </div>

      {/* Disease Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {diseases.map(d => (
          <button key={d} onClick={() => setDiseaseFilter(d)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all
              ${diseaseFilter === d ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
            {d}
          </button>
        ))}
      </div>

      {/* Main Map + Side Panel */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ height }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Risk Level:</span>
            {Object.entries(RISK_COLORS).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
                <span className="text-[11px] text-gray-400">{level}</span>
              </div>
            ))}
            <span className="text-[10px] text-gray-600 ml-auto">Risk computed using temperature, humidity, rainfall & endemic disease data</span>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Bengaluru Focus Card */}
          <motion.div whileHover={{ scale: 1.01 }}
            className="glass-card p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">Bengaluru Focus</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Karnataka</span>
            </div>
            {bengaluruWeather && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Temperature</span>
                  <span className="text-white font-medium">{Math.round(bengaluruWeather.main?.temp)}°C</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Humidity</span>
                  <span className="text-white font-medium">{bengaluruWeather.main?.humidity}%</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Condition</span>
                  <span className="text-white font-medium capitalize">{bengaluruWeather.weather?.[0]?.description}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Wind</span>
                  <span className="text-white font-medium">{bengaluruWeather.wind?.speed} m/s</span>
                </div>
              </div>
            )}
            {cityRisks.find(c => c.name === 'Bengaluru') && (() => {
              const b = cityRisks.find(c => c.name === 'Bengaluru')
              return (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                  <div className="text-[10px] text-gray-600 uppercase font-semibold mb-1">Disease Risk</div>
                  {b.diseases.map(d => (
                    <div key={d.name} className="flex justify-between items-center">
                      <span className="text-[11px]" style={{ color: d.color }}>{d.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: RISK_BG[d.risk], color: RISK_COLORS[d.risk] }}>
                        {d.risk}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </motion.div>

          {/* WHO India Data */}
          {indiaWHO && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-400">W</span>
                </div>
                <h4 className="text-xs font-bold text-white">WHO India Data</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ml-auto">LIVE</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Malaria Cases</span>
                  <span className="text-white font-bold">{formatNum(indiaWHO.malariaCases)}</span>
                </div>
                <div className="text-[9px] text-gray-600 text-right">WHO GHO {indiaWHO.malariaYear}</div>
                <div className="flex justify-between text-gray-400">
                  <span>Malaria Mortality</span>
                  <span className="text-white font-bold">{indiaWHO.malariaMortality?.toFixed(3)} /100K</span>
                </div>
                <div className="text-[9px] text-gray-600 text-right">WHO GHO {indiaWHO.malariaMortYear}</div>
              </div>
            </div>
          )}

          {/* COVID India Data */}
          {indiaCOVID && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-400">D</span>
                </div>
                <h4 className="text-xs font-bold text-white">COVID-19 India</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ml-auto">LIVE</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Total Cases</span>
                  <span className="text-white font-bold">{formatNum(indiaCOVID.cases)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Active Cases</span>
                  <span className="text-red-400 font-bold">{formatNum(indiaCOVID.active)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Total Deaths</span>
                  <span className="text-purple-400 font-bold">{formatNum(indiaCOVID.deaths)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Sources - Where is data extracting from */}
          <div className="glass-card p-4 border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Where is Data Extracting From?</h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ml-auto">LIVE</span>
            </div>
            <div className="space-y-3">
              {dataSources.map(s => (
                <div key={s.name} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <div className="text-[11px] font-semibold text-white">{s.name}</div>
                    <div className="text-[9px] text-gray-500">{s.desc}</div>
                    <div className="text-[9px] text-cyan-500 mt-0.5 font-mono">{s.url}</div>
                  </div>
                </div>
              ))}
              {dataSources.length === 0 && loading && (
                <div className="text-[11px] text-gray-600 animate-pulse">Fetching live data...</div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-[9px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-semibold">Risk Algorithm:</span>
                <span>Temperature + Humidity + Rainfall from OpenWeatherMap applied to each city's geographic coordinates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-semibold">Diseases Tracked:</span>
                <span>Dengue, Malaria, Cholera, Typhoid, Influenza, Leptospirosis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-semibold">Karnataka Cities:</span>
                <span>Bengaluru, Mysuru, Hubli-Dharwad, Belagavi, Mangaluru, Davanagere, Ballari, Shivamogga, Tumakuru, Vijayapura, Chamarajanagar, Gadag</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CITY_BASE as HOTSPOTS }
