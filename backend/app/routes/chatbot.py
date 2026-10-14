from flask import Blueprint, request, jsonify
import re
from datetime import datetime

chatbot_bp = Blueprint('chatbot', __name__)

# Knowledge base for the AI health chatbot
KNOWLEDGE_BASE = {
    'diseases': {
        'dengue': {
            'keywords': ['dengue', 'mosquito', 'platelet', 'aedes', 'breakbone'],
            'response': 'Dengue is a viral infection transmitted by Aedes mosquitoes. Key symptoms include high fever (104°F), severe headache, pain behind eyes, joint pain, and rash. If you suspect dengue:\n\n1. Take paracetamol for fever (avoid aspirin/ibuprofen)\n2. Drink plenty of fluids (ORS, coconut water)\n3. Rest adequately\n4. Monitor platelet count daily\n5. Seek medical help if bleeding occurs\n\nPrevention: Remove stagnant water, use mosquito repellents, wear full-sleeve clothing.',
            'risk': 'Can become severe - seek medical attention if symptoms worsen after 3-5 days.'
        },
        'malaria': {
            'keywords': ['malaria', 'plasmodium', 'fever with chills', 'anopheles', 'quinine'],
            'response': 'Malaria is caused by Plasmodium parasites transmitted through Anopheles mosquito bites. Symptoms include recurring fever with chills, sweating, headache, nausea, and body ache.\n\n1. Get tested immediately (blood smear or rapid test)\n2. Take antimalarial medication as prescribed\n3. Complete the full medication course\n4. Use mosquito nets while sleeping\n5. Stay hydrated and rest\n\nPrevention: Sleep under insecticide-treated nets, use repellents, wear protective clothing at dusk.',
            'risk': 'Can be fatal if not treated promptly. Seek immediate medical attention.'
        },
        'cholera': {
            'keywords': ['cholera', 'diarrhea', 'watery', 'dehydration', 'vibrio', 'contaminated water'],
            'response': 'Cholera is an acute diarrheal disease caused by Vibrio cholerae bacteria, spread through contaminated water/food.\n\nImmediate Actions:\n1. Start ORS (Oral Rehydration Solution) immediately\n2. Seek medical attention urgently\n3. Drink only boiled/purified water\n4. Continue eating soft, bland foods\n5. Take antibiotics if prescribed\n\nCritical: Severe dehydration can be fatal within hours. Do not delay treatment.\n\nPrevention: Drink purified water, wash hands frequently, eat freshly cooked food, avoid street food.',
            'risk': 'URGENT - Severe dehydration can be life-threatening. Seek immediate medical help.'
        },
        'typhoid': {
            'keywords': ['typhoid', 'salmonella', 'prolonged fever', 'widal', 'enteric'],
            'response': 'Typhoid fever is caused by Salmonella typhi bacteria, spread through contaminated food and water.\n\nSymptoms: Prolonged high fever, headache, abdominal pain, constipation or diarrhea, rose-colored spots.\n\n1. Take complete antibiotic course as prescribed\n2. Eat soft, easily digestible food\n3. Stay well hydrated\n4. Get adequate rest\n5. Avoid spicy/oily food\n\nPrevention: Get vaccinated, drink purified water, wash hands before meals, avoid unhygienic food vendors.',
            'risk': 'Requires antibiotic treatment. Untreated typhoid can cause serious complications.'
        },
        'influenza': {
            'keywords': ['flu', 'influenza', 'cold', 'cough', 'sore throat', 'body ache', 'fever'],
            'response': 'Influenza (flu) is a respiratory viral infection. Symptoms include sudden fever, dry cough, sore throat, body aches, and extreme fatigue.\n\n1. Rest and stay home\n2. Drink warm fluids (soup, ginger tea)\n3. Take paracetamol for fever\n4. Use steam inhalation for congestion\n5. Wear a mask to prevent spread\n6. Take antiviral medication if prescribed\n\nPrevention: Get annual flu vaccine, wash hands frequently, avoid close contact with sick people.',
            'risk': 'Usually self-limiting in 7-10 days. Seek help if breathing difficulty or symptoms worsen.'
        },
        'covid': {
            'keywords': ['covid', 'coronavirus', 'sars', 'pandemic', 'loss of taste', 'sp02', 'oxygen'],
            'response': 'COVID-19 is caused by SARS-CoV-2 virus. Key symptoms: fever, dry cough, loss of taste/smell, shortness of breath, fatigue.\n\n1. Isolate immediately if symptomatic\n2. Get tested (RT-PCR or rapid antigen)\n3. Monitor oxygen levels (SpO2) - seek help if < 94%\n4. Stay hydrated, take rest\n5. Follow doctor\'s advice for medication\n6. Practice proper ventilation at home\n\nPrevention: Get vaccinated + boosted, wear masks in crowds, sanitize hands, maintain distance.',
            'risk': 'Monitor SpO2 levels. Seek emergency care if SpO2 < 94% or breathing difficulty.'
        },
        'leptospirosis': {
            'keywords': ['leptospirosis', 'flood', 'rat', 'weil disease', 'jaundice', 'leptospira'],
            'response': 'Leptospirosis is a bacterial disease spread through water/soil contaminated by infected animal urine, especially during floods.\n\nSymptoms: High fever, severe headache, muscle pain (especially calves), red eyes, jaundice in severe cases.\n\n1. Seek medical help early\n2. Take doxycycline/penicillin as prescribed\n3. Rest and stay hydrated\n4. Avoid contact with floodwater\n5. Protect open wounds from contaminated water\n\nPrevention: Avoid wading in floodwater, wear protective boots/gloves, control rodents.',
            'risk': 'Can progress to Weil\'s disease (organ failure). Early treatment is critical.'
        }
    },
    'general': {
        'fever': {
            'keywords': ['fever', 'temperature', 'hot', 'warm body', 'high temp'],
            'response': 'Fever management:\n\n• Mild fever (99-100.4°F): Rest, fluids, monitor\n• Moderate (100.4-102°F): Take paracetamol, tepid sponging\n• High (>102°F): Seek medical attention\n\nGeneral tips:\n- Apply cold compress to forehead\n- Wear light clothing\n- Drink plenty of water/ORS\n- Monitor temperature every 30 min\n- Avoid bundling up with blankets\n\nSeek emergency care if: fever >104°F, seizures, stiff neck, confusion, or fever lasting >5 days.'
        },
        'dehydration': {
            'keywords': ['dehydration', 'thirst', 'dry mouth', 'urine', 'electrolyte', 'weak'],
            'response': 'Dehydration treatment:\n\n1. Drink ORS solution (1 sachet in 1 liter clean water)\n2. Sip water frequently (small amounts)\n3. Coconut water for natural electrolytes\n4. Avoid caffeine and alcohol\n5. Rest in a cool, shaded area\n\nSigns of severe dehydration:\n- Very dark urine or no urination\n- Dizziness/confusion\n- Rapid heartbeat\n- Sunken eyes\n\nSevere dehydration requires IV fluids - go to hospital immediately.'
        },
        'prevention': {
            'keywords': ['prevent', 'prevention', 'protect', 'safe', 'avoid disease', 'immune', 'immunity'],
            'response': 'General disease prevention tips:\n\n🧼 Hygiene:\n- Wash hands with soap for 20 seconds\n- Use hand sanitizer when soap unavailable\n- Keep nails trimmed and clean\n\n💧 Water & Food:\n- Drink boiled/purified water\n- Eat freshly cooked food\n- Avoid street food during outbreaks\n- Wash fruits/vegetables thoroughly\n\n🏠 Environment:\n- Remove stagnant water weekly\n- Keep surroundings clean\n- Ensure proper ventilation\n- Use mosquito nets and repellents\n\n💪 Immunity:\n- Eat balanced diet with fruits/vegetables\n- Exercise regularly (30 min/day)\n- Sleep 7-8 hours\n- Get recommended vaccinations'
        },
        'emergency': {
            'keywords': ['emergency', 'urgent', 'serious', 'critical', 'dying', 'help', 'ambulance'],
            'response': '🚨 EMERGENCY NUMBERS:\n\n• National Emergency: 112\n• Ambulance: 108\n• Health Helpline: 104 (24/7)\n\nFor life-threatening situations:\n1. Call 108 immediately\n2. Keep patient calm and still\n3. Check breathing and pulse\n4. If unconscious, place in recovery position\n5. Do not give food/water if unconscious\n\nFor severe allergic reaction: Use epinephrine if available.\nFor choking: Perform Heimlich maneuver.\nFor bleeding: Apply firm pressure with clean cloth.'
        },
        'hospital': {
            'keywords': ['hospital', 'doctor', 'clinic', 'medical', 'nearby', 'nearest', 'visit'],
            'response': 'To find nearby hospitals:\n\n1. Check the "Nearby Hospitals" section in your dashboard\n2. Call Health Helpline: 104 for guidance\n3. Use Google Maps: search "hospitals near me"\n\nWhen to visit a hospital:\n- High fever (>102°F) lasting >2 days\n- Difficulty breathing\n- Severe dehydration\n- Chest pain\n- Unusual bleeding\n- Persistent vomiting\n\nAlways carry: ID, insurance card, list of current medications, and previous medical records.'
        },
        'food': {
            'keywords': ['food', 'eat', 'diet', 'nutrition', 'meal', 'recipe', 'cook'],
            'response': 'Diet recommendations during illness:\n\n✅ Eat:\n- Fresh fruits (oranges, bananas, papaya)\n- Clear soups and broths\n- Khichdi/porridge\n- Yogurt (probiotics)\n- Coconut water, ORS\n- Leafy greens\n\n❌ Avoid:\n- Oily/fried foods\n- Spicy dishes\n- Heavy meats\n- Caffeine and alcohol\n- Street food\n\nGeneral tip: Eat 5-6 small meals instead of 3 large ones. Stay well hydrated (8-10 glasses/day).'
        },
        'medicine': {
            'keywords': ['medicine', 'drug', 'tablet', 'pill', 'dose', 'medication', 'paracetamol', 'antibiotic'],
            'response': 'Important medication guidelines:\n\n• Paracetamol: Safe for fever (500mg every 6 hours, max 4g/day)\n• ORS: Essential for dehydration/diarrhea\n• Antibiotics: Only take if prescribed, complete full course\n• NEVER self-medicate with steroids\n• NEVER take aspirin for dengue (increases bleeding risk)\n\nAlways consult a doctor before starting any medication.\nCall 104 (Health Helpline) for medication advice.\n\n⚠️ Important: Do not share prescription medicines with others.'
        }
    }
}

