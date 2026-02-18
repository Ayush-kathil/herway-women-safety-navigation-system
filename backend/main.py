from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import uvicorn
import numpy as np
from pydantic import BaseModel
from datetime import datetime
import os
import pandas as pd
import requests
import warnings
import math

warnings.filterwarnings("ignore", category=UserWarning)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "safety_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print("AI Model Loaded Successfully")
except:
    print(f"Error: '{MODEL_PATH}' not found. Run train_model.py first.")
    model = None

# --- Crime Data Loading ---
CRIME_CSV = os.path.join(BASE_DIR, "data.csv")
crime_df = None
try:
    raw = pd.read_csv(CRIME_CSV)
    def parse_hour(ts):
        try:
            ts = str(ts).strip()
            parts = ts.split(" ")
            if len(parts) >= 2:
                time_part = parts[1]
                if ":" in time_part:
                    return int(time_part.split(":")[0])
                elif "." in time_part:
                    return int(time_part.split(".")[0])
            return 12
        except:
            return 12 
    raw["crime_hour"] = raw["timestamp"].apply(parse_hour)
    crime_df = raw[["latitude", "longitude", "crime_hour"]].dropna()
    print(f"Crime Data Loaded: {len(crime_df)} records")
except Exception as e:
    print(f"Warning: Could not load crime data: {e}")


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def crime_density_near(lat, lng, radius=800):
    """Count crime incidents within radius meters of a point."""
    if crime_df is None:
        return 0
    count = 0
    for _, row in crime_df.iterrows():
        d = haversine(lat, lng, row["latitude"], row["longitude"])
        if d <= radius:
            count += 1
    return count


def get_time_modifier(hour):
    """Returns a 0-1 modifier based on time of day. Higher = riskier time."""
    if 0 <= hour <= 4:
        return 0.9
    elif 5 <= hour <= 6:
        return 0.5
    elif 7 <= hour <= 16:
        return 0.1
    elif 17 <= hour <= 18:
        return 0.3
    elif 19 <= hour <= 21:
        return 0.6
    else:
        return 0.8


def generate_advice(risk_score, hour, crime_count):
    """Generate dynamic, context-aware safety advice."""
    tips = []
    
    if risk_score > 75:
        tips.append("High risk area detected.")
        if hour >= 19 or hour <= 5:
            tips.append("Avoid traveling alone at night in this zone.")
        if crime_count > 3:
            tips.append(f"{crime_count} crime incidents reported nearby — consider alternative routes.")
        tips.append("Stay on well-lit main roads. Share live location with a trusted contact.")
    elif risk_score > 40:
        tips.append("Moderate risk — proceed with caution.")
        if hour >= 19 or hour <= 5:
            tips.append("Nighttime increases risk here. Stay alert and avoid shortcuts.")
        if crime_count > 0:
            tips.append(f"{crime_count} incident(s) reported in this area recently.")
        tips.append("Keep emergency contacts ready.")
    else:
        tips.append("This area is relatively safe at this time.")
        if crime_count == 0:
            tips.append("No crime incidents reported nearby.")
        else:
            tips.append(f"Only {crime_count} minor incident(s) recorded — low concern.")
        if 7 <= hour <= 16:
            tips.append("Good visibility and foot traffic expected.")
    
    return " ".join(tips)


# --- API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "Women Safety Prediction API is Running"}


