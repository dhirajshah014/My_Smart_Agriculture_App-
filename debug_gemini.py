import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing Key: {api_key[:10]}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('models/gemini-2.0-flash')

try:
    response = model.generate_content("Say hello")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Error: {e}")
