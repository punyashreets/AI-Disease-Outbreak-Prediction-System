import { useState, useEffect, useCallback } from 'react'

/**
 * Browser Geolocation API Hook
 * Gets user's real-time location (lat/lng) and reverse-geocodes to city/state.
 * Uses: navigator.geolocation + OpenStreetMap Nominatim for reverse geocoding
 */
export function useGeolocation() {
  const [location, setLocation] = useState({
    lat: null, lng: null, city: null, state: null, district: null,
    loading: true, error: null, accuracy: null
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const loc = { lat: latitude, lng: longitude, accuracy, loading: false, error: null }

        // Reverse geocode using OpenStreetMap Nominatim
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=12`,
            { headers: { 'Accept-Language': 'en' } }
          )
          if (resp.ok) {
            const data = await resp.json()
            const addr = data.address || {}
            loc.city = addr.city || addr.town || addr.village || addr.county || 'Unknown'
            loc.state = addr.state || 'Unknown'
            loc.district = addr.county || addr.district || addr.suburb || loc.city
            loc.address = data.display_name
          }
        } catch (err) {
          console.warn('Reverse geocoding failed:', err)
        }

        setLocation(loc)
      },
      (error) => {
        const messages = {
          1: 'Location permission denied. Please enable location access.',
          2: 'Location unavailable. Check GPS/network.',
          3: 'Location request timed out.'
        }
        setLocation(prev => ({
          ...prev, loading: false, error: messages[error.code] || 'Unknown error'
        }))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    )
  }, [])

  return location
}

/**
 * EmailJS Integration
 * Sends email alert notifications via EmailJS REST API.
 * Requires: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY in .env
 */
const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send'

export async function sendEmailAlert({ toEmail, alertTitle, alertMessage, riskLevel, userName }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured. Set VITE_EMAILJS_* in .env')
    return { success: false, error: 'EmailJS not configured' }
  }

  const templateParams = {
    to_email: toEmail,
    to_name: userName || 'Citizen',
    alert_title: alertTitle || 'Health Alert',
    alert_message: alertMessage || 'A new health alert has been issued for your region.',
    risk_level: riskLevel || 'Medium',
    from_name: 'Disease Outbreak Prediction System'
  }

  try {
    const resp = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    })

    if (resp.ok) {
      return { success: true }
    } else {
      const errText = await resp.text()
      return { success: false, error: errText }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Send bulk alerts to multiple users
 */
export async function sendBulkAlerts(users, alertData) {
  const results = []
  for (const user of users) {
    const result = await sendEmailAlert({
      toEmail: user.email,
      userName: user.full_name,
      ...alertData
    })
    results.push({ email: user.email, ...result })
  }
  return results
}
