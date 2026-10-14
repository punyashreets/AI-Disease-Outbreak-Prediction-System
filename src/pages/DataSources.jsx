import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import {
  Search, LocationOn, TrendingUp, Storage, Check, AccessTime, FilterList,
  Public, Business, BookOutlined, Cloud, Description, School,
  BarChart, Verified, Info
} from '@mui/icons-material'

const DATA_SOURCES = [
  {
    id: 1,
    name: 'World Health Organization (WHO)',
    category: 'Government/International',
    icon: '🌍',
    description: 'Global health authority providing disease surveillance and public health guidance',
    dataTypes: ['Global disease reports', 'Health statistics', 'Pandemic information', 'Public health guidelines'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-blue-500 to-cyan-500',
    website: 'www.who.int',
    sources: 25
  },
  {
    id: 2,
    name: 'National Centre for Disease Control (NCDC), India',
    category: 'Government - India',
    icon: '🏥',
    description: 'Indian disease surveillance and outbreak monitoring authority',
    dataTypes: ['Disease surveillance reports', 'Outbreak monitoring', 'Epidemiological updates', 'National health alerts'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-orange-500 to-red-500',
    website: 'www.ncdc.gov.in',
    sources: 18
  },
  {
    id: 3,
    name: 'Ministry of Health and Family Welfare (MoHFW), India',
    category: 'Government - India',
    icon: '🏛️',
    description: 'National health statistics and disease bulletins from India',
    dataTypes: ['National health statistics', 'Disease bulletins', 'Public health information', 'Health programs data'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-green-500 to-emerald-500',
    website: 'www.mohfw.gov.in',
    sources: 22
  },
  {
    id: 4,
    name: 'India Meteorological Department (IMD)',
    category: 'Weather Data',
    icon: '🌤️',
    description: 'Official weather and climate data affecting disease transmission',
    dataTypes: ['Temperature data', 'Rainfall information', 'Humidity trends', 'Climate factors', 'Seasonal patterns'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-purple-500 to-indigo-500',
    website: 'www.imd.gov.in',
    sources: 30
  },
  {
    id: 5,
    name: 'Weather Data Sources',
    category: 'Weather Data',
    icon: '⛅',
    description: 'Historical and real-time weather information for environmental analysis',
    dataTypes: ['Historical weather records', 'Environmental conditions', 'Seasonal patterns', 'Atmospheric data'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-sky-500 to-blue-500',
    website: 'openweathermap.org, weatherapi.com',
    sources: 15
  },
  {
    id: 6,
    name: 'News Sources',
    category: 'News & Media',
    icon: '📰',
    description: 'Health-related news and disease outbreak reports from global media',
    dataTypes: ['Health news articles', 'Outbreak reports', 'Public health announcements', 'Awareness campaigns'],
    reliability: 'Medium-High',
    lastUpdated: '2024-06-14',
    color: 'from-red-500 to-pink-500',
    website: 'Multiple news agencies',
    sources: 40
  },
  {
    id: 7,
    name: 'Research Publications',
    category: 'Academic',
    icon: '📚',
    description: 'Peer-reviewed research papers and scientific publications on disease prediction',
    dataTypes: ['IEEE Papers', 'Research journals', 'Scientific publications', 'Disease prediction studies'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-violet-500 to-purple-500',
    website: 'IEEE Xplore, ResearchGate, ArXiv',
    sources: 50
  },
  {
    id: 8,
    name: 'Historical Datasets',
    category: 'Public Datasets',
    icon: '📊',
    description: 'Public health datasets and disease outbreak records for ML training',
    dataTypes: ['Disease outbreak datasets', 'Population statistics', 'Regional health records', 'Public ML datasets'],
    reliability: 'High',
    lastUpdated: '2024-06-14',
    color: 'from-teal-500 to-cyan-500',
    website: 'Kaggle, WHO databases, Government repositories',
    sources: 35
  }
]

const TIMELINE_EVENTS = [
  { phase: 'Data Collection', description: 'Gathering from official sources', icon: '📥' },
  { phase: 'Data Validation', description: 'Cross-verification and quality checks', icon: '✓' },
  { phase: 'Data Integration', description: 'Combining multiple sources', icon: '🔗' },
  { phase: 'ML Processing', description: 'Training models with datasets', icon: '🧠' },
  { phase: 'Insights Generation', description: 'Predicting disease trends', icon: '📈' },
  { phase: 'User Delivery', description: 'Real-time alerts and dashboards', icon: '📱' }
]

const SOURCE_CATEGORIES = [
  { name: 'All', count: 8, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { name: 'Government - India', count: 2, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { name: 'Government/International', count: 1, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { name: 'Weather Data', count: 2, color: 'bg-gradient-to-r from-sky-500 to-blue-500' },
  { name: 'News & Media', count: 1, color: 'bg-gradient-to-r from-red-500 to-pink-500' },
  { name: 'Academic', count: 1, color: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { name: 'Public Datasets', count: 1, color: 'bg-gradient-to-r from-teal-500 to-cyan-500' }
]

export default function DataSources() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedCard, setExpandedCard] = useState(null)

  const filteredSources = useMemo(() => {
    return DATA_SOURCES.filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || source.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const stats = [
    { label: 'Total Sources', value: DATA_SOURCES.length, icon: Storage, color: 'from-blue-500 to-cyan-500' },
    { label: 'Government Sources', value: 3, icon: Business, color: 'from-orange-500 to-red-500' },
    { label: 'Research Sources', value: 2, icon: BookOutlined, color: 'from-violet-500 to-purple-500' },
    { label: 'Weather Sources', value: 2, icon: Cloud, color: 'from-sky-500 to-blue-500' }
  ]

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-xl">
              <Storage className="text-blue-400" fontSize="large" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Data Sources</h1>
              <p className="text-gray-300 max-w-2xl">Comprehensive overview of all official data sources, research repositories, and information systems powering our intelligent disease surveillance platform.</p>
            </div>
          </div>
        </motion.div>

        {/* Source Statistics */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} 
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer`}
              whileHover={{ scale: 1.05, y: -5 }}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="text-white/80 group-hover:text-white transition-colors" fontSize="large" />
                <TrendingUp className="text-white/60 group-hover:text-white/80 transition-colors" />
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Search Bar */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <Search className="text-blue-400" />
                <input
                  type="text"
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filter Button */}
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
              <FilterList className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium">{filteredSources.length} Results</span>
            </motion.div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-3">
            {SOURCE_CATEGORIES.map((category, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedCategory(category.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? `${category.color} text-white shadow-lg shadow-blue-500/30 border border-white/20`
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/20 hover:text-white'
                }`}>
                {category.name} <span className="ml-1 text-xs">({category.count})</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Data Source Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filteredSources.map((source, idx) => (
            <motion.div
              key={source.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              onHoverStart={() => setExpandedCard(source.id)}
              onHoverEnd={() => setExpandedCard(null)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${source.color} p-0.5 transition-all duration-300`}>
              
              {/* Glassmorphism Card */}
              <div className="relative p-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 h-full flex flex-col group-hover:bg-slate-900/60 transition-all duration-300">
                
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" style={{
                  background: `linear-gradient(135deg, ${source.color.split(' ')[1]}, ${source.color.split(' ')[3]})`
                }} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{source.icon}</div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${source.color} text-white text-xs font-bold`}>
                      <Verified fontSize="small" />
                      {source.reliability}
                    </div>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{source.name}</h3>
                  <p className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">{source.category}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{source.description}</p>

                  {/* Data Types */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Data Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {source.dataTypes.slice(0, 2).map((type, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                          {type}
                        </span>
                      ))}
                      {source.dataTypes.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                          +{source.dataTypes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCard === source.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-gray-300 mt-4 pt-4 border-t border-white/10">
                      <p className="mb-2"><strong>All Data Types:</strong></p>
                      <ul className="space-y-1 mb-3">
                        {source.dataTypes.map((type, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-400" />
                            {type}
                          </li>
                        ))}
                      </ul>
                      <p><strong>Website:</strong> {source.website}</p>
                    </motion.div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <AccessTime fontSize="small" />
                      {source.lastUpdated}
                    </div>
                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 font-semibold text-blue-400">
                      {source.sources} refs
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Collection Timeline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Data Collection Workflow</h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 hidden lg:block" />

            {/* Timeline Items */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {TIMELINE_EVENTS.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="group relative">
                  
                  {/* Circle */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/40 to-cyan-500/40 backdrop-blur-xl border border-blue-500/50 flex items-center justify-center text-2xl group-hover:border-blue-500/80 transition-all duration-300 shadow-lg shadow-blue-500/20">
                        {event.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <p className="font-bold text-white text-sm mb-1">{event.phase}</p>
                    <p className="text-xs text-gray-400">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Information Note */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
          className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <Info className="text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white mb-2">Data Integration Note</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                This project does not directly integrate with these organizations' APIs or real-time data feeds. These sources are referenced for research, dataset collection, validation, and project documentation purposes. All data presented is for demonstration and educational purposes as part of this final-year major project on intelligent disease surveillance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>Enterprise Healthcare Intelligence Platform | Data Sources Dashboard</p>
          <p className="mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
      </div>
    </Layout>
  )
}
