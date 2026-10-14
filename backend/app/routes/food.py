from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson.objectid import ObjectId

food_bp = Blueprint('food', __name__)

# ===================== FOOD ITEMS =====================

# Seed data for food catalog
FOOD_CATALOG = [
    # Soups
    {'name': 'Vegetable Soup', 'category': 'Soups', 'description': 'Nutritious mixed vegetable soup with herbs', 'health_benefits': ['Boosts immunity', 'Rich in vitamins', 'Easy to digest'], 'nutrition': {'calories': 120, 'protein': '5g', 'fiber': '4g'}, 'price': 89, 'image': '🥣', 'popular': True},
    {'name': 'Chicken Broth', 'category': 'Soups', 'description': 'Light chicken broth with ginger and garlic', 'health_benefits': ['High protein', 'Fights cold', 'Hydrating'], 'nutrition': {'calories': 95, 'protein': '12g', 'fiber': '1g'}, 'price': 119, 'image': '🍲', 'popular': True},
    {'name': 'Tomato Soup', 'category': 'Soups', 'description': 'Fresh tomato soup with basil', 'health_benefits': ['Rich in lycopene', 'Antioxidant', 'Heart healthy'], 'nutrition': {'calories': 85, 'protein': '3g', 'fiber': '3g'}, 'price': 79, 'image': '🍅', 'popular': False},
    {'name': 'Dal Soup', 'category': 'Soups', 'description': 'Protein-rich lentil soup with spices', 'health_benefits': ['High protein', 'Iron rich', 'Energy boosting'], 'nutrition': {'calories': 140, 'protein': '9g', 'fiber': '6g'}, 'price': 69, 'image': '🫕', 'popular': False},
    # Healthy Meals
    {'name': 'Khichdi', 'category': 'Healthy Meals', 'description': 'Easy-to-digest rice and lentil dish', 'health_benefits': ['Easy to digest', 'Complete protein', 'Gentle on stomach'], 'nutrition': {'calories': 220, 'protein': '8g', 'fiber': '4g'}, 'price': 99, 'image': '🍚', 'popular': True},
    {'name': 'Curd Rice', 'category': 'Healthy Meals', 'description': 'Cooling curd rice with tempering', 'health_benefits': ['Probiotic', 'Cooling effect', 'Gut health'], 'nutrition': {'calories': 200, 'protein': '6g', 'fiber': '2g'}, 'price': 79, 'image': '🍙', 'popular': True},
    {'name': 'Chapati with Sabzi', 'category': 'Healthy Meals', 'description': 'Whole wheat chapati with seasonal vegetables', 'health_benefits': ['High fiber', 'Balanced meal', 'Sustained energy'], 'nutrition': {'calories': 280, 'protein': '8g', 'fiber': '7g'}, 'price': 109, 'image': '🫓', 'popular': False},
    {'name': 'Steamed Idli', 'category': 'Healthy Meals', 'description': 'Steamed rice cakes with chutney', 'health_benefits': ['Low fat', 'Fermented probiotic', 'Light meal'], 'nutrition': {'calories': 160, 'protein': '4g', 'fiber': '2g'}, 'price': 59, 'image': '🥟', 'popular': False},
    # Fruits
    {'name': 'Fresh Banana', 'category': 'Fruits', 'description': 'Rich in potassium and natural energy', 'health_benefits': ['Potassium rich', 'Natural energy', 'Easy to digest'], 'nutrition': {'calories': 90, 'protein': '1g', 'fiber': '3g'}, 'price': 15, 'image': '🍌', 'popular': True},
    {'name': 'Apple', 'category': 'Fruits', 'description': 'Fresh apple rich in fiber and antioxidants', 'health_benefits': ['Fiber rich', 'Antioxidant', 'Heart healthy'], 'nutrition': {'calories': 95, 'protein': '0.5g', 'fiber': '4g'}, 'price': 35, 'image': '🍎', 'popular': True},
    {'name': 'Papaya Bowl', 'category': 'Fruits', 'description': 'Fresh papaya rich in digestive enzymes', 'health_benefits': ['Digestive enzymes', 'Vitamin C', 'Anti-inflammatory'], 'nutrition': {'calories': 60, 'protein': '1g', 'fiber': '3g'}, 'price': 45, 'image': '🥭', 'popular': False},
    {'name': 'Orange', 'category': 'Fruits', 'description': 'Vitamin C rich fresh orange', 'health_benefits': ['Vitamin C', 'Immunity booster', 'Antioxidant'], 'nutrition': {'calories': 62, 'protein': '1g', 'fiber': '3g'}, 'price': 25, 'image': '🍊', 'popular': True},
    # Juices
    {'name': 'Coconut Water', 'category': 'Juices', 'description': 'Natural electrolyte-rich coconut water', 'health_benefits': ['Natural electrolytes', 'Hydrating', 'Low calorie'], 'nutrition': {'calories': 45, 'protein': '2g', 'fiber': '0g'}, 'price': 40, 'image': '🥥', 'popular': True},
    {'name': 'Orange Juice', 'category': 'Juices', 'description': 'Freshly squeezed orange juice', 'health_benefits': ['Vitamin C boost', 'Immunity', 'Refreshing'], 'nutrition': {'calories': 110, 'protein': '2g', 'fiber': '0g'}, 'price': 59, 'image': '🧃', 'popular': True},
    {'name': 'Beetroot Juice', 'category': 'Juices', 'description': 'Iron-rich fresh beetroot juice', 'health_benefits': ['Iron rich', 'Blood purifier', 'Stamina booster'], 'nutrition': {'calories': 70, 'protein': '2g', 'fiber': '1g'}, 'price': 69, 'image': '🫗', 'popular': False},
    {'name': 'Papaya Leaf Juice', 'category': 'Juices', 'description': 'Traditional remedy for platelet boost', 'health_benefits': ['Boosts platelets', 'Dengue recovery', 'Immunity'], 'nutrition': {'calories': 35, 'protein': '1g', 'fiber': '0g'}, 'price': 89, 'image': '🥤', 'popular': True},
    # Herbal Drinks
    {'name': 'Herbal Tea', 'category': 'Herbal Drinks', 'description': 'Soothing herbal tea with tulsi and ginger', 'health_benefits': ['Stress relief', 'Immunity', 'Antioxidant'], 'nutrition': {'calories': 5, 'protein': '0g', 'fiber': '0g'}, 'price': 39, 'image': '🍵', 'popular': True},
    {'name': 'Ginger Tea', 'category': 'Herbal Drinks', 'description': 'Warming ginger tea for cold and flu', 'health_benefits': ['Anti-nausea', 'Warming', 'Anti-inflammatory'], 'nutrition': {'calories': 10, 'protein': '0g', 'fiber': '0g'}, 'price': 35, 'image': '☕', 'popular': True},
    {'name': 'Lemon Water', 'category': 'Herbal Drinks', 'description': 'Detox lemon water with honey', 'health_benefits': ['Detox', 'Vitamin C', 'Hydrating'], 'nutrition': {'calories': 25, 'protein': '0g', 'fiber': '0g'}, 'price': 29, 'image': '🍋', 'popular': False},
    {'name': 'ORS Solution', 'category': 'Herbal Drinks', 'description': 'Oral rehydration solution for dehydration', 'health_benefits': ['Electrolytes', 'Rehydration', 'Essential minerals'], 'nutrition': {'calories': 20, 'protein': '0g', 'fiber': '0g'}, 'price': 20, 'image': '💧', 'popular': True},
    # Recovery Foods
    {'name': 'Dry Fruits Mix', 'category': 'Recovery Foods', 'description': 'Premium mix of almonds, cashews, dates', 'health_benefits': ['Energy dense', 'Iron rich', 'Healthy fats'], 'nutrition': {'calories': 250, 'protein': '7g', 'fiber': '4g'}, 'price': 149, 'image': '🥜', 'popular': True},
    {'name': 'Dates', 'category': 'Recovery Foods', 'description': 'Natural energy booster rich in iron', 'health_benefits': ['Iron rich', 'Natural sugar', 'Energy booster'], 'nutrition': {'calories': 160, 'protein': '2g', 'fiber': '5g'}, 'price': 99, 'image': '🌴', 'popular': False},
    {'name': 'Spinach Salad', 'category': 'Recovery Foods', 'description': 'Iron-rich fresh spinach salad', 'health_benefits': ['Iron rich', 'Folate', 'Vitamin K'], 'nutrition': {'calories': 80, 'protein': '4g', 'fiber': '5g'}, 'price': 69, 'image': '🥗', 'popular': False},
    {'name': 'Protein Bowl', 'category': 'Recovery Foods', 'description': 'High protein recovery bowl with sprouts', 'health_benefits': ['High protein', 'Muscle recovery', 'Energy'], 'nutrition': {'calories': 300, 'protein': '20g', 'fiber': '8g'}, 'price': 179, 'image': '🥙', 'popular': True},
]

