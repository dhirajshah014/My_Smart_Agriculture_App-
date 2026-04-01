import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error, mean_absolute_error
import joblib
import os

# 1. Dataset Generation
crops = [
    'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
    'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
    'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
    'coconut', 'cotton', 'jute', 'coffee'
]

# Explicitly distinct ranges for synthetic generation
crop_profiles = {
    'rice': {'N': (60, 100), 'P': (35, 60), 'K': (35, 45), 'temp': (20, 30), 'hum': (80, 90), 'ph': (6.0, 7.0), 'rain': (200, 300)},
    'maize': {'N': (80, 120), 'P': (40, 60), 'K': (15, 25), 'temp': (18, 27), 'hum': (55, 75), 'ph': (5.7, 6.8), 'rain': (60, 110)},
    'chickpea': {'N': (20, 60), 'P': (55, 80), 'K': (75, 85), 'temp': (17, 21), 'hum': (14, 20), 'ph': (6.5, 8.5), 'rain': (65, 95)},
    'banana': {'N': (80, 120), 'P': (70, 95), 'K': (45, 55), 'temp': (25, 30), 'hum': (75, 85), 'ph': (5.5, 6.5), 'rain': (90, 120)},
    'grapes': {'N': (10, 40), 'P': (120, 145), 'K': (190, 210), 'temp': (18, 30), 'hum': (75, 85), 'ph': (5.5, 7.0), 'rain': (60, 80)},
    'apple': {'N': (190, 230), 'P': (120, 145), 'K': (190, 210), 'temp': (20, 25), 'hum': (90, 95), 'ph': (5.5, 6.5), 'rain': (100, 130)},
    'cotton': {'N': (100, 140), 'P': (35, 60), 'K': (15, 25), 'temp': (22, 26), 'hum': (75, 85), 'ph': (6.5, 7.5), 'rain': (60, 100)},
    'coffee': {'N': (80, 120), 'P': (15, 40), 'K': (25, 40), 'temp': (23, 28), 'hum': (50, 60), 'ph': (6.0, 7.5), 'rain': (130, 180)},
}

data = []
for crop in crops:
    profile = crop_profiles.get(crop, {'N': (40, 60), 'P': (40, 60), 'K': (40, 60), 'temp': (20, 30), 'hum': (60, 80), 'ph': (6.0, 7.0), 'rain': (100, 200)})
    for _ in range(130):
        N = np.random.uniform(*profile['N'])
        P = np.random.uniform(*profile['P'])
        K = np.random.uniform(*profile['K'])
        temp = np.random.uniform(*profile['temp'])
        hum = np.random.uniform(*profile['hum'])
        ph = np.random.uniform(*profile['ph'])
        rain = np.random.uniform(*profile['rain'])
        
        # Yield is dependent on these factors
        y = (N * 0.02 + P * 0.01 + rain * 0.05 + hum * 0.01) * np.random.uniform(0.9, 1.1)
        data.append([N, P, K, temp, hum, ph, rain, crop, y])

df = pd.DataFrame(data, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label', 'yield'])
df.to_csv('crop_data.csv', index=False)
print(f"Refined dataset generated: {len(df)} rows.")

# 2. Preprocessing
X = df.drop(['label', 'yield'], axis=1)
y_crop = df['label']
y_yield = df['yield']
le = LabelEncoder()
y_crop_encoded = le.fit_transform(y_crop)

X_train, X_test, y_crop_train, y_crop_test = train_test_split(X, y_crop_encoded, test_size=0.2, random_state=42)
_, _, y_yield_train, y_yield_test = train_test_split(X, y_yield, test_size=0.2, random_state=42)

# 3. Model Training - Crop Prediction
crop_model = RandomForestClassifier(n_estimators=100, random_state=42)
crop_model.fit(X_train, y_crop_train)
acc = accuracy_score(y_crop_test, crop_model.predict(X_test))
print(f"Random Forest Classifier Accuracy: {acc:.4f}")

# 4. Model Training - Yield Prediction (Regression)
# We'll use both as requested
lr_model = LinearRegression()
lr_model.fit(X_train, y_yield_train)
lr_preds = lr_model.predict(X_test)

rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
rf_reg.fit(X_train, y_yield_train)
rf_preds = rf_reg.predict(X_test)

print("-" * 30)
print("Yield Model Comparison:")
print(f"Linear Regression RMSE: {np.sqrt(mean_squared_error(y_yield_test, lr_preds)):.4f}")
print(f"Random Forest Regressor RMSE: {np.sqrt(mean_squared_error(y_yield_test, rf_preds)):.4f}")
print("-" * 30)

# Save models
os.makedirs('saved_models', exist_ok=True)
joblib.dump(crop_model, 'saved_models/crop_model.pkl')
joblib.dump(rf_reg, 'saved_models/yield_model.pkl') # Choosing RF for performance
joblib.dump(le, 'saved_models/label_encoder.pkl')
print("Models updated.")
