import os
from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRIMARY_CSV = os.path.join(BASE_DIR, "data.csv")
SOURCE_DIR = os.path.join(BASE_DIR, "data_sources")
OUTPUT_PATH = os.path.join(BASE_DIR, "processed_crime_data.csv")

RNG = np.random.default_rng(42)


def parse_dates(date_str):
    for fmt in ("%d-%m-%Y %H:%M", "%d/%m/%Y %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            return pd.to_datetime(date_str, format=fmt)
        except ValueError:
            pass
    return pd.to_datetime(date_str, errors="coerce")


def standardize_columns(df):
    df = df.copy()
    df.columns = [c.lower().strip() for c in df.columns]
    rename_map = {}
    for candidate in ("lat", "latitude_deg", "y"):
        if candidate in df.columns:
            rename_map[candidate] = "latitude"
    for candidate in ("lon", "lng", "longitude_deg", "x"):
        if candidate in df.columns:
            rename_map[candidate] = "longitude"
    for candidate in ("date", "datetime", "time"):
        if candidate in df.columns and "timestamp" not in df.columns:
            rename_map[candidate] = "timestamp"
    if rename_map:
        df = df.rename(columns=rename_map)
    return df


def load_source_csv(path):
    try:
        df = pd.read_csv(path, encoding="utf-8")
    except Exception as exc:
        print(f"Skipping {path}: {exc}")
        return None

    df = standardize_columns(df)
    if "latitude" not in df.columns or "longitude" not in df.columns:
        print(f"Skipping {path}: missing latitude/longitude columns")
        return None

    df = df.dropna(subset=["latitude", "longitude"]).copy()
    if "timestamp" in df.columns:
        df["dt"] = df["timestamp"].apply(parse_dates)
        df = df.dropna(subset=["dt"]).copy()
        df["hour"] = df["dt"].dt.hour.astype(int)
        df["day_of_week"] = df["dt"].dt.dayofweek.astype(int)
    else:
        index_values = np.arange(len(df))
        df["hour"] = (index_values * 3) % 24
        df["day_of_week"] = index_values % 7

    df["source"] = Path(path).stem
    return df


def get_lighting(hour):
    if 7 <= hour <= 17:
        return 0.93
    if hour in (6, 18):
        return 0.60
    if 5 <= hour <= 19:
        return 0.72
    return 0.20


def get_crowd(hour):
    if 9 <= hour <= 20:
        return 0.80
    if 21 <= hour <= 23:
        return 0.35
    return 0.12


def assign_base_risk(row):
    risk = 20
    for column, value in (("act379", 50), ("act323", 60), ("act363", 90), ("act302", 100), ("act13", 40), ("act279", 30)):
        if column in row and row[column] == 1:
            risk = max(risk, value)
    return risk


def build_police_hubs(df):
    lat_center = float(df["latitude"].mean())
    lon_center = float(df["longitude"].mean())
    return [
        (lat_center + 0.018, lon_center - 0.014),
        (lat_center - 0.016, lon_center + 0.012),
        (lat_center + 0.008, lon_center + 0.021),
        (lat_center - 0.021, lon_center - 0.010),
        (lat_center + 0.002, lon_center - 0.026),
    ]


def min_distance_to_police(lat, lon, police_hubs):
    distances = [np.sqrt((lat - p[0]) ** 2 + (lon - p[1]) ** 2) * 111.0 for p in police_hubs]
    return float(min(distances))


def compute_final_risk(row):
    base = row["base_risk"]
    lighting_penalty = (1.0 - row["lighting_condition"]) * 16
    crowd_penalty = (1.0 - row["crowd_density"]) * 14
    police_penalty = min(max(row["police_presence_dist"] - 1.0, 0) * 4.5, 18)
    time_penalty = row["time_risk"] * 10
    final_score = base + lighting_penalty + crowd_penalty + police_penalty + time_penalty
    return int(np.clip(final_score, 0, 100))


source_files = []
if os.path.exists(PRIMARY_CSV):
    source_files.append(PRIMARY_CSV)

if os.path.isdir(SOURCE_DIR):
    source_files.extend(sorted(str(path) for path in Path(SOURCE_DIR).glob("*.csv")))

if not source_files:
    print(f"Error: no CSV sources found. Expected {PRIMARY_CSV} or files in {SOURCE_DIR}.")
    raise SystemExit(1)

frames = []
for source_file in source_files:
    frame = load_source_csv(source_file)
    if frame is not None and not frame.empty:
        frames.append(frame)

if not frames:
    print("Error: all source files were empty or invalid.")
    raise SystemExit(1)

df = pd.concat(frames, ignore_index=True)
print(f"Loaded {len(frames)} source file(s) with {len(df)} rows before augmentation.")

df["base_risk"] = df.apply(assign_base_risk, axis=1)

expanded_frames = [df]
EXPANSION_FACTOR = 6
for _ in range(1, EXPANSION_FACTOR):
    augmented = df.copy()
    augmented["latitude"] = augmented["latitude"] + RNG.normal(0, 0.0007, len(augmented))
    augmented["longitude"] = augmented["longitude"] + RNG.normal(0, 0.0007, len(augmented))
    augmented["hour"] = (augmented["hour"] + RNG.integers(-1, 2, len(augmented))) % 24
    augmented["day_of_week"] = (augmented["day_of_week"] + RNG.integers(0, 2, len(augmented))) % 7
    augmented["base_risk"] = np.clip(augmented["base_risk"] + RNG.integers(-4, 5, len(augmented)), 0, 100)
    expanded_frames.append(augmented)

full_df = pd.concat(expanded_frames, ignore_index=True)
print(f"Expanded shape: {full_df.shape}")

full_df["lighting_condition"] = full_df["hour"].apply(get_lighting)
full_df["crowd_density"] = full_df["hour"].apply(get_crowd)

police_hubs = build_police_hubs(full_df)
full_df["police_presence_dist"] = full_df.apply(
    lambda row: min_distance_to_police(row["latitude"], row["longitude"], police_hubs),
    axis=1,
)

full_df["time_risk"] = full_df["hour"].apply(lambda hour: 0.9 if hour <= 4 else 0.6 if hour <= 6 else 0.15 if hour <= 16 else 0.35 if hour <= 18 else 0.65 if hour <= 21 else 0.8)
full_df["risk_score"] = full_df.apply(compute_final_risk, axis=1)

output_cols = [
    "latitude",
    "longitude",
    "hour",
    "day_of_week",
    "lighting_condition",
    "crowd_density",
    "police_presence_dist",
    "risk_score",
]

full_df[output_cols].to_csv(OUTPUT_PATH, index=False)
print(f"Processed data saved to '{OUTPUT_PATH}'")
print(full_df[output_cols].head())