FOOD_RECOMMENDATIONS = {
    'Dengue': ['Papaya Leaf Juice', 'Coconut Water', 'Orange Juice', 'Vegetable Soup', 'Fresh Banana', 'Khichdi'],
    'Malaria': ['Coconut Water', 'ORS Solution', 'Vegetable Soup', 'Khichdi', 'Fresh Banana', 'Orange Juice'],
    'Cholera': ['ORS Solution', 'Coconut Water', 'Curd Rice', 'Lemon Water', 'Khichdi', 'Banana'],
    'Typhoid': ['Khichdi', 'Curd Rice', 'Vegetable Soup', 'Apple', 'Coconut Water', 'Herbal Tea'],
    'Influenza': ['Herbal Tea', 'Ginger Tea', 'Vegetable Soup', 'Chicken Broth', 'Orange Juice', 'Lemon Water'],
    'COVID-19': ['Herbal Tea', 'Vegetable Soup', 'Orange Juice', 'Protein Bowl', 'Coconut Water', 'Dry Fruits Mix'],
    'Leptospirosis': ['ORS Solution', 'Coconut Water', 'Vegetable Soup', 'Khichdi', 'Fresh Banana', 'Herbal Tea'],
    'Fever': ['Vegetable Soup', 'Coconut Water', 'Fresh Banana', 'Apple', 'Orange Juice', 'Khichdi'],
    'Diarrhea': ['ORS Solution', 'Curd Rice', 'Fresh Banana', 'Coconut Water', 'Khichdi', 'Lemon Water'],
    'Flu': ['Herbal Tea', 'Ginger Tea', 'Vegetable Soup', 'Lemon Water', 'Chicken Broth', 'Orange Juice'],
    'Fatigue': ['Dry Fruits Mix', 'Dates', 'Orange Juice', 'Protein Bowl', 'Fresh Banana', 'Coconut Water'],
    'Dehydration': ['ORS Solution', 'Coconut Water', 'Orange Juice', 'Lemon Water', 'Fresh Banana'],
    'Anemia': ['Spinach Salad', 'Beetroot Juice', 'Dates', 'Dry Fruits Mix', 'Protein Bowl'],
}

