from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models.data_models import Prediction, WeatherData, DiseaseRecord, SatelliteData, PopulationData
import os
import joblib
import numpy as np

prediction_bp = Blueprint('prediction', __name__)

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'scaler.pkl')

DISEASES = ['Dengue', 'Malaria', 'Cholera', 'Typhoid', 'Influenza', 'COVID-19', 'Leptospirosis']

HEALTH_ADVISORY = {
    'Dengue': {
        'prevention': ['Remove stagnant water', 'Use mosquito repellents', 'Wear full-sleeve clothes', 'Use window screens'],
        'symptoms': ['High fever', 'Severe headache', 'Pain behind eyes', 'Joint pain', 'Rash'],
        'foods': {'recommended': ['Fruits rich in Vitamin C', 'Leafy greens', 'Plenty of fluids', 'ORS'], 'avoid': ['Oily food', 'Spicy food', 'Junk food']}
    },
    'Malaria': {
        'prevention': ['Use mosquito nets', 'Wear full-sleeve clothes', 'Apply insect repellent', 'Sleep in screened rooms'],
        'symptoms': ['Fever with chills', 'Headache', 'Nausea', 'Sweating', 'Body ache'],
        'foods': {'recommended': ['Warm soups', 'Citrus fruits', 'Green vegetables', 'Whole grains'], 'avoid': ['Cold drinks', 'Processed food', 'Excess sugar']}
    },
    'Cholera': {
        'prevention': ['Drink boiled water', 'Wash hands frequently', 'Eat freshly cooked food', 'Maintain hygiene'],
        'symptoms': ['Watery diarrhea', 'Vomiting', 'Leg cramps', 'Dehydration'],
        'foods': {'recommended': ['ORS solution', 'Rice gruel', 'Banana', 'Coconut water'], 'avoid': ['Raw vegetables', 'Street food', 'Uncooked food']}
    },
    'Typhoid': {
        'prevention': ['Drink purified water', 'Wash hands before eating', 'Avoid street food', 'Get vaccinated'],
        'symptoms': ['Prolonged fever', 'Headache', 'Abdominal pain', 'Constipation or diarrhea'],
        'foods': {'recommended': ['Soft cooked food', 'Porridge', 'Boiled vegetables', 'Yogurt'], 'avoid': ['Spicy food', 'High fiber food', 'Raw vegetables']}
    },
    'Influenza': {
        'prevention': ['Get flu vaccine', 'Cover mouth while coughing', 'Wash hands frequently', 'Avoid close contact with sick people'],
        'symptoms': ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue'],
        'foods': {'recommended': ['Warm soup', 'Citrus fruits', 'Ginger tea', 'Honey'], 'avoid': ['Cold drinks', 'Dairy products', 'Fried food']}
    },
    'COVID-19': {
        'prevention': ['Wear masks', 'Maintain social distance', 'Sanitize hands', 'Get vaccinated'],
        'symptoms': ['Fever', 'Dry cough', 'Loss of taste/smell', 'Difficulty breathing'],
        'foods': {'recommended': ['Vitamin C rich fruits', 'Turmeric milk', 'Warm water', 'Protein-rich food'], 'avoid': ['Cold food', 'Processed food', 'Excess sugar']}
    },
    'Leptospirosis': {
        'prevention': ['Avoid contact with floodwater', 'Wear protective clothing', 'Cover wounds', 'Rodent control'],
        'symptoms': ['High fever', 'Headache', 'Muscle pain', 'Red eyes', 'Jaundice'],
        'foods': {'recommended': ['Fresh fruits', 'Vegetable soup', 'Plenty of water', 'Electrolyte drinks'], 'avoid': ['Alcohol', 'Oily food', 'Street food']}
    }
}

def get_risk_level(probability):
    if probability < 0.35:
        return 'Low'
    elif probability < 0.70:
        return 'Medium'
    else:
        return 'High'

def generate_explanation(features, disease, risk_level):
    explanations = []
    if features.get('temperature', 0) > 30:
        explanations.append('High temperature increases breeding conditions')
    if features.get('humidity', 0) > 75:
        explanations.append('High humidity favors pathogen survival')
    if features.get('rainfall', 0) > 50:
        explanations.append('Heavy rainfall creates stagnant water pools')
    if features.get('population_density', 0) > 5000:
        explanations.append('High population density increases transmission risk')
    if features.get('ndvi', 0) > 0.6:
        explanations.append('Dense vegetation provides breeding habitats')
    if not explanations:
        explanations.append(f'Based on current environmental conditions in the region')
    return '; '.join(explanations)


