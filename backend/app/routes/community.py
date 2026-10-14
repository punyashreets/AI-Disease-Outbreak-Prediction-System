from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from bson.objectid import ObjectId

community_bp = Blueprint('community', __name__)

# ===================== COMMUNITY HEALTH REPORTS =====================

@community_bp.route('/reports', methods=['POST'])
@jwt_required()
def submit_report():
    """Citizen: Submit a community health report"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db

    report = {
        'user_id': user_id,
        'type': data.get('type', 'other'),  # fever_cluster, water_contamination, mosquito_breeding, health_hazard, other
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'location': {
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'district': data.get('district', ''),
            'state': data.get('state', ''),
            'lat': data.get('lat', 0),
            'lng': data.get('lng', 0),
        },
        'severity': data.get('severity', 'medium'),  # low, medium, high, critical
        'status': 'pending',  # pending, reviewing, resolved, dismissed
        'votes': 0,
        'created_at': datetime.utcnow()
    }
    result = db['community_reports'].insert_one(report)
    return jsonify({'message': 'Report submitted successfully', 'id': str(result.inserted_id)}), 201


@community_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    """Get community reports (filtered)"""
    db = current_app.db
    report_type = request.args.get('type')
    status = request.args.get('status')

    query = {}
    if report_type and report_type != 'all':
        query['type'] = report_type
    if status and status != 'all':
        query['status'] = status

    reports = list(db['community_reports'].find(query).sort('created_at', -1).limit(100))
    result = []
    for r in reports:
        result.append({
            'id': str(r['_id']),
            'type': r.get('type', ''),
            'title': r.get('title', ''),
            'description': r.get('description', ''),
            'location': r.get('location', {}),
            'severity': r.get('severity', 'medium'),
            'status': r.get('status', 'pending'),
            'votes': r.get('votes', 0),
            'created_at': r['created_at'].isoformat() if isinstance(r.get('created_at'), datetime) else str(r.get('created_at', '')),
        })
    return jsonify({'reports': result, 'total': len(result)})


@community_bp.route('/reports/<report_id>/vote', methods=['POST'])
@jwt_required()
def vote_report(report_id):
    """Vote on a community report"""
    db = current_app.db
    db['community_reports'].update_one({'_id': ObjectId(report_id)}, {'$inc': {'votes': 1}})
    return jsonify({'message': 'Vote recorded'})


@community_bp.route('/reports/<report_id>/status', methods=['PUT'])
@jwt_required()
def update_report_status(report_id):
    """Admin: Update report status"""
    data = request.get_json()
    db = current_app.db
    db['community_reports'].update_one(
        {'_id': ObjectId(report_id)},
        {'$set': {'status': data.get('status', 'reviewing'), 'updated_at': datetime.utcnow()}}
    )
    return jsonify({'message': 'Report status updated'})


@community_bp.route('/reports/stats', methods=['GET'])
@jwt_required()
def report_stats():
    """Get report statistics"""
    db = current_app.db
    total = db['community_reports'].count_documents({})
    pending = db['community_reports'].count_documents({'status': 'pending'})
    resolved = db['community_reports'].count_documents({'status': 'resolved'})

    # By type
    types = list(db['community_reports'].aggregate([
        {'$group': {'_id': '$type', 'count': {'$sum': 1}}}
    ]))

    # By severity
    severities = list(db['community_reports'].aggregate([
        {'$group': {'_id': '$severity', 'count': {'$sum': 1}}}
    ]))

    return jsonify({
        'total': total, 'pending': pending, 'resolved': resolved,
        'by_type': {t['_id']: t['count'] for t in types},
        'by_severity': {s['_id']: s['count'] for s in severities}
    })


# ===================== VACCINATION TRACKER =====================

VACCINE_SCHEDULE = [
    {'name': 'BCG', 'disease': 'Tuberculosis', 'age': 'At birth', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'OPV-0', 'disease': 'Polio', 'age': 'At birth', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Hepatitis B - Birth dose', 'disease': 'Hepatitis B', 'age': 'At birth', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Pentavalent-1', 'disease': 'DPT+HepB+Hib', 'age': '6 weeks', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Rotavirus-1', 'disease': 'Rotavirus', 'age': '6 weeks', 'category': 'Childhood', 'importance': 'Recommended'},
    {'name': 'IPV-1', 'disease': 'Polio', 'age': '6 weeks', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Pentavalent-2', 'disease': 'DPT+HepB+Hib', 'age': '10 weeks', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Pentavalent-3', 'disease': 'DPT+HepB+Hib', 'age': '14 weeks', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Measles/MR-1', 'disease': 'Measles/Rubella', 'age': '9 months', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Measles/MR-2', 'disease': 'Measles/Rubella', 'age': '16-24 months', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'DPT Booster-1', 'disease': 'DPT', 'age': '16-24 months', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'DPT Booster-2', 'disease': 'DPT', 'age': '5-6 years', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'TT', 'disease': 'Tetanus', 'age': '10 & 16 years', 'category': 'Childhood', 'importance': 'Mandatory'},
    {'name': 'Influenza (Annual)', 'disease': 'Influenza', 'age': 'All ages (yearly)', 'category': 'Seasonal', 'importance': 'Recommended'},
    {'name': 'COVID-19 Booster', 'disease': 'COVID-19', 'age': 'Adults', 'category': 'Adult', 'importance': 'Recommended'},
    {'name': 'Hepatitis A', 'disease': 'Hepatitis A', 'age': '12 months+', 'category': 'Optional', 'importance': 'Recommended'},
    {'name': 'Typhoid', 'disease': 'Typhoid', 'age': '2 years+', 'category': 'Optional', 'importance': 'Recommended'},
    {'name': 'HPV', 'disease': 'Cervical Cancer', 'age': '9-14 years', 'category': 'Optional', 'importance': 'Recommended'},
]


@community_bp.route('/vaccinations/schedule', methods=['GET'])
def get_vaccine_schedule():
    """Get complete vaccination schedule"""
    return jsonify({'schedule': VACCINE_SCHEDULE})


@community_bp.route('/vaccinations/records', methods=['GET'])
@jwt_required()
def get_vaccination_records():
    """Get user's vaccination records"""
    user_id = get_jwt_identity()
    db = current_app.db
    records = list(db['vaccination_records'].find({'user_id': user_id}).sort('date_taken', -1))
    result = []
    for r in records:
        result.append({
            'id': str(r['_id']),
            'vaccine_name': r.get('vaccine_name', ''),
            'disease': r.get('disease', ''),
            'date_taken': r['date_taken'].isoformat() if isinstance(r.get('date_taken'), datetime) else str(r.get('date_taken', '')),
            'hospital': r.get('hospital', ''),
            'batch_number': r.get('batch_number', ''),
            'next_due': r.get('next_due', ''),
        })
    return jsonify({'records': result})


