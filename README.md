# HerWay: Women's Safety Navigation System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

**A data-driven geospatial platform designed to enhance women's safety through real-time route analysis, crime hotspot detection, and emergency assistance integration.**

[Features](#features) &nbsp;&nbsp; [Architecture](#architecture) &nbsp;&nbsp; [Installation](#installation) &nbsp;&nbsp; [Usage](#usage) &nbsp;&nbsp; [API Documentation](#api-documentation) &nbsp;&nbsp; [Contributing](#contributing)

</div>


## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Usage Guide](#usage-guide)


## Overview
HerWay is a comprehensive web application that calculates the safest pedestrian and vehicle routes by analyzing historical crime data, street lighting, crowd density, and proximity to emergency services. 


## Features
* **Safety Routing:** Computes routes using multi-factor safety scoring models.
* **Hotspot Detection:** Visualizes high-risk areas using dynamic heatmaps.
* **Emergency SOS:** One-touch alert system triggering location broadcasts to trusted contacts.
* **Responsive UI:** Fully optimized mobile-first layout utilizing Next.js and TailwindCSS.
* **Resilient Architecture:** Implemented TanStack Query and Zustand for global state management with robust API rate-limit handling and background caching.
* **3D Map Optimizations:** MapLibre integration featuring WebGL hardware acceleration fail-safes and multi-touch crash protections for a seamless native-like map experience.


## Architecture
* **Frontend:** Next.js 16 (App Router), TailwindCSS, MapLibre GL, Zustand, TanStack Query.
* **Backend:** FastAPI (Python), Pandas for data processing, Scikit-learn for algorithmic risk scoring.
* **Database:** Supabase (PostgreSQL with PostGIS extensions).


## Prerequisites
* Node.js v18+
* Python 3.10+
* Git


## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Ayush-kathil/herway-women-safety-navigation-system.git
cd herway-women-safety-navigation-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python data_prep.py
python train_model.py
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```


## Usage Guide

To launch both the backend and frontend simultaneously, use the provided script at the root of the project:

**Windows:**
```bash
start_app.bat
```

This script will automatically start the FastAPI server on port 8000 and the Next.js development server on port 3000. 


## Contributing
Contributions are welcome. Please open an issue or submit a pull request for any bugs, enhancements, or feature requests. Ensure all code changes are thoroughly tested and adhere to the project's formatting standards.
