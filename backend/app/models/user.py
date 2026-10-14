from datetime import datetime
import bcrypt

class User:
    COLLECTION = 'users'
    
    @staticmethod
    def create(db, full_name, email, password, state, district, city, role='citizen'):
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        doc = {
            'full_name': full_name,
            'email': email.lower(),
            'password': hashed.decode('utf-8'),
            'state': state,
            'district': district,
            'city': city,
            'role': role,
            'alert_preferences': {'email': True, 'sms': False, 'push': True},
            'created_at': datetime.utcnow(),
            'last_login': None
        }
        result = db[User.COLLECTION].insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return doc
    
    @staticmethod
    def find_by_email(db, email):
        return db[User.COLLECTION].find_one({'email': email.lower()})
    
    @staticmethod
    def verify_password(user, password):
        return bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
    
    @staticmethod
    def to_dict(user):
        return {
            'id': str(user['_id']),
            'full_name': user['full_name'],
            'email': user['email'],
            'state': user['state'],
            'district': user['district'],
            'city': user['city'],
            'role': user.get('role', 'citizen'),
            'alert_preferences': user.get('alert_preferences', {}),
            'created_at': user['created_at'].isoformat() if isinstance(user['created_at'], datetime) else str(user['created_at'])
        }
    
    @staticmethod
    def update_last_login(db, user_id):
        from bson.objectid import ObjectId
        db[User.COLLECTION].update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_login': datetime.utcnow()}}
        )
    
    @staticmethod
    def get_all(db, skip=0, limit=50):
        users = list(db[User.COLLECTION].find().skip(skip).limit(limit))
        return [User.to_dict(u) for u in users]
    
    @staticmethod
    def count(db):
        return db[User.COLLECTION].count_documents({})
