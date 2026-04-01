# TerraLogic Pro - AI-Powered Agricultural Mission Control

TerraLogic Pro is a high-fidelity, data-driven agricultural management platform designed to provide farmers and scientists with real-time field intelligence and administrative oversight. It is powered by the **Gemini 2.0 Multimodal** ecosystem for sub-second latent interactions and vision-based diagnostics.

## 🚀 Key Features

### 🚜 Farmer Intelligence Suite
- **TerraBot Live (Multimodal AI)**: A sub-second latency voice assistant powered by **Gemini 2.0 Flash-Exp**. Experience real-time, hands-free field guidance with binary audio streaming via Socket.io.
- **Vision Pathogen Detection**: Advanced pathological analysis using **Gemini 2.0 Flash (Vision)**. Upload leaf images for instant diagnosis, treatment recommendations, and prevention strategies.
- **Crop Recommendation**: Optimized classification recommending the most profitable crops based on NPK and environmental telemetry.
- **Yield Forecasting**: Regression-based harvesting predictions with interactive **Plotly.js** vector visualizations.
- **Smart Advisor**: Multilingual support for Hindi, Nepali, and Telugu using native scripts and Gemini-powered function calling.

### 🛰️ Admin Command Center
- **System Heartbeat Telemetry**: Real-time server telemetry tracking CPU, RAM, and Network connections via `psutil`.
- **Live Audit Logs**: Authentic, thread-safe back-end event streaming with log-level filtering (INFO, WARN, ERROR).
- **Model Workbench**: High-density interface for managing ML artifacts (`.pkl`), viewing sensitivity analysis, and monitoring training epochs.
- **Dataset Intelligence**: Centralized cataloging for training assets and CSV data with quality scoring and storage metrics.
- **Latency Tracker**: Real-time Plotly charts tracking inferencing speeds for all core ML endpoints.

## 📁 Project Structure

```text
/
├── app.py              # Main Flask server & Route Controller
├── routes/
│   ├── api.py          # Core API: ML Inferences, Telemetry, & Vision AI
│   └── live_voice.py   # Gemini 2.0 Multimodal Live implementation
├── models/             # ML Training pipelines & Data Assets
├── saved_models/       # Production-ready PKL artifacts
├── static/
│   ├── css/style.css   # Glassmorphism & High-Density UI Design
│   └── js/app.js       # Real-time Telemetry Engine & Voice AI
└── templates/          # J2 Templates for Farmer & Admin Dashboards
```

## 🛠️ Installation & Setup (Developer Mode)

1. **Environment Setup**: Create a `.env` file with your `GEMINI_API_KEY`.
2. **Install Dependencies**:
   ```bash
   pip install flask flask-socketio google-genai pandas numpy scikit-learn joblib psutil python-dotenv
   ```
3. **Run Application**:
   ```bash
   python app.py
   ```
4. **Access Control**:
   - **Admin Portal**: Login with `admin@terralogic.pro` (Pass: `admin123`)
   - **Farmer Dashboard**: Login with `farmer@terralogic.pro` (Pass: `farmer123`)

## 🧠 Diagnostic Integrity
- **Real-time Heartbeat**: Telemetry indicators auto-refresh every 10 seconds via a background orchestration engine.
- **Log Buffer Handler**: Custom `LogBufferHandler` ensures all Flask lifecycle events are captured in a thread-safe diagnostic stream.

## ⚠️ Requirements
- **Gemini API Key**: Requires access to `gemini-1.5-flash-latest` and `gemini-2.0-flash-exp`.
- **Browser**: Best experienced in Chrome/Edge for Web Speech API, Binary Audio, & Plotly.js rendering.
- **Microphone**: Required for TerraBot Live Voice features.
