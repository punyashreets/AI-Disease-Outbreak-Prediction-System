from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models.data_models import WeatherData
from datetime import datetime
import requests
import os

weather_bp = Blueprint('weather', __name__)

# ─── OpenWeatherMap API Integration ───────────────────────────────────────
# Fetches live weather data and auto-saves to MongoDB for future predictions.
# Uses: Current Weather API + 5-day Forecast API
# Docs: https://openweathermap.org/api

OWM_BASE = 'https://api.openweathermap.org/data/2.5'

def fetch_openweathermap(city, api_key):
    """Fetch current weather from OpenWeatherMap API"""
    try:
        resp = requests.get(
            f'{OWM_BASE}/weather',
            params={'q': f'{city},IN', 'appid': api_key, 'units': 'metric'},
            timeout=10
        )
        if resp.status_code == 200:
            wd = resp.json()
            return {
                'temperature': wd['main']['temp'],
                'humidity': wd['main']['humidity'],
                'wind_speed': wd['wind'].get('speed', 0),
                'pressure': wd['main'].get('pressure', 0),
                'description': wd['weather'][0]['description'],
                'icon': wd['weather'][0]['icon'],
                'feels_like': wd['main'].get('feels_like', 0),
                'visibility': wd.get('visibility', 0),
                'clouds': wd.get('clouds', {}).get('all', 0),
                'lat': wd['coord']['lat'],
                'lon': wd['coord']['lon'],
                'source': 'openweathermap',
                'fetched_at': datetime.utcnow().isoformat()
            }
    except Exception as e:
        print(f'OpenWeatherMap error: {e}')
    return None


def fetch_owm_forecast(city, api_key):
    """Fetch 5-day forecast from OpenWeatherMap API"""
    try:
        resp = requests.get(
            f'{OWM_BASE}/forecast',
            params={'q': f'{city},IN', 'appid': api_key, 'units': 'metric'},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            forecasts = []
            for item in data.get('list', [])[:8]:  # next 24 hours (3h intervals)
                forecasts.append({
                    'time': item['dt_txt'],
                    'temperature': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'description': item['weather'][0]['description'],
                    'rain': item.get('rain', {}).get('3h', 0)
                })
            return forecasts
    except Exception as e:
        print(f'OpenWeatherMap forecast error: {e}')
    return []


@weather_bp.route('/current', methods=['GET'])
def get_current_weather():
    """
    Priority: 1) MongoDB cached data  2) OpenWeatherMap live API  3) Simulated fallback
    """
    db = current_app.db
    state = request.args.get('state')
    district = request.args.get('district')
    city = request.args.get('city', district or state or 'Delhi')
    use_live = request.args.get('live', 'false').lower() == 'true'
    
    # 1) Check MongoDB first (unless live=true)
    if not use_live:
        cached = WeatherData.get_latest(db, state, district)
        if cached:
            cached['source'] = 'database'
            return jsonify({'weather': cached}), 200
    
    # 2) Fetch from OpenWeatherMap API
    api_key = current_app.config.get('OPENWEATHER_API_KEY')
    if api_key:
        live_data = fetch_openweathermap(city, api_key)
        if live_data:
            # Auto-save to MongoDB for future predictions
            WeatherData.create(
                db, state or 'N/A', district or 'N/A', city,
                live_data['temperature'], live_data['humidity'],
                0,  # rainfall not in current weather endpoint
                live_data['wind_speed']
            )
            live_data['city'] = city
            live_data['state'] = state or 'N/A'
            live_data['district'] = district or 'N/A'
            live_data['rainfall'] = 0
            return jsonify({'weather': live_data}), 200
    
    # 3) Fallback simulated data
    return jsonify({'weather': {
        'temperature': 28.5, 'humidity': 72, 'rainfall': 12.3,
        'wind_speed': 8.5, 'city': city, 'state': state or 'N/A',
        'district': district or 'N/A', 'description': 'Partly Cloudy',
        'source': 'simulated',
        'note': 'Add OPENWEATHER_API_KEY to .env for live data'
    }}), 200


@weather_bp.route('/forecast', methods=['GET'])
def get_forecast():
    """Get 5-day weather forecast from OpenWeatherMap"""
    city = request.args.get('city', 'Delhi')
    api_key = current_app.config.get('OPENWEATHER_API_KEY')
    
    if api_key:
        forecasts = fetch_owm_forecast(city, api_key)
        if forecasts:
            return jsonify({'forecast': forecasts, 'city': city, 'source': 'openweathermap'}), 200
    
    # Simulated forecast
    import random
    simulated = []
    for i in range(8):
        simulated.append({
            'time': f'2026-06-13 {i*3:02d}:00:00',
            'temperature': round(random.uniform(25, 38), 1),
            'humidity': round(random.uniform(50, 90), 1),
            'description': random.choice(['Clear', 'Clouds', 'Rain', 'Drizzle']),
            'rain': round(random.uniform(0, 5), 1)
        })
    return jsonify({'forecast': simulated, 'city': city, 'source': 'simulated'}), 200


@weather_bp.route('/records', methods=['GET'])
def get_weather_records():
    db = current_app.db
    records = WeatherData.get_all(db, limit=int(request.args.get('limit', 100)))
    return jsonify({'records': records}), 200


@weather_bp.route('/records', methods=['POST'])
@jwt_required()
def create_weather_record():
    data = request.get_json()
    db = current_app.db
    record_id = WeatherData.create(
        db, data.get('state', ''), data.get('district', ''), data.get('city', ''),
        data.get('temperature', 0), data.get('humidity', 0),
        data.get('rainfall', 0), data.get('wind_speed', 0)
    )
    return jsonify({'message': 'Weather record created', 'id': record_id}), 201
