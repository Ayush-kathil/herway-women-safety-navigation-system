<div align="center">
  <img src="frontend/public/logo.png" alt="HerWay Logo" width="250" />
  <h1>HerWay: Predictive Safety Navigation System</h1>
  <p><strong>Advanced Machine Learning Routing Engine • Next.js 14 • Spatial APIs</strong></p>

  [![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/Ayush-kathil/herway-women-safety-navigation-system)
  [![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js_14-black)](https://nextjs.org/)
  [![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
  [![ML: Scikit-Learn](https://img.shields.io/badge/ML-Scikit_Learn-orange?logo=scikitlearn)](https://scikit-learn.org/)
</div>

<br />

> **Project Lead**: Ayush Kathil (Donay)  
> **Mission**: Re-engineering urban cartography. Instead of optimizing solely for vehicular speed, **HerWay** evaluates global routing arrays strictly through the lens of physiological safety, dynamically recalculating navigation pathways based on real-time socio-environmental matrices.

---

## 🌟 Architectural Features

### 🧠 Pre-Trained AI Context Engine
We departed from standard geographic heatmap visualizations in favor of an active, predictive neural approach:
*   **Vectorized Data Sciences**: Our core datasets are cleansed and expanded utilizing synthetic Gaussian jitter scripts to prevent ML overfitting on strict pinpoint anomalies.
*   **Random Forest Modeling**: Predicts localized coordinate safety by dynamically calculating 7 continuous variables: `Latitude`, `Longitude`, `Time of Day`, `Day of the Week`, `Lighting Conditions`, `Crowd Density`, and `Emergency Responder Proximity`.
*   *(See `MODEL_TRAINING_OVERVIEW.md` or `PROJECT_DESCRIPTION.md` for a comprehensive technical breakdown).*

### 🗺️ Extreme UI/UX Topologies
*   **Perspective Rendering Engine (3D)**: Standard OpenStreetMap raster systems are fundamentally flat. We engineered a dual-layer hyper-scaled rendering container that tricks `react-leaflet` into fetching 250% horizon bounds, allowing us to tilt the entire canvas vector 60° without tile clipping. 
*   **JIT Framer Motion Layouts**: Component orchestration utilizes strict React micro-animations offering a highly viscous, polished "Black & White Farm" aesthetic. 

## 🔌 System Stack

| Subsystem | Technologies Used |
| :--- | :--- |
| **Frontend Renderer** | React 18, Next.js 14 App Router, Tailwind CSS, Framer Motion |
| **Route/Map Engine** | React-Leaflet, OpenStreetMap Tile API, OSRM Polyline Servers |
| **Microservices API** | Python, FastAPI, Uvicorn, Pydantic |
| **Deep Training Core** | Pandas, Numpy, Scikit-Learn (GridSearchCV, RandomForest) |

## 🚀 Quick Start / Deployment

### 1. Unified Launch (Windows)
We provide a threaded `.bat` executable to dual-boot the Frontend compiler (`:3000`) and the Python ASGI server (`:8000`) concurrently.
```bash
.\start_app.bat
```

### 2. Manual Subsystems
**API Engine**:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
**Client Interface**:
```bash
cd frontend
npm install
npm run dev
```

---
*Developed under explicit focus on systemic reliability, algorithmic transparency, and flawless runtime execution. Designed for safer cities.*
