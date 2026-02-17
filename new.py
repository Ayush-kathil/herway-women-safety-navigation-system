import pandas as pd

# Load Indore Dataset
df = pd.read_csv("data.csv")

# Shift Coordinates to Bangalore (Approximate shift)
# Indore is approx 22.7, 75.8
# Bangalore is approx 12.9, 77.5
lat_shift = 12.9 - 22.7
long_shift = 77.5 - 75.8

df['latitude'] = df['latitude'] + lat_shift
df['longitude'] = df['longitude'] + long_shift

# Save as "bangalore_simulation_data.csv"
df.to_csv("bangalore_simulation_data.csv", index=False)