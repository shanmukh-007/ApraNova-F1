#!/usr/bin/env python
"""Test Gemini API key"""
import requests
from decouple import config

api_key = config('GEMINI_API_KEY', default='')
print(f"Testing API Key: {api_key[:20]}...")

# First, list available models
print("\n1. Listing available models...")
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
list_response = requests.get(list_url)
print(f"Status: {list_response.status_code}")

if list_response.status_code == 200:
    models = list_response.json()
    print("\nAvailable models:")
    for model in models.get('models', []):
        if 'generateContent' in model.get('supportedGenerationMethods', []):
            print(f"  - {model['name']}")
    
    # Try with gemini-2.5-flash
    print("\n2. Testing with gemini-2.5-flash...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": "Say hello"
            }]
        }]
    }
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        print("\n✅ API Key is VALID with v1 API!")
    else:
        print("\n❌ Still having issues")
else:
    print(f"Error listing models: {list_response.text}")
    print("\n❌ API Key has issues!")
    print("\nPossible solutions:")
    print("1. Get a new API key from: https://aistudio.google.com/app/apikey")
    print("2. Make sure the API key has Gemini API enabled")
    print("3. Check if there are any usage restrictions")
