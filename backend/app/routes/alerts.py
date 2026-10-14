from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.data_models import Alert
from app.models.user import User

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    db = current_app.db
    region = request.args.get('region')
    alerts = Alert.get_active(db, region)
    return jsonify({'alerts': alerts, 'count': len(alerts)}), 200


@alerts_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_alerts():
    db = current_app.db
    alerts = Alert.get_all(db, limit=int(request.args.get('limit', 100)))
    return jsonify({'alerts': alerts}), 200


@alerts_bp.route('/', methods=['POST'])
@jwt_required()
def create_alert():
    data = request.get_json()
    required = ['title', 'message', 'risk_level', 'region']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    db = current_app.db
    user_id = get_jwt_identity()
    alert_id = Alert.create(
        db, data['title'], data['message'], data['risk_level'],
        data['region'], data.get('disease_name'),
        created_by=user_id, scheduled_at=data.get('scheduled_at')
    )
    return jsonify({'message': 'Alert created', 'id': alert_id}), 201


@alerts_bp.route('/<alert_id>', methods=['PUT'])
@jwt_required()
def update_alert(alert_id):
    data = request.get_json()
    db = current_app.db
    Alert.update(db, alert_id, data)
    return jsonify({'message': 'Alert updated'}), 200


@alerts_bp.route('/<alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    db = current_app.db
    Alert.delete(db, alert_id)
    return jsonify({'message': 'Alert deleted'}), 200


@alerts_bp.route('/count', methods=['GET'])
def get_alert_count():
    db = current_app.db
    active = Alert.count(db, {'status': 'active'})
    total = Alert.count(db)
    return jsonify({'active': active, 'total': total}), 200
