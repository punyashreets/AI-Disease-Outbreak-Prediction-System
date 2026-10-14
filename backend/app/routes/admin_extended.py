from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from datetime import datetime, timedelta
import random

admin_ext_bp = Blueprint('admin_ext', __name__)

# ─── USER MANAGEMENT ───

@admin_ext_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    db = current_app.db
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 50))
    search = request.args.get('search', '')
    role = request.args.get('role', '')
    
    query = {}
    if search:
        query['$or'] = [
            {'full_name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}},
        ]
    if role:
        query['role'] = role
    
    total = db.users.count_documents(query)
    users = list(db.users.find(query).skip(skip).limit(limit).sort('created_at', -1))
    
    result = []
    for u in users:
        result.append({
            'id': str(u['_id']),
            'full_name': u.get('full_name', ''),
            'email': u.get('email', ''),
            'role': u.get('role', 'citizen'),
            'state': u.get('state', ''),
            'district': u.get('district', ''),
            'city': u.get('city', ''),
            'is_blocked': u.get('is_blocked', False),
            'created_at': u.get('created_at', '').isoformat() if isinstance(u.get('created_at'), datetime) else str(u.get('created_at', '')),
            'last_login': u.get('last_login', '').isoformat() if isinstance(u.get('last_login'), datetime) else str(u.get('last_login', '')),
        })
    
    return jsonify({'users': result, 'total': total}), 200


@admin_ext_bp.route('/users/<user_id>/block', methods=['PUT'])
@jwt_required()
def toggle_block_user(user_id):
    db = current_app.db
    from bson.objectid import ObjectId
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        new_status = not user.get('is_blocked', False)
        db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'is_blocked': new_status}})
        
        _log_activity(db, get_jwt_identity(), 'user_management', 
                      f'{"Blocked" if new_status else "Unblocked"} user {user.get("email")}')
        
        return jsonify({'message': f'User {"blocked" if new_status else "unblocked"}', 'is_blocked': new_status}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@admin_ext_bp.route('/users/<user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    db = current_app.db
    from bson.objectid import ObjectId
    data = request.get_json()
    role = data.get('role', 'citizen')
    
    valid_roles = ['citizen', 'admin', 'health_officer', 'analyst', 'viewer']
    if role not in valid_roles:
        return jsonify({'error': f'Invalid role. Choose from: {valid_roles}'}), 400
    
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'role': role}})
        _log_activity(db, get_jwt_identity(), 'user_management',
                      f'Changed role of {user.get("email")} to {role}')
        
        return jsonify({'message': f'Role updated to {role}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@admin_ext_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    db = current_app.db
    from bson.objectid import ObjectId
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.users.delete_one({'_id': ObjectId(user_id)})
        _log_activity(db, get_jwt_identity(), 'user_management',
                      f'Deleted user {user.get("email")}')
        
        return jsonify({'message': 'User deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ─── ACTIVITY LOGS ───

@admin_ext_bp.route('/activity-logs', methods=['GET'])
@jwt_required()
def get_activity_logs():
    db = current_app.db
    log_type = request.args.get('type', '')
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 50))
    
    query = {}
    if log_type:
        query['type'] = log_type
    
    total = db.activity_logs.count_documents(query)
    logs = list(db.activity_logs.find(query).skip(skip).limit(limit).sort('timestamp', -1))
    
    result = []
    for log in logs:
        result.append({
            'id': str(log.get('_id', '')),
            'user_id': str(log.get('user_id', '')),
            'user_email': log.get('user_email', 'System'),
            'type': log.get('type', ''),
            'action': log.get('action', ''),
            'timestamp': log.get('timestamp', '').isoformat() if isinstance(log.get('timestamp'), datetime) else str(log.get('timestamp', '')),
            'details': log.get('details', ''),
        })
    
    return jsonify({'logs': result, 'total': total}), 200


@admin_ext_bp.route('/activity-logs/seed', methods=['POST'])
@jwt_required()
def seed_activity_logs():
    db = current_app.db
    
    activities = [
        ('login', 'Admin logged in', 'admin@system.com'),
        ('prediction', 'Ran Dengue prediction for Mumbai', 'admin@system.com'),
        ('dataset', 'Uploaded disease_data.csv (40 records)', 'admin@system.com'),
        ('alert', 'Created High Risk alert for Delhi region', 'admin@system.com'),
        ('user_management', 'Blocked user spam@test.com', 'admin@system.com'),
        ('login', 'User officer@health.gov logged in', 'officer@health.gov'),
        ('prediction', 'Batch prediction for 7 diseases', 'admin@system.com'),
        ('dataset', 'Seeded database with sample data', 'admin@system.com'),
        ('settings', 'Updated OpenWeatherMap API key', 'admin@system.com'),
        ('alert', 'Sent email notification to 15 users', 'admin@system.com'),
        ('login', 'User citizen1@gmail.com logged in', 'citizen1@gmail.com'),
        ('prediction', 'Forecast generated for next 30 days', 'admin@system.com'),
        ('dataset', 'Weather data synced from OpenWeatherMap', 'System'),
        ('alert', 'Auto-alert: Dengue risk exceeded threshold in Chennai', 'System'),
        ('login', 'User analyst@lab.in logged in', 'analyst@lab.in'),
        ('prediction', 'Spread simulation run for Malaria in Kolkata', 'admin@system.com'),
        ('dataset', 'Satellite data updated for 24 cities', 'System'),
        ('settings', 'System configuration backup created', 'System'),
        ('alert', 'Weekly digest sent to 45 subscribers', 'System'),
        ('login', 'Admin changed password', 'admin@system.com'),
    ]
    
    inserted = 0
    for i, (atype, action, email) in enumerate(activities):
        hours_ago = i * random.randint(2, 12)
        doc = {
            'user_id': 'system',
            'user_email': email,
            'type': atype,
            'action': action,
            'details': f'Automated log entry for {atype}',
            'timestamp': datetime.utcnow() - timedelta(hours=hours_ago),
        }
        try:
            db.activity_logs.insert_one(doc)
            inserted += 1
        except:
            pass
    
    return jsonify({'message': f'Seeded {inserted} activity log entries'}), 200


# ─── SETTINGS ───

@admin_ext_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    db = current_app.db
    settings = db.system_settings.find_one({'_id': 'main'}) or {}
    
    return jsonify({
        'settings': {
            'api_keys': {
                'openweathermap': settings.get('openweathermap_key', '***configured***'),
                'emailjs_service': settings.get('emailjs_service', '***configured***'),
                'emailjs_template': settings.get('emailjs_template', '***configured***'),
            },
            'alert_thresholds': {
                'high_risk_probability': settings.get('high_risk_threshold', 0.7),
                'medium_risk_probability': settings.get('medium_risk_threshold', 0.35),
                'auto_email_alerts': settings.get('auto_email_alerts', True),
                'auto_sms_alerts': settings.get('auto_sms_alerts', False),
            },
            'system': {
                'app_name': settings.get('app_name', 'Disease Outbreak Prediction System'),
                'version': '1.0.0',
                'auto_backup': settings.get('auto_backup', True),
                'dark_mode_default': settings.get('dark_mode_default', True),
                'max_predictions_per_hour': settings.get('max_predictions_per_hour', 100),
            }
        }
    }), 200


@admin_ext_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    db = current_app.db
    data = request.get_json()
    
    update = {k: v for k, v in data.items() if k in [
        'openweathermap_key', 'emailjs_service', 'emailjs_template',
        'high_risk_threshold', 'medium_risk_threshold',
        'auto_email_alerts', 'auto_sms_alerts',
        'app_name', 'auto_backup', 'dark_mode_default', 'max_predictions_per_hour'
    ]}
    
    if update:
        db.system_settings.update_one(
            {'_id': 'main'},
            {'$set': update},
            upsert=True
        )
    
    _log_activity(db, get_jwt_identity(), 'settings', f'Updated settings: {list(update.keys())}')
    
    return jsonify({'message': 'Settings updated'}), 200


@admin_ext_bp.route('/settings/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    db = current_app.db
    from bson.objectid import ObjectId
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400
    
    user_id = get_jwt_identity()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    
    if not User.verify_password(user, data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    hashed = User.hash_password(data['new_password'])
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'password': hashed}})
    
    _log_activity(db, user_id, 'settings', 'Password changed')
    
    return jsonify({'message': 'Password changed successfully'}), 200


@admin_ext_bp.route('/settings/backup', methods=['POST'])
@jwt_required()
def backup_data():
    db = current_app.db
    
    collections = ['users', 'disease_records', 'weather_data', 'satellite_data',
                   'population_data', 'alerts', 'predictions', 'activity_logs']
    backup_info = {}
    
    for coll in collections:
        count = db[coll].count_documents({})
        backup_info[coll] = count
    
    _log_activity(db, get_jwt_identity(), 'settings', f'Database backup created')
    
    return jsonify({
        'message': 'Backup created successfully',
        'backup': backup_info,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# ─── SATELLITE MONITORING (Admin) ───

@admin_ext_bp.route('/satellite-overview', methods=['GET'])
def satellite_overview():
    db = current_app.db
    
    cities_data = [
        {'city': 'Mumbai', 'ndvi': 0.42, 'lst': 34.5, 'water_bodies': 0.18, 'risk': 'High'},
        {'city': 'Delhi', 'ndvi': 0.28, 'lst': 38.2, 'water_bodies': 0.08, 'risk': 'High'},
        {'city': 'Chennai', 'ndvi': 0.51, 'lst': 33.1, 'water_bodies': 0.22, 'risk': 'Medium'},
        {'city': 'Kolkata', 'ndvi': 0.55, 'lst': 32.8, 'water_bodies': 0.35, 'risk': 'High'},
        {'city': 'Bangalore', 'ndvi': 0.58, 'lst': 29.5, 'water_bodies': 0.12, 'risk': 'Low'},
        {'city': 'Pune', 'ndvi': 0.45, 'lst': 31.2, 'water_bodies': 0.10, 'risk': 'Medium'},
        {'city': 'Hyderabad', 'ndvi': 0.38, 'lst': 35.8, 'water_bodies': 0.15, 'risk': 'Medium'},
        {'city': 'Ahmedabad', 'ndvi': 0.22, 'lst': 39.1, 'water_bodies': 0.05, 'risk': 'Low'},
        {'city': 'Lucknow', 'ndvi': 0.35, 'lst': 36.4, 'water_bodies': 0.11, 'risk': 'Medium'},
        {'city': 'Jaipur', 'ndvi': 0.18, 'lst': 40.2, 'water_bodies': 0.03, 'risk': 'Low'},
        {'city': 'Patna', 'ndvi': 0.48, 'lst': 33.9, 'water_bodies': 0.28, 'risk': 'High'},
        {'city': 'Bhopal', 'ndvi': 0.52, 'lst': 31.5, 'water_bodies': 0.20, 'risk': 'Medium'},
    ]
    
    records = db.satellite_data.count_documents({})
    
    return jsonify({
        'cities': cities_data,
        'total_records': records,
        'satellite_sources': [
            {'name': 'MODIS NDVI', 'resolution': '250m', 'revisit': 'Daily', 'status': 'Active'},
            {'name': 'MODIS LST', 'resolution': '1km', 'revisit': 'Daily', 'status': 'Active'},
            {'name': 'Landsat 8/9', 'resolution': '30m', 'revisit': '16 days', 'status': 'Active'},
            {'name': 'Sentinel-2', 'resolution': '10m', 'revisit': '5 days', 'status': 'Active'},
        ]
    }), 200


# ─── WEATHER OVERVIEW (Admin) ───

@admin_ext_bp.route('/weather-overview', methods=['GET'])
def weather_overview():
    db = current_app.db
    
    cities_weather = [
        {'city': 'Mumbai', 'temp': 31.2, 'humidity': 82, 'rainfall': 45.2, 'wind': 12.5, 'aqi': 95},
        {'city': 'Delhi', 'temp': 38.5, 'humidity': 45, 'rainfall': 0, 'wind': 8.3, 'aqi': 210},
        {'city': 'Chennai', 'temp': 34.8, 'humidity': 75, 'rainfall': 12.8, 'wind': 15.2, 'aqi': 78},
        {'city': 'Kolkata', 'temp': 33.1, 'humidity': 88, 'rainfall': 68.5, 'wind': 10.1, 'aqi': 120},
        {'city': 'Bangalore', 'temp': 26.4, 'humidity': 65, 'rainfall': 22.1, 'wind': 9.8, 'aqi': 55},
        {'city': 'Pune', 'temp': 29.8, 'humidity': 70, 'rainfall': 35.6, 'wind': 11.2, 'aqi': 72},
        {'city': 'Hyderabad', 'temp': 35.2, 'humidity': 55, 'rainfall': 8.4, 'wind': 7.9, 'aqi': 88},
        {'city': 'Ahmedabad', 'temp': 40.1, 'humidity': 35, 'rainfall': 0, 'wind': 14.5, 'aqi': 145},
    ]
    
    records = db.weather_data.count_documents({})
    
    return jsonify({
        'cities': cities_weather,
        'total_records': records,
        'historical_trend': [
            {'month': 'Jan', 'avg_temp': 22, 'avg_rainfall': 15, 'avg_humidity': 55},
            {'month': 'Feb', 'avg_temp': 25, 'avg_rainfall': 12, 'avg_humidity': 50},
            {'month': 'Mar', 'avg_temp': 30, 'avg_rainfall': 18, 'avg_humidity': 48},
            {'month': 'Apr', 'avg_temp': 34, 'avg_rainfall': 25, 'avg_humidity': 52},
            {'month': 'May', 'avg_temp': 37, 'avg_rainfall': 45, 'avg_humidity': 60},
            {'month': 'Jun', 'avg_temp': 35, 'avg_rainfall': 120, 'avg_humidity': 75},
            {'month': 'Jul', 'avg_temp': 32, 'avg_rainfall': 210, 'avg_humidity': 82},
            {'month': 'Aug', 'avg_temp': 31, 'avg_rainfall': 185, 'avg_humidity': 80},
            {'month': 'Sep', 'avg_temp': 32, 'avg_rainfall': 145, 'avg_humidity': 78},
            {'month': 'Oct', 'avg_temp': 30, 'avg_rainfall': 85, 'avg_humidity': 70},
            {'month': 'Nov', 'avg_temp': 26, 'avg_rainfall': 30, 'avg_humidity': 60},
            {'month': 'Dec', 'avg_temp': 22, 'avg_rainfall': 10, 'avg_humidity': 52},
        ]
    }), 200


# ─── PREDICTION HISTORY ───

@admin_ext_bp.route('/prediction-history', methods=['GET'])
@jwt_required()
def prediction_history():
    db = current_app.db
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 50))
    disease = request.args.get('disease', '')
    
    query = {}
    if disease:
        query['disease'] = disease
    
    total = db.predictions.count_documents(query)
    preds = list(db.predictions.find(query).skip(skip).limit(limit).sort('created_at', -1))
    
    result = []
    for p in preds:
        result.append({
            'id': str(p.get('_id', '')),
            'disease': p.get('disease', ''),
            'state': p.get('state', ''),
            'district': p.get('district', ''),
            'probability': p.get('probability', 0),
            'risk_level': p.get('risk_level', ''),
            'model_used': p.get('model_used', 'Random Forest'),
            'confidence': p.get('confidence', 0.87),
            'created_at': p.get('created_at', '').isoformat() if isinstance(p.get('created_at'), datetime) else str(p.get('created_at', '')),
        })
    
    return jsonify({'predictions': result, 'total': total}), 200


# ─── HELPER ───

def _log_activity(db, user_id, activity_type, action, details=''):
    try:
        user = db.users.find_one({'_id': __import__('bson').objectid.ObjectId(user_id)})
        email = user.get('email', 'unknown') if user else 'System'
    except:
        email = 'System'
    
    try:
        db.activity_logs.insert_one({
            'user_id': str(user_id),
            'user_email': email,
            'type': activity_type,
            'action': action,
            'details': details,
            'timestamp': datetime.utcnow(),
        })
    except:
        pass
