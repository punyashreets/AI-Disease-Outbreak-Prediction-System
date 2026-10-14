import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { motion } from 'framer-motion'
import {
  CloudUpload, Send, TrendingUp, Warning, BugReport, ShowChart,
  Thermostat, WaterDrop, Air, People, CalendarMonth, LocationOn,
  CheckCircle, Cancel, Refresh, BarChart, TrackChanges, Info,
  FolderOpen, Storage
} from '@mui/icons-material'

const HEALTH_ADVISORIES = {
  Dengue: { prevention: ['Remove stagnant water', 'Use mosquito repellents', 'Wear full-sleeve clothes', 'Use window screens'], symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Skin rash'] },
  Malaria: { prevention: ['Use mosquito nets', 'Apply insect repellent', 'Sleep in screened rooms', 'Take prophylaxis if traveling'], symptoms: ['Fever with chills', 'Headache', 'Body ache', 'Sweating'] },
  Cholera: { prevention: ['Drink boiled water', 'Wash hands before eating', 'Avoid raw vegetables', 'Maintain sanitation'], symptoms: ['Watery diarrhea', 'Vomiting', 'Dehydration', 'Leg cramps'] },
  Typhoid: { prevention: ['Drink purified water', 'Wash hands before meals', 'Avoid street food', 'Get vaccinated'], symptoms: ['Prolonged fever', 'Headache', 'Abdominal pain', 'Rose spots'] },
  Influenza: { prevention: ['Get flu vaccine', 'Cover mouth while coughing', 'Wash hands frequently', 'Avoid close contact'], symptoms: ['Fever', 'Dry cough', 'Sore throat', 'Body aches'] },
  'COVID-19': { prevention: ['Wear masks', 'Maintain social distance', 'Sanitize hands', 'Get vaccinated'], symptoms: ['Fever', 'Dry cough', 'Loss of taste/smell', 'Shortness of breath'] },
  Leptospirosis: { prevention: ['Avoid floodwater contact', 'Wear protective clothing', 'Cover wounds', 'Control rodents'], symptoms: ['High fever', 'Headache', 'Muscle pain', 'Jaundice'] }
}

const RISK_CONFIG = {
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500', dot: 'bg-red-500' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500', dot: 'bg-amber-500' },
  Low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500', dot: 'bg-green-500' }
}

