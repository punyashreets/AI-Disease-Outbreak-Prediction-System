from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models.data_models import DiseaseRecord, WeatherData, SatelliteData, PopulationData
from werkzeug.utils import secure_filename
from datetime import datetime
import csv
import io

data_bp = Blueprint('data', __name__)

ALLOWED_COLLECTIONS = {
    'disease': DiseaseRecord,
    'weather': WeatherData,
    'satellite': SatelliteData,
    'population': PopulationData
}

@data_bp.route('/upload/<collection>', methods=['POST'])
@jwt_required()
def upload_csv(collection):
    if collection not in ALLOWED_COLLECTIONS:
        return jsonify({'error': 'Invalid collection'}), 400
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files allowed'}), 400
    
    db = current_app.db
    stream = io.StringIO(file.stream.read().decode('utf-8'))
    reader = csv.DictReader(stream)
    
    count = 0
    errors = []
    
    for i, row in enumerate(reader):
        try:
            if collection == 'disease':
                DiseaseRecord.create(
                    db, row.get('disease_name', ''), row.get('state', ''), row.get('district', ''),
                    int(row.get('cases', 0)), int(row.get('deaths', 0)), int(row.get('recovered', 0)),
                    row.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
                )
            elif collection == 'weather':
                WeatherData.create(
                    db, row.get('state', ''), row.get('district', ''), row.get('city', ''),
                    float(row.get('temperature', 0)), float(row.get('humidity', 0)),
                    float(row.get('rainfall', 0)), float(row.get('wind_speed', 0))
                )
            elif collection == 'satellite':
                SatelliteData.create(
                    db, row.get('state', ''), row.get('district', ''),
                    float(row.get('ndvi', 0)), float(row.get('land_surface_temp', 0)),
                    float(row.get('water_bodies', 0)), float(row.get('vegetation_index', 0))
                )
            elif collection == 'population':
                PopulationData.create(
                    db, row.get('state', ''), row.get('district', ''),
                    float(row.get('population_density', 0)),
                    float(row.get('urbanization', 0)),
                    row.get('demographics', '{}')
                )
            count += 1
        except Exception as e:
            errors.append(f'Row {i+2}: {str(e)}')
    
    return jsonify({
        'message': f'Imported {count} records',
        'imported': count,
        'errors': errors[:10]
    }), 200


@data_bp.route('/<collection>', methods=['GET'])
def get_data(collection):
    if collection not in ALLOWED_COLLECTIONS:
        return jsonify({'error': 'Invalid collection'}), 400
    
    db = current_app.db
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 100))
    
    model = ALLOWED_COLLECTIONS[collection]
    records = model.get_all(db, skip=skip, limit=limit)
    total = model.count(db)
    
    return jsonify({
        'records': records,
        'total': total,
        'skip': skip,
        'limit': limit
    }), 200


