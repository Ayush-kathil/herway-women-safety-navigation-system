import pandas as pd
import numpy as np
import os

# 1. Load the Dataset
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data.csv")

try:
    df = pd.read_csv(CSV_PATH, encoding='utf-8')
    print("Original Dataset Loaded Successfully!")
except FileNotFoundError:
    print(f"Error: file '{CSV_PATH}' not found. Please put the CSV in the same folder.")
    exit()
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit()

# 2. Standardize column names
df.columns = [c.lower().strip() for c in df.columns]

if 'latitude' not in df.columns or 'longitude' not in df.columns:
    print("Error: 'latitude' or 'longitude' columns not found.")
    exit()

print(f"Original shape: {df.shape}")

# 3. Time Feature Extraction properly before expansion
def parse_dates(date_str):
    for fmt in ('%d-%m-%Y %H:%M', '%d/%m/%Y %H:%M', '%Y-%m-%d %H:%M:%S'):
        try:
            return pd.to_datetime(date_str, format=fmt)
        except ValueError:
            pass
    return pd.to_datetime(date_str, errors='coerce')

if 'timestamp' in df.columns:
    df['dt'] = df['timestamp'].apply(parse_dates)
    df = df.dropna(subset=['dt']).copy()
    df['hour'] = df['dt'].dt.hour
    df['day_of_week'] = df['dt'].dt.dayofweek
else:
    df['hour'] = np.random.randint(0, 24, df.shape[0])
    df['day_of_week'] = np.random.randint(0, 7, df.shape[0])

# 4. Core Risk based on Crime Types
def assign_base_risk(row):
    risk = 20
    if 'act379' in row and row['act379'] == 1: risk = max(risk, 50)
    if 'act302' in row and row['act302'] == 1: risk = max(risk, 100)
    if 'act363' in row and row['act363'] == 1: risk = max(risk, 90)
    if 'act323' in row and row['act323'] == 1: risk = max(risk, 60)
    return risk

df['base_risk'] = df.apply(assign_base_risk, axis=1)

# 5. Expand Dataset (Synthetically create 8x more data points)
# We add jitter to coordinates and time to simulate a continuous realistic dataset
EXPANSION_FACTOR = 8
expanded_dfs = [df]

for i in range(1, EXPANSION_FACTOR):
    new_df = df.copy()
    # Add geographical jitter (~50-200 meters)
    jitter_lat = np.random.normal(0, 0.001, new_df.shape[0])
    jitter_lon = np.random.normal(0, 0.001, new_df.shape[0])
    new_df['latitude'] += jitter_lat
    new_df['longitude'] += jitter_lon
    
    # Randomly shift hour by +/- 2 hours to blur temporal lines
    hour_shift = np.random.randint(-2, 3, new_df.shape[0])
    new_df['hour'] = (new_df['hour'] + hour_shift) % 24
    
    # Introduce small noise into the base risk so model doesn't overfit
    noise_risk = np.random.randint(-5, 6, new_df.shape[0])
    new_df['base_risk'] = np.clip(new_df['base_risk'] + noise_risk, 0, 100)
    
    expanded_dfs.append(new_df)

full_df = pd.concat(expanded_dfs, ignore_index=True)
print(f"Expanded shape: {full_df.shape}")

# 6. Generate Contextual Environmental Features
# a) Lighting Condition (0 = pitch dark, 1 = bright daylight)
# Simplified: bright between 7-17, dark 19-5, twilight 6,18
def get_lighting(hour):
    if 7 <= hour <= 17: return np.random.uniform(0.8, 1.0)
    if hour in [6, 18]: return np.random.uniform(0.4, 0.7)
    return np.random.uniform(0.0, 0.3)
full_df['lighting_condition'] = full_df['hour'].apply(get_lighting)

# b) Crowd Density (0 = empty, 1 = packed)
# Higher during day and early evening, low at late night
def get_crowd(hour):
    if 9 <= hour <= 20: return np.random.uniform(0.5, 1.0)
    if 21 <= hour <= 23: return np.random.uniform(0.2, 0.6)
    return np.random.uniform(0.0, 0.2)
full_df['crowd_density'] = full_df['hour'].apply(get_crowd)

# c) Police Presence Distance (Simulated km to nearest station)
# Simulating 5 police hubs around the city center
lat_center, lon_center = full_df['latitude'].mean(), full_df['longitude'].mean()
police_hubs = [
    (lat_center + np.random.normal(0, 0.02), lon_center + np.random.normal(0, 0.02))
    for _ in range(5)
]

def min_distance_to_police(lat, lon):
    # Simplified euclidean approximation converted to roughly km
    distances = [np.sqrt((lat - p[0])**2 + (lon - p[1])**2) * 111.0 for p in police_hubs]
    return min(distances)

# Vectorized distance calculation
full_df['police_presence_dist'] = full_df.apply(lambda row: min_distance_to_police(row['latitude'], row['longitude']), axis=1)
# Add some gaussian noise to distance to represent patrols
full_df['police_presence_dist'] = np.abs(full_df['police_presence_dist'] + np.random.normal(0, 0.5, full_df.shape[0]))

# 7. Compute Final Risk Score dynamically combining base and environment
# Poor lighting, low crowd, and far police increases the apparent safety risk score.
def compute_final_risk(row):
    base = row['base_risk']
    
    # Lighting penalty: dark adds up to 15 points
    lighting_penalty = (1.0 - row['lighting_condition']) * 15
    
    # Crowd modifier: empty streets at late night is risky (up to 15 points)
    crowd_penalty = (1.0 - row['crowd_density']) * 15
    
    # Police distance: > 2km adds risk linearly
    police_penalty = min((max(0, row['police_presence_dist'] - 1.0) * 5), 20)
    
    final_score = base + lighting_penalty + crowd_penalty + police_penalty
    return int(np.clip(final_score, 0, 100))

full_df['risk_score'] = full_df.apply(compute_final_risk, axis=1)

# 8. Save Processed Data
output_cols = ['latitude', 'longitude', 'hour', 'day_of_week', 
               'lighting_condition', 'crowd_density', 'police_presence_dist', 'risk_score']

OUTPUT_PATH = os.path.join(BASE_DIR, "processed_crime_data.csv")
full_df[output_cols].to_csv(OUTPUT_PATH, index=False)
print(f"✅ Enhanced Data Processed and Saved as '{OUTPUT_PATH}'")
print(full_df[output_cols].head())