export default function DatasetManager() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('upload')
  const [csvFile, setCsvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [locations, setLocations] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [predicting, setPredicting] = useState(false)
  const [predictions, setPredictions] = useState(null)

  useEffect(() => {
    loadLocations()
    if (user?.state?.toLowerCase() === 'karnataka') {
      setSelectedDistrict(user.district || '')
    }
  }, [user])

  const loadLocations = async () => {
    try {
      const res = await api.get('/api/dataset-manager/locations')
      setLocations(res.data)
    } catch (err) {
      console.error('No dataset uploaded yet:', err)
    }
  }

  const handleUpload = async () => {
    if (!csvFile) return
    setUploading(true)
    setUploadResult(null)
    const formData = new FormData()
    formData.append('file', csvFile)
    try {
      const res = await api.post('/api/dataset-manager/upload', formData)
      setUploadResult(res.data)
      await loadLocations()
    } catch (err) {
      setUploadResult({ error: err.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedDistrict) return
    setPredicting(true)
    setPredictions(null)
    try {
      const res = await api.post('/api/dataset-manager/train', {
        state: 'Karnataka',
        district: selectedDistrict
      })
      setPredictions(res.data)
    } catch (err) {
      setPredictions({ error: err.response?.data?.error || 'Prediction failed' })
    } finally {
      setPredicting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50 outline-none transition text-white placeholder:text-gray-600"

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 border-glow">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Disease Dataset CSV</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload a CSV file with columns:
          <code className="px-2 py-1 bg-gray-800 rounded text-xs">disease_name, state, district, cases, deaths, recovered, date</code>
        </p>

        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
          <CloudUpload style={{ fontSize: 48 }} className="text-gray-500 mx-auto mb-4" />
          <input
            type="file"
            accept=".csv"
            onChange={e => setCsvFile(e.target.files[0])}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer text-blue-400 font-medium hover:text-blue-300 transition">
            Choose CSV file
          </label>
          {csvFile && (
            <p className="text-sm text-gray-400 mt-2">{csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !csvFile}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Refresh className="w-4 h-4 animate-spin" />
              Uploading & Importing...
            </>
          ) : 'Upload & Import Dataset'}
        </button>
      </div>

      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${uploadResult.error
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          {uploadResult.error ? (
            <p>{uploadResult.error}</p>
          ) : (
            <>
              <p className="font-semibold">Upload successful!</p>
              <p className="text-sm mt-1">{uploadResult.records_imported} records imported into the database.</p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <p className="text-sm mt-1">{uploadResult.errors.length} errors encountered during import.</p>
              )}
            </>
          )}
        </motion.div>
      )}

      {locations && (
        <div className="glass-card p-6 border-glow">
          <h3 className="text-lg font-semibold text-white mb-4">Available Karnataka Locations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {locations.districts.map(d => (
              <div key={d} className="flex items-center gap-2 p-3 bg-gray-700/30 rounded-xl">
                <LocationOn className="w-4 h-4 text-blue-400" />
                <span className="text-white">{d}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {locations.total_records} total Karnataka disease records found across {locations.districts.length} districts and {locations.diseases.length} diseases.
          </p>
        </div>
      )}
    </div>
  )

  const renderPredictTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 border-glow">
        <h3 className="text-lg font-semibold text-white mb-4">Train Model & Predict Top Diseases</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select a Karnataka location. The system will filter the uploaded CSV for that location, train a Random Forest model on the disease data, and return the top 5 predicted diseases.
        </p>

        {user?.state?.toLowerCase() === 'karnataka' && user?.district && (
          <p className="text-sm text-blue-400 mb-4">
            Your registered location: {user.district}, {user.state}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">District</label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className={inputClass + ' text-sm'}
            >
              <option value="" className="bg-slate-800">Select a district</option>
              {locations?.districts.map(d => (
                <option key={d} value={d} className="bg-slate-800">{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={predicting || !selectedDistrict}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {predicting ? (
              <>
                <Refresh className="w-4 h-4 animate-spin" />
                Training model and predicting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Train Model & Predict Top 5 Diseases
              </>
            )}
          </button>
        </div>
      </div>

      {predictions && (
        <div>
          {predictions.error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {predictions.error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  Top 5 Disease Predictions for {predictions.district || 'Karnataka'}
                </h3>
                <div className="text-xs text-gray-500">
                  Model: {predictions.model_used} | Records Analyzed: {predictions.total_records}
                </div>
              </div>

              <div className="space-y-4">
                {predictions.predictions.map((pred, i) => {
                  const riskConfig = RISK_CONFIG[pred.risk_level]
                  const advisory = pred.advisory || HEALTH_ADVISORIES[pred.disease] || HEALTH_ADVISORIES.Dengue
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-card p-6 border-l-4 ${riskConfig.border}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-xl text-white">{pred.disease}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskConfig.bg} ${riskConfig.text}`}>
                                {pred.risk_level} Risk
                              </span>
                              <span className="text-sm text-gray-400">Probability: {(pred.probability * 100).toFixed(1)}%</span>
                              <span className="text-sm text-gray-400">Confidence: {(pred.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                              {pred.explanation}
                            </p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${riskConfig.bg} ${riskConfig.text}`}>
                          <span className="text-2xl font-bold">{(pred.probability * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                          <BugReport className="w-5 h-5 mx-auto text-red-400 mb-1" />
                          <p className="text-xs text-gray-500">Total Cases</p>
                          <p className="text-lg font-bold text-white">{pred.total_cases}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                          <ShowChart className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                          <p className="text-xs text-gray-500">Peak Cases</p>
                          <p className="text-lg font-bold text-white">{pred.peak_cases}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                          <TrendingUp className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                          <p className="text-xs text-gray-500">Growth Rate</p>
                          <p className={`text-lg font-bold ${pred.case_growth_rate > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {pred.case_growth_rate > 0 ? '+' : ''}{(pred.case_growth_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                          <Cancel className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                          <p className="text-xs text-gray-500">Fatality Rate</p>
                          <p className="text-lg font-bold text-white">{(pred.case_fatality_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                          <CheckCircle className="w-5 h-5 mx-auto text-green-400 mb-1" />
                          <p className="text-xs text-gray-500">Recovery Rate</p>
                          <p className="text-lg font-bold text-white">{(pred.recovery_rate * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Prevention</h5>
                          <ul className="space-y-1">
                            {(advisory.prevention || []).map((tip, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Symptoms</h5>
                          <ul className="space-y-1">
                            {(advisory.symptoms || []).map((sym, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                <Warning className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {sym}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-glow"
      >
        <div className="flex items-center gap-3 mb-2">
          <Storage style={{ fontSize: 32 }} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Dataset Manager</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Upload disease datasets, train ML models on Karnataka data, and view top disease outbreak predictions.
        </p>
      </motion.div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          Upload Dataset
        </button>
        <button
          onClick={() => setActiveTab('predict')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'predict'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
          disabled={!locations}
        >
          Train & Predict
        </button>
      </div>

      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'predict' && renderPredictTab()}
    </div>
  )
}