@food_bp.route('/foods', methods=['GET'])
def get_foods():
    """Get all food items with optional filtering"""
    db = current_app.db
    category = request.args.get('category')
    search = request.args.get('search')
    sort = request.args.get('sort', 'popular')
    
    # Try to get from DB first, if empty use seed data
    foods = list(db['food_items'].find({'is_active': True}))
    
    if not foods:
        # Seed the database
        seed_items = []
        for i, food in enumerate(FOOD_CATALOG):
            item = {
                'name': food['name'],
                'category': food['category'],
                'description': food.get('description', ''),
                'health_benefits': food.get('health_benefits', []),
                'nutrition': food.get('nutrition', {}),
                'price': food.get('price', 0),
                'image': food.get('image', '🍽️'),
                'popular': food.get('popular', False),
                'food_id': f'FD{i+1001}',
                'is_active': True,
                'created_at': datetime.utcnow()
            }
            seed_items.append(item)
        db['food_items'].insert_many(seed_items)
        foods = list(db['food_items'].find({'is_active': True}))
    
    result = []
    for f in foods:
        item = {
            'id': str(f['_id']),
            'food_id': f.get('food_id', ''),
            'name': f['name'],
            'category': f['category'],
            'description': f.get('description', ''),
            'health_benefits': f.get('health_benefits', []),
            'nutrition': f.get('nutrition', {}),
            'price': f.get('price', 0),
            'image': f.get('image', '🍽️'),
            'popular': f.get('popular', False),
        }
        # Filter
        if category and category != 'All' and item['category'] != category:
            continue
        if search and search.lower() not in item['name'].lower() and search.lower() not in item.get('description', '').lower():
            continue
        result.append(item)
    
    # Sort
    if sort == 'price_low':
        result.sort(key=lambda x: x['price'])
    elif sort == 'price_high':
        result.sort(key=lambda x: x['price'], reverse=True)
    elif sort == 'popular':
        result.sort(key=lambda x: not x['popular'])
    
    return jsonify({'foods': result, 'total': len(result)})


