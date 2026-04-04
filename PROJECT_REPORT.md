# HerWay: Women's Safety Navigation System

**Project Report**

<!--
This report is written in a clean Markdown structure so it can be converted to LaTeX later.
Replace the placeholders in the title and front matter with your institution-specific details.
-->

---

## Title Page

**Project Title:** HerWay: Women's Safety Navigation System  
**Domain:** Web Application, Geospatial Safety Analytics, Machine Learning, and Emergency Response  
**Project Type:** Final Year / Capstone / Academic Project Report  
**Prepared By:** _[Your Name]_  
**Enrollment No.:** _[Your Enrollment Number]_  
**Program:** _[Your Program Name]_  
**Institution:** _[Your Institution Name]_  
**Guide / Supervisor:** _[Supervisor Name]_  
**Submission Date:** April 2026

---

## Certificate

This is to certify that the project report titled **"HerWay: Women's Safety Navigation System"** is a bona fide record of the work carried out by **_[Your Name]_** under my supervision and guidance. The report is submitted in partial fulfillment of the requirements for the award of the degree / diploma / certification in **_[Program Name]_**.

The work presented in this report is original to the best of my knowledge and has not been submitted elsewhere for the award of any degree, diploma, or other qualification.

**Supervisor Signature:** ____________________  
**Name:** _[Supervisor Name]_  
**Designation:** _[Designation]_  
**Date:** _[Date]_  
**Seal:** ____________________

---

## Declaration

I, **_[Your Name]_**, hereby declare that the project report titled **"HerWay: Women's Safety Navigation System"** is my original work and has been completed under the guidance of **_[Supervisor Name]_**. This report is submitted for academic evaluation only.

I also declare that all sources of information used in the preparation of this report have been properly acknowledged in the references section. No part of this report has been copied without citation, and the content has been prepared in a plagiarism-free manner.

**Signature:** ____________________  
**Name:** _[Your Name]_  
**Date:** _[Date]_

---

## Acknowledgement

I would like to express my sincere gratitude to everyone who contributed to the successful completion of this project report.

First, I thank my project supervisor, **_[Supervisor Name]_**, for valuable guidance, constructive feedback, and continuous support throughout the development process. Their suggestions helped shape the technical and conceptual direction of the system.

I also thank my institution for providing the academic environment, resources, and encouragement required to carry out this work. The availability of laboratory facilities, internet access, and project review support was instrumental in completing the system.

I am grateful to the open-source community for the tools and libraries used in this project, including FastAPI, Next.js, React, TypeScript, Leaflet, MapLibre GL, scikit-learn, pandas, NumPy, and joblib. These technologies made it possible to build a practical, modern, and scalable safety navigation application.

Finally, I thank my family and friends for their motivation, patience, and support during the entire project period.

---

## Abstract

Women’s safety in public spaces remains a serious concern in many cities, especially during late hours, in poorly lit areas, and on routes with a history of incidents. Conventional navigation applications focus mainly on shortest-path routing or travel time. They rarely incorporate safety intelligence, local crime awareness, or emergency response support. This project addresses that gap by proposing and implementing **HerWay**, a women-focused safety navigation platform that combines route planning, crime hotspot awareness, location-based risk scoring, and emergency escalation features in a single system.

HerWay is built as a full-stack application with a **Next.js frontend** and a **FastAPI backend**. The backend processes crime datasets, loads a machine learning model, and computes contextual safety scores based on location, time of day, distance from police presence, and nearby incident density. The frontend provides a clean and responsive user interface where a user can search for locations, request safety analysis, explore routes, monitor live navigation, view hotspots, and trigger emergency actions. The system also includes trusted contacts management and safe-place discovery to help users make informed decisions in real time.

The project uses publicly available crime data and a trained model stored in the repository. Route safety estimation is not limited to static geographic markers; instead, it combines dynamic factors such as time, crowd patterns, and surrounding incident density. This makes the recommendation more useful than a simple map overlay. The final result is a practical prototype that demonstrates how machine learning, geospatial analytics, and human-centered design can be combined to improve personal safety during travel.

