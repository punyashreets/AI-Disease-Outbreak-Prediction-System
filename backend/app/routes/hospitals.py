from flask import Blueprint, request, jsonify, current_app
import requests as http_requests

hospitals_bp = Blueprint('hospitals', __name__)

OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

# Fallback hospital data for Indian cities (when API is unavailable)
FALLBACK_HOSPITALS = {
    'Mumbai': [
        {'name': 'KEM Hospital', 'lat': 19.0176, 'lon': 72.8478, 'type': 'Government', 'phone': '022-24107000', 'beds': 1800, 'emergency': True},
        {'name': 'Lilavati Hospital', 'lat': 19.0437, 'lon': 72.8217, 'type': 'Private', 'phone': '022-26568678', 'beds': 314, 'emergency': True},
        {'name': 'Tata Memorial Hospital', 'lat': 19.0183, 'lon': 72.8565, 'type': 'Government', 'phone': '022-24170711', 'beds': 700, 'emergency': True},
        {'name': 'Bombay Hospital', 'lat': 18.9388, 'lon': 72.8257, 'type': 'Private', 'phone': '022-22067676', 'beds': 822, 'emergency': True},
        {'name': 'Nair Hospital', 'lat': 18.9804, 'lon': 72.8298, 'type': 'Government', 'phone': '022-23027301', 'beds': 800, 'emergency': True},
    ],
    'Delhi': [
        {'name': 'AIIMS Delhi', 'lat': 28.5672, 'lon': 77.2100, 'type': 'Government', 'phone': '011-26588500', 'beds': 2500, 'emergency': True},
        {'name': 'Safdarjung Hospital', 'lat': 28.5681, 'lon': 77.2083, 'type': 'Government', 'phone': '011-26707437', 'beds': 2071, 'emergency': True},
        {'name': 'Max Super Speciality', 'lat': 28.5608, 'lon': 77.2761, 'type': 'Private', 'phone': '011-26515050', 'beds': 500, 'emergency': True},
        {'name': 'Fortis Escorts', 'lat': 28.5592, 'lon': 77.2769, 'type': 'Private', 'phone': '011-47135000', 'beds': 310, 'emergency': True},
        {'name': 'RML Hospital', 'lat': 28.6264, 'lon': 77.1997, 'type': 'Government', 'phone': '011-23404343', 'beds': 2080, 'emergency': True},
    ],
    'Chennai': [
        {'name': 'Apollo Hospital', 'lat': 13.0604, 'lon': 80.2496, 'type': 'Private', 'phone': '044-28293333', 'beds': 500, 'emergency': True},
        {'name': 'Rajiv Gandhi Govt Hospital', 'lat': 13.0758, 'lon': 80.2744, 'type': 'Government', 'phone': '044-25305000', 'beds': 2140, 'emergency': True},
        {'name': 'Fortis Malar', 'lat': 13.0108, 'lon': 80.2559, 'type': 'Private', 'phone': '044-42891000', 'beds': 400, 'emergency': True},
        {'name': 'MIOT International', 'lat': 13.0067, 'lon': 80.1785, 'type': 'Private', 'phone': '044-42002288', 'beds': 1000, 'emergency': True},
    ],
    'Kolkata': [
        {'name': 'SSKM Hospital', 'lat': 22.5447, 'lon': 88.3499, 'type': 'Government', 'phone': '033-22041512', 'beds': 2000, 'emergency': True},
        {'name': 'AMRI Hospital', 'lat': 22.5120, 'lon': 88.3640, 'type': 'Private', 'phone': '033-66800000', 'beds': 450, 'emergency': True},
        {'name': 'Medica Superspecialty', 'lat': 22.4784, 'lon': 88.3838, 'type': 'Private', 'phone': '033-71222222', 'beds': 400, 'emergency': True},
    ],
    'Bangalore': [
        {'name': 'NIMHANS', 'lat': 12.9445, 'lon': 77.5428, 'type': 'Government', 'phone': '080-26995000', 'beds': 1000, 'emergency': True},
        {'name': 'Manipal Hospital', 'lat': 12.9589, 'lon': 77.6380, 'type': 'Private', 'phone': '080-25024444', 'beds': 600, 'emergency': True},
        {'name': 'Victoria Hospital', 'lat': 12.9612, 'lon': 77.5725, 'type': 'Government', 'phone': '080-26701111', 'beds': 1500, 'emergency': True},
    ],
    'Pune': [
        {'name': 'KEM Hospital Pune', 'lat': 18.5390, 'lon': 73.8451, 'type': 'Government', 'phone': '020-26122001', 'beds': 600, 'emergency': True},
        {'name': 'Ruby Hall Clinic', 'lat': 18.5370, 'lon': 73.8794, 'type': 'Private', 'phone': '020-26123391', 'beds': 700, 'emergency': True},
        {'name': 'Deenanath Mangeshkar Hospital', 'lat': 18.5072, 'lon': 73.8212, 'type': 'Private', 'phone': '020-40151000', 'beds': 500, 'emergency': True},
    ],
    'Hyderabad': [
        {'name': 'NIMS Hospital', 'lat': 17.4156, 'lon': 78.4747, 'type': 'Government', 'phone': '040-23390933', 'beds': 1500, 'emergency': True},
        {'name': 'Apollo Hospital Hyderabad', 'lat': 17.3850, 'lon': 78.4867, 'type': 'Private', 'phone': '040-23434474', 'beds': 350, 'emergency': True},
        {'name': 'KIMS Hospital', 'lat': 17.4239, 'lon': 78.4487, 'type': 'Private', 'phone': '040-30410000', 'beds': 650, 'emergency': True},
    ],
    'Ahmedabad': [
        {'name': 'Civil Hospital', 'lat': 23.0354, 'lon': 72.5795, 'type': 'Government', 'phone': '079-22680074', 'beds': 2800, 'emergency': True},
        {'name': 'Apollo Hospital Ahmedabad', 'lat': 23.0225, 'lon': 72.5714, 'type': 'Private', 'phone': '079-66701800', 'beds': 350, 'emergency': True},
    ],
}


