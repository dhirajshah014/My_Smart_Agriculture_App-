import pandas as pd
import numpy as np
import datetime
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1. Dataset Generation (5 Years of Synthetic Data)
# Crops: Rice, Maize, Wheat, Cotton, Sugarcane, Jute
np.random.seed(42)
crops = ["rice", "maize", "wheat", "cotton", "sugarcane", "jute"]
base_prices = {"rice": 2000, "maize": 1600, "wheat": 1800, "cotton": 4500, "sugarcane": 300, "jute": 3500}
volatility = {"rice": 100, "maize": 80, "wheat": 90, "cotton": 200, "sugarcane": 30, "jute": 150}

start_date = pd.Timestamp(2021, 1, 1)
end_date = pd.Timestamp(2026, 3, 29)
date_range = pd.date_range(start_date, end_date)

data_list = []

for crop in crops:
    current_price = base_prices[crop]
    for d in date_range:
        # Add some seasonality (sine wave)
        seasonal_effect = np.sin(2 * np.pi * d.dayofyear / 365.25) * (volatility[crop] / 2)
        # Add trend (slow growth)
        trend = (d - start_date).days * (base_prices[crop] * 0.0001) 
        # Add random noise
        noise = np.random.normal(0, volatility[crop] / 4)
        
        price = current_price + seasonal_effect + trend + noise
        data_list.append([crop, d, round(price, 2)])

df = pd.DataFrame(data_list, columns=["crop", "date", "price"])

# 2. Preprocessing
print("Pre-processing data...")
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['dayofyear'] = df['date'].dt.dayofyear

# Sort chronologically
df = df.sort_values(['crop', 'date'])

# Handle One-hot encoding for crops
df_encoded = pd.get_dummies(df, columns=['crop'])

# Features and target
X = df_encoded.drop(['date', 'price'], axis=1)
y = df_encoded['price']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Training (RandomForestRegressor)
print("Training RandomForestRegressor...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print(f"Model Training Complete!")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")

# 5. Saving the Model and Encoders
MODELS_DIR = "saved_models"
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

model_path = os.path.join(MODELS_DIR, "price_model.pkl")
joblib.dump(model, model_path)

# Save feature names for consistent encoding during prediction
features = X.columns.tolist()
joblib.dump(features, os.path.join(MODELS_DIR, "price_features.pkl"))

print(f"Model saved to {model_path}")
