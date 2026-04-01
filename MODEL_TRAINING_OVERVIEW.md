# HerWay: Security ML Model Overview & Data Sciences Report

> **Project Lead & Head Architect**: Donay (Ayush Kathil)  
> **Collaborators**: Engineering Team  

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Dataset Engineering & Preprocessing](#dataset-engineering--preprocessing)
3. [Algorithmic Architecture (Random Forest)](#algorithmic-architecture--random-forest)
4. [Tuning & Grid Search Configuration](#tuning--grid-search-configuration)
5. [Reproduction Commands](#reproduction-commands)

---

## 🚀 Executive Summary
The navigation core of the HerWay application is decoupled from standard traffic-centric route planners (e.g., OSRM). Instead, we feed every polyline coordinate chunk through a heavily vectorized, hyperparameter-tuned **Machine Learning Pipeline**. We utilize a deterministic `RandomForestRegressor` model to predict the **Safety Risk Score [0-100]** for any given geographical sub-section of an urban environment, adapting dynamically to the exact minute of the day.

---

## 🧬 Dataset Engineering & Preprocessing

### 1. The Core `data.csv`
The raw baseline spatial data is originally ingested as raw coordinate (`latitude`, `longitude`) points tagged with police-reported severity acts (`act379`, `act302`, `act363`, `act323`).

### 2. Data Cleaning & Synthesizing (The Script Fix)
Real-world datasets for crime statistics notoriously lack robust, real-time contextual variables. During preprocessing in `backend/data_prep.py`, the sparse arrays are synthesized safely into a primary comprehensive dataset:

- **Geo-Jitter Generation**: We utilized Gaussian distribution arrays (noise layers) to duplicate and slightly offset coordinate data by `~50-200 meters`. This dramatically expanded the dataset volume (x8 ratio, passing 16,000+ rows) and forces the ML model to generalize rather than perfectly memorize highly specific intersections.
- **Lighting Condition (`lighting_condition`)**: Simulated continuously into the index file mapping specific hours to daylight ratios. `1.0` = Bright, `0.0` = Pitch dark.
- **Crowd Dynamics (`crowd_density`)**: Simulated socio-behavioral presence where daytime correlates high output (`0.5 - 1.0`), punishing late-night isolated metrics.
- **Responder Proximity (`police_presence_dist`)**: Computed using Euclidean distance algorithms (simulating Haversine curvature) matching points mathematically against central simulated police hubs.

---

## 🧠 Algorithmic Architecture | Random Forest

We strictly rejected simpler Linear Regressions and Deep Neural Networks (due to excessive inference latency requirements). 

The optimal engine selected was the **Random Forest Regressor** (via `scikit-learn`). 
- **Non-Linear Relationships**: Crime vs. Time isn’t a straight line. Random Forests natively branch non-linear thresholds (e.g., *Is the time after 10 PM? If yes, is the Lighting bad? If yes > HIGH RISK*).
- **Outlier Resistances**: Ensemble averaging across dozens of independent decision trees severely mitigates single-coordinate data spiking anomalies.

The model reads `X` inputs (`Lat`, `Lng`, `Hour`, `Day`, `Lighting`, `Crowd`, `Police Dist`) and correlates them to `y` target (Base Risk + Environmental Penalties).

---

## ⚙️ Tuning & Grid Search Configuration

In `backend/train_model.py`, we execute a `GridSearchCV` operation prioritizing exhaustive parameter sweeping cross-validated over 3 folds (`CV=3`). 

```python
param_grid = {
    'n_estimators': [50, 100],     # Array of trees inside the forest
    'max_depth': [None, 10, 20],   # Constraint levels for tree depth logic
    'min_samples_split': [2, 5]    # Granular branching tolerance
}
```
The algorithm autonomously trained 36 independent fit models, evaluated them utilizing `neg_mean_squared_error` grading curves, and serialized the single best-performing artifact tree into `backend/safety_model.pkl` using `joblib`.

---

## 💻 Reproduction Commands

To replicate the data sciences pipeline perfectly natively via your terminal, execute these strictly in order:

### 1. Build The Synthetic Context Dataset
This script loads `data.csv`, simulates all environmental factors, applies jitter, and outputs an ultra-dense `processed_crime_data.csv`.
```bash
python backend/data_prep.py
```

### 2. Train and Serialize the ML Model
This script performs GridSearch, evaluates MAE/RMSE physics mappings, and drops out `safety_model.pkl` natively.
```bash
python backend/train_model.py
```

### 3. Launch App to Ingest AI Models
The Fast API server instantly hot-swaps the generated `safety_model.pkl` byte file on boot, piping the ML weights exactly into the Leaflet Navigation array.
```bash
.\start_app.bat
```
