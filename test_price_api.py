import requests
import json

def test_price():
    url = "http://127.0.0.1:5000/api/predict_price"
    payload = {"crop": "rice", "days_ahead": 15}
    try:
        res = requests.post(url, json=payload)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"Crop: {data['crop']}")
            print(f"Predicted Price: ₹{data['predicted_price']}")
            print(f"History Points: {len(data['history'])}")
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_price()
