import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import numpy as np

# 1. Load Processed Data
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "processed_crime_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "safety_model.pkl")

try:
    df = pd.read_csv(DATA_PATH)
    print("Dataset loaded.")
except FileNotFoundError:
    print(f"Error: '{DATA_PATH}' not found. Run data_prep.py first.")
    exit()

# 2. Select Features (Inputs) and Target (Output)
# Inputs: Latitude, Longitude, Hour of Day, Day of Week
X = df[['latitude', 'longitude', 'hour', 'day_of_week']]
# Output: Risk Score
y = df['risk_score']

# 3. Split Data (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Model (Random Forest)
print("Training Model... (This might take a minute)")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate Model
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"Model Performance:")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
print(f"R^2 Score: {r2:.2f}")

# 6. Save the Model
joblib.dump(model, MODEL_PATH)
print(f"✅ Model Saved as '{MODEL_PATH}'")