# Outbreak-related social media keyword monitoring
SOCIAL_MEDIA_KEYWORDS = {
    'dengue': ['dengue outbreak', 'mosquito menace', 'stagnant water', 'dengue cases rising', 'platelet shortage', 'fogging'],
    'malaria': ['malaria spread', 'mosquito bite', 'fever outbreak', 'malaria cases', 'bed net'],
    'cholera': ['water contamination', 'diarrhea outbreak', 'cholera cases', 'dirty water', 'food poisoning outbreak'],
    'covid': ['covid cases', 'coronavirus surge', 'positive case', 'quarantine', 'covid wave', 'mask mandate'],
    'influenza': ['flu season', 'flu spreading', 'cold wave', 'respiratory illness surge'],
    'typhoid': ['typhoid outbreak', 'contaminated food', 'foodborne illness', 'typhoid cases'],
    'leptospirosis': ['flood water', 'rat infestation', 'leptospirosis', 'post-flood disease'],
}


def analyze_message(message):
    """Analyze user message and find best matching response"""
    msg_lower = message.lower().strip()
    
    # Greetings
    if any(g in msg_lower for g in ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste']):
        return {
            'response': 'Hello! I\'m your AI Health Assistant. I can help you with:\n\n'
                       '• Disease information (Dengue, Malaria, COVID-19, etc.)\n'
                       '• Symptom checking and first aid\n'
                       '• Prevention tips\n'
                       '• Finding nearby hospitals\n'
                       '• Diet recommendations during illness\n'
                       '• Emergency guidance\n\n'
                       'What would you like to know about?',
            'confidence': 0.95,
            'category': 'greeting'
        }
    
    # Thanks / goodbye
    if any(w in msg_lower for w in ['thank', 'thanks', 'bye', 'goodbye']):
        return {
            'response': 'You\'re welcome! Stay healthy and safe. Remember:\n\n'
                       '• Wash hands frequently\n• Stay hydrated\n• Get vaccinated\n• Seek medical help early if symptoms appear\n\n'
                       'Feel free to ask anytime! Stay well! 💚',
            'confidence': 0.95,
            'category': 'farewell'
        }
    
    # Check diseases first
    for disease_name, disease_info in KNOWLEDGE_BASE['diseases'].items():
        if any(kw in msg_lower for kw in disease_info['keywords']):
            return {
                'response': disease_info['response'],
                'confidence': 0.9,
                'category': 'disease',
                'disease': disease_name,
                'risk_note': disease_info['risk']
            }
    
    # Check general health topics
    for topic_name, topic_info in KNOWLEDGE_BASE['general'].items():
        if any(kw in msg_lower for kw in topic_info['keywords']):
            return {
                'response': topic_info['response'],
                'confidence': 0.85,
                'category': 'general_health',
                'topic': topic_name
            }
    
    # Symptom checker
    symptoms_found = []
    symptom_map = {
        'fever': 'Fever', 'headache': 'Headache', 'cough': 'Cough',
        'diarrhea': 'Diarrhea', 'vomiting': 'Vomiting', 'rash': 'Rash',
        'fatigue': 'Fatigue', 'body ache': 'Body ache', 'chills': 'Chills',
        'nausea': 'Nausea', 'breathing': 'Breathing difficulty', 'pain': 'Pain',
        'swelling': 'Swelling', 'bleeding': 'Bleeding', 'dizzy': 'Dizziness',
    }
    for keyword, symptom in symptom_map.items():
        if keyword in msg_lower:
            symptoms_found.append(symptom)
    
    if symptoms_found:
        possible = []
        if 'Fever' in symptoms_found and 'Body ache' in symptoms_found:
            possible.append('Influenza or Dengue')
        if 'Fever' in symptoms_found and 'Chills' in symptoms_found:
            possible.append('Malaria')
        if 'Diarrhea' in symptoms_found and 'Vomiting' in symptoms_found:
            possible.append('Cholera or Food poisoning')
        if 'Cough' in symptoms_found and 'Breathing difficulty' in symptoms_found:
            possible.append('COVID-19 or respiratory infection')
        if 'Fever' in symptoms_found and 'Rash' in symptoms_found:
            possible.append('Dengue')
        if 'Fever' in symptoms_found and 'Headache' in symptoms_found:
            possible.append('Typhoid or Meningitis')
        
        response = f"Based on your symptoms: {', '.join(symptoms_found)}\n\n"
        if possible:
            response += f"Possible conditions: {', '.join(possible)}\n\n"
        response += "Recommendations:\n"
        response += "1. Monitor your symptoms closely\n"
        response += "2. Take rest and stay hydrated\n"
        response += "3. Take paracetamol for fever if needed\n"
        response += "4. Seek medical attention if symptoms worsen\n\n"
        response += "⚠️ This is not a medical diagnosis. Please consult a doctor for proper evaluation."
        
        return {
            'response': response,
            'confidence': 0.7,
            'category': 'symptom_check',
            'symptoms': symptoms_found,
            'possible_conditions': possible
        }
    
    # District-specific queries
    district_keywords = ['district', 'city', 'area', 'region', 'zone', 'highest', 'lowest', 'which', 'worst', 'most affected']
    if any(kw in msg_lower for kw in district_keywords):
        # Check which disease is mentioned
        detected_disease = None
        for d_name in ['dengue', 'malaria', 'cholera', 'typhoid', 'influenza', 'covid', 'leptospirosis']:
            if d_name in msg_lower:
                detected_disease = d_name.title()
                if d_name == 'covid': detected_disease = 'COVID-19'
                break
        
        if detected_disease:
            response = f"Based on current data analysis for {detected_disease}:\n\n"
            response += "🔴 High Risk Districts:\n"
            response += "• Delhi - 87% risk probability\n"
            response += "• Mumbai - 82% risk probability\n"
            response += "• Kolkata - 78% risk probability\n\n"
            response += "🟡 Medium Risk Districts:\n"
            response += "• Chennai - 58% risk probability\n"
            response += "• Bangalore - 52% risk probability\n\n"
            response += "🟢 Low Risk Districts:\n"
            response += "• Pune - 28% risk probability\n"
            response += "• Hyderabad - 22% risk probability\n\n"
            response += "Check the Predictions section for detailed analysis of each district."
        else:
            response = "Which disease would you like district-level analysis for?\n\n"
            response += "Available: Dengue, Malaria, Cholera, Typhoid, Influenza, COVID-19, Leptospirosis\n\n"
            response += "Example: 'Which district has highest dengue risk?'"
        
        return {'response': response, 'confidence': 0.85, 'category': 'district_query'}
    
    # Trend queries
    trend_keywords = ['trend', 'show', 'graph', 'chart', 'history', 'month', 'week', 'year', 'pattern']
    if any(kw in msg_lower for kw in trend_keywords):
        detected_disease = None
        for d_name in ['dengue', 'malaria', 'cholera', 'typhoid', 'influenza', 'covid', 'leptospirosis']:
            if d_name in msg_lower:
                detected_disease = d_name.title()
                if d_name == 'covid': detected_disease = 'COVID-19'
                break
        
        disease_name = detected_disease or 'all diseases'
        response = f"📈 Trend Analysis for {disease_name}:\n\n"
        
        if 'month' in msg_lower or 'weekly' in msg_lower:
            response += "Weekly Pattern:\n"
            response += "• Week 1: Moderate risk (45%)\n"
            response += "• Week 2: Increasing risk (58%)\n"
            response += "• Week 3: Peak risk (72%)\n"
            response += "• Week 4: Declining risk (55%)\n\n"
        else:
            response += "Monthly Pattern (12-month view):\n"
            response += "• Jan-Mar: Low-Moderate risk\n"
            response += "• Apr-Jun: Rising trend\n"
            response += "• Jul-Sep: Peak season (highest risk)\n"
            response += "• Oct-Dec: Declining trend\n\n"
        
        response += "📊 Key Insights:\n"
        response += "• Monsoon season (Jul-Sep) shows highest disease burden\n"
        response += "• Post-monsoon cases remain elevated for 2-3 months\n"
        response += "• Winter months see increased respiratory infections\n\n"
        response += "Check the Analytics section for interactive charts and detailed trends."
        
        return {'response': response, 'confidence': 0.80, 'category': 'trend_query'}
    
    # Forecast queries
    forecast_keywords = ['predict', 'forecast', 'future', 'next week', 'next month', 'outlook']
    if any(kw in msg_lower for kw in forecast_keywords):
        response = "🔮 Disease Outbreak Forecast:\n\n"
        response += "Next 7 Days:\n"
        response += "• Dengue: Rising trend expected (65% → 78%)\n"
        response += "• Malaria: Stable high risk (72%)\n"
        response += "• Cholera: Moderate risk (45%)\n\n"
        response += "Next 30 Days:\n"
        response += "• Peak outbreak expected around Day 15-20\n"
        response += "• Gradual decline expected after Day 25\n\n"
        response += "Next 3 Months:\n"
        response += "• Seasonal decline expected with changing weather\n"
        response += "• Monsoon transition may cause temporary spike\n\n"
        response += "Check the Predictions section for detailed forecasting models."
        return {'response': response, 'confidence': 0.75, 'category': 'forecast_query'}
    
    # Resource queries
    resource_keywords = ['hospital', 'bed', 'resource', 'staff', 'medicine', 'supply', 'capacity']
    if any(kw in msg_lower for kw in resource_keywords) and 'nearby' not in msg_lower:
        response = "🏥 Hospital Resource Prediction:\n\n"
        response += "Based on current outbreak risk:\n\n"
        response += "• Beds Required: 45-60 beds\n"
        response += "• ICU Beds: 7-10 beds\n"
        response += "• Ventilators: 2-3 units\n\n"
        response += "Staff Requirements:\n"
        response += "• Doctors: 5-6\n"
        response += "• Nurses: 15-20\n"
        response += "• Lab Technicians: 3-4\n\n"
        response += "Critical Medicines to Stock:\n"
        response += "• Paracetamol: 840 units\n"
        response += "• ORS Packets: 1200 units\n"
        response += "• IV Fluids: 420 units\n\n"
        response += "Check the Nearby Hospitals section for facility-specific data."
        return {'response': response, 'confidence': 0.78, 'category': 'resource_query'}
    
    # Default response
    return {
        'response': 'I understand your question. While I can\'t provide a specific answer to that, here are some topics I can help with:\n\n'
                   '• Ask about specific diseases (e.g., "What is dengue?")\n'
                   '• Describe symptoms (e.g., "I have fever and headache")\n'
                   '• Ask about prevention (e.g., "How to prevent malaria?")\n'
                   '• Ask about diet (e.g., "What should I eat during fever?")\n'
                   '• Ask about hospitals (e.g., "Find nearby hospital")\n'
                   '• Emergency help (e.g., "Emergency numbers")\n\n'
                   'Or call Health Helpline: 104 for professional medical advice.',
        'confidence': 0.3,
        'category': 'unknown'
    }


@chatbot_bp.route('/message', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    result = analyze_message(message)
    
    return jsonify({
        'reply': result['response'],
        'confidence': result['confidence'],
        'category': result['category'],
        'timestamp': datetime.utcnow().isoformat(),
        'suggestions': [
            'What are dengue symptoms?',
            'How to prevent malaria?',
            'Find nearby hospitals',
            'Diet during fever',
            'Emergency numbers'
        ]
    }), 200


@chatbot_bp.route('/analyze-social', methods=['POST'])
def analyze_social_signals():
    """Analyze text content for disease outbreak signals (simulates social media monitoring)"""
    data = request.get_json()
    content = data.get('content', '').lower()
    region = data.get('region', 'India')
    
    signals = {}
    total_mentions = 0
    
    for disease, keywords in SOCIAL_MEDIA_KEYWORDS.items():
        mentions = sum(1 for kw in keywords if kw in content)
        if mentions > 0:
            signals[disease] = {
                'mentions': mentions,
                'keywords_matched': [kw for kw in keywords if kw in content],
                'alert_level': 'High' if mentions >= 3 else 'Medium' if mentions >= 2 else 'Low',
                'sentiment': 'negative'  # Simplified - would use NLP in production
            }
            total_mentions += mentions
    
    risk_score = min(total_mentions / 10.0, 1.0)
    overall_risk = 'High' if risk_score > 0.7 else 'Medium' if risk_score > 0.3 else 'Low'
    
    return jsonify({
        'region': region,
        'signals': signals,
        'total_mentions': total_mentions,
        'risk_score': round(risk_score, 2),
        'overall_risk': overall_risk,
        'source': 'social_media_analysis',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@chatbot_bp.route('/outbreak-signals', methods=['GET'])
def get_outbreak_signals():
    """Get simulated social media outbreak monitoring data"""
    region = request.args.get('region', 'India')
    
    # Simulated social media monitoring data
    signals = [
        {'disease': 'Dengue', 'platform': 'Twitter/X', 'mentions': 1250, 'trend': 'rising', 'sentiment': 'negative', 'top_keywords': ['mosquito', 'stagnant water', 'fever']},
        {'disease': 'Malaria', 'platform': 'Facebook', 'mentions': 890, 'trend': 'stable', 'sentiment': 'concerned', 'top_keywords': ['mosquito net', 'fever', 'prevention']},
        {'disease': 'COVID-19', 'platform': 'Twitter/X', 'mentions': 3400, 'trend': 'declining', 'sentiment': 'neutral', 'top_keywords': ['vaccine', 'cases', 'mask']},
        {'disease': 'Cholera', 'platform': 'Reddit', 'mentions': 156, 'trend': 'rising', 'sentiment': 'negative', 'top_keywords': ['water contamination', 'diarrhea', 'hygiene']},
        {'disease': 'Influenza', 'platform': 'Twitter/X', 'mentions': 670, 'trend': 'stable', 'sentiment': 'neutral', 'top_keywords': ['flu season', 'cold', 'vaccine']},
    ]
    
    # Sort by mentions to determine highest alert
    signals.sort(key=lambda x: x['mentions'], reverse=True)
    
    return jsonify({
        'region': region,
        'signals': signals,
        'summary': f'{len(signals)} diseases being monitored',
        'highest_alert': signals[0]['disease'] if signals else 'None',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
