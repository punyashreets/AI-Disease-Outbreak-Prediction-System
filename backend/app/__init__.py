from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from config import Config
import os
import requests as http_requests
from flask import jsonify, request

jwt = JWTManager()
mongo_client = None
db = None

def create_app():
    global mongo_client, db
    
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False  # Fix CORS trailing slash redirects
    
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    
    mongo_client = MongoClient(app.config['MONGO_URI'])
    db = mongo_client.get_default_database(default='disease_outbreak')
    app.db = db
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    from app.routes.auth import auth_bp
    from app.routes.disease import disease_bp
    from app.routes.weather import weather_bp
    from app.routes.prediction import prediction_bp
    from app.routes.alerts import alerts_bp
    from app.routes.admin import admin_bp
    from app.routes.reports import reports_bp
    from app.routes.data_management import data_bp
    from app.routes.satellite import satellite_bp
    from app.routes.hospitals import hospitals_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.notifications import notifications_bp
    from app.routes.advanced import advanced_bp
    from app.routes.admin_extended import admin_ext_bp
    from app.routes.food import food_bp
    from app.routes.community import community_bp
    from app.routes.dataset_manager import dataset_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(disease_bp, url_prefix='/api/disease')
    app.register_blueprint(weather_bp, url_prefix='/api/weather')
    app.register_blueprint(satellite_bp, url_prefix='/api/satellite')
    app.register_blueprint(prediction_bp, url_prefix='/api/predict')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(data_bp, url_prefix='/api/data')
    app.register_blueprint(hospitals_bp, url_prefix='/api/hospitals')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(advanced_bp, url_prefix='/api/advanced')
    app.register_blueprint(admin_ext_bp, url_prefix='/api/admin-ext')
    app.register_blueprint(food_bp, url_prefix='/api/food')
    app.register_blueprint(community_bp, url_prefix='/api/community')
    app.register_blueprint(dataset_bp, url_prefix='/api/dataset-manager')
    
    @app.route('/api/health')
    def health():
        try:
            db.command('ping')
            db_status = 'connected'
        except:
            db_status = 'disconnected'
        return {
            'status': 'healthy',
            'database': db_status,
            'ml_model': 'loaded' if os.path.exists('app/ml/model.pkl') else 'not_trained'
        }
    
    # WHO GHO API Proxy (bypasses browser CORS restrictions)
    @app.route('/api/who-gho/<path:indicator>')
    def who_gho_proxy(indicator):
        """Proxy WHO GHO API requests to bypass CORS restrictions"""
        country = request.args.get('country', 'IND')
        url = f"https://ghoapi.azureedge.net/api/{indicator}?$filter=SpatialDim eq '{country}'"
        try:
            r = http_requests.get(url, timeout=15)
            if r.status_code == 200:
                data = r.json()
                values = data.get('value', [])
                # Sort by year descending and return
                values.sort(key=lambda x: x.get('TimeDim', 0), reverse=True)
                return jsonify({
                    'indicator': indicator,
                    'country': country,
                    'values': values,
                    'latest': values[0] if values else None,
                    'count': len(values),
                    'source': 'WHO GHO API (ghoapi.azureedge.net)'
                })
            return jsonify({'error': 'WHO API error', 'status': r.status_code}), 502
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # India-specific health data endpoint
    @app.route('/api/india-health')
    def india_health():
        """Aggregated India health data from WHO GHO + disease.sh"""
        result = {'who': {}, 'covid': {}, 'source_info': {}}
        
        # WHO GHO - Malaria data for India
        indicators = {
            'MALARIA_TOTAL_CASES': 'malaria_cases',
            'MALARIA_EST_MORTALITY': 'malaria_mortality',
            'MALARIA_MICR_POS': 'malaria_confirmed',
        }
        for indicator, key in indicators.items():
            try:
                url = f"https://ghoapi.azureedge.net/api/{indicator}?$filter=SpatialDim eq 'IND'"
                r = http_requests.get(url, timeout=10)
                if r.status_code == 200:
                    vals = r.json().get('value', [])
                    vals.sort(key=lambda x: x.get('TimeDim', 0), reverse=True)
                    if vals:
                        result['who'][key] = {
                            'value': vals[0].get('NumericValue'),
                            'year': vals[0].get('TimeDim'),
                            'history': [{'year': v['TimeDim'], 'value': v['NumericValue']} for v in vals[:8]][::-1]
                        }
            except: pass
        
        # disease.sh - India COVID data
        try:
            r = http_requests.get('https://disease.sh/v3/covid-19/countries/india', timeout=10)
            if r.status_code == 200:
                d = r.json()
                result['covid'] = {
                    'cases': d.get('cases'), 'deaths': d.get('deaths'),
                    'recovered': d.get('recovered'), 'active': d.get('active'),
                    'critical': d.get('critical'), 'todayCases': d.get('todayCases'),
                    'todayDeaths': d.get('todayDeaths'),
                }
        except: pass
        
        # South Asia regional comparison
        try:
            r = http_requests.get('https://disease.sh/v3/covid-19/countries?sort=cases', timeout=10)
            if r.status_code == 200:
                sa = ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Myanmar', 'Maldives', 'Bhutan']
                result['south_asia'] = [c for c in r.json() if c.get('country') in sa]
        except: pass
        
        result['source_info'] = {
            'who_gho': {'name': 'WHO GHO API', 'url': 'ghoapi.azureedge.net', 'desc': 'World Health Organization Global Health Observatory'},
            'disease_sh': {'name': 'disease.sh', 'url': 'disease.sh', 'desc': 'Open disease data (Johns Hopkins, WHO, CDC, ECDC)'},
            'openweathermap': {'name': 'OpenWeatherMap', 'url': 'openweathermap.org', 'desc': 'Real-time weather for risk modeling'},
        }
        
        return jsonify(result)
    
    return app
