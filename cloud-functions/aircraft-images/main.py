import functions_framework
import json
from flask import jsonify

# Aircraft image mapping
AIRCRAFT_IMAGES = {
    # Boeing aircraft
    'B737': {
        'name': 'Boeing 737',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-737.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-737-thumb.jpg'
    },
    'B737MAX': {
        'name': 'Boeing 737 MAX',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-737-max.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-737-max-thumb.jpg'
    },
    'B747': {
        'name': 'Boeing 747',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-747.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-747-thumb.jpg'
    },
    'B757': {
        'name': 'Boeing 757',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-757.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-757-thumb.jpg'
    },
    'B767': {
        'name': 'Boeing 767',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-767.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-767-thumb.jpg'
    },
    'B777': {
        'name': 'Boeing 777',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-777.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-777-thumb.jpg'
    },
    'B787': {
        'name': 'Boeing 787 Dreamliner',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/boeing-787.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/boeing-787-thumb.jpg'
    },
    
    # Airbus aircraft
    'A319': {
        'name': 'Airbus A319',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a319.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a319-thumb.jpg'
    },
    'A320': {
        'name': 'Airbus A320',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a320.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a320-thumb.jpg'
    },
    'A321': {
        'name': 'Airbus A321',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a321.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a321-thumb.jpg'
    },
    'A320NEO': {
        'name': 'Airbus A320neo',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a320neo.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a320neo-thumb.jpg'
    },
    'A330': {
        'name': 'Airbus A330',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a330.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a330-thumb.jpg'
    },
    'A350': {
        'name': 'Airbus A350',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a350.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a350-thumb.jpg'
    },
    'A380': {
        'name': 'Airbus A380',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/airbus-a380.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/airbus-a380-thumb.jpg'
    },
    
    # Embraer aircraft
    'E175': {
        'name': 'Embraer E175',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/embraer-e175.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/embraer-e175-thumb.jpg'
    },
    'E190': {
        'name': 'Embraer E190',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/embraer-e190.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/embraer-e190-thumb.jpg'
    },
    
    # Bombardier aircraft
    'CRJ700': {
        'name': 'Bombardier CRJ700',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/bombardier-crj700.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/bombardier-crj700-thumb.jpg'
    },
    'CRJ900': {
        'name': 'Bombardier CRJ900',
        'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/bombardier-crj900.jpg',
        'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/bombardier-crj900-thumb.jpg'
    }
}

# Model variations mapping
MODEL_VARIATIONS = {
    # Boeing
    'Boeing 737': 'B737',
    'Boeing 737-800': 'B737',
    'Boeing 737-900': 'B737',
    'Boeing 737-700': 'B737',
    'Boeing 737 MAX': 'B737MAX',
    'Boeing 737 MAX 8': 'B737MAX',
    'Boeing 737 MAX 9': 'B737MAX',
    'Boeing 747': 'B747',
    'Boeing 747-400': 'B747',
    'Boeing 747-8': 'B747',
    'Boeing 757': 'B757',
    'Boeing 757-200': 'B757',
    'Boeing 767': 'B767',
    'Boeing 767-300': 'B767',
    'Boeing 777': 'B777',
    'Boeing 777-200': 'B777',
    'Boeing 777-300': 'B777',
    'Boeing 787': 'B787',
    'Boeing 787 Dreamliner': 'B787',
    
    # Airbus
    'Airbus A319': 'A319',
    'Airbus A320': 'A320',
    'Airbus A321': 'A321',
    'Airbus A320neo': 'A320NEO',
    'Airbus A321neo': 'A321NEO',
    'Airbus A330': 'A330',
    'Airbus A330-200': 'A330',
    'Airbus A330-300': 'A330',
    'Airbus A350': 'A350',
    'Airbus A350-900': 'A350',
    'Airbus A380': 'A380',
    
    # Embraer
    'Embraer E175': 'E175',
    'Embraer E190': 'E190',
    
    # Bombardier
    'Bombardier CRJ700': 'CRJ700',
    'Bombardier CRJ900': 'CRJ900',
    
    # Short codes
    '737': 'B737',
    '747': 'B747',
    '757': 'B757',
    '767': 'B767',
    '777': 'B777',
    '787': 'B787',
    'A319': 'A319',
    'A320': 'A320',
    'A321': 'A321',
    'A330': 'A330',
    'A350': 'A350',
    'A380': 'A380'
}

def get_aircraft_code(model_string):
    """Convert aircraft model string to standardized code"""
    if not model_string:
        return None
    
    # Direct match
    if model_string in AIRCRAFT_IMAGES:
        return model_string
    
    # Check variations
    if model_string in MODEL_VARIATIONS:
        return MODEL_VARIATIONS[model_string]
    
    # Try partial matching
    model_upper = model_string.upper()
    for variation, code in MODEL_VARIATIONS.items():
        if variation.upper() in model_upper or model_upper in variation.upper():
            return code
    
    return None

@functions_framework.http
def aircraft_images_handler(request):
    """Handle aircraft image requests"""
    
    # Set CORS headers
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        # Get aircraft model from query parameter
        aircraft_model = request.args.get('model', '')
        
        if not aircraft_model:
            return json.dumps({
                'success': False,
                'error': 'Aircraft model parameter is required'
            }), 400, headers
        
        # Get standardized aircraft code
        aircraft_code = get_aircraft_code(aircraft_model)
        
        if not aircraft_code or aircraft_code not in AIRCRAFT_IMAGES:
            # Return a default/generic aircraft image
            return json.dumps({
                'success': True,
                'aircraft_model': aircraft_model,
                'aircraft_code': 'GENERIC',
                'data': {
                    'name': 'Generic Aircraft',
                    'image_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/generic-aircraft.jpg',
                    'thumbnail_url': 'https://storage.googleapis.com/flightriskradar-aircraft-images/thumbnails/generic-aircraft-thumb.jpg'
                }
            }), 200, headers
        
        # Return aircraft image data
        aircraft_data = AIRCRAFT_IMAGES[aircraft_code]
        
        return json.dumps({
            'success': True,
            'aircraft_model': aircraft_model,
            'aircraft_code': aircraft_code,
            'data': aircraft_data
        }), 200, headers
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'error': str(e)
        }), 500, headers