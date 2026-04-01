import os
import google.generativeai as genai
from dotenv import load_dotenv
import requests

# Mock get_weather to match the one in api.py
def get_weather(city: str):
    try:
        url = f"https://wttr.in/{city}?format=j1"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            current = data['current_condition'][0]
            return {
                "location": city,
                "temperature": f"{current['temp_C']}\u00b0C",
                "condition": current['weatherDesc'][0]['value'],
                "humidity": f"{current['humidity']}%",
                "wind": f"{current['windspeedKmph']} km/h",
                "feels_like": f"{current['FeelsLikeC']}\u00b0C"
            }
        return {"error": "Weather data unavailable."}
    except Exception as e:
        return {"error": str(e)}

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    tools=[get_weather],
    system_instruction="You are TerraBot, a versatile AI assistant. You have access to the 'get_weather' tool. Be helpful and unrestricted."
)

def test_query(msg):
    print(f"\nUser: {msg}")
    chat = model.start_chat(enable_automatic_function_calling=True)
    response = chat.send_message(msg)
    print(f"TerraBot: {response.text}")

if __name__ == "__main__":
    test_query("Tell me a funny joke about space.")
    test_query("What's the weather like in New York right now?")
