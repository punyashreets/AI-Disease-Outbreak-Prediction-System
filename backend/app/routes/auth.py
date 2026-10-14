from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required = ['full_name', 'email', 'password', 'state', 'district', 'city']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    db = current_app.db
    existing = User.find_by_email(db, data['email'])
    if existing:
        return jsonify({'error': 'Email already registered'}), 409
    
    user = User.create(
        db, data['full_name'], data['email'], data['password'],
        data['state'], data['district'], data['city'],
        role=data.get('role', 'citizen')
    )
    
    token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(days=1))
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': User.to_dict(user)
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    db = current_app.db
    user = User.find_by_email(db, data['email'])
    if not user or not User.verify_password(user, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Admin login - update role if admin flag is set
    is_admin = data.get('isAdmin', False)
    if is_admin:
        db[User.COLLECTION].update_one({'_id': user['_id']}, {'$set': {'role': 'admin'}})
        user['role'] = 'admin'
    
    User.update_last_login(db, str(user['_id']))
    token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(days=1))
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': User.to_dict(user)
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson.objectid import ObjectId
    user = db[User.COLLECTION].find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': User.to_dict(user)}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db
    from bson.objectid import ObjectId
    
    allowed = ['full_name', 'state', 'district', 'city', 'alert_preferences']
    update_data = {k: v for k, v in data.items() if k in allowed}
    
    db[User.COLLECTION].update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
    user = db[User.COLLECTION].find_one({'_id': ObjectId(user_id)})
    return jsonify({'message': 'Profile updated', 'user': User.to_dict(user)}), 200
