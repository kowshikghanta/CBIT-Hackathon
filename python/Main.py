import pandas as pd
import xgboost as xgb
from sklearn.model_selection import KFold, cross_val_score
from sklearn.metrics import make_scorer, mean_squared_error, r2_score
import numpy as np
import sys


def analyze_credit(csv_file_path):
    """
    Analyze credit score using XGBoost regression model
    """
    try:
        # Load data
        df = pd.read_csv(csv_file_path)

        # Features and target
        X = df.drop(columns=["Name", "Phone Number", "Email", "Credit Score"])
        y = df["Credit Score"]

        # Convert object columns to categorical
        for col in X.select_dtypes(include='object').columns:
            X[col] = X[col].astype('category')

        # Define model
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

        # Define K-Fold
        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        # Custom scorer for R²
        r2_scorer = make_scorer(r2_score)

        # Cross-validation for R²
        r2_scores = cross_val_score(model, X, y, cv=kf, scoring=r2_scorer)
        print("R² scores for each fold:", r2_scores)
        print("Mean R²:", np.mean(r2_scores))

        # Cross-validation for MSE (negative MSE in scikit-learn)
        mse_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error')
        mse_scores = -mse_scores  # convert to positive
        print("MSE scores for each fold:", mse_scores)
        print("Mean MSE:", np.mean(mse_scores))

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python Main.py <csv_file_path>")
        sys.exit(1)

    csv_path = sys.argv[1]
    analyze_credit(csv_path)
