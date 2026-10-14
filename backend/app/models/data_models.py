from datetime import datetime
from bson.objectid import ObjectId

class DiseaseRecord:
    COLLECTION = 'disease_records'
    
    @staticmethod
    def create(db, disease_name, state, district, cases, deaths, recovered, date, source='manual'):
        doc = {
            'disease_name': disease_name,
            'state': state,
            'district': district,
            'cases': cases,
            'deaths': deaths,
            'recovered': recovered,
            'date': datetime.strptime(date, '%Y-%m-%d') if isinstance(date, str) else date,
            'source': source,
            'created_at': datetime.utcnow()
        }
        result = db[DiseaseRecord.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_by_region(db, state=None, district=None, limit=100):
        query = {}
        if state: query['state'] = state
        if district: query['district'] = district
        records = list(db[DiseaseRecord.COLLECTION].find(query).sort('date', -1).limit(limit))
        return [DiseaseRecord.to_dict(r) for r in records]
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        records = list(db[DiseaseRecord.COLLECTION].find().sort('date', -1).skip(skip).limit(limit))
        return [DiseaseRecord.to_dict(r) for r in records]
    
    @staticmethod
    def get_stats(db):
        pipeline = [
            {'$group': {
                '_id': '$disease_name',
                'total_cases': {'$sum': '$cases'},
                'total_deaths': {'$sum': '$deaths'},
                'total_recovered': {'$sum': '$recovered'},
                'record_count': {'$sum': 1}
            }}
        ]
        return list(db[DiseaseRecord.COLLECTION].aggregate(pipeline))
    
    @staticmethod
    def get_state_wise(db):
        pipeline = [
            {'$group': {
                '_id': {'state': '$state', 'disease': '$disease_name'},
                'total_cases': {'$sum': '$cases'},
                'total_deaths': {'$sum': '$deaths'}
            }},
            {'$sort': {'total_cases': -1}}
        ]
        return list(db[DiseaseRecord.COLLECTION].aggregate(pipeline))
    
    @staticmethod
    def get_monthly_trends(db):
        pipeline = [
            {'$group': {
                '_id': {'year': {'$year': '$date'}, 'month': {'$month': '$date'}, 'disease': '$disease_name'},
                'total_cases': {'$sum': '$cases'}
            }},
            {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]
        return list(db[DiseaseRecord.COLLECTION].aggregate(pipeline))
    
    @staticmethod
    def count(db):
        return db[DiseaseRecord.COLLECTION].count_documents({})
    
    @staticmethod
    def to_dict(record):
        return {
            'id': str(record['_id']),
            'disease_name': record['disease_name'],
            'state': record['state'],
            'district': record['district'],
            'cases': record['cases'],
            'deaths': record['deaths'],
            'recovered': record['recovered'],
            'date': record['date'].isoformat() if isinstance(record['date'], datetime) else str(record['date']),
            'source': record.get('source', 'manual'),
            'created_at': record['created_at'].isoformat() if isinstance(record['created_at'], datetime) else str(record['created_at'])
        }
    
    @staticmethod
    def delete(db, record_id):
        return db[DiseaseRecord.COLLECTION].delete_one({'_id': ObjectId(record_id)})
    
    @staticmethod
    def update(db, record_id, data):
        return db[DiseaseRecord.COLLECTION].update_one(
            {'_id': ObjectId(record_id)},
            {'$set': data}
        )


class WeatherData:
    COLLECTION = 'weather_data'
    
    @staticmethod
    def create(db, state, district, city, temperature, humidity, rainfall, wind_speed, date=None):
        doc = {
            'state': state, 'district': district, 'city': city,
            'temperature': temperature, 'humidity': humidity,
            'rainfall': rainfall, 'wind_speed': wind_speed,
            'date': date or datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
        result = db[WeatherData.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_latest(db, state=None, district=None):
        query = {}
        if state: query['state'] = state
        if district: query['district'] = district
        record = db[WeatherData.COLLECTION].find_one(query, sort=[('created_at', -1)])
        return WeatherData.to_dict(record) if record else None
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        records = list(db[WeatherData.COLLECTION].find().sort('created_at', -1).skip(skip).limit(limit))
        return [WeatherData.to_dict(r) for r in records]
    
    @staticmethod
    def count(db):
        return db[WeatherData.COLLECTION].count_documents({})
    
    @staticmethod
    def to_dict(record):
        return {
            'id': str(record['_id']),
            'state': record['state'], 'district': record['district'], 'city': record['city'],
            'temperature': record['temperature'], 'humidity': record['humidity'],
            'rainfall': record['rainfall'], 'wind_speed': record['wind_speed'],
            'date': record['date'].isoformat() if isinstance(record['date'], datetime) else str(record['date']),
            'created_at': record['created_at'].isoformat() if isinstance(record['created_at'], datetime) else str(record['created_at'])
        }


class SatelliteData:
    COLLECTION = 'satellite_data'
    
    @staticmethod
    def create(db, state, district, ndvi, land_surface_temp, water_bodies, vegetation_index, date=None):
        doc = {
            'state': state, 'district': district,
            'ndvi': ndvi, 'land_surface_temp': land_surface_temp,
            'water_bodies': water_bodies, 'vegetation_index': vegetation_index,
            'date': date or datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
        result = db[SatelliteData.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_latest(db, state=None, district=None):
        query = {}
        if state: query['state'] = state
        if district: query['district'] = district
        record = db[SatelliteData.COLLECTION].find_one(query, sort=[('created_at', -1)])
        return SatelliteData.to_dict(record) if record else None
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        records = list(db[SatelliteData.COLLECTION].find().sort('created_at', -1).skip(skip).limit(limit))
        return [SatelliteData.to_dict(r) for r in records]
    
    @staticmethod
    def count(db):
        return db[SatelliteData.COLLECTION].count_documents({})
    
    @staticmethod
    def to_dict(record):
        return {
            'id': str(record['_id']),
            'state': record['state'], 'district': record['district'],
            'ndvi': record['ndvi'], 'land_surface_temp': record['land_surface_temp'],
            'water_bodies': record['water_bodies'], 'vegetation_index': record['vegetation_index'],
            'date': record['date'].isoformat() if isinstance(record['date'], datetime) else str(record['date']),
            'created_at': record['created_at'].isoformat() if isinstance(record['created_at'], datetime) else str(record['created_at'])
        }


class PopulationData:
    COLLECTION = 'population_data'
    
    @staticmethod
    def create(db, state, district, population_density, urbanization, demographics):
        doc = {
            'state': state, 'district': district,
            'population_density': population_density,
            'urbanization': urbanization,
            'demographics': demographics,
            'created_at': datetime.utcnow()
        }
        result = db[PopulationData.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_by_region(db, state=None, district=None):
        query = {}
        if state: query['state'] = state
        if district: query['district'] = district
        record = db[PopulationData.COLLECTION].find_one(query)
        return PopulationData.to_dict(record) if record else None
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        records = list(db[PopulationData.COLLECTION].find().skip(skip).limit(limit))
        return [PopulationData.to_dict(r) for r in records]
    
    @staticmethod
    def count(db):
        return db[PopulationData.COLLECTION].count_documents({})
    
    @staticmethod
    def to_dict(record):
        return {
            'id': str(record['_id']),
            'state': record['state'], 'district': record['district'],
            'population_density': record['population_density'],
            'urbanization': record['urbanization'],
            'demographics': record['demographics'],
            'created_at': record['created_at'].isoformat() if isinstance(record['created_at'], datetime) else str(record['created_at'])
        }


class Alert:
    COLLECTION = 'alerts'
    
    @staticmethod
    def create(db, title, message, risk_level, region, disease_name=None, created_by=None, scheduled_at=None):
        doc = {
            'title': title, 'message': message, 'risk_level': risk_level,
            'region': region, 'disease_name': disease_name,
            'created_by': created_by, 'status': 'active',
            'scheduled_at': scheduled_at,
            'created_at': datetime.utcnow()
        }
        result = db[Alert.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_active(db, region=None):
        query = {'status': 'active'}
        if region: query['region'] = region
        alerts = list(db[Alert.COLLECTION].find(query).sort('created_at', -1))
        return [Alert.to_dict(a) for a in alerts]
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        alerts = list(db[Alert.COLLECTION].find().sort('created_at', -1).skip(skip).limit(limit))
        return [Alert.to_dict(a) for a in alerts]
    
    @staticmethod
    def update(db, alert_id, data):
        return db[Alert.COLLECTION].update_one({'_id': ObjectId(alert_id)}, {'$set': data})
    
    @staticmethod
    def delete(db, alert_id):
        return db[Alert.COLLECTION].delete_one({'_id': ObjectId(alert_id)})
    
    @staticmethod
    def count(db, query=None):
        return db[Alert.COLLECTION].count_documents(query or {})
    
    @staticmethod
    def to_dict(alert):
        return {
            'id': str(alert['_id']),
            'title': alert['title'], 'message': alert['message'],
            'risk_level': alert['risk_level'], 'region': alert['region'],
            'disease_name': alert.get('disease_name'),
            'created_by': alert.get('created_by'),
            'status': alert['status'],
            'scheduled_at': alert['scheduled_at'].isoformat() if alert.get('scheduled_at') and isinstance(alert['scheduled_at'], datetime) else alert.get('scheduled_at'),
            'created_at': alert['created_at'].isoformat() if isinstance(alert['created_at'], datetime) else str(alert['created_at'])
        }


class Prediction:
    COLLECTION = 'predictions'
    
    @staticmethod
    def create(db, state, district, disease_name, risk_level, probability, confidence, features, explanation):
        doc = {
            'state': state, 'district': district, 'disease_name': disease_name,
            'risk_level': risk_level, 'probability': probability,
            'confidence': confidence, 'features': features,
            'explanation': explanation,
            'created_at': datetime.utcnow()
        }
        result = db[Prediction.COLLECTION].insert_one(doc)
        return str(result.inserted_id)
    
    @staticmethod
    def get_latest(db, state=None, district=None):
        query = {}
        if state: query['state'] = state
        if district: query['district'] = district
        records = list(db[Prediction.COLLECTION].find(query).sort('created_at', -1).limit(10))
        return [Prediction.to_dict(r) for r in records]
    
    @staticmethod
    def get_all(db, skip=0, limit=100):
        records = list(db[Prediction.COLLECTION].find().sort('created_at', -1).skip(skip).limit(limit))
        return [Prediction.to_dict(r) for r in records]
    
    @staticmethod
    def count(db):
        return db[Prediction.COLLECTION].count_documents({})
    
    @staticmethod
    def to_dict(pred):
        return {
            'id': str(pred['_id']),
            'state': pred['state'], 'district': pred['district'],
            'disease_name': pred['disease_name'],
            'risk_level': pred['risk_level'],
            'probability': pred['probability'],
            'confidence': pred['confidence'],
            'features': pred.get('features', {}),
            'explanation': pred.get('explanation', ''),
            'created_at': pred['created_at'].isoformat() if isinstance(pred['created_at'], datetime) else str(pred['created_at'])
        }