**Keywords:** women safety, navigation system, FastAPI, Next.js, machine learning, geospatial analytics, route safety, emergency response, crime hotspots, trusted contacts

---

## Table of Contents

1. [Introduction](#1-introduction)  
2. [Problem Statement](#2-problem-statement)  
3. [Objectives](#3-objectives)  
4. [Scope of the Project](#4-scope-of-the-project)  
5. [Background and Related Concepts](#5-background-and-related-concepts)  
6. [System Requirements](#6-system-requirements)  
7. [Technology Stack](#7-technology-stack)  
8. [System Design](#8-system-design)  
9. [Implementation Details](#9-implementation-details)  
10. [Testing and Validation](#10-testing-and-validation)  
11. [Results and Discussion](#11-results-and-discussion)  
12. [Limitations](#12-limitations)  
13. [Future Scope](#13-future-scope)  
14. [Conclusion](#14-conclusion)  
15. [References](#15-references)  
16. [Appendix](#16-appendix)

---

## List of Abbreviations

- **API**: Application Programming Interface
- **ASGI**: Asynchronous Server Gateway Interface
- **CORS**: Cross-Origin Resource Sharing
- **CSV**: Comma-Separated Values
- **GPS**: Global Positioning System
- **JSON**: JavaScript Object Notation
- **ML**: Machine Learning
- **OSRM**: Open Source Routing Machine
- **UI**: User Interface
- **UX**: User Experience

---

# 1. Introduction

Safety during travel is a fundamental concern for everyone, but it becomes especially critical in the context of women navigating urban environments. A route that is geographically short is not always safe. Streets with poor lighting, low foot traffic, limited surveillance, or historical crime concentration can increase personal risk even if they appear efficient on a standard map. In many real-world situations, people make route decisions based on intuition, local familiarity, or informal advice. That approach is subjective, inconsistent, and difficult to scale.

The HerWay project was created to address this problem through a safety-oriented navigation system that combines geospatial data, machine learning, and emergency assistance. The system attempts to answer a question that standard navigation tools ignore: **not just where should the user go, but how safe is that route at the current time?**

The solution is designed as a web-based platform so that it can be accessed from common devices without requiring a dedicated native mobile application. A web architecture also makes development, testing, and deployment easier for an academic project. The frontend is built using Next.js and React to provide a dynamic interface. The backend is built using FastAPI to expose analytical and operational endpoints. Crime data and model artifacts are stored in the repository, making the system reproducible and transparent.

The project is not only a route planner; it is a safety decision-support system. It supports exploration mode, route mode, real-time GPS tracking, safe-place discovery, emergency contacts, and SOS triggering. Each of these features contributes to a broader goal: reducing uncertainty and helping users take informed actions when moving through unfamiliar or risky environments.

---

# 2. Problem Statement

Traditional map applications are optimized for distance, time, or traffic conditions. While these criteria are valuable, they do not directly reflect personal safety. A route that is shorter may pass through isolated areas, poorly lit roads, or locations with a higher risk of incidents. Users often have to rely on experience or external sources to judge whether a route is appropriate. This creates several practical problems:

- Safety evaluation is manual and inconsistent.
- Users may not know nearby safe places such as hospitals, police stations, or pharmacies.
- Emergency support is often separated from the navigation flow.
- Crime data, if available, is typically not integrated into route selection.
- Users cannot easily compare alternate routes based on safety.

These limitations become more serious for women traveling alone, especially at night or in unfamiliar areas. A system is needed that can combine real-time location awareness with historical incident patterns and present the result in a simple, actionable format.

The core problem addressed by HerWay is therefore the absence of a unified, user-friendly, and context-aware safety navigation platform for women.

---

# 3. Objectives

The project is built around the following objectives:

1. To design a safety-focused navigation system that evaluates routes based on risk, not only distance.
2. To integrate machine learning for location-based safety estimation.
3. To identify and visualize crime hotspots using available crime data.
4. To support live navigation with contextual safety alerts.
5. To provide an emergency SOS mechanism and trusted contact workflow.
6. To help users discover nearby safe locations such as hospitals, police stations, and pharmacies.
7. To create a responsive web application that works across devices.
8. To keep the architecture modular so that the system can be expanded into a mobile app or larger platform later.

These objectives guided both the backend model design and the frontend user interface.

---

# 4. Scope of the Project

The scope of the project includes the development of a working prototype for safety-oriented navigation. The system focuses on the following functions:

- Location search and map display
- Route safety analysis
- Safety score generation
- Crime hotspot mapping
- Safe-place lookup
- GPS-based live monitoring
- Emergency alert handling
- Trusted contact management

The project also includes a backend service for processing route requests and serving predictions. The implementation is intended for academic demonstration and prototype evaluation. It is not a certified emergency system and does not replace law enforcement, public safety systems, or professional navigation services.

The scope excludes the following items for the current version:

- Government-grade crime data integration
- Direct SMS or call gateway integration with telecom providers
- Authentication backed by a production database
- Native mobile apps for Android and iOS
- Offline map functionality
- Full user account management and secure cloud storage

These exclusions are deliberate because the project aims to prove the concept within the limits of a manageable academic build.

---

# 5. Background and Related Concepts

## 5.1 Safety-Aware Navigation

Safety-aware navigation refers to route planning that takes personal risk into account. Instead of choosing the shortest route alone, the system evaluates whether the route passes through areas with higher incident frequency, low visibility, or limited access to assistance. In practice, this requires combining map data, crime records, and contextual conditions.

## 5.2 Geospatial Analytics

Geospatial analytics deals with the processing and interpretation of location-based information. In this project, coordinates are used to estimate crime density around the user’s location and along a route. Distance calculations such as the Haversine formula help determine how close a location is to risky points or support facilities.

## 5.3 Machine Learning in Safety Scoring

Machine learning supports the prediction of safety scores from multiple variables. A model can learn patterns from historical crime data and other features, then estimate risk for new coordinates or route segments. This allows the system to provide an adaptive score rather than a fixed rule-based result.

## 5.4 Human-Centered Safety Design

A safety system is only effective if users can understand and act on it quickly. That means the design must be clear, non-technical, and emotionally usable under stress. HerWay uses simple labels such as safe, moderate, risky, and dangerous, plus actionable advice and emergency shortcuts.

## 5.5 Emergency Escalation Support

In urgent scenarios, users need immediate options. The SOS button and trusted contacts workflow provide escalation support directly from the interface. This shortens the gap between identifying danger and requesting help.

---

# 6. System Requirements

## 6.1 Functional Requirements

The system must be able to:

- Accept location input through search or GPS.
- Display a map centered on the user’s position.
- Compute a safety score for selected points.
- Analyze complete routes between two locations.
- Display crime hotspots near the selected area.
- Show nearby safe places.
- Support emergency SOS triggering.
- Save and retrieve trusted contacts.
- Provide live route guidance and danger alerts.

## 6.2 Non-Functional Requirements

The system must also satisfy the following non-functional requirements:

- **Usability:** Users should understand the interface without training.
- **Responsiveness:** The interface should work on desktop and mobile screens.
- **Reliability:** Backend services should fail gracefully if data is missing.
- **Maintainability:** Code should remain modular and readable.
- **Performance:** Route analysis and safety scoring should return quickly enough for practical use.
- **Portability:** The system should run in standard browser environments and common Python/Node setups.

## 6.3 Hardware Requirements

A typical development environment is sufficient:

- Dual-core processor or better
- 8 GB RAM minimum
- Stable internet connection
- Modern browser such as Chrome, Edge, or Firefox

## 6.4 Software Requirements

- Node.js 20.x
- Python 3.8+
- Next.js 16.x
- React 19.x
- FastAPI
- Uvicorn
- pandas
- NumPy
- scikit-learn
- joblib

---

# 7. Technology Stack

## 7.1 Frontend Technologies

The frontend uses Next.js with React and TypeScript. This combination provides strong component organization, good type safety, and modern rendering support. Tailwind CSS is used for styling and layout behavior, while libraries such as Leaflet and MapLibre GL support interactive mapping. Framer Motion is used for motion effects and user feedback. The application also uses iconography from Lucide React and theming support via next-themes.

## 7.2 Backend Technologies

The backend uses FastAPI for HTTP API handling and Uvicorn as the ASGI server. It uses pandas and NumPy for data processing and numerical computation, scikit-learn for machine learning predictions, joblib for model loading, and requests for third-party map and routing API access.

## 7.3 Data Storage

The project stores crime datasets in CSV format and serializes the trained model as a `.pkl` file. Trusted contacts are stored locally in JSON format. This approach is appropriate for an academic prototype because it keeps the implementation simple and transparent.

## 7.4 Why These Technologies Were Selected

Each technology was selected for a specific reason:

- **Next.js** provides a strong full-stack frontend framework with routing and performance benefits.
- **FastAPI** offers high performance and readable API definitions.
- **TypeScript** helps reduce bugs in complex UI state handling.
- **pandas / NumPy** are suitable for tabular and vectorized geospatial calculations.
- **scikit-learn** is ideal for prototype-level predictive modeling.
- **Leaflet / MapLibre** support route and marker visualization.

---

# 8. System Design

## 8.1 High-Level Architecture

The system follows a two-tier architecture with a client-side frontend and a server-side backend.

1. The user interacts with the frontend application.
2. The frontend sends requests to the backend.
3. The backend loads data, computes safety information, and returns the results.
4. The frontend presents the result as maps, scores, warnings, and route details.

This design separates presentation from analytical logic. It also makes the project easier to test, since the backend can be evaluated independently from the UI.

## 8.2 Major Components

### Frontend Layer
The frontend contains:
- Header and sidebar layout
- Map component
- Navigation panel
- Danger alert component
- Live safety bar
- SOS button
- Trusted contacts modal
- Login modal
- Safe-place manager
- Location search component

### Backend Layer
The backend contains:
- Health check endpoint
- Safety prediction endpoint
- Route analysis endpoint
- Crime hotspot endpoint
- Safety grid endpoint
- Safe-place endpoint
- Contact management endpoint
- SOS trigger endpoint

### Data Layer
The data layer consists of:
- `backend/data.csv`
- `backend/processed_crime_data.csv`
- `backend/safety_model.pkl`
- `backend/contacts.json` when created

## 8.3 Safety Score Logic

The safety score is influenced by several factors:

- Prediction from the trained ML model
- Density of crime incidents nearby
- Time-of-day modifier
- Proximity to police hubs or similar support points

This multi-factor approach is more realistic than using a single variable. A place may be safe in the morning but riskier at night; the score therefore changes with context.

## 8.4 Route Scoring Logic

For route analysis, the route geometry is split into segments. Each segment is scored individually using the same safety logic. The system then calculates an average route safety score and identifies the safest route among available alternatives. This is important because safety can vary across different parts of the same journey.

## 8.5 Safe-Place Discovery Design

The safe-place feature queries nearby points of interest such as police stations, hospitals, pharmacies, convenience stores, and fuel stations. This provides users with actionable fallback destinations when they want to move toward a safer area.

---

# 9. Implementation Details

## 9.1 Frontend Implementation

The frontend application is organized using the Next.js App Router structure. The main page coordinates the map, route analysis, safety visualization, and emergency features. State management is handled with React hooks. Dynamic imports are used for heavier components so that the application loads more efficiently.

The frontend maintains several pieces of application state:

- Current mode: explore or route
- Selected location
- Route start and end points
- Safety data and route data
- Crime hotspot list
- Safe-place list
- Live navigation state
- Voice and map theme settings
- Backend status

This state-driven design allows the interface to react immediately to user choices and backend responses.

## 9.2 Map Experience

The map component acts as the central visual element. It displays selected markers, route lines, crime hotspots, grid overlays, user location, and safe places. The design helps the user understand the environment at a glance instead of reading raw numeric output.

## 9.3 GPS Handling

A custom hook handles geolocation. It manages start, stop, watching, and error states. This avoids repeating geolocation logic in multiple components. The system also supports a GPS permission prompt so that the user is guided through location access rather than being blocked silently.

## 9.4 SOS Button

The SOS button is deliberately prominent and mobile-friendly. The user can activate it quickly during a stressful situation. The improved version of the button now sends the current location to the backend before dialing the emergency line, which makes the emergency payload more useful.

## 9.5 Trusted Contacts

The trusted contacts module lets the user store emergency contacts. The backend now safely reads and writes the contacts file, which prevents crashes if the JSON data is missing or corrupt.

## 9.6 Backend API Behavior

The backend uses separate endpoints for specific responsibilities. This keeps the API understandable and easy to extend. For example, the safety score endpoint is not mixed with route analysis, and the safe-place endpoint is separate from SOS handling.

## 9.7 Data Processing and ML Integration

The backend loads crime data from CSV and calculates distance-based metrics. It uses the persisted model to estimate risk. This model output is blended with contextual factors to produce the final score. The result is less brittle than rule-based scoring alone.

## 9.8 Error Handling Improvements

During review, several user-facing issues were identified and fixed:

- Stale `.next` type references in the frontend config
- Truthy checks that failed for valid zero-valued coordinates
- SOS flow that could lose the backend request
- Contacts file handling that could fail on malformed JSON

These fixes improve reliability and make the system behave more predictably in real use.

---

# 10. Testing and Validation

## 10.1 Testing Approach

The project was validated at the file and endpoint level by checking:

- Frontend TypeScript errors
- Backend Python errors
- Map and navigation component integration
- API endpoint availability
- Location-related state handling
- SOS and contact workflow behavior

## 10.2 Functional Validation

The following behaviors were validated:

- The application can read the backend health endpoint.
- Route analysis and safety scoring functions are present.
- Safe-place discovery returns usable map results.
- SOS can be triggered with a current location payload.
- Trusted contacts are stored without crashing on invalid data.

## 10.3 Code Quality Checks

Type and syntax checks were run on the modified files. The following issues were resolved:

- Removed broken `.next/dev/types` includes
- Fixed null-check logic for GPS coordinates
- Hardened backend file I/O
- Adjusted SOS call timing

## 10.4 Practical Validation Observations

A review from the perspective of a real user surfaced likely failure points. Those included missing backend data, confusion when GPS permission is denied, and the danger of sending emergency actions without location context. The current implementation now handles those cases more gracefully than before.

---

# 11. Results and Discussion

## 11.1 What the System Achieves

HerWay demonstrates that women’s safety can be treated as a first-class navigation problem. Instead of focusing only on directions, the application evaluates context. It helps users understand whether a route is reasonably safe, where nearby assistance exists, and what to do in an emergency.

## 11.2 Strengths of the Implementation

The project has several strong points:

- Clear user interface with map-centered workflow
- Separate backend service for prediction and analysis
- Practical combination of route scoring and safety advice
- Emergency workflow integrated into the main experience
- Modular structure that can support future expansion

## 11.3 User-Facing Value

A user does not need to interpret raw data or search multiple sources. The system gives a practical answer in one place. That is important because safety decisions are often time-sensitive and emotionally stressful.

## 11.4 Why the Project Is Better Than a Simple Map App

A standard map app can tell users how to get from point A to point B. HerWay attempts to explain whether that journey is sensible from a safety perspective. That distinction matters because the shortest path is not always the best path.

## 11.5 Discussion of Realistic Use

The application is best understood as a decision-support tool. It provides guidance, not guarantees. It is useful in daily travel planning, route comparison, and emergency awareness, but it should still be used with judgment and awareness of local conditions.

---

# 12. Limitations

No project of this kind is perfect, and the current prototype has several limitations:

1. The system relies on the available crime data and the quality of the trained model.
2. The safe-place feature depends on external map services.
3. Emergency communication is simulated in parts of the implementation.
4. The project does not yet include a secure user authentication and database layer.
5. GPS access depends on browser permissions and device support.
6. Route analysis is computationally heavier than basic mapping.
7. The current version is web-based rather than a dedicated native mobile application.

These limitations do not invalidate the project. They simply show where further engineering is needed for production deployment.

---

# 13. Future Scope

The project has several promising directions for future improvement:

## 13.1 Mobile Application
A native Android or iOS version would improve access to GPS, notifications, and emergency features.

## 13.2 Secure Authentication
A production-ready login system could allow user-specific contacts, saved routes, and personalized safety preferences.

## 13.3 Real Emergency Gateway Integration
Integration with SMS, voice call APIs, or emergency service gateways would make the SOS feature operational at a real-world level.

## 13.4 Improved Data Pipeline
More comprehensive and frequently updated crime data could make the safety scores more reliable.

## 13.5 Community Reporting
Users could submit reports about incidents, unsafe conditions, or hazards, which would enrich the map intelligence.

## 13.6 Offline Support
Offline map tiles and cached safety data would improve reliability in areas with weak network coverage.

## 13.7 Better Model Explainability
The model could expose feature importance or simple explanations so that users understand why a route is marked risky.

## 13.8 Multi-City Expansion
The project could be extended from one city to a broader regional or national service.

---

# 14. Conclusion

HerWay: Women's Safety Navigation System is a practical academic project that combines geospatial visualization, machine learning, and emergency support into one coherent platform. It addresses a real and important problem: the lack of safety-aware navigation for women traveling in uncertain environments.

The project demonstrates that route planning can be improved when crime data, time-based risk, and nearby support infrastructure are considered together. It also shows that safety tools are more useful when they are built into the navigation experience rather than isolated as separate services.

From a software engineering perspective, the system is modular, readable, and suitable for future expansion. From a societal perspective, it illustrates how technology can be used to improve situational awareness and support safer decisions. While the current version remains a prototype, it forms a strong foundation for further development into a more complete safety platform.

---

# 15. References

The following references were used as technical and conceptual support during the development of this project:

1. FastAPI Documentation. https://fastapi.tiangolo.com/
2. Next.js Documentation. https://nextjs.org/docs
3. React Documentation. https://react.dev/
4. TypeScript Handbook. https://www.typescriptlang.org/docs/
5. Leaflet Documentation. https://leafletjs.com/
6. MapLibre GL JS Documentation. https://maplibre.org/maplibre-gl-js/docs/
7. scikit-learn Documentation. https://scikit-learn.org/stable/
8. pandas Documentation. https://pandas.pydata.org/docs/
9. NumPy Documentation. https://numpy.org/doc/
10. joblib Documentation. https://joblib.readthedocs.io/
11. OSRM Routing Service. https://project-osrm.org/
12. OpenStreetMap and Overpass API documentation. https://wiki.openstreetmap.org/

Additional references may be added according to your institution’s citation style.

---

# 16. Appendix

## Appendix A: Project Folder Structure

```text
herway-women-safety-navigation-system/
├── backend/
│   ├── data.csv
│   ├── data_prep.py
│   ├── main.py
│   ├── processed_crime_data.csv
│   ├── requirements.txt
│   ├── safety_model.pkl
│   └── train_model.py
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── README.md
├── package.json
├── start_app.bat
└── vercel.json
```

## Appendix B: Key Backend Endpoints

- `GET /health` — backend and model status
- `POST /add_contact` — save trusted contact
- `GET /get_contacts` — retrieve contacts
- `POST /trigger_sos` — trigger emergency flow
- `GET /predict_safety` — get point-based safety score
- `GET /get_crime_hotspots` — find nearby crime points
- `POST /analyze_route` — evaluate route safety
- `GET /get_safety_grid` — generate safety grid overlay
- `GET /safe_places` — fetch nearby safe places

## Appendix C: Data Files Preserved in the Project

- `backend/data.csv`
- `backend/processed_crime_data.csv`
- `backend/safety_model.pkl`

## Appendix D: Suggested Report Formatting Notes for LaTeX Conversion

When converting this Markdown report into LaTeX later, the following structure can be retained:

- Title page
- Certificate
- Declaration
- Acknowledgement
- Abstract
- Table of contents
- Main chapters
- References
- Appendix

This keeps the report formal and suitable for academic submission.

---

## Final Note

This report is written as an original, project-specific document and intentionally avoids copied language. You may edit the placeholder fields, add your institution name, and adapt the references to your required citation style.