@prediction_bp.route('/disease', methods=['POST'])
def predict_disease():
    data = request.get_json()
    state = data.get('state', 'Delhi')
    district = data.get('district', 'Delhi')
    disease = data.get('disease', 'Dengue')
    db = current_app.db
    
    # Get features from DB or request
    weather = WeatherData.get_latest(db, state, district) or {}
    satellite = SatelliteData.get_latest(db, state, district) or {}
    population = PopulationData.get_by_region(db, state, district) or {}
    
    features = {
        'temperature': data.get('temperature', weather.get('temperature', 28.0)),
        'humidity': data.get('humidity', weather.get('humidity', 70.0)),
        'rainfall': data.get('rainfall', weather.get('rainfall', 10.0)),
        'wind_speed': data.get('wind_speed', weather.get('wind_speed', 5.0)),
        'ndvi': data.get('ndvi', satellite.get('ndvi', 0.4)),
        'land_surface_temp': data.get('land_surface_temp', satellite.get('land_surface_temp', 32.0)),
        'water_bodies': data.get('water_bodies', satellite.get('water_bodies', 0.2)),
        'population_density': data.get('population_density', population.get('population_density', 3000)),
        'urbanization': data.get('urbanization', population.get('urbanization', 0.6)),
        'historical_cases': data.get('historical_cases', 50)
    }
    
    # Try ML model prediction
    probability = 0.0
    confidence = 0.0
    model_used = 'heuristic'
    
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
            
            feature_array = np.array([[
                features['temperature'], features['humidity'], features['rainfall'],
                features['ndvi'], features['land_surface_temp'], features['water_bodies'],
                features['population_density'], features['urbanization'], features['historical_cases']
            ]])
            
            if scaler:
                feature_array = scaler.transform(feature_array)
            
            pred = model.predict_proba(feature_array)[0]
            probability = float(pred[1]) if len(pred) > 1 else float(pred[0])
            confidence = float(max(pred))
            model_used = 'random_forest'
    except Exception as e:
        print(f"ML prediction error: {e}")
    
    # Fallback heuristic
    if model_used == 'heuristic':
        risk_score = 0
        if features['temperature'] > 30: risk_score += 0.15
        elif features['temperature'] > 25: risk_score += 0.1
        if features['humidity'] > 75: risk_score += 0.2
        elif features['humidity'] > 60: risk_score += 0.1
        if features['rainfall'] > 50: risk_score += 0.25
        elif features['rainfall'] > 20: risk_score += 0.1
        if features['ndvi'] > 0.6: risk_score += 0.1
        if features['population_density'] > 5000: risk_score += 0.15
        elif features['population_density'] > 2000: risk_score += 0.05
        if features['historical_cases'] > 100: risk_score += 0.15
        elif features['historical_cases'] > 50: risk_score += 0.1
        
        probability = min(risk_score + 0.1, 1.0)
        confidence = 0.75
    
    risk_level = get_risk_level(probability)
    explanation = generate_explanation(features, disease, risk_level)
    
    # Save prediction
    Prediction.create(db, state, district, disease, risk_level, probability, confidence, features, explanation)
    
    advisory = HEALTH_ADVISORY.get(disease, HEALTH_ADVISORY['Dengue'])
    
    return jsonify({
        'prediction': {
            'disease': disease,
            'state': state,
            'district': district,
            'risk_level': risk_level,
            'probability': round(probability, 4),
            'confidence': round(confidence, 4),
            'model_used': model_used,
            'features': features,
            'explanation': explanation
        },
        'advisory': advisory
    }), 200


@prediction_bp.route('/all-diseases', methods=['POST'])
def predict_all_diseases():
    data = request.get_json()
    state = data.get('state', 'Delhi')
    district = data.get('district', 'Delhi')
    
    results = []
    for disease in DISEASES:
        req_data = {**data, 'state': state, 'district': district, 'disease': disease}
        with current_app.test_request_context(json=req_data):
            resp = predict_disease()
            result = resp[0].get_json()
            results.append(result['prediction'])
    
    results.sort(key=lambda x: x['probability'], reverse=True)
    return jsonify({'predictions': results, 'state': state, 'district': district}), 200


@prediction_bp.route('/history', methods=['GET'])
def get_prediction_history():
    db = current_app.db
    state = request.args.get('state')
    district = request.args.get('district')
    predictions = Prediction.get_latest(db, state, district)
    return jsonify({'predictions': predictions}), 200


@prediction_bp.route('/advisory/<disease>', methods=['GET'])
def get_advisory(disease):
    advisory = HEALTH_ADVISORY.get(disease, HEALTH_ADVISORY.get('Dengue'))
    return jsonify({'disease': disease, 'advisory': advisory}), 200
