import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            if '1.5-flash' in m.name:
                print(f"FOUND: {m.name}")
                found = True
    if not found:
        print("Standard gemini-1.5-flash NOT found for this key.")
except Exception as e:
    print(f"Error listing models: {e}")
