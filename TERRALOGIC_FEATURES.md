# TerraLogic Pro: Project Specifications & Feature Catalog

This document provides a highly detailed, "pin-to-pin" breakdown of all implemented features within the TerraLogic Pro ecosystem, divided into the **Farmer Intelligence Suite** and the **Admin Command Center**.

---

## 1. Public Landing Page (TerraLogic.Pro)
*The public-facing entry point for the platform.*

- **High-Fidelity UI**: Modern, glassmorphism-inspired design with vibrant HSL-tailored colors and smooth scroll micro-animations.
- **Marketing Funnel**: Integrated CTAs (Request Early Access, Start Onboarding) that redirect guests to the secure login/sign-up portal.
- **Smart Gateway**: Intelligent routing that detects authenticated sessions; logged-in users are automatically redirected to their respective dashboards.
- **Mobile Responsive**: Fully fluid layout optimized for field tablets and smartphones.

---

## 2. Farmer Intelligence Dashboard (`/dashboard`)
*The scientific workspace for active field management.*

### A. Core Diagnostic Modules (Sidebar)
1.  **Crop Prediction System**: Uses an optimized **Random Forest Classifier** to recommend the most profitable crop based on Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, pH, and Rainfall.
2.  **Yield Forecasting**: A regression-based model that predicts harvest weight (tons/hectare).
    - **Regression Vector Analysis**: Provides interactive **Plotly.js** visualizations comparing regional trends.
3.  **Disease Detection**: An image-recognition module (powered by **ResNet50**) that allows farmers to upload photos of plants for instant pathological analysis.
4.  **Marketplace Interface**: A unified platform for buying and selling agricultural assets, integrated with session-based identity.
5.  **AI Assistant (TerraBot)**: A generative AI chatbot (Gemini-powered) capable of answering complex agronomic queries and interpreting field data in real-time.

### B. Real-Time Telemetry (Main View)
- **Voice-Activated Guidance**: A hero interface allowing voice queries like *"Hey Terra, what is my optimal nitrogen level?"*
- **Live Atmosphere Widget**: Integration of real-time weather data including Local Temperature, Humidity, and Rainfall (mm).
- **ML Performance HUD**: Displays the current Model Accuracy and the most recent detection result.

---

## 3. Admin Command Center (`/admin`)
*The technical oversight hub for system scientists.*

### A. Metrics & Monitoring (Command Center)
- **Model Vitality HUD**: High-density cards displaying **Verified Accuracy (88.25%)**, **Yield System (Operational)**, and **Price System (Operational)**.
- **Operational HUD**: High-density cards displaying real-time server health: **CPU Load**, **Memory Usage**, **System Uptime (99.98%)**, and **Active Connections**.
- **Latency Monitoring**: High-fidelity **Plotly.js** line chart tracking API response times for core prediction endpoints in real-time.
- **Telemetry Indicators**: Global "PULSE" monitor showing server heartbeats and last-refresh timestamps (10s intervals).

### B. Specialized Controls
1.  **Model Workbench**: Hub for managing training artifacts (`.pkl`), viewing model complexity, and initializing retraining pipelines.
2.  **Dataset Management**: Centralized high-throughput interface for cataloging `crop_data.csv` and managing storage usage metrics.
3.  **System Logs (Diagnostic Console)**: 
    - **Authentic Event Stream**: A live terminal environment capturing Flask lifecycle events using a thread-safe `LogBufferHandler`.
    - **Operational Power**: Integrated **Log Filtering** (isolating INFO, WARN, ERROR) and **CSV Export** for forensic data analysis.
    - **Automatic Re-sync**: Background auto-refresh logic ensuring the dashboard state is always synchronized with the backend diagnostic buffer.

---

## 4. Platform Architecture & Security
- **Backend Architecture**: Modular Blueprint-based routing system with integrated logging triggers.
- **Frontend Engine**: Real-time data-binding via `app.js` using a custom 10s telemetry heartbeat.
- **Access Control**: Role-Based Access Control (RBAC) enforced via global `before_request` hooks and session-based identity.
- **Port Management**: Conflict-aware port binding (port 5000) with diagnostic error reporting.

---

## 5. Default Credentials (Access Catalog)

The platform is pre-configured with the following roles for immediate testing and oversight.

### **Administrator (System Oversight)**
- **Email**: `admin@terralogic.pro`
- **Password**: `admin123`
- **Access Level**: Full Command Center, Workbench, Datasets, and System Logs.

### **Standard Farmer (Field User)**
- **Email**: `farmer@terralogic.pro`
- **Password**: `farmer123`
- **Access Level**: Diagnostic Suite, AI Advisor, and Weather Telemetry.
