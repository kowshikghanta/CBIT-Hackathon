import pandas as pd
import xgboost as xgb
from sklearn.model_selection import KFold, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import sys
import pickle

MODEL_PATH = "credit_xgb_model.pkl"

def train_and_save(csv_file_path):
    """Train XGBoost on financial dataset and save model"""
    df = pd.read_csv(csv_file_path)
    X = df.drop(columns=["Name", "Phone Number", "Email", "Credit Score"])
    y = df["Credit Score"]
    for col in X.select_dtypes(include='object').columns:
        X[col] = X[col].astype('category')
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        enable_categorical=True
    )

    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    r2_scores = cross_val_score(model, X, y, cv=kf, scoring='r2')
    mse_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error') * -1

    print("Training complete. Mean R2:", np.mean(r2_scores))
    print("Mean MSE:", np.mean(mse_scores))
    # Fit model on entire data
    model.fit(X, y)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {MODEL_PATH}")

def predict(input_json_path):
    """Predict credit score for formatted user input (from PDF, etc.)"""
    # Load model
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    input_df = pd.read_json(input_json_path)
    # Ensure categorical conversion if needed
    for col in input_df.select_dtypes(include='object').columns:
        input_df[col] = input_df[col].astype('category')
    preds = model.predict(input_df)
    print(f"Predicted score(s): {preds.tolist()}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage:")
        print("Train: python main.py train <csv_file>")
        print("Predict: python main.py predict <input_json>")
        sys.exit(1)
    cmd, path = sys.argv[1], sys.argv[2]
    if cmd == "train":
        train_and_save(path)
    elif cmd == "predict":
        predict(path)
    else:
        print("Unknown command:", cmd)
        sys.exit(1)