@community_bp.route('/vaccinations/records', methods=['POST'])
@jwt_required()
def add_vaccination_record():
    """Add a vaccination record"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db

    record = {
        'user_id': user_id,
        'vaccine_name': data.get('vaccine_name', ''),
        'disease': data.get('disease', ''),
        'date_taken': datetime.strptime(data['date_taken'], '%Y-%m-%d') if data.get('date_taken') else datetime.utcnow(),
        'hospital': data.get('hospital', ''),
        'batch_number': data.get('batch_number', ''),
        'next_due': data.get('next_due', ''),
        'created_at': datetime.utcnow()
    }
    result = db['vaccination_records'].insert_one(record)
    return jsonify({'message': 'Vaccination record added', 'id': str(result.inserted_id)}), 201


@community_bp.route('/vaccinations/records/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_vaccination_record(record_id):
    """Delete a vaccination record"""
    db = current_app.db
    db['vaccination_records'].delete_one({'_id': ObjectId(record_id)})
    return jsonify({'message': 'Record deleted'})


@community_bp.route('/vaccinations/stats', methods=['GET'])
@jwt_required()
def vaccination_stats():
    """Get vaccination statistics for user"""
    user_id = get_jwt_identity()
    db = current_app.db

    total_records = db['vaccination_records'].count_documents({'user_id': user_id})
    mandatory_taken = list(db['vaccination_records'].find({
        'user_id': user_id,
        'vaccine_name': {'$in': [v['name'] for v in VACCINE_SCHEDULE if v['importance'] == 'Mandatory']}
    }))

    mandatory_names = [v['name'] for v in VACCINE_SCHEDULE if v['importance'] == 'Mandatory']
    taken_names = [r['vaccine_name'] for r in mandatory_taken]
    pending = [name for name in mandatory_names if name not in taken_names]

    return jsonify({
        'total_records': total_records,
        'mandatory_total': len(mandatory_names),
        'mandatory_done': len(mandatory_taken),
        'mandatory_pending': len(pending),
        'pending_vaccines': pending,
        'coverage_pct': round(len(mandatory_taken) / max(len(mandatory_names), 1) * 100, 1)
    })


# ===================== HEALTH CAMPS & EVENTS =====================

@community_bp.route('/camps', methods=['GET'])
def get_camps():
    """Get all health camps"""
    db = current_app.db
    camp_type = request.args.get('type')

    query = {'is_active': True}
    if camp_type and camp_type != 'all':
        query['type'] = camp_type

    camps = list(db['health_camps'].find(query).sort('event_date', 1).limit(50))
    result = []
    for c in camps:
        registrations = db['camp_registrations'].count_documents({'camp_id': str(c['_id'])})
        result.append({
            'id': str(c['_id']),
            'title': c.get('title', ''),
            'type': c.get('type', 'health_camp'),
            'description': c.get('description', ''),
            'event_date': c['event_date'].isoformat() if isinstance(c.get('event_date'), datetime) else str(c.get('event_date', '')),
            'location': c.get('location', ''),
            'city': c.get('city', ''),
            'state': c.get('state', ''),
            'organizer': c.get('organizer', ''),
            'capacity': c.get('capacity', 100),
            'registrations': registrations,
            'benefits': c.get('benefits', []),
            'contact': c.get('contact', ''),
        })
    return jsonify({'camps': result, 'total': len(result)})


@community_bp.route('/camps', methods=['POST'])
@jwt_required()
def create_camp():
    """Admin: Create a health camp"""
    data = request.get_json()
    db = current_app.db

    camp = {
        'title': data.get('title', ''),
        'type': data.get('type', 'health_camp'),  # health_camp, blood_donation, awareness_program
        'description': data.get('description', ''),
        'event_date': datetime.strptime(data['event_date'], '%Y-%m-%d') if data.get('event_date') else datetime.utcnow() + timedelta(days=7),
        'location': data.get('location', ''),
        'city': data.get('city', ''),
        'state': data.get('state', ''),
        'organizer': data.get('organizer', ''),
        'capacity': data.get('capacity', 100),
        'benefits': data.get('benefits', []),
        'contact': data.get('contact', ''),
        'is_active': True,
        'created_at': datetime.utcnow()
    }
    result = db['health_camps'].insert_one(camp)
    return jsonify({'message': 'Health camp created', 'id': str(result.inserted_id)}), 201


@community_bp.route('/camps/<camp_id>', methods=['PUT'])
@jwt_required()
def update_camp(camp_id):
    """Admin: Update health camp"""
    data = request.get_json()
    db = current_app.db
    update = {k: v for k, v in data.items() if k in ['title', 'description', 'event_date', 'location', 'city', 'state', 'organizer', 'capacity', 'benefits', 'contact', 'is_active']}
    if 'event_date' in update and isinstance(update['event_date'], str):
        update['event_date'] = datetime.strptime(update['event_date'], '%Y-%m-%d')
    db['health_camps'].update_one({'_id': ObjectId(camp_id)}, {'$set': update})
    return jsonify({'message': 'Camp updated'})


@community_bp.route('/camps/<camp_id>', methods=['DELETE'])
@jwt_required()
def delete_camp(camp_id):
    """Admin: Delete health camp"""
    db = current_app.db
    db['health_camps'].delete_one({'_id': ObjectId(camp_id)})
    return jsonify({'message': 'Camp deleted'})


@community_bp.route('/camps/<camp_id>/register', methods=['POST'])
@jwt_required()
def register_for_camp(camp_id):
    """Citizen: Register for a health camp"""
    user_id = get_jwt_identity()
    db = current_app.db

    existing = db['camp_registrations'].find_one({'camp_id': camp_id, 'user_id': user_id})
    if existing:
        return jsonify({'error': 'Already registered'}), 409

    registration = {
        'camp_id': camp_id,
        'user_id': user_id,
        'status': 'registered',
        'created_at': datetime.utcnow()
    }
    db['camp_registrations'].insert_one(registration)
    return jsonify({'message': 'Successfully registered for the camp!'}), 201


@community_bp.route('/camps/my-registrations', methods=['GET'])
@jwt_required()
def my_camp_registrations():
    """Get user's camp registrations"""
    user_id = get_jwt_identity()
    db = current_app.db

    regs = list(db['camp_registrations'].find({'user_id': user_id}))
    result = []
    for r in regs:
        camp = db['health_camps'].find_one({'_id': ObjectId(r['camp_id'])})
        if camp:
            result.append({
                'id': str(r['_id']),
                'camp_id': r['camp_id'],
                'camp_title': camp.get('title', ''),
                'camp_type': camp.get('type', ''),
                'event_date': camp['event_date'].isoformat() if isinstance(camp.get('event_date'), datetime) else str(camp.get('event_date', '')),
                'location': camp.get('location', ''),
                'status': r.get('status', 'registered'),
            })
    return jsonify({'registrations': result})


