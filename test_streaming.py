import requests
import json

def test_streaming():
    url = "http://127.0.0.1:5000/api/chatbot"
    payload = {
        "message": "Write a short poem about agriculture in 3 sentences.",
        "language": "English"
    }
    
    print(f"Testing streaming from {url}...")
    try:
        response = requests.post(url, json=payload, stream=True)
        print(f"Status Code: {response.status_code}")
        
        full_text = ""
        print("Chunks received:")
        for chunk in response.iter_content(chunk_size=None):
            if chunk:
                text = chunk.decode('utf-8')
                print(f"[{text}]", end="", flush=True)
                full_text += text
        
        print("\n\nFull response received successfully.")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    test_streaming()
