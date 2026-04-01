import numpy as np

class AdvisoryLogic:
    def __init__(self):
        # Crop-specific water requirements (mm)
        self.water_thresholds = {
            "rice": 500,
            "wheat": 300,
            "maize": 400,
            "soybeans": 350,
            "default": 400
        }

    def generate_advice(self, data):
        """
        Processes soil, weather, and prediction data to return actionable advice.
        """
        n = float(data.get('N', 50))
        p = float(data.get('P', 50))
        k = float(data.get('K', 50))
        temp = float(data.get('temperature', 25))
        humidity = float(data.get('humidity', 80))
        ph = float(data.get('ph', 6.5))
        rainfall = float(data.get('rainfall', 100))
        predicted_crop = data.get('predicted_crop', '').lower()
        predicted_yield = data.get('predicted_yield', 0)

        recommendations = []
        irrigation_advice = "Irrigation is not required; natural rainfall is sufficient."
        fertilizer_advice = "Standard soil nutrients are optimal."
        disease_advice = "No immediate disease risk detected."

        # 1. Irrigation Logic
        threshold = self.water_thresholds.get(predicted_crop, self.water_thresholds['default'])
        if rainfall < threshold:
            shortfall = threshold - rainfall
            irrigation_advice = f"Rainfall is low ({rainfall}mm). Irrigation required to meet the {threshold}mm target for {predicted_crop.capitalize()}."
        
        # 2. Fertilizer Logic
        deficiency = []
        if n < 30: deficiency.append("Nitrogen (N)")
        if p < 30: deficiency.append("Phosphorous (P)")
        if k < 20: deficiency.append("Potassium (K)")
        
        if deficiency:
            fertilizer_advice = f"Soil is deficient in {', '.join(deficiency)}. Apply organic manure or specialized N-P-K fertilizer as per local soil health card recommendations."

        # 3. Disease Risk Logic
        if humidity > 85:
            disease_advice = "High humidity (>85%) detected. Moderate risk of fungal infection. Apply preventive organic fungicides like Neem oil."
        elif temp > 32 and humidity > 70:
            disease_advice = "Warm and humid conditions detected. Monitor for pest outbreaks like Aphids or Leaf Folders."

        # 4. Crop Selection Logic (Based on Ph and Temp)
        crop_advice = f"Based on current conditions, it is recommended to grow {predicted_crop.capitalize()}."
        if ph < 5.5:
            crop_advice += " Note: Soil is acidic; consider adding lime to improve pH balance."
        elif ph > 8.0:
            crop_advice += " Note: Soil is alkaline; consider treating with gypsum."

        # 5. Marketplace Suggestion (Direct Commerce)
        market_suggestion = ""
        if predicted_yield > 2.0:
            market_suggestion = f" 🛍️ High yield potential detected! Consider listing your excess {predicted_crop.capitalize()} on the AgroMarket for direct-to-consumer profit."

        # Summary for Chatbot/Voice
        summary = f"{crop_advice} {irrigation_advice} {fertilizer_advice} {disease_advice}{market_suggestion}"

        return {
            "crop_advice": crop_advice,
            "irrigation": irrigation_advice,
            "fertilizer": fertilizer_advice,
            "disease_prevention": disease_advice,
            "summary": summary,
            "alerts": self._get_critical_alerts(n, p, k, humidity)
        }

    def _get_critical_alerts(self, n, p, k, humidity):
        alerts = []
        if n < 20: alerts.append("CRITICAL: Nitrogen levels extremely low!")
        if humidity > 90: alerts.append("WARNING: Extreme risk of Blast/Blight disease.")
        return alerts

# Singleton instance
advisory_engine = AdvisoryLogic()