# ===================== DEMO DATA SEEDER =====================

@community_bp.route('/seed-demo', methods=['POST'])
def seed_demo_data():
    """Seed sample demo data across all modules"""
    db = current_app.db
    seeded = {}

    # 1. Sample Community Reports
    sample_reports = [
        {'type': 'fever_cluster', 'title': 'Fever cluster reported in Koramangala', 'description': 'Multiple families in 3rd Block reporting high fever with joint pain for the past week.', 'location': {'address': '3rd Block, Koramangala', 'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9352, 'lng': 77.6245}, 'severity': 'high', 'status': 'pending', 'votes': 12, 'user_id': 'demo', 'created_at': datetime.utcnow() - timedelta(days=2)},
        {'type': 'mosquito_breeding', 'title': 'Mosquito breeding near BBMP park', 'description': 'Stagnant water in the drainage near the park has become a mosquito breeding ground.', 'location': {'address': 'BBMP Park, HSR Layout', 'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9116, 'lng': 77.6389}, 'severity': 'medium', 'status': 'reviewing', 'votes': 8, 'user_id': 'demo', 'created_at': datetime.utcnow() - timedelta(days=5)},
        {'type': 'water_contamination', 'title': 'Contaminated water supply in Jayanagar', 'description': 'Water from the main supply line has a foul smell and brownish color.', 'location': {'address': '4th T Block, Jayanagar', 'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9250, 'lng': 77.5938}, 'severity': 'critical', 'status': 'pending', 'votes': 23, 'user_id': 'demo', 'created_at': datetime.utcnow() - timedelta(days=1)},
        {'type': 'health_hazard', 'title': 'Garbage pile near school', 'description': 'Large garbage pile near the government school causing health issues for children.', 'location': {'address': 'Govt School, BTM Layout', 'city': 'Bengaluru', 'district': 'Bengaluru Urban', 'state': 'Karnataka', 'lat': 12.9166, 'lng': 77.6101}, 'severity': 'high', 'status': 'resolved', 'votes': 15, 'user_id': 'demo', 'created_at': datetime.utcnow() - timedelta(days=10)},
    ]
    db['community_reports'].insert_many(sample_reports)
    seeded['community_reports'] = len(sample_reports)

    # 2. Sample Vaccination Records
    sample_vaccines = [
        {'vaccine_name': 'BCG', 'disease': 'Tuberculosis', 'date_taken': datetime(2020, 3, 15), 'hospital': 'City Health Center', 'batch_number': 'BCG-2020-001', 'user_id': 'demo', 'created_at': datetime.utcnow()},
        {'vaccine_name': 'COVID-19 Booster', 'disease': 'COVID-19', 'date_taken': datetime(2024, 6, 20), 'hospital': 'Apollo Clinic', 'batch_number': 'COV-2024-552', 'user_id': 'demo', 'created_at': datetime.utcnow()},
        {'vaccine_name': 'Influenza (Annual)', 'disease': 'Influenza', 'date_taken': datetime(2025, 1, 10), 'hospital': 'Manipal Hospital', 'batch_number': 'FLU-2025-089', 'user_id': 'demo', 'created_at': datetime.utcnow()},
        {'vaccine_name': 'Typhoid', 'disease': 'Typhoid', 'date_taken': datetime(2024, 8, 5), 'hospital': 'Fortis Hospital', 'batch_number': 'TYP-2024-123', 'user_id': 'demo', 'created_at': datetime.utcnow()},
        {'vaccine_name': 'Hepatitis A', 'disease': 'Hepatitis A', 'date_taken': datetime(2023, 11, 22), 'hospital': 'Narayana Health', 'batch_number': 'HEP-2023-445', 'user_id': 'demo', 'created_at': datetime.utcnow()},
    ]
    db['vaccination_records'].insert_many(sample_vaccines)
    seeded['vaccination_records'] = len(sample_vaccines)

    # 3. Sample Health Camps
    sample_camps = [
        {'title': 'Free Dengue Screening Camp', 'type': 'health_camp', 'description': 'Free blood test and dengue screening for all residents. Bring your Aadhaar card.', 'event_date': datetime.utcnow() + timedelta(days=7), 'location': 'Community Hall, Koramangala', 'city': 'Bengaluru', 'state': 'Karnataka', 'organizer': 'BBMP Health Dept', 'capacity': 200, 'benefits': ['Free Blood Test', 'Doctor Consultation', 'Free Medicines'], 'contact': '080-25551234', 'is_active': True, 'created_at': datetime.utcnow()},
        {'title': 'Blood Donation Drive', 'type': 'blood_donation', 'description': 'Donate blood, save lives. All blood groups needed urgently. Refreshments provided.', 'event_date': datetime.utcnow() + timedelta(days=14), 'location': 'Red Cross Bhavan, Indiranagar', 'city': 'Bengaluru', 'state': 'Karnataka', 'organizer': 'Indian Red Cross Society', 'capacity': 150, 'benefits': ['Health Checkup', 'Blood Group Card', 'Certificate'], 'contact': '080-25551000', 'is_active': True, 'created_at': datetime.utcnow()},
        {'title': 'Monsoon Health Awareness Program', 'type': 'awareness_program', 'description': 'Learn about monsoon diseases, prevention, and nutrition tips. Open for all ages.', 'event_date': datetime.utcnow() + timedelta(days=21), 'location': 'Town Hall, Jayanagar', 'city': 'Bengaluru', 'state': 'Karnataka', 'organizer': 'Karnataka Health Ministry', 'capacity': 300, 'benefits': ['Health Kit', 'Nutrition Guide', 'Expert Talk'], 'contact': '080-26661234', 'is_active': True, 'created_at': datetime.utcnow()},
    ]
    camp_result = db['health_camps'].insert_many(sample_camps)
    seeded['health_camps'] = len(sample_camps)

    # 4. Sample Food Orders
    sample_orders = [
        {'order_number': 'FD9001', 'user_id': 'demo', 'items': [{'name': 'Vegetable Soup', 'price': 89, 'qty': 2}, {'name': 'Coconut Water', 'price': 49, 'qty': 1}], 'subtotal': 227, 'delivery_fee': 40, 'tax': 13.35, 'total': 280.35, 'status': 'Delivered', 'payment': 'COD', 'address': '123 Main St, Koramangala', 'customer_name': 'Demo User', 'customer_phone': '9876543210', 'created_at': datetime.utcnow() - timedelta(days=3)},
        {'order_number': 'FD9002', 'user_id': 'demo', 'items': [{'name': 'Khichdi', 'price': 119, 'qty': 1}, {'name': 'Fresh Banana', 'price': 39, 'qty': 2}, {'name': 'ORS Solution', 'price': 29, 'qty': 3}], 'subtotal': 284, 'delivery_fee': 40, 'tax': 16.2, 'total': 340.2, 'status': 'Out For Delivery', 'payment': 'Online Demo', 'address': '123 Main St, Koramangala', 'customer_name': 'Demo User', 'customer_phone': '9876543210', 'created_at': datetime.utcnow() - timedelta(days=1)},
        {'order_number': 'FD9003', 'user_id': 'demo', 'items': [{'name': 'Papaya Leaf Juice', 'price': 149, 'qty': 1}, {'name': 'Orange Juice', 'price': 79, 'qty': 2}], 'subtotal': 307, 'delivery_fee': 40, 'tax': 17.35, 'total': 364.35, 'status': 'Preparing Food', 'payment': 'COD', 'address': '123 Main St, Koramangala', 'customer_name': 'Demo User', 'customer_phone': '9876543210', 'created_at': datetime.utcnow()},
    ]
    db['food_orders'].insert_many(sample_orders)
    seeded['food_orders'] = len(sample_orders)

    return jsonify({'message': 'Demo data seeded successfully', 'seeded': seeded}), 201
