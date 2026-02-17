import pandas as pd
import numpy as np

# 1. Load the Dataset
try:
    # Try reading with different encodings to avoid issues
    df = pd.read_csv("data.csv", encoding='utf-8')
    print("Dataset Loaded Successfully!")
except FileNotFoundError:
    print("Error: file 'data.csv' not found. Please put the CSV in the same folder.")
    exit()
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit()

# 2. Coordinate Shift (Indore -> Bangalore Simulation)
# Indore center: ~22.7, 75.8
# Bangalore center: ~12.9, 77.5
LAT_SHIFT = 12.9141 - 22.7196
LONG_SHIFT = 77.5946 - 75.8577

# Standardize column names
df.columns = [c.lower().strip() for c in df.columns]

if 'latitude' in df.columns and 'longitude' in df.columns:
    df['latitude'] = df['latitude'] + LAT_SHIFT
    df['longitude'] = df['longitude'] + LONG_SHIFT
else:
    print("Error: 'latitude' or 'longitude' columns not found.")
    exit()

# 3. Create 'Risk Score' based on Crime Type
# We assign weights: Heinous crimes = 100, Petty crimes = 20
def assign_risk(row):
    # If using the provided dataset which has act columns instead of a single type
    # act379 (Theft), act302 (Murder), act363 (Kidnapping), etc.
    risk = 20 # Base risk
    
    if 'act379' in row and row['act379'] == 1: risk = max(risk, 50) # Theft
    if 'act302' in row and row['act302'] == 1: risk = max(risk, 100) # Murder
    if 'act363' in row and row['act363'] == 1: risk = max(risk, 90) # Kidnapping
    if 'act323' in row and row['act323'] == 1: risk = max(risk, 60) # Assault
    
    return risk

df['risk_score'] = df.apply(assign_risk, axis=1)

# 4. Extract Time Features
# Handle various date formats
def parse_dates(date_str):
    for fmt in ('%d-%m-%Y %H:%M', '%d/%m/%Y %H:%M', '%Y-%m-%d %H:%M:%S'):
        try:
            return pd.to_datetime(date_str, format=fmt)
        except ValueError:
            pass
    return pd.to_datetime(date_str, errors='coerce')

if 'timestamp' in df.columns:
    df['dt'] = df['timestamp'].apply(parse_dates)
    df = df.dropna(subset=['dt']) # Drop rows where date parsing failed
    
    df['hour'] = df['dt'].dt.hour
    df['day_of_week'] = df['dt'].dt.dayofweek # Monday=0, Sunday=6
else:
    print("Warning: 'timestamp' column not found. Generating simulation headers.")
    df['hour'] = np.random.randint(0, 24, df.shape[0])
    df['day_of_week'] = np.random.randint(0, 7, df.shape[0])

# 5. Save Processed Data
output_cols = ['latitude', 'longitude', 'hour', 'day_of_week', 'risk_score']
df[output_cols].to_csv("processed_crime_data.csv", index=False)
print("✅ Data Processed and Saved as 'processed_crime_data.csv'")
print(df[output_cols].head())