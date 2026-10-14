from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/popup', methods=['GET'])
def get_popup_notifications():
    """Get popup notifications to show when user opens the website"""
    db = current_app.db
    
    notifications = []
    
    # 1. Check for active high-risk alerts
    try:
        high_risk_alerts = list(db.alerts.find(
            {'risk_level': 'High', 'active': True},
            sort=[('created_at', -1)]
        ).limit(3))
        for alert in high_risk_alerts:
            notifications.append({
                'id': str(alert.get('_id', '')),
                'type': 'high_risk',
                'title': alert.get('title', 'High Risk Alert'),
                'message': alert.get('message', 'New health alert in your region'),
                'icon': 'warning',
                'priority': 1,
                'action_url': '/?section=alerts',
                'timestamp': alert.get('created_at', datetime.utcnow()).isoformat() if isinstance(alert.get('created_at'), datetime) else str(alert.get('created_at', ''))
            })
    except:
        pass
    
    # 2. Check for recent predictions with high risk
    try:
        recent_predictions = list(db.predictions.find(
            {'risk_level': 'High'},
            sort=[('created_at', -1)]
        ).limit(2))
        for pred in recent_predictions:
            notifications.append({
                'id': str(pred.get('_id', '')),
                'type': 'prediction',
                'title': f"High {pred.get('disease', 'Disease')} Risk Detected",
                'message': f"Risk level elevated in {pred.get('state', 'your region')}. Take precautions.",
                'icon': 'trending_up',
                'priority': 2,
                'action_url': '/?section=predictions',
                'timestamp': pred.get('created_at', datetime.utcnow()).isoformat() if isinstance(pred.get('created_at'), datetime) else str(pred.get('created_at', ''))
            })
    except:
        pass
    
    # 3. Add seasonal health tips
    seasonal_tips = [
        {'title': 'Monsoon Season Alert', 'message': 'Dengue and Malaria cases rise during monsoon. Remove stagnant water and use mosquito nets.', 'icon': 'water_drop'},
        {'title': 'Stay Hydrated', 'message': 'Drink at least 8-10 glasses of water daily. Include ORS and coconut water during hot weather.', 'icon': 'local_drink'},
        {'title': 'Vaccination Reminder', 'message': 'Ensure you and your family are up to date with recommended vaccinations.', 'icon': 'vaccines'},
        {'title': 'Food Safety Tip', 'message': 'During monsoon season, avoid street food and uncooked items to prevent waterborne diseases.', 'icon': 'restaurant'},
        {'title': 'Mosquito Prevention', 'message': 'Empty flower pots, coolers, and containers weekly to prevent mosquito breeding.', 'icon': 'pest_control'},
    ]
    
    # Pick 1-2 random tips
    tips = random.sample(seasonal_tips, min(2, len(seasonal_tips)))
    for i, tip in enumerate(tips):
        notifications.append({
            'id': f'tip_{i}',
            'type': 'health_tip',
            'title': tip['title'],
            'message': tip['message'],
            'icon': tip['icon'],
            'priority': 5,
            'action_url': '/?section=advisory',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    # 4. Add system announcement
    notifications.append({
        'id': 'system_1',
        'type': 'announcement',
        'title': 'Welcome to Disease Outbreak Prediction System',
        'message': 'Your AI-powered health companion is ready. Check your personalized risk predictions, nearby hospitals, and health advisories.',
        'icon': 'campaign',
        'priority': 3,
        'action_url': '/',
        'timestamp': datetime.utcnow().isoformat()
    })
    
    # Sort by priority (lower number = higher priority)
    notifications.sort(key=lambda x: x.get('priority', 10))
    
    return jsonify({
        'notifications': notifications[:5],  # Max 5 popup notifications
        'count': len(notifications),
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@notifications_bp.route('/mark-read', methods=['POST'])
@jwt_required()
def mark_notification_read():
    """Mark a notification as read by the user"""
    user_id = get_jwt_identity()
    data = request.get_json()
    notification_ids = data.get('notification_ids', [])
    
    db = current_app.db
    db.notification_reads.update_one(
        {'user_id': user_id},
        {'$set': {
            'read_ids': notification_ids,
            'updated_at': datetime.utcnow()
        }},
        upsert=True
    )
    
    return jsonify({'message': 'Notifications marked as read'}), 200


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications for the user"""
    user_id = get_jwt_identity()
    db = current_app.db
    
    read_record = db.notification_reads.find_one({'user_id': user_id})
    read_ids = read_record.get('read_ids', []) if read_record else []
    
    # Total notifications available
    try:
        total_alerts = db.alerts.count_documents({'active': True})
    except:
        total_alerts = 3  # fallback
    
    unread = max(0, total_alerts - len(read_ids))
    
    return jsonify({
        'unread_count': unread,
        'total': total_alerts,
        'read_ids': read_ids
    }), 200
