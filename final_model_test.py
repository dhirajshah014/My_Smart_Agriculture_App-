import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('models/gemini-2.0-flash')
    response = model.generate_content("Hi")
    print(f"WINNER: models/gemini-2.0-flash works! - {response.text}")
except Exception as e:
    print(f"FAILED models/gemini-2.0-flash: {e}")
    try:
        model = genai.GenerativeModel('models/gemini-pro-latest')
        response = model.generate_content("Hi")
        print(f"WINNER: models/gemini-pro-latest works! - {response.text}")
    except Exception as e2:
        print(f"FAILED models/gemini-pro-latest: {e2}")