@app.get("/health")
def health():
    """Health check for frontend connection testing."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "crime_data_loaded": crime_df is not None,
        "crime_records": len(crime_df) if crime_df is not None else 0,
    }


@app.get("/predict_safety")
def predict_safety(lat: float, long: float, hour: int, day_of_week: int = -1):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if day_of_week == -1:
        day_of_week = datetime.now().weekday()
    
    try:
        prediction = model.predict([[lat, long, hour, day_of_week]])
        model_score = float(prediction[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {e}")
    
    # Get real crime density for this location
    crime_count = crime_density_near(lat, long, 1000)
    crime_factor = min(crime_count * 3, 25)  # 0-25 range
    
    # Time modifier
    time_mod = get_time_modifier(hour) * 15  # 0-15 range
    
    # Combined score: ML model is PRIMARY (60%), crime density (25%), time (15%)
    risk_score = (model_score * 0.60) + (crime_factor) + (time_mod)
    risk_score = max(0, min(100, risk_score))
    
    # Determine category
    category = "Safe"
    color = "green"
    if risk_score > 75:
        category = "High Risk"
        color = "red"
    elif risk_score > 40:
        category = "Moderate Risk"
        color = "yellow"

    advice = generate_advice(risk_score, hour, crime_count)
        
    return {
        "latitude": lat,
        "longitude": long,
        "hour": hour,
        "day_of_week": day_of_week,
        "safety_score": round(risk_score, 1),
        "category": category,
        "zone_color": color,
        "advice": advice,
        "crime_count": crime_count,
        "model_raw_score": round(model_score, 1),
    }


@app.get("/get_crime_hotspots")
def get_crime_hotspots(lat: float, lng: float, radius: float = 2000, hour: int = -1):
    if crime_df is None:
        return []
    
    nearby = []
    for _, row in crime_df.iterrows():
        dist = haversine(lat, lng, row["latitude"], row["longitude"])
        if dist <= radius:
            crime_hr = int(row["crime_hour"])
            relevance = 1.0
            if hour >= 0:
                diff = min(abs(crime_hr - hour), 24 - abs(crime_hr - hour))
                if diff > 4:
                    continue
                relevance = max(0.3, 1.0 - (diff * 0.2))
            
            nearby.append({
                "lat": float(row["latitude"]),
                "lng": float(row["longitude"]),
                "hour": crime_hr,
                "relevance": round(relevance, 2)
            })
    
    seen = set()
    unique = []
    for p in nearby:
        key = (round(p["lat"], 4), round(p["lng"], 4))
        if key not in seen:
            seen.add(key)
            unique.append(p)
    
    return unique[:50]


class RouteRequest(BaseModel):
    waypoints: list[list[float]]
    hour: int
    day_of_week: int = -1


@app.post("/analyze_route")
def analyze_route(request: RouteRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    day = request.day_of_week if request.day_of_week != -1 else datetime.now().weekday()
    
    if len(request.waypoints) < 2:
         return {"error": "Need at least start and end points"}
         
    start = request.waypoints[0]
    end = request.waypoints[-1]
    
    url = f"http://router.project-osrm.org/route/v1/driving/{start[1]},{start[0]};{end[1]},{end[0]}?overview=full&geometries=geojson&alternatives=3"
    
    try:
        response = requests.get(url, timeout=8)
        data = response.json()
        
        if data["code"] != "Ok":
            raise Exception("OSRM API Error")
            
        osrm_routes = data["routes"]
        
    except Exception as e:
        print(f"Routing Error: {e}")
        return {"error": "Could not fetch route. Please check internet connection."}

    time_mod = get_time_modifier(request.hour)

    def score_route(route_geometry):
        full_path = [[p[1], p[0]] for p in route_geometry]
        chunk_size = 15
        annotated_segments = []
        total_risk = 0
        risk_counts = 0
        total_crimes = 0
        
        for i in range(0, len(full_path), chunk_size):
            chunk = full_path[i : i + chunk_size + 1]
            if not chunk:
                continue
            
            mid_point = chunk[len(chunk)//2]
            lat, long = mid_point
            
            try:
                pred = model.predict([[lat, long, request.hour, day]])
                model_score = float(pred[0])
                
                crime_count = crime_density_near(lat, long, 800)
                total_crimes += crime_count
                crime_factor = min(crime_count * 3, 25)
                
                time_contribution = time_mod * 15
                
                # ML model = 60%, crime = 25%, time = 15%
                score = (model_score * 0.60) + crime_factor + time_contribution
                score = max(0, min(100, score))
                
                total_risk += score
                risk_counts += 1
                
                color = "#10b981"  # green
                if score > 65:
                    color = "#ef4444"  # red
                elif score > 35:
                    color = "#eab308"  # yellow
                
                annotated_segments.append({
                    "path": chunk,
                    "score": round(score, 1),
                    "color": color
                })
            except:
                annotated_segments.append({
                    "path": chunk, "score": 0, "color": "#9ca3af"
                })
        
        avg = total_risk / max(1, risk_counts)
        mx = max([s["score"] for s in annotated_segments]) if annotated_segments else 0
        return annotated_segments, avg, mx, total_crimes

    scored_routes = []
    for idx, route in enumerate(osrm_routes):
        coords = route["geometry"]["coordinates"]
        duration = route.get("duration", 0)
        distance = route.get("distance", 0)
        segments, avg, mx, crimes = score_route(coords)
        scored_routes.append({
            "route_index": idx,
            "risk_segments": segments,
            "average_safety_score": round(avg, 1),
            "max_risk_score": round(mx, 1),
            "is_safe": avg < 50,
            "duration_min": round(duration / 60, 1),
            "distance_km": round(distance / 1000, 1),
            "total_crimes_along_route": crimes,
        })
    
    scored_routes.sort(key=lambda r: r["average_safety_score"])
    
    safest = scored_routes[0]
    alternatives = scored_routes[1:] if len(scored_routes) > 1 else []
    
    # Calculate comparison stats
    comparison = None
    if alternatives:
        worst_avg = max(r["average_safety_score"] for r in alternatives)
        if worst_avg > 0:
            pct_safer = round(((worst_avg - safest["average_safety_score"]) / worst_avg) * 100, 1)
        else:
            pct_safer = 0
        comparison = {
            "percent_safer": pct_safer,
            "crimes_avoided": max(r["total_crimes_along_route"] for r in alternatives) - safest["total_crimes_along_route"],
        }
    
    # Generate route-specific reasoning
    reasons = []
    if safest["is_safe"]:
        reasons.append("Low average risk score across all segments")
    if safest["total_crimes_along_route"] == 0:
        reasons.append("No crime hotspots detected along this route")
    elif alternatives and safest["total_crimes_along_route"] < max(r["total_crimes_along_route"] for r in alternatives):
        reasons.append("Fewer crime incidents along this path")
    if alternatives and safest["duration_min"] <= min(r["duration_min"] for r in alternatives):
        reasons.append("Also the fastest route available")
    elif alternatives:
        time_diff = safest["duration_min"] - min(r["duration_min"] for r in alternatives)
        if time_diff > 0:
            reasons.append(f"Only {time_diff:.0f} min longer than fastest route")
    
    return {
        "recommended": safest,
        "alternatives": alternatives,
        "total_routes_found": len(scored_routes),
        "hour_analyzed": request.hour,
        "comparison": comparison,
        "recommendation_reasons": reasons,
    }


@app.get("/get_safety_grid")
def get_safety_grid(lat_min: float, lat_max: float, long_min: float, long_max: float, hour: int):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    lat_steps = np.linspace(lat_min, lat_max, 15)
    long_steps = np.linspace(long_min, long_max, 15)
    
    day = datetime.now().weekday()
    grid_data = []
    
    input_data = []
    coords = []
    
    for lat in lat_steps:
        for long in long_steps:
            input_data.append([lat, long, hour, day])
            coords.append((lat, long))
            
    if not input_data:
        return []
        
    try:
        predictions = model.predict(input_data)
        time_mod = get_time_modifier(hour) * 15
        
        for (lat, long), model_score in zip(coords, predictions):
            crime_count = crime_density_near(lat, long, 600)
            crime_factor = min(crime_count * 3, 25)
            
            score = (float(model_score) * 0.60) + crime_factor + time_mod
            score = max(0, min(100, score))
            
            color = "green"
            if score > 75:
                color = "red"
            elif score > 40:
                color = "yellow"
            
            grid_data.append({
                "lat": lat,
                "lng": long,
                "score": round(score, 1),
                "color": color
            })
            
    except Exception as e:
        print(f"Grid generation error: {e}")
        return []

    return grid_data


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)