@food_bp.route('/foods', methods=['POST'])
@jwt_required()
def create_food():
    """Admin: Create a new food item"""
    data = request.get_json()
    db = current_app.db
    
    food = {
        'name': data['name'],
        'category': data.get('category', 'Healthy Meals'),
        'description': data.get('description', ''),
        'health_benefits': data.get('health_benefits', []),
        'nutrition': data.get('nutrition', {}),
        'price': data.get('price', 0),
        'image': data.get('image', '🍽️'),
        'popular': data.get('popular', False),
        'is_active': True,
        'food_id': f'FD{db["food_items"].count_documents({}) + 1001}',
        'created_at': datetime.utcnow()
    }
    result = db['food_items'].insert_one(food)
    food['id'] = str(result.inserted_id)
    return jsonify({'message': 'Food item created', 'food': food}), 201


@food_bp.route('/foods/<food_id>', methods=['PUT'])
@jwt_required()
def update_food(food_id):
    """Admin: Update a food item"""
    data = request.get_json()
    db = current_app.db
    
    update_data = {k: v for k, v in data.items() if k in ['name', 'category', 'description', 'health_benefits', 'nutrition', 'price', 'image', 'popular', 'is_active']}
    db['food_items'].update_one({'_id': ObjectId(food_id)}, {'$set': update_data})
    return jsonify({'message': 'Food item updated'})


@food_bp.route('/foods/<food_id>', methods=['DELETE'])
@jwt_required()
def delete_food(food_id):
    """Admin: Delete a food item"""
    db = current_app.db
    db['food_items'].delete_one({'_id': ObjectId(food_id)})
    return jsonify({'message': 'Food item deleted'})


# ===================== RECOMMENDATIONS =====================

@food_bp.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get food recommendations based on disease/symptoms"""
    data = request.get_json() or {}
    disease = data.get('disease', '')
    symptoms = data.get('symptoms', [])
    db = current_app.db
    
    # Get matching foods
    recommended_names = []
    
    # Check disease match
    for key in FOOD_RECOMMENDATIONS:
        if key.lower() in disease.lower() or disease.lower() in key.lower():
            recommended_names.extend(FOOD_RECOMMENDATIONS[key])
    
    # Check symptom matches
    for symptom in symptoms:
        for key in FOOD_RECOMMENDATIONS:
            if key.lower() in symptom.lower() or symptom.lower() in key.lower():
                recommended_names.extend(FOOD_RECOMMENDATIONS[key])
    
    # Deduplicate and limit
    recommended_names = list(dict.fromkeys(recommended_names))[:8]
    
    if not recommended_names:
        # Default healthy recommendations
        recommended_names = ['Vegetable Soup', 'Coconut Water', 'Fresh Banana', 'Herbal Tea', 'ORS Solution', 'Apple']
    
    # Fetch food details
    foods = list(db['food_items'].find({'name': {'$in': recommended_names}, 'is_active': True}))
    
    result = []
    for f in foods:
        result.append({
            'id': str(f['_id']),
            'name': f['name'],
            'category': f['category'],
            'description': f.get('description', ''),
            'health_benefits': f.get('health_benefits', []),
            'price': f.get('price', 0),
            'image': f.get('image', '🍽️'),
        })
    
    return jsonify({
        'recommendations': result,
        'disease': disease,
        'message': f'Based on {disease} analysis, these foods can aid recovery'
    })


# ===================== CART =====================

@food_bp.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    user_id = get_jwt_identity()
    db = current_app.db
    
    cart_items = list(db['cart'].find({'user_id': user_id}))
    result = []
    total = 0
    
    for item in cart_items:
        food = db['food_items'].find_one({'_id': ObjectId(item['food_id'])})
        if food:
            subtotal = food.get('price', 0) * item.get('quantity', 1)
            total += subtotal
            result.append({
                'id': str(item['_id']),
                'food_id': item['food_id'],
                'name': food['name'],
                'image': food.get('image', '🍽️'),
                'price': food.get('price', 0),
                'quantity': item.get('quantity', 1),
                'subtotal': subtotal,
                'category': food.get('category', ''),
            })
    
    delivery_fee = 40 if total > 0 else 0
    tax = round(total * 0.05, 2)
    grand_total = round(total + delivery_fee + tax, 2)
    
    return jsonify({
        'items': result,
        'subtotal': total,
        'delivery_fee': delivery_fee,
        'tax': tax,
        'grand_total': grand_total,
        'item_count': sum(i['quantity'] for i in result)
    })


@food_bp.route('/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db
    
    food_id = data.get('food_id')
    quantity = data.get('quantity', 1)
    
    # Check if already in cart
    existing = db['cart'].find_one({'user_id': user_id, 'food_id': food_id})
    if existing:
        db['cart'].update_one(
            {'_id': existing['_id']},
            {'$inc': {'quantity': quantity}}
        )
    else:
        db['cart'].insert_one({
            'user_id': user_id,
            'food_id': food_id,
            'quantity': quantity,
            'created_at': datetime.utcnow()
        })
    
    return jsonify({'message': 'Added to cart'})


@food_bp.route('/cart/remove', methods=['POST'])
@jwt_required()
def remove_from_cart():
    """Remove item from cart"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db
    
    db['cart'].delete_one({'user_id': user_id, 'food_id': data.get('food_id')})
    return jsonify({'message': 'Removed from cart'})


