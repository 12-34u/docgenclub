import os
import google.generativeai as genai

# Configure API
api_key = "AIzaSyDb6HEljnx0X9Xxlz1lvJMphIKAnjM3fWo"
genai.configure(api_key=api_key)

print("Listing available models...")
print("=" * 50)

try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
            print(f"  Display name: {model.display_name}")
            print(f"  Description: {model.description[:100] if model.description else 'N/A'}")
            print()
except Exception as e:
    print(f"Error: {e}")
