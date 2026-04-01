import joblib
import pandas as pd
from sklearn.metrics import accuracy_score

try:
    model = joblib.load('saved_models/crop_model.pkl')
    le = joblib.load('saved_models/label_encoder.pkl')
    df = pd.read_csv('crop_data.csv')
    
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_true = le.transform(df['label'])
    
    preds = model.predict(X)
    acc = accuracy_score(y_true, preds)
    print(f"accuracy:{acc*100:.2f}")
except Exception as e:
    print(f"error:{e}")
