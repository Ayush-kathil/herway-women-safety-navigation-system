import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import numpy as np
import os

# 1. Load Processed Data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "processed_crime_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "safety_model.pkl")

try:
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded. Shape: {df.shape}")
except FileNotFoundError:
    print(f"Error: '{DATA_PATH}' not found. Run data_prep.py first.")
    exit()

# 2. Select Features (Inputs) and Target (Output)
# Updated to include environmental simulation features
features = [
    'latitude', 'longitude', 'hour', 'day_of_week', 
    'lighting_condition', 'crowd_density', 'police_presence_dist'
]

# Ensure all columns exist
for col in features:
    if col not in df.columns:
        print(f"Error: Missing required feature '{col}'. Regenerate dataset.")
        exit()

X = df[features]
y = df['risk_score']

# 3. Split Data (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train and Optimize the Model (GridSearchCV on RandomForest)
print("Initializing Grid Search for optimal hyperparameters... (This may take a few minutes)")
rf = RandomForestRegressor(random_state=42)

# Param grid carefully chosen to balance performance and runtime
param_grid = {
    'n_estimators': [50, 100],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}

grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, 
                           cv=3, n_jobs=-1, scoring='neg_mean_squared_error', verbose=2)

grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"\nBest Hyperparameters found: {grid_search.best_params_}")

# 5. Evaluate Model
y_pred = best_model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\n--- Model Performance ---")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
print(f"R^2 Score: {r2:.2f}")

# Print feature importances
print("\n--- Feature Importances ---")
importances = best_model.feature_importances_
for feature, imp in zip(features, importances):
    print(f"{feature:25}: {imp:.4f}")

# 6. Save the Model
joblib.dump(best_model, MODEL_PATH)
print(f"\n✅ Highly Optimized Model Saved as '{MODEL_PATH}'")