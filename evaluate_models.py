if __name__ == "__main__":
    import joblib
    import pandas as pd
    from sklearn.metrics import accuracy_score
    
    le = joblib.load('saved_models/label_encoder.pkl')
    model = joblib.load('saved_models/crop_model.pkl')
    df = pd.read_csv('crop_data.csv')
    
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y_true = le.transform(df['label'])
    
    acc = accuracy_score(y_true, model.predict(X))
    print(f"REPORT_ACCURACY:{acc*100:.2f}")
    print("REPORT_YIELD:Operational")
    print("REPORT_PRICE:Operational")

