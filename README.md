# TerraLogic Pro 🌾🤖

TerraLogic Pro is a comprehensive, advanced AI-powered Smart Agriculture platform designed to revolutionize modern farming. By integrating state-of-the-art machine learning models and the Gemini AI API, the platform provides farmers and agricultural administrators with real-time, actionable insights.

## 🚀 Key Features

### 🚜 Farmer Intelligence Suite
- **🌿 Vision-Based Disease Detection:** Fast pathological analysis using **Gemini Flash Vision**. Upload leaf images for instant diagnosis, treatment recommendations, and prevention strategies.
- **💬 Multilingual AI Assistant (TerraBot):** An interactive chatbot powered by a highly robust multi-model fallback Gemini architecture. It communicates in English, Hindi, Nepali, and Telugu natively, providing farming advice and real-time weather updates.
- **📈 Crop & Yield Prediction:** Uses soil data (N, P, K, pH) and climate factors to recommend optimal crops (via Random Forest Classifier) and forecast precise yield volumes (via Regression modeling).
- **💹 Market Price Forecasting:** Analyzes historical agricultural data to predict marketplace trends, helping farmers decide the most profitable time to sell.

### 🛰️ Admin Command Center
- **System Heartbeat Telemetry:** Real-time server telemetry tracking CPU, RAM, and Network connections via `psutil`.
- **Live Audit Logs:** Authentic, thread-safe back-end event streaming with log-level filtering (INFO, WARN, ERROR).
- **Model Workbench:** High-density interface for managing classification/regression artifacts (`.pkl`), viewing sensitivity analysis, and monitoring training epochs.
- **Dataset Intelligence:** Centralized cataloging for training assets and CSV data with quality scoring and storage metrics.

## 📁 Project Structure

```text
/
├── app.py              # Main Flask server & Route Controller
├── routes/
│   ├── api.py          # Core API: ML Inferences, Telemetry, & Vision AI
│   └── live_voice.py   # Live communications implementation
├── models/             # ML Training pipelines & Data Assets
├── saved_models/       # Production-ready PKL artifacts
├── static/
│   ├── css/style.css   # Glassmorphism & High-Density UI Design
│   └── js/app.js       # Real-time Telemetry Engine & App Logic
└── templates/          # J2 Templates for Farmer & Admin Dashboards
```

## 🛠️ Installation & Setup (Developer Mode)

1. **Environment Setup:** Create a `.env` file with your `GEMINI_API_KEY`.
2. **Install Dependencies:**
   ```bash
   pip install flask flask-socketio google-genai pandas numpy scikit-learn joblib psutil python-dotenv requests
   ```
3. **Run Application:**
   ```bash
   python app.py
   ```
4. **Access Control (Default Users):**
   - **Admin Portal:** Login with `admin@terralogic.pro` (Pass: `admin123`)
   - **Farmer Dashboard:** Login with `farmer@terralogic.pro` (Pass: `farmer123`)

## 🧠 System Architecture
- **Fault-Tolerant AI:** Custom fallback loops iterate through multiple Gemini models (`gemini-2.5-flash-lite`, `gemini-flash-latest`, `gemma-3-4b-it`) automatically, entirely eliminating Free-Tier quota limitations for the chatbot and vision tools.
- **Real-time Heartbeat:** Telemetry indicators auto-refresh every 10 seconds via a background orchestration engine.
- **Log Buffer Handler:** Custom `LogBufferHandler` ensures all Flask lifecycle events are safely captured in a diagnostic stream.