@food_bp.route('/cart/update', methods=['POST'])
@jwt_required()
def update_cart():
    """Update cart item quantity"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db
    
    if data.get('quantity', 0) <= 0:
        db['cart'].delete_one({'user_id': user_id, 'food_id': data.get('food_id')})
    else:
        db['cart'].update_one(
            {'user_id': user_id, 'food_id': data.get('food_id')},
            {'$set': {'quantity': data['quantity']}}
        )
    return jsonify({'message': 'Cart updated'})


@food_bp.route('/cart/clear', methods=['POST'])
@jwt_required()
def clear_cart():
    """Clear entire cart"""
    user_id = get_jwt_identity()
    db = current_app.db
    db['cart'].delete_many({'user_id': user_id})
    return jsonify({'message': 'Cart cleared'})


# ===================== ORDERS =====================

@food_bp.route('/order/create', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    user_id = get_jwt_identity()
    data = request.get_json()
    db = current_app.db
    
    # Get cart items
    cart_items = list(db['cart'].find({'user_id': user_id}))
    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400
    
    # Calculate totals
    order_items = []
    subtotal = 0
    for item in cart_items:
        food = db['food_items'].find_one({'_id': ObjectId(item['food_id'])})
        if food:
            item_total = food.get('price', 0) * item.get('quantity', 1)
            subtotal += item_total
            order_items.append({
                'food_id': item['food_id'],
                'food_name': food['name'],
                'image': food.get('image', '🍽️'),
                'quantity': item.get('quantity', 1),
                'price': food.get('price', 0),
                'subtotal': item_total
            })
    
    delivery_fee = 40
    tax = round(subtotal * 0.05, 2)
    grand_total = round(subtotal + delivery_fee + tax, 2)
    
    # Generate order number
    order_count = db['orders'].count_documents({}) + 1023
    order_number = f'FD{order_count}'
    
    order = {
        'user_id': user_id,
        'order_number': order_number,
        'items': order_items,
        'subtotal': subtotal,
        'delivery_fee': delivery_fee,
        'tax': tax,
        'grand_total': grand_total,
        'status': 'Order Received',
        'payment_method': data.get('payment_method', 'COD'),
        'delivery_address': data.get('delivery_address', {}),
        'customer_info': data.get('customer_info', {}),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db['orders'].insert_one(order)
    order['id'] = str(result.inserted_id)
    
    # Clear cart
    db['cart'].delete_many({'user_id': user_id})
    
    return jsonify({
        'message': 'Order placed successfully!',
        'order_id': order_number,
        'order': order
    }), 201


@food_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """Get user's orders"""
    user_id = get_jwt_identity()
    db = current_app.db
    
    orders = list(db['orders'].find({'user_id': user_id}).sort('created_at', -1))
    result = []
    for o in orders:
        result.append({
            'id': str(o['_id']),
            'order_number': o['order_number'],
            'items': o.get('items', []),
            'grand_total': o.get('grand_total', 0),
            'status': o.get('status', 'Order Received'),
            'payment_method': o.get('payment_method', 'COD'),
            'delivery_address': o.get('delivery_address', {}),
            'created_at': o['created_at'].isoformat() if isinstance(o.get('created_at'), datetime) else str(o.get('created_at', '')),
        })
    return jsonify({'orders': result, 'total': len(result)})


