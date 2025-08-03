#!/usr/bin/env python3
"""
Test the deployed cloud function with direct flight lookup to verify OpenWeatherMap usage
"""
import requests
import json
from datetime import datetime, timedelta

def test_direct_flight():
    """Test direct flight lookup which should trigger weather analysis"""
    
    # Cloud function URL
    function_url = "https://us-central1-argon-acumen-268900.cloudfunctions.net/flight-risk-analysis"
    
    # Test with direct flight lookup (tomorrow's date to trigger real-time weather)
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    test_request = {
        "action": "lookup_specific_flight",
        "flight_number": "WN1125",
        "airline_code": "WN", 
        "airline_name": "Southwest Airlines",
        "date": tomorrow
    }
    
    print(f"🚀 Testing direct flight lookup...")
    print(f"📅 Flight Date: {tomorrow} (within 7 days for real-time weather)")
    print(f"✈️ Flight: {test_request['flight_number']}")
    print(f"🌐 Function URL: {function_url}")
    
    try:
        # Make request to cloud function
        response = requests.post(
            function_url,
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=120
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for OpenWeatherMap usage indicators in the response
            response_text = json.dumps(data, indent=2)
            
            openweather_indicators = [
                "OpenWeatherMap API",
                "Real-time weather data from OpenWeatherMap",
                "OPENWEATHERMAP"
            ]
            
            serpapi_indicators = [
                "SerpAPI",
                "Real-time weather data from SerpAPI",
                "SERPAPI"
            ]
            
            openweather_found = any(indicator in response_text for indicator in openweather_indicators)
            serpapi_found = any(indicator in response_text for indicator in serpapi_indicators)
            
            print(f"\n🌤️ Weather API Analysis:")
            print(f"  ✅ OpenWeatherMap detected: {openweather_found}")
            print(f"  ❌ SerpAPI detected: {serpapi_found}")
            
            if openweather_found and not serpapi_found:
                print(f"\n🎉 SUCCESS: Function is using OpenWeatherMap API!")
            elif serpapi_found:
                print(f"\n⚠️ WARNING: Function is still using SerpAPI!")
            else:
                print(f"\n❓ No clear weather API usage detected in response")
            
            # Look for specific weather data patterns
            if "weather" in response_text.lower():
                print(f"  🌤️ Weather data found in response")
            
            # Save full response for analysis
            output_file = "direct_flight_test_response.json"
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
    test_direct_flight()