import { motion } from 'framer-motion'
import Layout from '../components/Layout'

const LAYERS = [
  {
    title: 'Frontend Layer',
    subtitle: 'React + Tailwind CSS + Framer Motion',
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    icon: '⚛️',
    items: ['React 18 (SPA)', 'Tailwind CSS (Dark Theme)', 'Framer Motion (Animations)', 'Recharts (Visualizations)', 'Axios (HTTP Client)', 'React Router v6']
  },
  {
    title: 'Backend Layer',
    subtitle: 'Flask REST API + JWT Authentication',
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    icon: '🐍',
    items: ['Flask (Python 3.10)', 'Flask-JWT-Extended', 'Flask-CORS', 'BluePrint Modular Routes', 'RESTful API Design', '20+ API Endpoints']
  },
  {
    title: 'Database Layer',
    subtitle: 'MongoDB NoSQL Database',
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    icon: '🗄️',
    items: ['MongoDB 8.2', 'PyMongo Driver', '12+ Collections', 'Indexed Queries', 'Auto-seeding', 'Aggregation Pipelines']
  },
  {
    title: 'Machine Learning Layer',
    subtitle: 'Scikit-learn + Random Forest + XGBoost',
    color: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/20',
    icon: '🤖',
    items: ['Random Forest Classifier', 'XGBoost', 'Logistic Regression', 'SVM', 'Feature Engineering', 'Model Comparison']
  },
  {
    title: 'Prediction Engine',
    subtitle: 'AI-Powered Disease Risk Assessment',
    color: 'from-red-500 to-pink-500',
    shadow: 'shadow-red-500/20',
    icon: '🎯',
    items: ['Multi-Disease Prediction', 'Risk Score (0-100)', 'Spread Simulation', '7/14/30 Day Forecast', 'Explainable AI', 'Confidence Scoring']
  },
  {
    title: 'Data Integration Layer',
    subtitle: 'Multi-Source API Aggregation',
    color: 'from-indigo-500 to-blue-500',
    shadow: 'shadow-indigo-500/20',
    icon: '🌐',
    items: ['WHO Disease Data', 'NCDC Surveillance', 'IMD Weather API', 'OpenWeatherMap', 'News API', 'Satellite Data']
  },
  {
    title: 'Citizen Dashboard',
    subtitle: 'Health Monitoring & Engagement',
    color: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-500/20',
    icon: '👤',
    items: ['Risk Predictions', 'Interactive Risk Map', 'Disease Forecasting', 'AI Chatbot (Voice)', 'Food Ordering', 'Vaccination Tracker']
  },
  {
    title: 'Admin Dashboard',
    subtitle: 'Command Center & Management',
    color: 'from-fuchsia-500 to-pink-500',
    shadow: 'shadow-fuchsia-500/20',
    icon: '🛡️',
    items: ['System Overview', 'User Management', 'Data Center', 'Alert Management', 'Community Reports', 'Health Camps']
  },
]

export default function Architecture() {
  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-glow text-center">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">System Architecture</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            AI-Powered Public Health Intelligence, Disease Outbreak Prediction, Healthcare Assistance, Community Monitoring & Smart Nutrition Platform
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {['React', 'Flask', 'MongoDB', 'Scikit-learn', 'Tailwind', 'JWT'].map((tech, i) => (
              <motion.span key={tech}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Architecture Layers */}
        <div className="space-y-4">
          {LAYERS.map((layer, idx) => (
            <motion.div key={layer.title}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
              className="relative">
              {/* Connection Arrow */}
              {idx < LAYERS.length - 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className={`rounded-2xl p-6 bg-gradient-to-r ${layer.color} bg-opacity-5 dark:bg-opacity-10 border border-white/10 backdrop-blur-xl`}>
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${layer.color} ${layer.shadow} shadow-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {layer.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 dark:text-white text-lg">{layer.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{layer.subtitle}</p>
                    <div className="flex flex-wrap gap-2">
                      {layer.items.map(item => (
                        <span key={item} className="px-2.5 py-1 rounded-lg bg-white/50 dark:bg-white/[0.05] text-xs font-medium text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card p-6 border-glow">
          <h3 className="font-black text-gray-800 dark:text-white text-lg mb-4">Data Flow Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'API Endpoints', value: '20+', icon: '🔗' },
              { label: 'Database Collections', value: '12+', icon: '📦' },
              { label: 'ML Models', value: '5', icon: '🧠' },
              { label: 'External APIs', value: '6', icon: '🌐' },
              { label: 'Frontend Pages', value: '25+', icon: '📄' },
              { label: 'Total Modules', value: '16', icon: '🧩' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/[0.03]">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg font-black text-gray-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