@food_bp.route('/orders/<order_id>', methods=['GET'])
@jwt_required()
def get_order_detail(order_id):
    """Get single order details"""
    db = current_app.db
    order = db['orders'].find_one({'_id': ObjectId(order_id)})
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    order['id'] = str(order['_id'])
    if isinstance(order.get('created_at'), datetime):
        order['created_at'] = order['created_at'].isoformat()
    del order['_id']
    return jsonify({'order': order})


@food_bp.route('/order/status', methods=['PUT'])
@jwt_required()
def update_order_status():
    """Admin: Update order status"""
    data = request.get_json()
    db = current_app.db
    
    order_id = data.get('order_id')
    new_status = data.get('status')
    
    valid_statuses = ['Order Received', 'Preparing Food', 'Packed', 'Out For Delivery', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    db['orders'].update_one(
        {'_id': ObjectId(order_id)},
        {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
    )
    return jsonify({'message': 'Order status updated'})


# ===================== ADMIN ORDER MANAGEMENT =====================

@food_bp.route('/admin/orders', methods=['GET'])
@jwt_required()
def admin_get_orders():
    """Admin: Get all orders"""
    db = current_app.db
    search = request.args.get('search', '')
    
    query = {}
    if search:
        query['$or'] = [
            {'order_number': {'$regex': search, '$options': 'i'}},
            {'customer_info.name': {'$regex': search, '$options': 'i'}},
        ]
    
    orders = list(db['orders'].find(query).sort('created_at', -1).limit(100))
    result = []
    for o in orders:
        result.append({
            'id': str(o['_id']),
            'order_number': o.get('order_number', ''),
            'user_id': o.get('user_id', ''),
            'items': o.get('items', []),
            'grand_total': o.get('grand_total', 0),
            'status': o.get('status', 'Order Received'),
            'payment_method': o.get('payment_method', 'COD'),
            'customer_info': o.get('customer_info', {}),
            'delivery_address': o.get('delivery_address', {}),
            'created_at': o['created_at'].isoformat() if isinstance(o.get('created_at'), datetime) else str(o.get('created_at', '')),
        })
    
    # Stats
    total_revenue = sum(o.get('grand_total', 0) for o in orders if o.get('status') != 'Cancelled')
    active_deliveries = len([o for o in orders if o.get('status') == 'Out For Delivery'])
    
    return jsonify({
        'orders': result,
        'stats': {
            'total_orders': len(result),
            'total_revenue': total_revenue,
            'active_deliveries': active_deliveries,
            'delivered': len([o for o in orders if o.get('status') == 'Delivered']),
        }
    })


@food_bp.route('/admin/foods', methods=['GET'])
@jwt_required()
def admin_get_foods():
    """Admin: Get all food items including inactive"""
    db = current_app.db
    foods = list(db['food_items'].find().sort('created_at', -1))
    result = []
    for f in foods:
        result.append({
            'id': str(f['_id']),
            'food_id': f.get('food_id', ''),
            'name': f['name'],
            'category': f.get('category', ''),
            'price': f.get('price', 0),
            'image': f.get('image', '🍽️'),
            'is_active': f.get('is_active', True),
            'popular': f.get('popular', False),
        })
    return jsonify({'foods': result})


@food_bp.route('/admin/analytics', methods=['GET'])
@jwt_required()
def food_analytics():
    """Admin: Food ordering analytics"""
    db = current_app.db
    
    orders = list(db['orders'].find())
    total_revenue = sum(o.get('grand_total', 0) for o in orders if o.get('status') != 'Cancelled')
    
    # Most ordered foods
    food_counts = {}
    for order in orders:
        for item in order.get('items', []):
            name = item.get('food_name', 'Unknown')
            food_counts[name] = food_counts.get(name, 0) + item.get('quantity', 1)
    
    top_foods = sorted(food_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return jsonify({
        'total_orders': len(orders),
        'total_revenue': total_revenue,
        'active_deliveries': len([o for o in orders if o.get('status') == 'Out For Delivery']),
        'top_foods': [{'name': name, 'count': count} for name, count in top_foods],
    })
