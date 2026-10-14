import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'objectives', label: 'Objectives', icon: '🎯' },
  { id: 'tech', label: 'Technologies', icon: '⚙️' },
  { id: 'workflow', label: 'Workflow', icon: '🔄' },
  { id: 'modules', label: 'Modules', icon: '🧩' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'scope', label: 'Future Scope', icon: '🚀' },
]

const MODULES = [
  { name: 'AI Disease Outbreak Prediction', desc: 'ML-powered risk assessment for 7 diseases with confidence scoring' },
  { name: 'Disease Forecasting', desc: '7/14/30-day predictions with trend visualization' },
  { name: 'Interactive Risk Maps', desc: 'District-level heatmap with color-coded risk zones' },
  { name: 'Spread Simulation', desc: 'Disease spread modeling with configurable parameters' },
  { name: 'Explainable AI', desc: 'Feature importance and model transparency for trust' },
  { name: 'ML Model Comparison', desc: 'Random Forest, XGBoost, SVM, Logistic Regression side-by-side' },
  { name: 'AI Health Chatbot', desc: 'Voice-enabled conversational assistant with symptom detection' },
  { name: 'Multi-Language Support', desc: 'English, Hindi, and Kannada interface' },
  { name: 'Smart Health Food Ordering', desc: 'Disease-aware food catalog with cart and checkout' },
  { name: 'Vaccination Tracker', desc: 'National immunization schedule with personal records' },
  { name: 'Community Health Reporting', desc: 'Citizen-submitted hazard reports with admin review' },
  { name: 'Health Camps & Events', desc: 'Camp creation, registration, and management' },
  { name: 'Disease Knowledge Graph', desc: 'Interactive disease-symptom-weather-prevention-food relationships' },
  { name: 'Prediction History', desc: 'Historical risk trends and past predictions' },
  { name: 'Emergency Module', desc: 'Quick-access emergency contacts and SOS panel' },
  { name: 'Weather Integration', desc: 'Real-time weather correlation with disease risk' },
]

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-glow text-center">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Project Documentation</h1>
          <p className="text-gray-500 dark:text-gray-400">
            AI-Powered Public Health Intelligence & Disease Outbreak Prediction Platform
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-glow">
                  <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">Project Overview</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    This project presents a comprehensive AI-powered Public Health Intelligence Platform that combines machine learning,
                    multi-source data integration, and intelligent analytics to predict, monitor, and manage disease outbreaks.
                    The system serves as a complete digital public-health ecosystem encompassing disease prediction, health monitoring,
                    community reporting, smart nutrition, vaccination tracking, and emergency response.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    The platform features dual-role dashboards (Citizen and Admin), real-time weather correlation,
                    interactive risk maps, voice-enabled AI chatbot, multi-language support (English, Hindi, Kannada),
                    food ordering with disease-aware recommendations, and a complete community health reporting system.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {[
                      { label: 'Total Modules', value: '16+', color: 'from-blue-500 to-cyan-500' },
                      { label: 'API Endpoints', value: '50+', color: 'from-emerald-500 to-teal-500' },
                      { label: 'Diseases Covered', value: '7', color: 'from-red-500 to-orange-500' },
                      { label: 'ML Models', value: '5', color: 'from-violet-500 to-purple-500' },
                    ].map((s, i) => (
                      <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${s.color} text-white text-center`}>
                        <p className="text-3xl font-black">{s.value}</p>
                        <p className="text-white/80 text-xs font-medium mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'objectives' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">Project Objectives</h3>
                <div className="space-y-3">
                  {[
                    'Develop an AI-based disease outbreak prediction system using multiple data sources',
                    'Create an interactive risk assessment dashboard with real-time visualizations',
                    'Integrate weather, satellite, and demographic data for enhanced prediction accuracy',
                    'Build a citizen-centric health monitoring portal with personalized recommendations',
                    'Implement community health reporting for crowd-sourced hazard detection',
                    'Design a multi-language, voice-enabled AI health assistant',
                    'Develop a smart food recommendation system based on disease conditions',
                    'Create comprehensive admin dashboards for public health management',
                    'Build vaccination tracking and health camp management modules',
                    'Implement explainable AI for model transparency and trust',
                    'Design disease knowledge graphs for educational awareness',
                    'Generate downloadable reports (PDF/CSV/JSON) for health authorities',
                  ].map((obj, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/[0.03]">
                      <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{obj}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">Technologies Used</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { cat: 'Frontend', items: [
                      { name: 'React 18', desc: 'UI framework with hooks and functional components' },
                      { name: 'Tailwind CSS', desc: 'Utility-first CSS with custom dark theme' },
                      { name: 'Framer Motion', desc: 'Animation library for smooth transitions' },
                      { name: 'Recharts', desc: 'Chart library for data visualization' },
                      { name: 'Material UI Icons', desc: 'Consistent iconography throughout' },
                      { name: 'Web Speech API', desc: 'Voice input/output for AI chatbot' },
                    ]},
                    { cat: 'Backend', items: [
                      { name: 'Flask (Python)', desc: 'Lightweight REST API framework' },
                      { name: 'Flask-JWT-Extended', desc: 'JWT-based authentication' },
                      { name: 'MongoDB', desc: 'NoSQL document database' },
                      { name: 'PyMongo', desc: 'MongoDB Python driver' },
                      { name: 'Scikit-learn', desc: 'Machine learning library' },
                      { name: 'XGBoost', desc: 'Gradient boosting framework' },
                    ]},
                  ].map((section, si) => (
                    <div key={si}>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> {section.cat}
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/[0.03]">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">{item.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">System Workflow</h3>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Data Collection', desc: 'Multi-source data from WHO, NCDC, IMD Weather, Satellite feeds, News APIs, and historical datasets', color: 'bg-blue-500' },
                    { step: '2', title: 'Data Processing', desc: 'Feature engineering, normalization, and correlation analysis between weather, demographics, and disease patterns', color: 'bg-cyan-500' },
                    { step: '3', title: 'ML Prediction', desc: 'Trained models (Random Forest, XGBoost, SVM) generate risk scores and outbreak probabilities for 7 diseases', color: 'bg-violet-500' },
                    { step: '4', title: 'Risk Assessment', desc: 'Risk scores mapped to Low/Medium/High categories with district-level granularity and confidence intervals', color: 'bg-amber-500' },
                    { step: '5', title: 'Visualization', desc: 'Interactive dashboards, risk maps, trend charts, and AI insights presented to citizens and administrators', color: 'bg-emerald-500' },
                    { step: '6', title: 'Action & Response', desc: 'Health alerts, food recommendations, hospital referrals, vaccination reminders, and community reports triggered', color: 'bg-red-500' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg`}>
                        {s.step}
                      </div>
                      <div className="flex-1 p-4 rounded-xl bg-white/50 dark:bg-white/[0.03]">
                        <h4 className="font-bold text-gray-800 dark:text-white">{s.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">System Modules ({MODULES.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MODULES.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.05]">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{m.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">Project Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <h4 className="font-bold text-blue-500 text-sm uppercase tracking-wider mb-3">Project Guide</h4>
                    <p className="text-lg font-black text-gray-800 dark:text-white">Department of Computer Science</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Faculty Guide & Supervisor</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <h4 className="font-bold text-violet-500 text-sm uppercase tracking-wider mb-3">Student Team</h4>
                    <p className="text-lg font-black text-gray-800 dark:text-white">Final Year Project Team</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">B.Tech / B.E. Computer Science</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 md:col-span-2">
                    <h4 className="font-bold text-emerald-500 text-sm uppercase tracking-wider mb-3">Institution</h4>
                    <p className="text-lg font-black text-gray-800 dark:text-white">College / University Name</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Academic Year 2025-2026</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scope' && (
              <div className="glass-card p-6 border-glow">
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4">Future Scope</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Deep Learning Integration', desc: 'LSTM and Transformer models for improved time-series forecasting', icon: '🧠' },
                    { title: 'IoT Sensor Integration', desc: 'Real-time environmental sensors for water quality and air pollution monitoring', icon: '📡' },
                    { title: 'Mobile Application', desc: 'React Native mobile app with push notifications and offline capabilities', icon: '📱' },
                    { title: 'Blockchain Records', desc: 'Immutable vaccination and health records using blockchain technology', icon: '🔗' },
                    { title: 'Telemedicine Integration', desc: 'Connect patients with doctors for remote consultations', icon: '🏥' },
                    { title: 'Government Integration', desc: 'Connect with real government health databases and alert systems', icon: '🏛️' },
                    { title: 'Federated Learning', desc: 'Privacy-preserving ML across multiple hospitals without sharing data', icon: '🔒' },
                    { title: 'AR/VR Visualization', desc: 'Augmented reality disease spread visualization for public awareness', icon: '🥽' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.05]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{item.icon}</span>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  )
}
