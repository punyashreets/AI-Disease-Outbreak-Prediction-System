from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.models.data_models import DiseaseRecord

disease_bp = Blueprint('disease', __name__)

@disease_bp.route('/records', methods=['GET'])
def get_records():
    db = current_app.db
    state = request.args.get('state')
    district = request.args.get('district')
    limit = int(request.args.get('limit', 100))
    
    if state or district:
        records = DiseaseRecord.get_by_region(db, state, district, limit)
    else:
        records = DiseaseRecord.get_all(db, limit=limit)
    return jsonify({'records': records, 'count': len(records)}), 200


@disease_bp.route('/records', methods=['POST'])
@jwt_required()
def create_record():
    data = request.get_json()
    required = ['disease_name', 'state', 'district', 'cases', 'date']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    db = current_app.db
    record_id = DiseaseRecord.create(
        db, data['disease_name'], data['state'], data['district'],
        data['cases'], data.get('deaths', 0), data.get('recovered', 0), data['date']
    )
    return jsonify({'message': 'Record created', 'id': record_id}), 201


@disease_bp.route('/records/<record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    data = request.get_json()
    db = current_app.db
    DiseaseRecord.update(db, record_id, data)
    return jsonify({'message': 'Record updated'}), 200


@disease_bp.route('/records/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    db = current_app.db
    DiseaseRecord.delete(db, record_id)
    return jsonify({'message': 'Record deleted'}), 200


@disease_bp.route('/stats', methods=['GET'])
def get_stats():
    db = current_app.db
    stats = DiseaseRecord.get_stats(db)
    return jsonify({'stats': stats}), 200


@disease_bp.route('/state-wise', methods=['GET'])
def get_state_wise():
    db = current_app.db
    data = DiseaseRecord.get_state_wise(db)
    return jsonify({'data': data}), 200


@disease_bp.route('/monthly-trends', methods=['GET'])
def get_monthly_trends():
    db = current_app.db
    data = DiseaseRecord.get_monthly_trends(db)
    return jsonify({'data': data}), 200
