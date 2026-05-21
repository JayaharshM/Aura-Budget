#!/usr/bin/env python3
"""
Train a Random Forest model on the Kaggle personal finance dataset.

Dataset: ramyapintchy/personal-finance-data
Columns: Date, Transaction Description, Category, Amount, Type

MODEL: RandomForestRegressor to predict expense Amount
  - Filters to Expense rows only
  - Features: Category (one-hot), DayOfWeek, Month, Year, DayOfMonth
  - Target: Amount (continuous)
  - Useful for budget planning: given a category + date, predict expected spend

Outputs (saved to ../model/):
  expense_amount_rf.pkl          - Trained RandomForestRegressor pipeline
  expense_category_classes.json  - List of Category labels for one-hot encoding
"""

# ── Imports ──────────────────────────────────────────────────────────────────
import os
import json
import warnings
warnings.filterwarnings("ignore")

import kagglehub
from kagglehub import KaggleDatasetAdapter

import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import joblib

# ── 1. Load Dataset ───────────────────────────────────────────────────────────
print("=" * 60)
print("  Expense Amount Predictor — Random Forest")
print("=" * 60)
print("\n📦 Loading dataset from Kaggle...")

df = kagglehub.load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "ramyapintchy/personal-finance-data",
    "Personal_Finance_Dataset.csv",
)
print(f"  Total rows: {len(df)}")
print(f"  Columns:    {list(df.columns)}")

# ── 2. Clean & Filter ─────────────────────────────────────────────────────────
df.columns = [c.strip() for c in df.columns]
df["Type"] = df["Type"].str.strip()

expense_df = df[df["Type"] == "Expense"].copy()
print(f"\n💳 Expense rows: {len(expense_df)}")

expense_df["Date"]   = pd.to_datetime(expense_df["Date"], errors="coerce")
expense_df["Amount"] = pd.to_numeric(expense_df["Amount"], errors="coerce")
expense_df["Category"] = expense_df["Category"].str.strip()
expense_df = expense_df.dropna(subset=["Date", "Amount", "Category"])

# ── 3. Feature Engineering ────────────────────────────────────────────────────
expense_df["DayOfWeek"] = expense_df["Date"].dt.dayofweek
expense_df["Month"]     = expense_df["Date"].dt.month
expense_df["Year"]      = expense_df["Date"].dt.year
expense_df["DayOfMonth"]= expense_df["Date"].dt.day
expense_df["Quarter"]   = expense_df["Date"].dt.quarter

categories = sorted(expense_df["Category"].unique().tolist())
print(f"\n📂 Categories ({len(categories)}): {categories}")
print("\n📊 Amount statistics by Category:")
print(expense_df.groupby("Category")["Amount"].agg(["count","mean","std","min","max"]).round(2).to_string())

# ── 4. Build Feature Matrix ───────────────────────────────────────────────────
feature_cols = ["Category", "DayOfWeek", "Month", "Year", "DayOfMonth", "Quarter"]
X = expense_df[feature_cols].copy()
y = expense_df["Amount"].values

preprocessor = ColumnTransformer(transformers=[
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["Category"]),
    ("num", StandardScaler(), ["DayOfWeek", "Month", "Year", "DayOfMonth", "Quarter"]),
])

# ── 5. Build Pipeline ─────────────────────────────────────────────────────────
pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1,
    )),
])

# ── 6. Train / Test Split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\n🔀 Train: {len(X_train)} samples | Test: {len(X_test)} samples")

# ── 7. Fit & Evaluate ─────────────────────────────────────────────────────────
print("\n🌲 Training Random Forest Regressor (300 trees)...")
pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
mae   = mean_absolute_error(y_test, y_pred)
rmse  = np.sqrt(mean_squared_error(y_test, y_pred))
r2    = r2_score(y_test, y_pred)

print("\n📈 Test Set Metrics:")
print(f"   MAE  (Mean Absolute Error):  ₹{mae:.2f}")
print(f"   RMSE (Root Mean Sq. Error):  ₹{rmse:.2f}")
print(f"   R²   (Variance explained):   {r2:.4f}")

# Feature importances
rf       = pipeline.named_steps["regressor"]
ohe      = pipeline.named_steps["preprocessor"].named_transformers_["cat"]
cat_names= list(ohe.get_feature_names_out(["Category"]))
num_names= ["DayOfWeek", "Month", "Year", "DayOfMonth", "Quarter"]
all_names= cat_names + num_names

importances = rf.feature_importances_
top_features = sorted(zip(all_names, importances), key=lambda x: -x[1])[:10]
print("\n🏆 Top 10 Feature Importances:")
for name, imp in top_features:
    bar = "█" * int(imp * 50)
    print(f"  {name:<30s} {imp:.4f}  {bar}")

# Per-category prediction sample
print("\n💡 Sample Predictions vs Actuals (first 20 test rows):")
results_df = pd.DataFrame({
    "Category":  X_test["Category"].values,
    "Month":     X_test["Month"].values,
    "Actual ₹":  y_test.round(2),
    "Predicted ₹": y_pred.round(2),
    "Error ₹":   (y_pred - y_test).round(2),
})
print(results_df.head(20).to_string(index=False))

# ── 8. Save Artifacts ─────────────────────────────────────────────────────────
model_dir    = os.path.join(os.path.dirname(__file__), "..", "model")
os.makedirs(model_dir, exist_ok=True)

model_path   = os.path.join(model_dir, "expense_amount_rf.pkl")
classes_path = os.path.join(model_dir, "expense_category_classes.json")

joblib.dump(pipeline, model_path)
with open(classes_path, "w") as f:
    json.dump({"classes": categories}, f, indent=2)

print(f"\n✅ Model saved  → {os.path.abspath(model_path)}")
print(f"✅ Classes saved → {os.path.abspath(classes_path)}")
print("\n🎉 Done!")