def query_overpass(lat, lon, radius=5000):
    """Query OpenStreetMap Overpass API for nearby hospitals"""
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lon});
      way["amenity"="hospital"](around:{radius},{lat},{lon});
      node["amenity"="clinic"](around:{radius},{lat},{lon});
      node["amenity"="doctors"](around:{radius},{lat},{lon});
    );
    out body;
    """
    try:
        resp = http_requests.post(OVERPASS_URL, data={'data': query}, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            hospitals = []
            for el in data.get('elements', [])[:15]:
                tags = el.get('tags', {})
                hospitals.append({
                    'name': tags.get('name', 'Unnamed Hospital'),
                    'lat': el.get('lat', el.get('center', {}).get('lat', lat)),
                    'lon': el.get('lon', el.get('center', {}).get('lon', lon)),
                    'type': tags.get('operator:type', tags.get('healthcare', 'Unknown')),
                    'phone': tags.get('phone', tags.get('contact:phone', 'N/A')),
                    'beds': int(tags['beds']) if 'beds' in tags else None,
                    'emergency': tags.get('emergency', 'unknown') == 'yes',
                    'website': tags.get('website', ''),
                    'distance_km': None  # calculated on frontend
                })
            return hospitals
    except Exception as e:
        print(f"Overpass API error: {e}")
    return None


@hospitals_bp.route('/nearby', methods=['GET'])
def get_nearby_hospitals():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    city = request.args.get('city', '')
    radius = request.args.get('radius', 5000, type=int)
    
    # Try Overpass API if coordinates provided
    if lat and lon:
        hospitals = query_overpass(lat, lon, radius)
        if hospitals:
            return jsonify({'hospitals': hospitals, 'source': 'openstreetmap', 'count': len(hospitals)}), 200
    
    # Fallback to pre-loaded data
    city_key = city.strip() if city else ''
    for key in FALLBACK_HOSPITALS:
        if key.lower() == city_key.lower():
            return jsonify({
                'hospitals': FALLBACK_HOSPITALS[key],
                'source': 'database',
                'count': len(FALLBACK_HOSPITALS[key])
            }), 200
    
    # Generic fallback
    all_hospitals = []
    for city_hospitals in FALLBACK_HOSPITALS.values():
        all_hospitals.extend(city_hospitals)
    
    return jsonify({
        'hospitals': all_hospitals[:5],
        'source': 'database',
        'count': len(all_hospitals[:5]),
        'message': f'Showing hospitals near major cities. Provide lat/lon for better results.'
    }), 200


@hospitals_bp.route('/emergency-numbers', methods=['GET'])
def get_emergency_numbers():
    return jsonify({
        'numbers': [
            {'name': 'National Emergency', 'number': '112', 'desc': 'All emergencies'},
            {'name': 'Ambulance', 'number': '108', 'desc': 'Free ambulance service'},
            {'name': 'Health Helpline', 'number': '104', 'desc': 'Medical advice (24/7)'},
            {'name': 'Women Helpline', 'number': '1091', 'desc': 'Women safety'},
            {'name': 'Child Helpline', 'number': '1098', 'desc': 'Child protection'},
            {'name': 'Poison Control', 'number': '1800-11-6117', 'desc': 'Poison information'},
            {'name': 'Mental Health', 'number': '080-46110007', 'desc': 'iCall helpline'},
            {'name': 'Blood Bank', 'number': '1800-11-1372', 'desc': 'eRaktkosh'},
        ]
    }), 200
