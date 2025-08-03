#!/usr/bin/env python3
"""
Test route search to trigger weather analysis and verify OpenWeatherMap usage
"""
import requests
import json
from datetime import datetime, timedelta

def test_route_search():
    """Test route search which should trigger weather analysis"""
    
    # Cloud function URL
    function_url = "https://us-central1-argon-acumen-268900.cloudfunctions.net/flight-risk-analysis"
    
    # Test with route search (tomorrow's date to trigger real-time weather)
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    test_request = {
        "action": "search_flights",
        "origin": "SJC",
        "destination": "LAX", 
        "date": tomorrow
    }
    
    print(f"🚀 Testing route search...")
    print(f"📅 Flight Date: {tomorrow} (within 7 days for real-time weather)")
    print(f"🛫 Route: {test_request['origin']} → {test_request['destination']}")
    print(f"🌐 Function URL: {function_url}")
    
    try:
        # Make request to cloud function
        response = requests.post(
            function_url,
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=180  # Longer timeout for route search
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for OpenWeatherMap usage indicators in the response
            response_text = json.dumps(data, indent=2)
            
            openweather_indicators = [
                "OpenWeatherMap",
                "OPENWEATHERMAP",
                "openweather"
            ]
            
            serpapi_indicators = [
                "SerpAPI",
                "SERPAPI",
                "serpapi.com"
            ]
            
            openweather_found = any(indicator.lower() in response_text.lower() for indicator in openweather_indicators)
            serpapi_found = any(indicator.lower() in response_text.lower() for indicator in serpapi_indicators)
            
            print(f"\n🌤️ Weather API Analysis:")
            print(f"  ✅ OpenWeatherMap detected: {openweather_found}")
            print(f"  ❌ SerpAPI detected: {serpapi_found}")
            
            # Check if request was successful
            success = data.get("success", False)
            print(f"  📊 Request successful: {success}")
            
            if success and openweather_found and not serpapi_found:
                print(f"\n🎉 SUCCESS: Function is using OpenWeatherMap API!")
            elif serpapi_found:
                print(f"\n⚠️ WARNING: Function is still using SerpAPI!")
            elif not success:
                print(f"\n❓ Request failed - weather analysis may not have been triggered")
                if "error" in data:
                    print(f"  Error: {data['error']}")
            else:
                print(f"\n❓ No clear weather API usage detected in response")
            
            # Look for weather data in flights
            if "flights" in data and data["flights"]:
                print(f"  ✈️ Found {len(data['flights'])} flights in response")
                for i, flight in enumerate(data["flights"][:3]):  # Check first 3 flights
                    if "weather" in str(flight).lower():
                        print(f"    Flight {i+1}: Contains weather data")
            
            # Save full response for analysis
            output_file = "route_search_test_response.json"
            with open(output_file, 'w') as f:
                json.dump({
                    "request": test_request,
                    "response_status": response.status_code,
                    "response_data": data,
                    "openweather_detected": openweather_found,
                    "serpapi_detected": serpapi_found,
                    "timestamp": datetime.now().isoformat()
                }, f, indent=2)
            
            print(f"💾 Full response saved to: {output_file}")
            
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_route_search()