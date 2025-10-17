# ==========================================================
# CREDIT SCORE PREDICTION USING XGBOOST
# ==========================================================

import pandas as pd
import matplotlib.pyplot as plt
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb

# --- Load Dataset ---
df = pd.read_csv("credit_score_dataset_30k.csv")

# ==========================================================
# STEP 1: ENCODE CATEGORICAL FEATURES
# ==========================================================
# Convert all 'object' type columns to category
for col in df.select_dtypes(include=['object']).columns:
    if col != 'Customer_ID':  # skip ID
        df[col] = df[col].astype('category')

# Encode the target variable (Credit_Score)
le = LabelEncoder()
df['Credit_Score'] = le.fit_transform(df['Credit_Score'])

# Display the mapping for reference
label_map = dict(zip(le.classes_, le.transform(le.classes_)))
print("🎯 Label Mapping:", label_map)

# ==========================================================
# STEP 2: SPLIT DATA INTO FEATURES AND TARGET
# ==========================================================
X = df.drop(['Customer_ID', 'Credit_Score'], axis=1)
y = df['Credit_Score']

# ==========================================================
# STEP 3: TRAIN-TEST SPLIT
# ==========================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ==========================================================
# STEP 4: TRAIN XGBOOST CLASSIFIER
# ==========================================================
model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.1,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='mlogloss',
    enable_categorical=True  # 👈 enables native categorical support
)

print("\n🚀 Training XGBoost model...")
model.fit(X_train, y_train)
print("✅ Training complete!")

# ==========================================================
# STEP 5: EVALUATION
# ==========================================================
y_pred = model.predict(X_test)

print("\n✅ Accuracy:", accuracy_score(y_test, y_pred))
print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))
print("\n🔢 Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# ==========================================================
# STEP 6: FEATURE IMPORTANCE
# ==========================================================
xgb.plot_importance(model, max_num_features=10, importance_type='gain')
plt.title("Top 10 Important Features")
plt.show()

# ==========================================================
# STEP 7: SAVE MODEL AND ENCODER
# ==========================================================
joblib.dump(model, "credit_score_xgb_model.pkl")
joblib.dump(le, "label_encoder.pkl")
print("\n💾 Model saved as 'credit_score_xgb_model.pkl'")
print("💾 Label Encoder saved as 'label_encoder.pkl'")

# ==========================================================
# STEP 8: SAMPLE PREDICTION (Optional)
# ==========================================================
# Example: decode predicted labels back to strings
decoded_preds = le.inverse_transform(y_pred[:10])
print("\n🔍 Sample Predictions:", decoded_preds)

joblib.dump(model, "credit_score_xgb_model.pkl")