@data_bp.route('/<collection>/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(collection, record_id):
    if collection not in ALLOWED_COLLECTIONS:
        return jsonify({'error': 'Invalid collection'}), 400
    
    db = current_app.db
    if collection == 'disease':
        DiseaseRecord.delete(db, record_id)
    
    return jsonify({'message': 'Record deleted'}), 200


@data_bp.route('/seed', methods=['POST'])
@jwt_required()
def seed_data():
    """Seed the database with sample data"""
    db = current_app.db
    
    seed_disease_data(db)
    seed_weather_data(db)
    seed_satellite_data(db)
    seed_population_data(db)
    seed_alerts(db)
    
    return jsonify({'message': 'Database seeded with sample data'}), 200


def seed_disease_data(db):
    diseases = ['Dengue', 'Malaria', 'Cholera', 'Typhoid', 'Influenza', 'COVID-19', 'Leptospirosis']
    states = [
        ('Maharashtra', ['Mumbai', 'Pune', 'Nagpur', 'Nashik']),
        ('Delhi', ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi']),
        ('Karnataka', ['Bangalore', 'Mysore', 'Mangalore', 'Hubli']),
        ('Tamil Nadu', ['Chennai', 'Coimbatore', 'Madurai', 'Trichy']),
        ('West Bengal', ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri']),
        ('Uttar Pradesh', ['Lucknow', 'Kanpur', 'Varanasi', 'Agra']),
        ('Gujarat', ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot']),
        ('Kerala', ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'])
    ]
    
    import random
    for disease in diseases:
        for state, districts in states:
            for district in districts:
                for month in range(1, 13):
                    DiseaseRecord.create(
                        db, disease, state, district,
                        cases=random.randint(10, 500),
                        deaths=random.randint(0, 20),
                        recovered=random.randint(5, 400),
                        date=f'2025-{month:02d}-15'
                    )


def seed_weather_data(db):
    import random
    states = [
        ('Maharashtra', ['Mumbai', 'Pune', 'Nagpur']),
        ('Delhi', ['New Delhi', 'North Delhi']),
        ('Karnataka', ['Bangalore', 'Mysore']),
        ('Tamil Nadu', ['Chennai', 'Coimbatore']),
        ('West Bengal', ['Kolkata', 'Howrah']),
        ('Uttar Pradesh', ['Lucknow', 'Kanpur']),
        ('Gujarat', ['Ahmedabad', 'Surat']),
        ('Kerala', ['Thiruvananthapuram', 'Kochi'])
    ]
    
    for state, districts in states:
        for district in districts:
            WeatherData.create(
                db, state, district, district,
                temperature=round(random.uniform(22, 42), 1),
                humidity=round(random.uniform(40, 95), 1),
                rainfall=round(random.uniform(0, 200), 1),
                wind_speed=round(random.uniform(2, 25), 1)
            )


def seed_satellite_data(db):
    import random
    states = [
        ('Maharashtra', ['Mumbai', 'Pune', 'Nagpur']),
        ('Delhi', ['New Delhi']),
        ('Karnataka', ['Bangalore', 'Mysore']),
        ('Tamil Nadu', ['Chennai']),
        ('West Bengal', ['Kolkata']),
        ('Uttar Pradesh', ['Lucknow']),
        ('Gujarat', ['Ahmedabad']),
        ('Kerala', ['Thiruvananthapuram', 'Kochi'])
    ]
    
    for state, districts in states:
        for district in districts:
            SatelliteData.create(
                db, state, district,
                ndvi=round(random.uniform(0.1, 0.8), 3),
                land_surface_temp=round(random.uniform(25, 45), 1),
                water_bodies=round(random.uniform(0, 0.5), 3),
                vegetation_index=round(random.uniform(0.2, 0.9), 3)
            )


def seed_population_data(db):
    import random
    states = [
        ('Maharashtra', ['Mumbai', 'Pune', 'Nagpur']),
        ('Delhi', ['New Delhi', 'North Delhi']),
        ('Karnataka', ['Bangalore', 'Mysore']),
        ('Tamil Nadu', ['Chennai', 'Coimbatore']),
        ('West Bengal', ['Kolkata']),
        ('Uttar Pradesh', ['Lucknow', 'Kanpur']),
        ('Gujarat', ['Ahmedabad', 'Surat']),
        ('Kerala', ['Thiruvananthapuram', 'Kochi'])
    ]
    
    for state, districts in states:
        for district in districts:
            PopulationData.create(
                db, state, district,
                population_density=round(random.uniform(500, 20000), 0),
                urbanization=round(random.uniform(0.3, 0.95), 2),
                demographics=f'{{"total": {random.randint(100000, 20000000)}, "literacy": {round(random.uniform(60, 95), 1)}}}'
            )


def seed_alerts(db):
    from app.models.data_models import Alert
    
    alerts_data = [
        ('Dengue Outbreak Warning', 'High dengue activity reported. Remove stagnant water.', 'High', 'Maharashtra', 'Dengue'),
        ('Malaria Season Alert', 'Monsoon season increases malaria risk. Use mosquito nets.', 'High', 'Kerala', 'Malaria'),
        ('Water Contamination Advisory', 'Cholera risk elevated. Drink boiled water only.', 'Medium', 'West Bengal', 'Cholera'),
        ('Seasonal Flu Advisory', 'Influenza cases rising. Get vaccinated.', 'Medium', 'Delhi', 'Influenza'),
        ('Heat Wave Warning', 'Extreme temperatures expected. Stay hydrated.', 'Low', 'Rajasthan', None),
        ('Typhoid Prevention', 'Maintain hygiene and drink purified water.', 'Medium', 'Uttar Pradesh', 'Typhoid'),
        ('COVID-19 Monitoring', 'New variant detected. Follow safety protocols.', 'High', 'Karnataka', 'COVID-19'),
    ]
    
    for title, message, risk, region, disease in alerts_data:
        Alert.create(db, title, message, risk, region, disease_name=disease)
