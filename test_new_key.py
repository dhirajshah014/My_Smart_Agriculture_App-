import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def test_model(m):
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        chat = model.start_chat()
        response = chat.send_message("hi", stream=True, request_options={"timeout": 10.0})
        text = ""
        for chunk in response:
            if chunk.text:
                text += chunk.text
        if text:
            print(f"  {m} SUCCESS: {text[:50]}...")
        else:
            print(f"  {m} FAILED: Empty response (possible safety block)")
    except Exception as e:
        print(f"  {m} FAILED with error: {e}")

models = ["gemini-1.5-flash-latest", "gemini-2.0-flash-exp", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"]
for m in models:
    test_model(m)
