from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import uvicorn
import numpy as np
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# --- CONFIGURATION ---
# Enable CORS for React Frontend (localhost:5173)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*" # For development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load the Trained Model
try:
    model = joblib.load("safety_model.pkl")
    print("AI Model Loaded Successfully")
except:
    print("Error: 'safety_model.pkl' not found. Run train_model.py first.")
    model = None

@app.get("/")
def home():
    return {"message": "Women Safety Prediction API is Running"}

@app.get("/predict_safety")
def predict_safety(lat: float, long: float, hour: int, day_of_week: int = -1):
    """
    Input: Latitude, Longitude, Hour (0-23), Day of Week (0=Monday, 6=Sunday)
    Output: Risk Score and Safety Category
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # If day_of_week is not provided, estimate it from current time or default to Monday (0)
    if day_of_week == -1:
        day_of_week = datetime.now().weekday()
    
    # Predict Risk Score using the model
    # The input must be a 2D array [[lat, long, hour, day_of_week]]
    try:
        prediction = model.predict([[lat, long, hour, day_of_week]])
        risk_score = float(prediction[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {e}")
    
    # Determine Category
    category = "Safe"
    color = "green"
    advice = "Safe to travel. High police presence detected."
    
    if risk_score > 75:
        category = "High Risk"
        color = "red"
        advice = "Avoid this area. High report of incidents at night."
    elif risk_score > 40:
        category = "Moderate Risk"
        color = "yellow"
        advice = "Proceed with Caution. Well-lit areas recommended."
        
    return {
        "latitude": lat,
        "longitude": long,
        "hour": hour,
        "day_of_week": day_of_week,
        "safety_score": round(risk_score, 1),
        "category": category,
        "zone_color": color,
        "advice": advice
    }

# To run this: uvicorn main:app --reload
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)