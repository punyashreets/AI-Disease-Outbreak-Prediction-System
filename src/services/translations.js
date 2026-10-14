// Flat key-value translation dictionary for English, Hindi, and Kannada
const translations = {
  // ─── NAV ───
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'nav.predictions': { en: 'Predictions', hi: 'पूर्वानुमान', kn: 'ಮುನ್ಸೂಚನೆಗಳು' },
  'nav.riskMap': { en: 'Risk Map', hi: 'जोखिम मानचित्र', kn: 'ಅಪಾಯ ನಕ್ಷೆ' },
  'nav.hospitals': { en: 'Nearby Hospitals', hi: 'नज़दीकी अस्पताल', kn: 'ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳು' },
  'nav.forecast': { en: 'Forecasting', hi: 'पूर्वानुमान', kn: 'ಮುನ್ಸೂಚನೆ' },
  'nav.spread': { en: 'Spread Simulation', hi: 'फैलाव सिमुलेशन', kn: 'ಹರಡುವಿಕೆ ಸಿಮ್ಯುಲೇಶನ್' },
  'nav.explain': { en: 'Explainable AI', hi: 'व्याख्यात्मक AI', kn: 'ವಿವರಣಾತ್ಮಕ AI' },
  'nav.mlModels': { en: 'ML Models', hi: 'ML मॉडल', kn: 'ML ಮಾದರಿಗಳು' },
  'nav.insights': { en: 'AI Insights', hi: 'AI अंतर्दृष्टि', kn: 'AI ಒಳನೋಟಗಳು' },
  'nav.resources': { en: 'Resources & Health', hi: 'संसाधन और स्वास्थ्य', kn: 'ಸಂಪನ್ಮೂಲಗಳು ಮತ್ತು ಆರೋಗ್ಯ' },
  'nav.analytics': { en: 'Analytics', hi: 'विश्लेषिकी', kn: 'ವಿಶ್ಲೇಷಣೆ' },
  'nav.social': { en: 'Social Signals', hi: 'सामाजिक संकेत', kn: 'ಸಾಮಾಜಿಕ ಸಂಕೇತಗಳು' },
  'nav.alerts': { en: 'Alerts', hi: 'अलर्ट', kn: 'ಎಚ್ಚರಿಕೆಗಳು' },
  'nav.community': { en: 'Community Reports', hi: 'सामुदायिक रिपोर्ट', kn: 'ಸಮುದಾಯ ವರದಿಗಳು' },
  'nav.vaccination': { en: 'Vaccination', hi: 'टीकाकरण', kn: 'ಲಸಿಕೆ' },
  'nav.camps': { en: 'Health Camps', hi: 'स्वास्थ्य शिविर', kn: 'ಆರೋಗ್ಯ ಶಿಬಿರಗಳು' },
  'nav.advisory': { en: 'Health Advisory', hi: 'स्वास्थ्य सलाह', kn: 'ಆರೋಗ್ಯ ಸಲಹೆ' },
  'nav.foodGuide': { en: 'Food Guide', hi: 'खाद्य गाइड', kn: 'ಆಹಾರ ಮಾರ್ಗದರ್ಶಿ' },
  'nav.healthFood': { en: 'Health Food', hi: 'स्वास्थ्य खाद्य', kn: 'ಆರೋಗ್ಯ ಆಹಾರ' },
  'nav.myOrders': { en: 'My Orders', hi: 'मेरे ऑर्डर', kn: 'ನನ್ನ ಆದೇಶಗಳು' },
  'nav.emergency': { en: 'Emergency', hi: 'आपातकाल', kn: 'ತುರ್ತು' },
  'nav.dataSources': { en: 'Data Sources', hi: 'डेटा स्रोत', kn: 'ಡೇಟಾ ಮೂಲಗಳು' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफ़ाइल', kn: 'ಪ್ರೊಫೈಲ್' },
  'nav.knowledge': { en: 'Knowledge Graph', hi: 'ज्ञान ग्राफ़', kn: 'ಜ್ಞಾನ ಗ್ರಾಫ್' },
  'nav.history': { en: 'Prediction History', hi: 'पूर्वानुमान इतिहास', kn: 'ಮುನ್ಸೂಚನೆ ಇತಿಹಾಸ' },
  'nav.signOut': { en: 'Sign Out', hi: 'साइन आउट', kn: 'ಸೈನ್ ಔಟ್' },

  // ─── ADMIN NAV ───
  'nav.overview': { en: 'Overview', hi: 'अवलोकन', kn: 'ಅವಲೋಕನ' },
  'nav.userMgmt': { en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन', kn: 'ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ' },
  'nav.monitoring': { en: 'Disease Monitoring', hi: 'रोग निगरानी', kn: 'ರೋಗ ಮೇಲ್ವಿಚಾರಣೆ' },
  'nav.dataCenter': { en: 'Data Center', hi: 'डेटा केंद्र', kn: 'ಡೇಟಾ ಕೇಂದ್ರ' },
  'nav.aiPredict': { en: 'AI Predictions', hi: 'AI पूर्वानुमान', kn: 'AI ಮುನ್ಸೂಚನೆಗಳು' },
  'nav.foodMgmt': { en: 'Food Management', hi: 'खाद्य प्रबंधन', kn: 'ಆಹಾರ ನಿರ್ವಹಣೆ' },
  'nav.orderMgmt': { en: 'Order Management', hi: 'ऑर्डर प्रबंधन', kn: 'ಆದೇಶ ನಿರ್ವಹಣೆ' },
  'nav.alertMgmt': { en: 'Alert Management', hi: 'अलर्ट प्रबंधन', kn: 'ಎಚ್ಚರಿಕೆ ನಿರ್ವಹಣೆ' },
  'nav.dataset': { en: 'Dataset Manager', hi: 'डेटासेट प्रबंधक', kn: 'ಡೇಟಾಸೆಟ್ ನಿರ್ವಾಹಕ' },
  'nav.reports': { en: 'Reports', hi: 'रिपोर्ट', kn: 'ವರದಿಗಳು' },
  'nav.healthcare': { en: 'Healthcare Resources', hi: 'स्वास्थ्य संसाधन', kn: 'ಆರೋಗ್ಯ ಸಂಪನ್ಮೂಲಗಳು' },
  'nav.activityLogs': { en: 'Activity Logs', hi: 'गतिविधि लॉग', kn: 'ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳು' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  'nav.system': { en: 'System Monitor', hi: 'सिस्टम मॉनिटर', kn: 'ಸಿಸ್ಟಮ್ ಮಾನಿಟರ್' },
  'nav.architecture': { en: 'Architecture', hi: 'वास्तुकला', kn: 'ವಾಸ್ತುಶಿಲ್ಪ' },
  'nav.documentation': { en: 'Documentation', hi: 'प्रलेखन', kn: 'ದಾಖಲೀಕರಣ' },
  'nav.demo': { en: 'Demo Mode', hi: 'डेमो मोड', kn: 'ಡೆಮೋ ಮೋಡ್' },
  'nav.citizenView': { en: 'Citizen View', hi: 'नागरिक दृश्य', kn: 'ನಾಗರಿಕ ವೀಕ್ಷಣೆ' },

  // ─── DASHBOARD ───
  'dash.welcome': { en: 'Welcome back', hi: 'वापस स्वागत है', kn: 'ಮರಳಿ ಸ್ವಾಗತ' },
  'dash.subtitle': { en: 'Your AI-powered health monitoring dashboard', hi: 'आपका AI-संचालित स्वास्थ्य निगरानी डैशबोर्ड', kn: 'ನಿಮ್ಮ AI-ಚಾಲಿತ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'dash.highRisk': { en: 'High Risk Area', hi: 'उच्च जोखिम क्षेत्र', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ ಪ್ರದೇಶ' },
  'dash.mediumRisk': { en: 'Medium Risk Area', hi: 'मध्यम जोखिम क्षेत्र', kn: 'ಮಧ್ಯಮ ಅಪಾಯ ಪ್ರದೇಶ' },
  'dash.lowRisk': { en: 'Low Risk Area', hi: 'कम जोखिम क्षेत्र', kn: 'ಕಡಿಮೆ ಅಪಾಯ ಪ್ರದೇಶ' },
  'dash.totalCases': { en: 'Total Cases', hi: 'कुल मामले', kn: 'ಒಟ್ಟು ಪ್ರಕರಣಗಳು' },
  'dash.activeAlerts': { en: 'Active Alerts', hi: 'सक्रिय अलर्ट', kn: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು' },
  'dash.highRiskRegions': { en: 'High Risk Regions', hi: 'उच्च जोखिम क्षेत्र', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ ಪ್ರದೇಶಗಳು' },
  'dash.predictions': { en: 'Predictions Made', hi: 'किए गए पूर्वानुमान', kn: 'ಮಾಡಿದ ಮುನ್ಸೂಚನೆಗಳು' },
  'dash.registeredUsers': { en: 'Registered Users', hi: 'पंजीकृत उपयोगकर्ता', kn: 'ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು' },
  'dash.dataSources': { en: 'Data Sources', hi: 'डेटा स्रोत', kn: 'ಡೇಟಾ ಮೂಲಗಳು' },
  'dash.foodOrders': { en: 'Food Orders', hi: 'खाद्य ऑर्डर', kn: 'ಆಹಾರ ಆದೇಶಗಳು' },
  'dash.communityReports': { en: 'Community Reports', hi: 'सामुदायिक रिपोर्ट', kn: 'ಸಮುದಾಯ ವರದಿಗಳು' },
  'dash.campRegistrations': { en: 'Camp Registrations', hi: 'शिविर पंजीकरण', kn: 'ಶಿಬಿರ ನೋಂದಣಿಗಳು' },
  'dash.systemOnline': { en: 'System Online', hi: 'सिस्टम ऑनलाइन', kn: 'ಸಿಸ್ಟಮ್ ಆನ್‌ಲೈನ್' },
  'dash.allOperational': { en: 'All Systems Operational', hi: 'सभी सिस्टम चालू', kn: 'ಎಲ್ಲಾ ಸಿಸ್ಟಮ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ' },

  // ─── COMMON ───
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...', kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' },
  'common.noData': { en: 'No data available', hi: 'कोई डेटा उपलब्ध नहीं', kn: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ' },
  'common.submit': { en: 'Submit', hi: 'जमा करें', kn: 'ಸಲ್ಲಿಸಿ' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें', kn: 'ರದ್ದುಮಾಡಿ' },
  'common.save': { en: 'Save', hi: 'सहेजें', kn: 'ಉಳಿಸಿ' },
  'common.delete': { en: 'Delete', hi: 'हटाएं', kn: 'ಅಳಿಸಿ' },
  'common.search': { en: 'Search...', hi: 'खोजें...', kn: 'ಹುಡುಕಿ...' },
  'common.filter': { en: 'Filter', hi: 'फ़िल्टर', kn: 'ಫಿಲ್ಟರ್' },
  'common.all': { en: 'All', hi: 'सभी', kn: 'ಎಲ್ಲಾ' },
  'common.active': { en: 'Active', hi: 'सक्रिय', kn: 'ಸಕ್ರಿಯ' },
  'common.inactive': { en: 'Inactive', hi: 'निष्क्रिय', kn: 'ನಿಷ್ಕ್ರಿಯ' },
  'common.pending': { en: 'Pending', hi: 'लंबित', kn: 'ಬಾಕಿ' },
  'common.resolved': { en: 'Resolved', hi: 'हल किया गया', kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ' },
  'common.error': { en: 'Something went wrong', hi: 'कुछ गलत हो गया', kn: 'ಏನೋ ತಪ್ಪಾಗಿದೆ' },
  'common.retry': { en: 'Retry', hi: 'पुनः प्रयास करें', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' },

  // ─── CHATBOT ───
  'chat.title': { en: 'AI Health Assistant', hi: 'AI स्वास्थ्य सहायक', kn: 'AI ಆರೋಗ್ಯ ಸಹಾಯಕ' },
  'chat.poweredBy': { en: 'Powered by AI • Always available', hi: 'AI द्वारा संचालित • हमेशा उपलब्ध', kn: 'AI-ಚಾಲಿತ • ಯಾವಾಗಲೂ ಲಭ್ಯ' },
  'chat.placeholder': { en: 'Type your health question...', hi: 'अपना स्वास्थ्य प्रश्न टाइप करें...', kn: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...' },
  'chat.welcome': { en: "Hello! I'm your AI Health Assistant. I can help with:\n\n• Disease information (Dengue, Malaria, COVID-19)\n• Symptom checking\n• Prevention tips\n• Nearby hospitals\n• Diet recommendations\n\nHow can I help you today?", hi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। मैं मदद कर सकता हूं:\n\n• रोग जानकारी (डेंगू, मलेरिया, COVID-19)\n• लक्षण जांच\n• रोकथाम के उपाय\n• नज़दीकी अस्पताल\n• आहार सिफारिशें\n\nआज मैं आपकी कैसे मदद कर सकता हूं?", kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n• ರೋಗ ಮಾಹಿತಿ (ಡೆಂಗ್ಯೂ, ಮಲೇರಿಯಾ, COVID-19)\n• ರೋಗಲಕ್ಷಣ ಪರಿಶೀಲನೆ\n• ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು\n• ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳು\n• ಆಹಾರ ಶಿಫಾರಸುಗಳು\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?" },
  'chat.listen': { en: 'Listen', hi: 'सुनें', kn: 'ಕೇಳಿ' },
  'chat.speaking': { en: 'Speaking...', hi: 'बोल रहा है...', kn: 'ಮಾತನಾಡುತ್ತಿದೆ...' },
  'chat.listening': { en: 'Listening...', hi: 'सुन रहा हूं...', kn: 'ಕೇಳುತ್ತಿದೆ...' },
  'chat.micError': { en: 'Microphone not supported', hi: 'माइक्रोफ़ोन समर्थित नहीं', kn: 'ಮೈಕ್ರೊಫೋನ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ' },

  // ─── EMERGENCY ───
  'emergency.title': { en: 'Emergency Contact Numbers', hi: 'आपातकालीन संपर्क नंबर', kn: 'ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳು' },
  'emergency.subtitle': { en: 'Keep these numbers handy at all times', hi: 'इन नंबरों को हमेशा पास रखें', kn: 'ಈ ಸಂಖ್ಯೆಗಳನ್ನು ಯಾವಾಗಲೂ ಹತ್ತಿರ ಇಡಿ' },
  'emergency.firstAid': { en: 'First Aid Guidelines', hi: 'प्राथमिक चिकित्सा दिशानिर्देश', kn: 'ಪ್ರಾಥಮಿಕ ಚಿಕಿತ್ಸೆ ಮಾರ್ಗಸೂಚಿಗಳು' },
  'emergency.firstAidSub': { en: 'Quick response can save lives', hi: 'त्वरित प्रतिक्रिया जान बचा सकती है', kn: 'ತ್ವರಿತ ಪ್ರತಿಕ್ರಿಯೆ ಜೀವ ಉಳಿಸಬಹುದು' },
  'emergency.healthcare': { en: 'Healthcare Support', hi: 'स्वास्थ्य सहायता', kn: 'ಆರೋಗ್ಯ ಬೆಂಬಲ' },
  'emergency.healthcareSub': { en: 'Resources and information', hi: 'संसाधन और जानकारी', kn: 'ಸಂಪನ್ಮೂಲಗಳು ಮತ್ತು ಮಾಹಿತಿ' },

  // ─── LAYOUT ───
  'layout.navigation': { en: 'Navigation', hi: 'नेविगेशन', kn: 'ನ್ಯಾವಿಗೇಶನ್' },
  'layout.adminDashboard': { en: 'Admin Dashboard', hi: 'एडमिन डैशबोर्ड', kn: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'layout.citizenDashboard': { en: 'Citizen Dashboard', hi: 'नागरिक डैशबोर्ड', kn: 'ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'layout.adminControl': { en: 'Admin Control Center', hi: 'एडमिन नियंत्रण केंद्र', kn: 'ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ' },
  'layout.citizenPortal': { en: 'Citizen Health Portal', hi: 'नागरिक स्वास्थ्य पोर्टल', kn: 'ನಾಗರಿಕ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್' },
  'layout.healthCommand': { en: 'Health Command', hi: 'स्वास्थ्य कमांड', kn: 'ಆರೋಗ್ಯ ಕಮಾಂಡ್' },

  // ─── LANGUAGE ───
  'lang.label': { en: 'Language', hi: 'भाषा', kn: 'ಭಾಷೆ' },
  'lang.en': { en: 'English', hi: 'English', kn: 'English' },
  'lang.hi': { en: 'हिन्दी', hi: 'हिन्दी', kn: 'हिन्दी' },
  'lang.kn': { en: 'ಕನ್ನಡ', hi: 'कन्नड', kn: 'ಕನ್ನಡ' },

  // ─── USER DASHBOARD — OVERVIEW ───
  'overview.subtitle': { en: 'Current disease risk predictions for your area', hi: 'आपके क्षेत्र के लिए वर्तमान रोग जोखिम पूर्वानुमान', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕೆ ಪ್ರಸ್ತುತ ರೋಗ ಅಪಾಯ ಮುನ್ಸೂಚನೆಗಳು' },
  'overview.noAlerts': { en: 'No active alerts in your area', hi: 'आपके क्षेत्र में कोई सक्रिय अलर्ट नहीं', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ' },
  'overview.safe': { en: "You're all safe! Stay healthy.", hi: 'आप पूरी तरह सुरक्षित हैं! स्वस्थ रहें।', kn: 'ನೀವು ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ! ಆರೋಗ್ಯವಾಗಿರಿ.' },

  // ─── USER DASHBOARD — RISK MAP ───
  'riskMap.title': { en: 'Risk Map', hi: 'जोखिम मानचित्र', kn: 'ಅಪಾಯ ನಕ್ಷೆ' },
  'riskMap.subtitle': { en: 'Disease hotspots in your region', hi: 'आपके क्षेत्र में रोग हॉटस्पॉट', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ರೋಗ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು' },
  'riskMap.interactive': { en: 'Interactive Risk Map', hi: 'इंटरैक्टिव जोखिम मानचित्र', kn: 'ಸಂವಾದಾತ್ಮಕ ಅಪಾಯ ನಕ್ಷೆ' },
  'riskMap.interactiveSub': { en: 'Disease hotspots and risk zones across India', hi: 'भारत भर में रोग हॉटस्पॉट और जोखिम क्षेत्र', kn: 'ಭಾರತಾದ್ಯಂತ ರೋಗ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಮತ್ತು ಅಪಾಯ ವಲಯಗಳು' },
  'riskMap.highZones': { en: 'High Risk Zones', hi: 'उच्च जोखिम क्षेत्र', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ ವಲಯಗಳು' },
  'riskMap.medZones': { en: 'Medium Risk Zones', hi: 'मध्यम जोखिम क्षेत्र', kn: 'ಮಧ್ಯಮ ಅಪಾಯ ವಲಯಗಳು' },
  'riskMap.lowZones': { en: 'Low Risk Zones', hi: 'कम जोखिम क्षेत्र', kn: 'ಕಡಿಮೆ ಅಪಾಯ ವಲಯಗಳು' },
  'riskMap.regionsIdentified': { en: 'regions identified', hi: 'क्षेत्र पहचाने गए', kn: 'ಪ್ರದೇಶಗಳು ಗುರುತಿಸಲಾಗಿದೆ' },

  // ─── USER DASHBOARD — ALERTS ───
  'alerts.recentTitle': { en: 'Recent Alerts', hi: 'हाल के अलर्ट', kn: 'ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು' },
  'alerts.recentSub': { en: 'Stay informed about nearby health risks', hi: 'आस-पास के स्वास्थ्य जोखिमों के बारे में सूचित रहें', kn: 'ಸಮೀಪದ ಆರೋಗ್ಯ ಅಪಾಯಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ' },
  'alerts.center': { en: 'Alert Center', hi: 'अलर्ट केंद्र', kn: 'ಎಚ್ಚರಿಕೆ ಕೇಂದ್ರ' },
  'alerts.activeCount': { en: 'active alerts in your region', hi: 'आपके क्षेत्र में सक्रिय अलर्ट', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು' },
  'alerts.sendEmail': { en: 'Send Email Alert', hi: 'ईमेल अलर्ट भेजें', kn: 'ಇಮೇಲ್ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ' },
  'alerts.sending': { en: 'Sending...', hi: 'भेजा जा रहा है...', kn: 'ಕಳುಹಿಸುತ್ತಿದೆ...' },
  'alerts.emailSent': { en: 'Email Sent!', hi: 'ईमेल भेजा गया!', kn: 'ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗಿದೆ!' },
  'alerts.allClear': { en: 'All Clear!', hi: 'सब साफ़!', kn: 'ಎಲ್ಲಾ ಸ್ಪಷ್ಟ!' },
  'alerts.noAlertsMsg': { en: 'No active health alerts in your area. Stay safe!', hi: 'आपके क्षेत्र में कोई सक्रिय स्वास्थ्य अलर्ट नहीं। सुरक्षित रहें!', kn: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ. ಸುರಕ್ಷಿತವಾಗಿರಿ!' },

  // ─── USER DASHBOARD — PREDICTIONS ───
  'pred.riskAssessment': { en: 'Risk Assessment', hi: 'जोखिम मूल्यांकन', kn: 'ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ' },
  'pred.outbreakProb': { en: 'Outbreak Probability', hi: 'प्रकोप की संभावना', kn: 'ಪ್ರಕೋಪದ ಸಂಭವನೀಯತೆ' },
  'pred.confidence': { en: 'Confidence Score', hi: 'विश्वास स्कोर', kn: 'ವಿಶ್ವಾಸ ಸ್ಕೋರ್' },
  'pred.details': { en: 'Prediction Details', hi: 'पूर्वानुमान विवरण', kn: 'ಮುನ್ಸೂಚನೆ ವಿವರಗಳು' },
  'pred.explanation': { en: 'Explanation', hi: 'व्याख्या', kn: 'ವಿವರಣೆ' },
  'pred.explanationText': { en: 'Risk analysis based on integrated multi-source data including weather patterns, satellite imagery, population density, and historical disease records.', hi: 'मौसम पैटर्न, उपग्रह चित्र, जनसंख्या घनत्व, और ऐतिहासिक रोग रिकॉर्ड सहित एकीकृत बहु-स्रोत डेटा के आधार पर जोखिम विश्लेषण।', kn: 'ಹವಾಮಾನ ಮಾದರಿಗಳು, ಉಪಗ್ರಹ ಚಿತ್ರಗಳು, ಜನಸಂಖ್ಯಾ ಸಾಂದ್ರತೆ ಮತ್ತು ಐತಿಹಾಸಿಕ ರೋಗ ದಾಖಲೆಗಳನ್ನು ಒಳಗೊಂಡ ಸಂಯೋಜಿತ ಬಹು-ಮೂಲ ಡೇಟಾದ ಆಧಾರದ ಮೇಲೆ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ.' },
  'pred.keySymptoms': { en: 'Key Symptoms', hi: 'प्रमुख लक्षण', kn: 'ಪ್ರಮುಖ ರೋಗಲಕ್ಷಣಗಳು' },
  'pred.prevention': { en: 'Prevention Measures', hi: 'रोकथाम के उपाय', kn: 'ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು' },
  'pred.allPredictions': { en: 'All Disease Predictions', hi: 'सभी रोग पूर्वानुमान', kn: 'ಎಲ್ಲಾ ರೋಗ ಮುನ್ಸೂಚನೆಗಳು' },
  'pred.probability': { en: 'probability', hi: 'संभावना', kn: 'ಸಂಭವನೀಯತೆ' },

  // ─── USER DASHBOARD — ANALYTICS ───
  'analytics.trend': { en: 'Disease Trend (Monthly)', hi: 'रोग प्रवृत्ति (मासिक)', kn: 'ರೋಗ ಪ್ರವೃತ್ತಿ (ಮಾಸಿಕ)' },
  'analytics.trendSub': { en: 'Cases over the past 12 months', hi: 'पिछले 12 महीनों में मामले', kn: 'ಕಳೆದ 12 ತಿಂಗಳುಗಳಲ್ಲಿ ಪ್ರಕರಣಗಳು' },
  'analytics.distribution': { en: 'Total Cases Distribution', hi: 'कुल मामलों का वितरण', kn: 'ಒಟ್ಟು ಪ್ರಕರಣಗಳ ವಿತರಣೆ' },
  'analytics.distribSub': { en: 'Aggregate disease burden', hi: 'समग्र रोग भार', kn: 'ಒಟ್ಟು ರೋಗ ಹೊರೆ' },
  'analytics.outbreakHist': { en: 'Monthly Outbreak History', hi: 'मासिक प्रकोप इतिहास', kn: 'ಮಾಸಿಕ ಪ್ರಕೋಪ ಇತಿಹಾಸ' },
  'analytics.outbreakSub': { en: 'Peak season analysis', hi: 'शिखर मौसम विश्लेषण', kn: 'ಗರಿಷ್ಠ ಋತು ವಿಶ್ಲೇಷಣೆ' },
  'analytics.radar': { en: 'Risk Comparison Radar', hi: 'जोखिम तुलना रडार', kn: 'ಅಪಾಯ ಹೋಲಿಕೆ ರಾಡಾರ್' },
  'analytics.radarSub': { en: 'Multi-factor risk analysis', hi: 'बहु-कारक जोखिम विश्लेषण', kn: 'ಬಹು-ಅಂಶ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ' },

  // ─── USER DASHBOARD — HOSPITALS ───
  'hosp.title': { en: 'Emergency Services', hi: 'आपातकालीन सेवाएं', kn: 'ತುರ್ತು ಸೇವೆಗಳು' },
  'hosp.subtitle': { en: 'Nearby hospitals with real-time bed availability', hi: 'रीयल-टाइम बेड उपलब्धता के साथ नज़दीकी अस्पताल', kn: 'ನೈಜ-ಸಮಯದ ಹಾಸಿಗೆ ಲಭ್ಯತೆಯೊಂದಿಗೆ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳು' },
  'hosp.nearby': { en: 'Nearby hospitals', hi: 'नज़दीकी अस्पताल', kn: 'ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳು' },

  // ─── USER DASHBOARD — ADVISORY ───
  'advisory.subtitle': { en: 'Personalized recommendations based on current risk', hi: 'वर्तमान जोखिम के आधार पर व्यक्तिगत सिफारिशें', kn: 'ಪ್ರಸ್ತುತ ಅಪಾಯದ ಆಧಾರದ ಮೇಲೆ ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳು' },
  'advisory.recommendations': { en: 'Health Recommendations', hi: 'स्वास्थ्य सिफारिशें', kn: 'ಆರೋಗ್ಯ ಶಿಫಾರಸುಗಳು' },
  'advisory.preventionTips': { en: 'Prevention Tips', hi: 'रोकथाम के सुझाव', kn: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು' },
  'advisory.symptoms': { en: 'Common Symptoms', hi: 'सामान्य लक्षण', kn: 'ಸಾಮಾನ್ಯ ರೋಗಲಕ್ಷಣಗಳು' },
  'advisory.dietary': { en: 'Dietary Advice', hi: 'आहार सलाह', kn: 'ಆಹಾರ ಸಲಹೆ' },
  'advisory.foodRecommend': { en: 'Recommended Foods', hi: 'अनुशंसित खाद्य पदार्थ', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಆಹಾರಗಳು' },
  'advisory.avoid': { en: 'Foods to Avoid', hi: 'बचने वाले खाद्य पदार्थ', kn: 'ತಪ್ಪಿಸಬೇಕಾದ ಆಹಾರಗಳು' },

  // ─── USER DASHBOARD — RESOURCES ───
  'resources.subtitle': { en: 'Educational resources and health guides', hi: 'शैक्षिक संसाधन और स्वास्थ्य गाइड', kn: 'ಶೈಕ್ಷಣಿಕ ಸಂಪನ್ಮೂಲಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿಗಳು' },
  'resources.learnMore': { en: 'Learn More', hi: 'अधिक जानें', kn: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ' },

  // ─── USER DASHBOARD — INSIGHTS ───
  'insights.subtitle': { en: 'AI-powered health recommendations', hi: 'AI-संचालित स्वास्थ्य सिफारिशें', kn: 'AI-ಚಾಲಿತ ಆರೋಗ್ಯ ಶಿಫಾರಸುಗಳು' },

  // ─── USER DASHBOARD — SOCIAL ───
  'social.subtitle': { en: 'Social media health signal monitoring', hi: 'सोशल मीडिया स्वास्थ्य संकेत निगरानी', kn: 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಆರೋಗ್ಯ ಸಂಕೇತ ಮೇಲ್ವಿಚಾರಣೆ' },
  'social.totalMentions': { en: 'Total Mentions', hi: 'कुल उल्लेख', kn: 'ಒಟ್ಟು ಉಲ್ಲೇಖಗಳು' },
  'social.sources': { en: 'Sources Monitored', hi: 'निगरानी किए गए स्रोत', kn: 'ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿದ ಮೂಲಗಳು' },
  'social.sentiment': { en: 'Sentiment Analysis', hi: 'भावना विश्लेषण', kn: 'ಭಾವನೆ ವಿಶ್ಲೇಷಣೆ' },
  'social.trending': { en: 'Trending Keywords', hi: 'ट्रेंडिंग कीवर्ड', kn: 'ಟ್ರೆಂಡಿಂಗ್ ಕೀವರ್ಡ್‌ಗಳು' },

  // ─── USER — KNOWLEDGE GRAPH ───
  'kg.subtitle': { en: 'Interactive visualization of disease relationships, symptoms, prevention & dietary guidance', hi: 'रोग संबंधों, लक्षणों, रोकथाम और आहार मार्गदर्शन का इंटरैक्टिव विज़ुअलाइज़ेशन', kn: 'ರೋಗ ಸಂಬಂಧಗಳು, ರೋಗಲಕ್ಷಣಗಳು, ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಆಹಾರ ಮಾರ್ಗದರ್ಶನದ ಸಂವಾದಾತ್ಮಕ ದೃಶ್ಯೀಕರಣ' },
  'kg.clickNode': { en: 'Click any node to see details', hi: 'विवरण देखने के लिए किसी भी नोड पर क्लिक करें', kn: 'ವಿವರಗಳನ್ನು ನೋಡಲು ಯಾವುದೇ ನೋಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ' },
  'kg.disease': { en: 'Disease', hi: 'रोग', kn: 'ರೋಗ' },
  'kg.symptom': { en: 'Symptom', hi: 'लक्षण', kn: 'ರೋಗಲಕ್ಷಣ' },
  'kg.weather': { en: 'Weather Factor', hi: 'मौसम कारक', kn: 'ಹವಾಮಾನ ಅಂಶ' },
  'kg.preventionNode': { en: 'Prevention', hi: 'रोकथाम', kn: 'ತಡೆಗಟ್ಟುವಿಕೆ' },
  'kg.food': { en: 'Food / Diet', hi: 'खाद्य / आहार', kn: 'ಆಹಾರ / ಡಯಟ್' },
  'kg.connectedTo': { en: 'Connected To', hi: 'से जुड़ा', kn: 'ಸಂಪರ್ಕಿತ' },
  'kg.details': { en: 'Node Details', hi: 'नोड विवरण', kn: 'ನೋಡ್ ವಿವರಗಳು' },
  'kg.selectNode': { en: 'Select a node to view details', hi: 'विवरण देखने के लिए एक नोड चुनें', kn: 'ವಿವರಗಳನ್ನು ನೋಡಲು ನೋಡ್ ಆಯ್ಕೆಮಾಡಿ' },

  // ─── USER — PREDICTION HISTORY ───
  'hist.subtitle': { en: 'Track your past health risk assessments and view trends over time', hi: 'अपने पिछले स्वास्थ्य जोखिम मूल्यांकन ट्रैक करें और समय के साथ रुझान देखें', kn: 'ನಿಮ್ಮ ಹಿಂದಿನ ಆರೋಗ್ಯ ಅಪಾಯ ಮೌಲ್ಯಮಾಪನಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಸಮಯದೊಂದಿಗೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ನೋಡಿ' },
  'hist.total': { en: 'Total Predictions', hi: 'कुल पूर्वानुमान', kn: 'ಒಟ್ಟು ಮುನ್ಸೂಚನೆಗಳು' },
  'hist.highCount': { en: 'High Risk', hi: 'उच्च जोखिम', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' },
  'hist.lowCount': { en: 'Low Risk', hi: 'कम जोखिम', kn: 'ಕಡಿಮೆ ಅಪಾಯ' },
  'hist.trend': { en: 'Risk Level Trend Over Time', hi: 'समय के साथ जोखिम स्तर प्रवृत्ति', kn: 'ಸಮಯದೊಂದಿಗೆ ಅಪಾಯ ಮಟ್ಟ ಪ್ರವೃತ್ತಿ' },
  'hist.yourHistory': { en: 'Your Prediction Records', hi: 'आपके पूर्वानुमान रिकॉर्ड', kn: 'ನಿಮ್ಮ ಮುನ್ಸೂಚನೆ ದಾಖಲೆಗಳು' },
  'hist.noHistory': { en: 'No prediction history available yet.', hi: 'अभी तक कोई पूर्वानुमान इतिहास उपलब्ध नहीं है।', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಮುನ್ಸೂಚನೆ ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ.' },
  'hist.date': { en: 'Date', hi: 'तारीख', kn: 'ದಿನಾಂಕ' },
  'hist.disease': { en: 'Disease', hi: 'रोग', kn: 'ರೋಗ' },
  'hist.riskLevel': { en: 'Risk Level', hi: 'जोखिम स्तर', kn: 'ಅಪಾಯ ಮಟ್ಟ' },
  'hist.probability': { en: 'Probability', hi: 'संभावना', kn: 'ಸಂಭವನೀಯತೆ' },
  'hist.actions': { en: 'Actions', hi: 'कार्रवाई', kn: 'ಕ್ರಿಯೆಗಳು' },

  // ─── USER — COMMUNITY REPORTS ───
  'comm.title': { en: 'Community Health Reports', hi: 'सामुदायिक स्वास्थ्य रिपोर्ट', kn: 'ಸಮುದಾಯ ಆರೋಗ್ಯ ವರದಿಗಳು' },
  'comm.subtitle': { en: 'Report and track local health hazards in your community', hi: 'अपने समुदाय में स्थानीय स्वास्थ्य खतरों की रिपोर्ट और ट्रैक करें', kn: 'ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಅಪಾಯಗಳನ್ನು ವರದಿ ಮಾಡಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' },
  'comm.submitReport': { en: 'Submit a Health Report', hi: 'स्वास्थ्य रिपोर्ट जमा करें', kn: 'ಆರೋಗ್ಯ ವರದಿ ಸಲ್ಲಿಸಿ' },
  'comm.reportTitle': { en: 'Report Title', hi: 'रिपोर्ट शीर्षक', kn: 'ವರದಿ ಶೀರ್ಷಿಕೆ' },
  'comm.description': { en: 'Description', hi: 'विवरण', kn: 'ವಿವರಣೆ' },
  'comm.location': { en: 'Location', hi: 'स्थान', kn: 'ಸ್ಥಳ' },
  'comm.category': { en: 'Category', hi: 'श्रेणी', kn: 'ವರ್ಗ' },
  'comm.recentReports': { en: 'Recent Community Reports', hi: 'हाल की सामुदायिक रिपोर्ट', kn: 'ಇತ್ತೀಚಿನ ಸಮುದಾಯ ವರದಿಗಳು' },
  'comm.noReports': { en: 'No community reports yet. Be the first to submit!', hi: 'अभी तक कोई सामुदायिक रिपोर्ट नहीं। पहले जमा करें!', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸಮುದಾಯ ವರದಿಗಳಿಲ್ಲ. ಮೊದಲಿಗರಾಗಿ ಸಲ್ಲಿಸಿ!' },
  'comm.water': { en: 'Water Issue', hi: 'पानी की समस्या', kn: 'ನೀರಿನ ಸಮಸ್ಯೆ' },
  'comm.air': { en: 'Air Quality', hi: 'वायु गुणवत्ता', kn: 'ಗಾಳಿ ಗುಣಮಟ್ಟ' },
  'comm.disease': { en: 'Disease Outbreak', hi: 'रोग प्रकोप', kn: 'ರೋಗ ಪ್ರಕೋಪ' },
  'comm.sanitation': { en: 'Sanitation', hi: 'स्वच्छता', kn: 'ನೈರ್ಮಲ್ಯ' },
  'comm.other': { en: 'Other', hi: 'अन्य', kn: 'ಇತರೆ' },
  'comm.upvotes': { en: 'upvotes', hi: 'अपवोट', kn: 'ಅಪ್‌ವೋಟ್‌ಗಳು' },

  // ─── USER — VACCINATION ───
  'vacc.title': { en: 'Vaccination Tracker', hi: 'टीकाकरण ट्रैकर', kn: 'ಲಸಿಕೆ ಟ್ರ್ಯಾಕರ್' },
  'vacc.addRecord': { en: 'Add Vaccination Record', hi: 'टीकाकरण रिकॉर्ड जोड़ें', kn: 'ಲಸಿಕೆ ದಾಖಲೆ ಸೇರಿಸಿ' },
  'vacc.vaccineName': { en: 'Vaccine Name', hi: 'टीके का नाम', kn: 'ಲಸಿಕೆ ಹೆಸರು' },
  'vacc.vaccinationDate': { en: 'Vaccination Date', hi: 'टीकाकरण तिथि', kn: 'ಲಸಿಕೆ ದಿನಾಂಕ' },
  'vacc.hospital': { en: 'Hospital / Clinic', hi: 'अस्पताल / क्लिनिक', kn: 'ಆಸ್ಪತ್ರೆ / ಕ್ಲಿನಿಕ್' },
  'vacc.doseNumber': { en: 'Dose Number', hi: 'खुराक संख्या', kn: 'ಡೋಸ್ ಸಂಖ್ಯೆ' },
  'vacc.myRecords': { en: 'My Vaccination Records', hi: 'मेरे टीकाकरण रिकॉर्ड', kn: 'ನನ್ನ ಲಸಿಕೆ ದಾಖಲೆಗಳು' },
  'vacc.noRecords': { en: 'No vaccination records yet.', hi: 'अभी तक कोई टीकाकरण रिकॉर्ड नहीं।', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಲಸಿಕೆ ದಾಖಲೆಗಳಿಲ್ಲ.' },
  'vacc.totalVaccines': { en: 'Total Vaccines', hi: 'कुल टीके', kn: 'ಒಟ್ಟು ಲಸಿಕೆಗಳು' },
  'vacc.lastVaccine': { en: 'Last Vaccine', hi: 'अंतिम टीका', kn: 'ಕೊನೆಯ ಲಸಿಕೆ' },
  'vacc.schedule': { en: 'Recommended Schedule', hi: 'अनुशंसित कार्यक्रम', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ವೇಳಾಪಟ್ಟಿ' },

  // ─── USER — HEALTH CAMPS ───
  'camps.title': { en: 'Health Camps & Events', hi: 'स्वास्थ्य शिविर और कार्यक्रम', kn: 'ಆರೋಗ್ಯ ಶಿಬಿರಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು' },
  'camps.upcoming': { en: 'Upcoming Health Camps', hi: 'आगामी स्वास्थ्य शिविर', kn: 'ಮುಂಬರುವ ಆರೋಗ್ಯ ಶಿಬಿರಗಳು' },
  'camps.noCamps': { en: 'No upcoming health camps scheduled.', hi: 'कोई आगामी स्वास्थ्य शिविर निर्धारित नहीं है।', kn: 'ಯಾವುದೇ ಮುಂಬರುವ ಆರೋಗ್ಯ ಶಿಬಿರಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ.' },
  'camps.register': { en: 'Register', hi: 'पंजीकरण करें', kn: 'ನೋಂದಣಿ ಮಾಡಿ' },
  'camps.registered': { en: 'Registered', hi: 'पंजीकृत', kn: 'ನೋಂದಾಯಿತ' },
  'camps.myRegs': { en: 'My Registrations', hi: 'मेरे पंजीकरण', kn: 'ನನ್ನ ನೋಂದಣಿಗಳು' },
  'camps.date': { en: 'Date', hi: 'तारीख', kn: 'ದಿನಾಂಕ' },
  'camps.time': { en: 'Time', hi: 'समय', kn: 'ಸಮಯ' },
  'camps.registrants': { en: 'Registrants', hi: 'पंजीकरणकर्ता', kn: 'ನೋಂದಣಿದಾರರು' },

  // ─── USER — FOOD ───
  'food.subtitle': { en: 'Seasonal health food recommendations', hi: 'मौसमी स्वास्थ्य खाद्य सिफारिशें', kn: 'ಋತುಮಾನದ ಆರೋಗ್ಯ ಆಹಾರ ಶಿಫಾರಸುಗಳು' },
  'food.category': { en: 'Food Category', hi: 'खाद्य श्रेणी', kn: 'ಆಹಾರ ವರ್ಗ' },
  'food.benefits': { en: 'Benefits', hi: 'लाभ', kn: 'ಪ್ರಯೋಜನಗಳು' },
  'food.addFood': { en: 'Add Food Item', hi: 'खाद्य वस्तु जोड़ें', kn: 'ಆಹಾರ ಪದಾರ್ಥ ಸೇರಿಸಿ' },
  'food.name': { en: 'Food Name', hi: 'खाद्य नाम', kn: 'ಆಹಾರ ಹೆಸರು' },
  'food.description': { en: 'Description', hi: 'विवरण', kn: 'ವಿವರಣೆ' },
  'food.season': { en: 'Season', hi: 'मौसम', kn: 'ಋತು' },
  'food.price': { en: 'Price', hi: 'मूल्य', kn: 'ಬೆಲೆ' },
  'food.order': { en: 'Order Now', hi: 'अभी ऑर्डर करें', kn: 'ಈಗ ಆದೇಶಿಸಿ' },

  // ─── USER — ORDERS ───
  'orders.myOrders': { en: 'My Food Orders', hi: 'मेरे खाद्य ऑर्डर', kn: 'ನನ್ನ ಆಹಾರ ಆದೇಶಗಳು' },
  'orders.noOrders': { en: 'No orders placed yet.', hi: 'अभी तक कोई ऑर्डर नहीं दिया गया।', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಆದೇಶಗಳನ್ನು ನೀಡಿಲ್ಲ.' },
  'orders.totalSpent': { en: 'Total Spent', hi: 'कुल खर्च', kn: 'ಒಟ್ಟು ಖರ್ಚು' },
  'orders.orderedOn': { en: 'Ordered on', hi: 'को ऑर्डर किया', kn: 'ಆದೇಶಿಸಿದ ದಿನಾಂಕ' },

  // ─── USER — EMERGENCY ───
  'emg.quickDial': { en: 'Quick Dial', hi: 'त्वरित डायल', kn: 'ತ್ವರಿತ ಡಯಲ್' },
  'emg.callNow': { en: 'Call Now', hi: 'अभी कॉल करें', kn: 'ಈಗ ಕರೆ ಮಾಡಿ' },

  // ─── ADMIN — OVERVIEW ───
  'admin.overviewSub': { en: 'System-wide monitoring dashboard', hi: 'सिस्टम-व्यापी निगरानी डैशबोर्ड', kn: 'ಸಿಸ್ಟಮ್-ವ್ಯಾಪಿ ಮೇಲ್ವಿಚಾರಣೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'admin.diseaseRecords': { en: 'Disease Records', hi: 'रोग रिकॉर्ड', kn: 'ರೋಗ ದಾಖಲೆಗಳು' },
  'admin.campRegs': { en: 'Camp Registrations', hi: 'शिविर पंजीकरण', kn: 'ಶಿಬಿರ ನೋಂದಣಿಗಳು' },
  'admin.recentActivity': { en: 'Recent Activity', hi: 'हाल की गतिविधि', kn: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ' },
  'admin.weatherSummary': { en: 'Weather Summary', hi: 'मौसम सारांश', kn: 'ಹವಾಮಾನ ಸಾರಾಂಶ' },
  'admin.avgTemp': { en: 'Avg Temperature', hi: 'औसत तापमान', kn: 'ಸರಾಸರಿ ತಾಪಮಾನ' },
  'admin.avgHumidity': { en: 'Avg Humidity', hi: 'औसत आर्द्रता', kn: 'ಸರಾಸರಿ ಆರ್ದ್ರತೆ' },
  'admin.avgRain': { en: 'Avg Rainfall', hi: 'औसत वर्षा', kn: 'ಸರಾಸರಿ ಮಳೆ' },
  'admin.today': { en: 'Today', hi: 'आज', kn: 'ಇಂದು' },
  'admin.thisWeek': { en: 'This Week', hi: 'इस सप्ताह', kn: 'ಈ ವಾರ' },
  'admin.newUsers': { en: 'New Users', hi: 'नए उपयोगकर्ता', kn: 'ಹೊಸ ಬಳಕೆದಾರರು' },
  'admin.newPredictions': { en: 'New Predictions', hi: 'नए पूर्वानुमान', kn: 'ಹೊಸ ಮುನ್ಸೂಚನೆಗಳು' },

  // ─── ADMIN — DATA CENTER ───
  'data.title': { en: 'Data Management Center', hi: 'डेटा प्रबंधन केंद्र', kn: 'ಡೇಟಾ ನಿರ್ವಹಣೆ ಕೇಂದ್ರ' },
  'data.importData': { en: 'Import Data', hi: 'डेटा आयात करें', kn: 'ಡೇಟಾ ಆಮದು ಮಾಡಿ' },
  'data.source': { en: 'Data Source', hi: 'डेटा स्रोत', kn: 'ಡೇಟಾ ಮೂಲ' },
  'data.selectSource': { en: 'Select data source...', hi: 'डेटा स्रोत चुनें...', kn: 'ಡೇಟಾ ಮೂಲ ಆಯ್ಕೆಮಾಡಿ...' },
  'data.file': { en: 'Select File (CSV/JSON)', hi: 'फ़ाइल चुनें (CSV/JSON)', kn: 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (CSV/JSON)' },
  'data.importing': { en: 'Importing...', hi: 'आयात हो रहा है...', kn: 'ಆಮದು ಮಾಡುತ್ತಿದೆ...' },
  'data.noRecords': { en: 'No records found', hi: 'कोई रिकॉर्ड नहीं मिला', kn: 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'data.showing': { en: 'Showing', hi: 'दिखा रहा है', kn: 'ತೋರಿಸುತ್ತಿದೆ' },
  'data.of': { en: 'of', hi: 'में से', kn: 'ರಲ್ಲಿ' },
  'data.records': { en: 'records', hi: 'रिकॉर्ड', kn: 'ದಾಖಲೆಗಳು' },

  // ─── ADMIN — AI PREDICTIONS ───
  'aiPred.runModel': { en: 'Run AI Model', hi: 'AI मॉडल चलाएं', kn: 'AI ಮಾದರಿ ಚಲಾಯಿಸಿ' },
  'aiPred.running': { en: 'Running...', hi: 'चल रहा है...', kn: 'ಚಲಾಯಿಸುತ್ತಿದೆ...' },
  'aiPred.latestPred': { en: 'Latest Predictions', hi: 'नवीनतम पूर्वानुमान', kn: 'ಇತ್ತೀಚಿನ ಮುನ್ಸೂಚನೆಗಳು' },
  'aiPred.modelPerformance': { en: 'Model Performance', hi: 'मॉडल प्रदर्शन', kn: 'ಮಾದರಿ ಕಾರ್ಯಕ್ಷಮತೆ' },
  'aiPred.accuracy': { en: 'Accuracy', hi: 'सटीकता', kn: 'ನಿಖರತೆ' },

  // ─── ADMIN — FORECASTING ───
  'forecast.title': { en: 'Disease Forecasting', hi: 'रोग पूर्वानुमान', kn: 'ರೋಗ ಮುನ್ಸೂಚನೆ' },
  'forecast.runForecast': { en: 'Run Forecast', hi: 'पूर्वानुमान चलाएं', kn: 'ಮುನ್ಸೂಚನೆ ಚಲಾಯಿಸಿ' },
  'forecast.period': { en: 'Forecast Period (Days)', hi: 'पूर्वानुमान अवधि (दिन)', kn: 'ಮುನ್ಸೂಚನೆ ಅವಧಿ (ದಿನಗಳು)' },
  'forecast.seasonal': { en: 'Seasonal Risk Forecast', hi: 'मौसमी जोखिम पूर्वानुमान', kn: 'ಋತುಮಾನದ ಅಪಾಯ ಮುನ್ಸೂಚನೆ' },
  'forecast.noData': { en: 'Run a forecast to see predictions', hi: 'पूर्वानुमान देखने के लिए फोरकास्ट चलाएं', kn: 'ಮುನ್ಸೂಚನೆಗಳನ್ನು ನೋಡಲು ಫೋರ್‌ಕಾಸ್ಟ್ ಚಲಾಯಿಸಿ' },

  // ─── ADMIN — SPREAD SIMULATION ───
  'spread.title': { en: 'Disease Spread Simulation', hi: 'रोग फैलाव सिमुलेशन', kn: 'ರೋಗ ಹರಡುವಿಕೆ ಸಿಮ್ಯುಲೇಶನ್' },
  'spread.radius': { en: 'Spread Radius (km)', hi: 'फैलाव त्रिज्या (किमी)', kn: 'ಹರಡುವಿಕೆ ತ್ರಿಜ್ಯ (ಕಿಮೀ)' },
  'spread.speed': { en: 'Speed', hi: 'गति', kn: 'ವೇಗ' },

  // ─── ADMIN — EXPLAINABLE AI ───
  'xai.title': { en: 'Explainable AI (SHAP Analysis)', hi: 'व्याख्यात्मक AI (SHAP विश्लेषण)', kn: 'ವಿವರಣಾತ್ಮಕ AI (SHAP ವಿಶ್ಲೇಷಣೆ)' },
  'xai.subtitle': { en: 'Understanding feature importance in disease predictions', hi: 'रोग पूर्वानुमान में फीचर महत्व को समझना', kn: 'ರೋಗ ಮುನ್ಸೂಚನೆಗಳಲ್ಲಿ ವೈಶಿಷ್ಟ್ಯ ಪ್ರಾಮುಖ್ಯತೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು' },
  'xai.generate': { en: 'Generate SHAP Analysis', hi: 'SHAP विश्लेषण उत्पन्न करें', kn: 'SHAP ವಿಶ್ಲೇಷಣೆ ರಚಿಸಿ' },

  // ─── ADMIN — ML MODELS ───
  'ml.title': { en: 'ML Model Comparison', hi: 'ML मॉडल तुलना', kn: 'ML ಮಾದರಿ ಹೋಲಿಕೆ' },
  'ml.modelName': { en: 'Model', hi: 'मॉडल', kn: 'ಮಾದರಿ' },
  'ml.precision': { en: 'Precision', hi: 'परिशुद्धता', kn: 'ನಿಖರತೆ' },
  'ml.recall': { en: 'Recall', hi: 'रिकॉल', kn: 'ರಿಕಾಲ್' },
  'ml.f1': { en: 'F1 Score', hi: 'F1 स्कोर', kn: 'F1 ಸ್ಕೋರ್' },
  'ml.auc': { en: 'AUC-ROC', hi: 'AUC-ROC', kn: 'AUC-ROC' },
  'ml.trainTime': { en: 'Training Time', hi: 'प्रशिक्षण समय', kn: 'ತರಬೇತಿ ಸಮಯ' },

  // ─── ADMIN — USER MGMT ───
  'users.title': { en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन', kn: 'ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ' },
  'users.totalUsers': { en: 'Total Users', hi: 'कुल उपयोगकर्ता', kn: 'ಒಟ್ಟು ಬಳಕೆದಾರರು' },
  'users.role': { en: 'Role', hi: 'भूमिका', kn: 'ಪಾತ್ರ' },
  'users.email': { en: 'Email', hi: 'ईमेल', kn: 'ಇಮೇಲ್' },
  'users.joined': { en: 'Joined', hi: 'शामिल हुए', kn: 'ಸೇರಿದ ದಿನಾಂಕ' },

  // ─── ADMIN — MONITORING ───
  'monitor.title': { en: 'Disease Surveillance & Monitoring', hi: 'रोग निगरानी और मॉनिटरिंग', kn: 'ರೋಗ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಮಾನಿಟರಿಂಗ್' },
  'monitor.heatmap': { en: 'Disease Outbreak Heatmap', hi: 'रोग प्रकोप हीटमैप', kn: 'ರೋಗ ಪ್ರಕೋಪ ಹೀಟ್‌ಮ್ಯಾಪ್' },
  'monitor.severity': { en: 'Severity Distribution', hi: 'गंभीरता वितरण', kn: 'ತೀವ್ರತೆ ವಿತರಣೆ' },
  'monitor.trends': { en: 'Disease Trends Over Time', hi: 'समय के साथ रोग प्रवृत्ति', kn: 'ಸಮಯದೊಂದಿಗೆ ರೋಗ ಪ್ರವೃತ್ತಿಗಳು' },
  'monitor.monthly': { en: 'Monthly Cases', hi: 'मासिक मामले', kn: 'ಮಾಸಿಕ ಪ್ರಕರಣಗಳು' },

  // ─── ADMIN — DEMO MODE ───
  'demo.title': { en: 'Demo Data Seeder', hi: 'डेमो डेटा सीडर', kn: 'ಡೆಮೋ ಡೇಟಾ ಸೀಡರ್' },
  'demo.desc': { en: 'Populate the system with sample data for presentations and testing', hi: 'प्रस्तुतीकरण और परीक्षण के लिए सिस्टम को नमूना डेटा से भरें', kn: 'ಪ್ರಸ್ತುತಿ ಮತ್ತು ಪರೀಕ್ಷೆಗಾಗಿ ಸಿಸ್ಟಮ್ ಅನ್ನು ಮಾದರಿ ಡೇಟಾದಿಂದ ಭರ್ತಿ ಮಾಡಿ' },
  'demo.seed': { en: 'Seed Demo Data', hi: 'डेमो डेटा सीड करें', kn: 'ಡೆಮೋ ಡೇಟಾ ಸೀಡ್ ಮಾಡಿ' },
  'demo.seeding': { en: 'Seeding...', hi: 'सीड हो रहा है...', kn: 'ಸೀಡ್ ಮಾಡುತ್ತಿದೆ...' },
  'demo.success': { en: 'Demo data seeded successfully!', hi: 'डेमो डेटा सफलतापूर्वक सीड किया गया!', kn: 'ಡೆಮೋ ಡೇಟಾ ಯಶಸ್ವಿಯಾಗಿ ಸೀಡ್ ಆಗಿದೆ!' },

  // ─── ADMIN — FOOD MGMT ───
  'foodMgmt.title': { en: 'Food Management', hi: 'खाद्य प्रबंधन', kn: 'ಆಹಾರ ನಿರ್ವಹಣೆ' },
  'foodMgmt.addFood': { en: 'Add Food Item', hi: 'खाद्य वस्तु जोड़ें', kn: 'ಆಹಾರ ಪದಾರ್ಥ ಸೇರಿಸಿ' },

  // ─── ADMIN — ORDER MGMT ───
  'orderMgmt.title': { en: 'Order Management', hi: 'ऑर्डर प्रबंधन', kn: 'ಆದೇಶ ನಿರ್ವಹಣೆ' },
  'orderMgmt.allOrders': { en: 'All Orders', hi: 'सभी ऑर्डर', kn: 'ಎಲ್ಲಾ ಆದೇಶಗಳು' },

  // ─── ADMIN — ALERT MGMT ───
  'alertMgmt.title': { en: 'Alert Management', hi: 'अलर्ट प्रबंधन', kn: 'ಎಚ್ಚರಿಕೆ ನಿರ್ವಹಣೆ' },
  'alertMgmt.active': { en: 'Active Alerts', hi: 'सक्रिय अलर्ट', kn: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು' },

  // ─── ADMIN — HEALTHCARE ───
  'healthcare.title': { en: 'Healthcare Resources', hi: 'स्वास्थ्य संसाधन', kn: 'ಆರೋಗ್ಯ ಸಂಪನ್ಮೂಲಗಳು' },
  'healthcare.addHospital': { en: 'Add Hospital', hi: 'अस्पताल जोड़ें', kn: 'ಆಸ್ಪತ್ರೆ ಸೇರಿಸಿ' },

  // ─── ADMIN — ACTIVITY LOGS ───
  'logs.title': { en: 'Activity Logs', hi: 'गतिविधि लॉग', kn: 'ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳು' },
  'logs.exportPdf': { en: 'Export PDF Report', hi: 'PDF रिपोर्ट निर्यात करें', kn: 'PDF ವರದಿ ರಫ್ತು ಮಾಡಿ' },
  'logs.noLogs': { en: 'No activity logs found.', hi: 'कोई गतिविधि लॉग नहीं मिला।', kn: 'ಯಾವುದೇ ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' },

  // ─── ADMIN — COMMUNITY REPORTS ───
  'adminComm.title': { en: 'Community Health Reports Management', hi: 'सामुदायिक स्वास्थ्य रिपोर्ट प्रबंधन', kn: 'ಸಮುದಾಯ ಆರೋಗ್ಯ ವರದಿ ನಿರ್ವಹಣೆ' },
  'adminComm.verify': { en: 'Verify', hi: 'सत्यापित करें', kn: 'ಪರಿಶೀಲಿಸಿ' },
  'adminComm.reject': { en: 'Reject', hi: 'अस्वीकार करें', kn: 'ತಿರಸ್ಕರಿಸಿ' },
  'adminComm.dismiss': { en: 'Dismiss', hi: 'खारिज करें', kn: 'ವಜಾಗೊಳಿಸಿ' },

  // ─── ADMIN — HEALTH CAMPS ───
  'adminCamps.title': { en: 'Health Camps Management', hi: 'स्वास्थ्य शिविर प्रबंधन', kn: 'ಆರೋಗ್ಯ ಶಿಬಿರ ನಿರ್ವಹಣೆ' },
  'adminCamps.create': { en: 'Create New Health Camp', hi: 'नया स्वास्थ्य शिविर बनाएं', kn: 'ಹೊಸ ಆರೋಗ್ಯ ಶಿಬಿರ ರಚಿಸಿ' },

  // ─── COMMON EXTENDED ───
  'common.viewDetails': { en: 'View Details', hi: 'विवरण देखें', kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ' },
  'common.back': { en: 'Back', hi: 'वापस', kn: 'ಹಿಂದೆ' },
  'common.close': { en: 'Close', hi: 'बंद करें', kn: 'ಮುಚ್ಚಿ' },
  'common.refresh': { en: 'Refresh', hi: 'रिफ्रेश करें', kn: 'ರಿಫ್ರೆಶ್ ಮಾಡಿ' },
  'common.export': { en: 'Export', hi: 'निर्यात करें', kn: 'ರಫ್ತು ಮಾಡಿ' },
  'common.import': { en: 'Import', hi: 'आयात करें', kn: 'ಆಮದು ಮಾಡಿ' },
  'common.status': { en: 'Status', hi: 'स्थिति', kn: 'ಸ್ಥಿತಿ' },
  'common.type': { en: 'Type', hi: 'प्रकार', kn: 'ಪ್ರಕಾರ' },
  'common.name': { en: 'Name', hi: 'नाम', kn: 'ಹೆಸರು' },
  'common.email': { en: 'Email', hi: 'ईमेल', kn: 'ಇಮೇಲ್' },
  'common.phone': { en: 'Phone', hi: 'फोन', kn: 'ಫೋನ್' },
  'common.address': { en: 'Address', hi: 'पता', kn: 'ವಿಳಾಸ' },
  'common.city': { en: 'City', hi: 'शहर', kn: 'ನಗರ' },
  'common.state': { en: 'State', hi: 'राज्य', kn: 'ರಾಜ್ಯ' },
  'common.region': { en: 'Region', hi: 'क्षेत्र', kn: 'ಪ್ರದೇಶ' },
  'common.disease': { en: 'Disease', hi: 'रोग', kn: 'ರೋಗ' },
  'common.riskLevel': { en: 'Risk Level', hi: 'जोखिम स्तर', kn: 'ಅಪಾಯ ಮಟ್ಟ' },
  'common.confidence': { en: 'Confidence', hi: 'विश्वास', kn: 'ವಿಶ್ವಾಸ' },
  'common.verified': { en: 'Verified', hi: 'सत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'common.unverified': { en: 'Unverified', hi: 'असत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ' },
  'common.rejected': { en: 'Rejected', hi: 'अस्वीकृत', kn: 'ತಿರಸ್ಕೃತ' },
}

export default translations
