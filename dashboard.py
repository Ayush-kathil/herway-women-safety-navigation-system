import streamlit as st
import folium
from streamlit_folium import st_folium
import requests
import pandas as pd
import numpy as np

st.image("logo.png", width=50)
# --- CONFIGURATION ---
API_URL = "http://127.0.0.1:8000/predict_safety"
BANGALORE_CENTER = [12.9716, 77.5946]

st.set_page_config(page_title="Women Safety Shield", page_icon="st.image", layout="wide")

st.title("🛡️ Women Safety Risk Prediction System")
st.markdown("**Real-time AI Analysis of Route Safety**")

# --- SIDEBAR CONTROLS ---
with st.sidebar:
    st.header("📍 Navigation Settings")
    hour = st.slider("Time of Day (24h)", 0, 23, 22)
    st.info(f"Analyzing Safety for: **{hour}:00** hours")
    
    st.markdown("---")
    st.write(" **Team Members:**")
    st.caption("Ayush Gupta (Lead)\n+ 5 Team Members")

# --- FUNCTIONS ---
def get_safety_score(lat, lng, time_hour):
    """Call the FastAPI Backend to get risk score"""
    try:
        response = requests.get(f"{API_URL}?lat={lat}&long={lng}&hour={time_hour}")
        if response.status_code == 200:
            return response.json()
        else:
            st.error("Backend Connection Error")
            return None
    except Exception as e:
        st.error(f"API Error: {e}")
        return None

# --- MAIN LAYOUT ---
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("🗺️ Live Safety Map")
    
    # Create the Map
    m = folium.Map(location=BANGALORE_CENTER, zoom_start=13)
    
    # Allow user to click on map to check a spot
    m.add_child(folium.LatLngPopup())
    
    # 1. HANDLE MAP CLICKS
    map_data = st_folium(m, height=500, width=700)

    clicked_lat = None
    clicked_long = None

    if map_data['last_clicked']:
        clicked_lat = map_data['last_clicked']['lat']
        clicked_long = map_data['last_clicked']['lng']

with col2:
    st.subheader("📊 Risk Analysis")
    
    if clicked_lat:
        st.write(f"**Selected Location:**")
        st.code(f"{clicked_lat:.4f}, {clicked_long:.4f}")
        
        with st.spinner("AI is analyzing historical crime patterns..."):
            result = get_safety_score(clicked_lat, clicked_long, hour)
        
        if result:
            score = result['safety_score']
            category = result['category']
            color = result['zone_color']
            
            # Display Big Metric
            st.metric(label="Safety Score (0-100)", value=f"{score}/100", delta="-High Risk" if score > 70 else "Safe")
            
            # Risk Badge
            if color == "Red":
                st.error(f"⚠️ {category.upper()}")
                st.markdown("🚫 **Avoid this area.** High report of incidents at night.")
            elif color == "Yellow":
                st.warning(f"⚠️ {category.upper()}")
                st.markdown("👀 **Proceed with Caution.** Well-lit areas recommended.")
            else:
                st.success(f"✅ {category.upper()}")
                st.markdown("🛡️ **Safe Zone.** High police presence detected.")
            
    else:
        st.info("👈 Click anywhere on the map to analyze safety risks.")

# --- ROUTE SIMULATION (BONUS FOR EXHIBITION) ---
st.markdown("---")
st.subheader("🛣️ Route Safety Scanner")
st.write("Simulates a route from **Indiranagar** to **Koramangala** and scans safety at every km.")

if st.button("Scan Route for Safety"):
    # Simulated Route Points (Lat, Long)
    route_points = [
        (12.9719, 77.6412), # Indiranagar
        (12.9600, 77.6350), # Domlur
        (12.9352, 77.6245), # Koramangala
    ]
    
    risk_log = []
    
    cols = st.columns(len(route_points))
    for i, (r_lat, r_long) in enumerate(route_points):
        res = get_safety_score(r_lat, r_long, hour)
        risk_log.append(res['safety_score'])
        
        with cols[i]:
            st.write(f"📍 Point {i+1}")
            if res['zone_color'] == 'Red':
                st.error(f"Risk: {res['safety_score']}")
            elif res['zone_color'] == 'Yellow':
                st.warning(f"Risk: {res['safety_score']}")
            else:
                st.success(f"Risk: {res['safety_score']}")

    avg_risk = sum(risk_log) / len(risk_log)
    if avg_risk > 60:
        st.error(f"🚫 ROUTE REJECTED: Average Risk {avg_risk:.1f} is too high.")
    else:
        st.success(f"✅ ROUTE APPROVED: Average Risk {avg_risk:.1f} is acceptable.")