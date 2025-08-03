#!/usr/bin/env python3
"""
Test the deployed cloud function to verify it's using OpenWeatherMap
"""
import requests
import json
from datetime import datetime, timedelta

def test_deployed_function():
    """Test the deployed cloud function with a simple flight request"""
    
    # Cloud function URL
    function_url = "https://us-central1-argon-acumen-268900.cloudfunctions.net/flight-risk-analysis"
    
    # Test flight data (within 7 days to trigger real-time weather)
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    test_request = {
        "action": "analyze_flight_risk",
        "flight_number": "WN1125",
        "airline_code": "WN", 
        "airline_name": "Southwest Airlines",
        "date": tomorrow
    }
    
    print(f"🚀 Testing deployed cloud function...")
    print(f"📅 Flight Date: {tomorrow} (within 7 days for real-time weather)")
    print(f"✈️ Flight: {test_request['flight_number']}")
    print(f"🌐 Function URL: {function_url}")
    
    try:
        # Make request to cloud function
        response = requests.post(
            function_url,
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for OpenWeatherMap usage indicators
            weather_sources = []
            openweather_found = False
            serpapi_found = False
            
            # Scan response for weather data sources
            response_text = json.dumps(data, indent=2)
            
            if "OpenWeatherMap" in response_text:
                openweather_found = True
                weather_sources.append("✅ OpenWeatherMap API")
            
            if "SerpAPI" in response_text and "OpenWeatherMap" not in response_text:
                serpapi_found = True
                weather_sources.append("❌ SerpAPI (should not be used)")
            
            print(f"\n🌤️ Weather Data Sources Found:")
            for source in weather_sources:
                print(f"  {source}")
            
            if openweather_found and not serpapi_found:
                print(f"\n✅ SUCCESS: Function is using OpenWeatherMap API!")
            elif serpapi_found:
                print(f"\n❌ WARNING: Function is still using SerpAPI!")
            else:
                print(f"\n⚠️ UNCLEAR: Could not determine weather data source")
            
            # Save full response for analysis
            output_file = "deployed_function_test_response.json"
            with open(output_file, 'w') as f:
                json.dump({
                    "request": test_request,
                    "response_status": response.status_code,
                    "response_data": data,
                    "weather_sources_found": weather_sources,
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
    test_deployed_function()