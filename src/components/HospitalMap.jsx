import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { LocalHospital, Phone, Directions, Language, Hotel, Warning } from '@mui/icons-material'
import api from '../services/api'

const hospitalIcon = L.divIcon({
  html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function HospitalMap({ userLat, userLon, city }) {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHospital, setSelectedHospital] = useState(null)

  useEffect(() => {
    fetchHospitals()
  }, [userLat, userLon, city])

  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const params = {}
      if (userLat && userLon) {
        params.lat = userLat
        params.lon = userLon
      }
      if (city) params.city = city
      
      const res = await api.get('/api/hospitals/nearby', { params })
      const data = res.data.hospitals || []
      
      // Calculate distances
      if (userLat && userLon) {
        data.forEach(h => {
          if (h.lat && h.lon) {
            h.distance_km = haversineDistance(userLat, userLon, h.lat, h.lon).toFixed(1)
          }
        })
        data.sort((a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km))
      }
      
      setHospitals(data)
    } catch (err) {
      console.error('Failed to fetch hospitals:', err)
    } finally {
      setLoading(false)
    }
  }

  const mapCenter = userLat && userLon 
    ? [userLat, userLon] 
    : hospitals[0] ? [hospitals[0].lat, hospitals[0].lon] : [20.5937, 78.9629]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-red-500 rounded-full border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Finding nearby hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hospital Map */}
      <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer center={mapCenter} zoom={userLat ? 13 : 5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          {/* User location */}
          {userLat && userLon && (
            <>
              <Circle center={[userLat, userLon]} radius={5000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }} />
              <Marker position={[userLat, userLon]} icon={L.divIcon({
                html: `<div style="background: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
                className: '', iconSize: [14, 14], iconAnchor: [7, 7]
              })}>
                <Popup>Your Location</Popup>
              </Marker>
            </>
          )}
          
          {/* Hospital markers */}
          {hospitals.map((h, i) => (
            <Marker key={i} position={[h.lat, h.lon]} icon={hospitalIcon} eventHandlers={{ click: () => setSelectedHospital(h) }}>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <h4 className="font-bold text-gray-900">{h.name}</h4>
                  <p className="text-gray-500 text-xs mt-1">{h.type}</p>
                  {h.phone && <p className="text-xs mt-1">📞 {h.phone}</p>}
                  {h.beds && <p className="text-xs">🛏️ {h.beds} beds</p>}
                  {h.distance_km && <p className="text-xs text-blue-600 font-medium">📍 {h.distance_km} km away</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Hospital List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedHospital(h)}
            className={`glass-card-hover p-4 cursor-pointer transition-all ${selectedHospital?.name === h.name ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${h.type === 'Government' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <LocalHospital className={h.type === 'Government' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm dark:text-white truncate">{h.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${h.type === 'Government' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'}`}>
                    {h.type}
                  </span>
                  {h.distance_km && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{h.distance_km} km</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {h.phone && <span className="flex items-center gap-1"><Phone className="text-xs" /> {h.phone}</span>}
                  {h.beds && <span className="flex items-center gap-1"><Hotel className="text-xs" /> {h.beds}</span>}
                </div>
                {h.emergency && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-red-600 dark:text-red-400">
                    <Warning className="text-xs" /> Emergency Services Available
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              {h.phone && (
                <a href={`tel:${h.phone}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                  <Phone className="text-xs" /> Call
                </a>
              )}
              <a href={`https://www.google.com/maps/dir/${h.lat},${h.lon}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                <Directions className="text-xs" /> Directions
              </a>
              {h.website && (
                <a href={h.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <Language className="text-xs" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
