#!/usr/bin/env python3
"""
Test OpenWeatherMap API directly and save raw response for analysis
"""
import requests
import json
import os
from datetime import datetime

def test_openweather_api():
    """Test OpenWeatherMap API for different airports and save raw responses"""
    
    # Your OpenWeatherMap API key
    api_key = "bc50a2de0e54181ecaa2c0495dd29fc3"
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    
    # Test airports
    test_airports = [
        {"code": "SJC", "city": "San Jose", "state": "CA", "country": "US"},
        {"code": "LAX", "city": "Los Angeles", "state": "CA", "country": "US"},
        {"code": "JFK", "city": "New York", "state": "NY", "country": "US"},
        {"code": "ATL", "city": "Atlanta", "state": "GA", "country": "US"}
    ]
    
    results = {}
    
    for airport in test_airports:
        print(f"\n🌤️ Testing OpenWeatherMap API for {airport['code']} ({airport['city']})...")
        
        # Format location for API
        location = f"{airport['city']},{airport['state']},{airport['country']}"
        
        try:
            # Build API request
            params = {
                'q': location,
                'appid': api_key,
                'units': 'imperial'  # Fahrenheit, mph
            }
            
            print(f"📤 Request URL: {base_url}")
            print(f"📤 Location: {location}")
            print(f"📤 Parameters: {params}")
            
            # Make API request
            response = requests.get(base_url, params=params, timeout=15)
            response.raise_for_status()
            
            print(f"📥 Response Status: {response.status_code}")
            
            # Parse JSON response
            data = response.json()
            
            # Extract key information for display
            main = data.get('main', {})
            weather = data.get('weather', [{}])[0]
            wind = data.get('wind', {})
            
            print(f"✅ Weather: {weather.get('description', 'Unknown')}")
            print(f"✅ Temperature: {main.get('temp', 'Unknown')}°F")
            print(f"✅ Humidity: {main.get('humidity', 'Unknown')}%")
            print(f"✅ Wind Speed: {wind.get('speed', 'Unknown')} mph")
            
            # Store full response
            results[airport['code']] = {
                "airport_info": airport,
                "request_params": params,
                "response_status": response.status_code,
                "raw_response": data,
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            results[airport['code']] = {
                "airport_info": airport,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            results[airport['code']] = {
                "airport_info": airport,
                "error": f"JSON parsing failed: {str(e)}",
                "raw_text": response.text if 'response' in locals() else "No response",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            results[airport['code']] = {
                "airport_info": airport,
                "error": f"Unexpected error: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    # Save results to JSON file
    output_file = "openweather_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Raw responses saved to: {output_file}")
    print(f"📊 Total airports tested: {len(test_airports)}")
    print(f"✅ Successful responses: {len([r for r in results.values() if 'raw_response' in r])}")
    print(f"❌ Failed responses: {len([r for r in results.values() if 'error' in r])}")
    
    return results

if __name__ == "__main__":
    print("🚀 Starting OpenWeatherMap API Test...")
    test_results = test_openweather_api()
    print("✅ Test completed!")