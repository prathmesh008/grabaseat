from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load Model
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    print("Advanced AI Model Loaded Successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict_multiplier():
    try:
        data = request.get_json()
        
        # Extract Features
        hour = data.get('hour', 12)
        is_weekend = data.get('isWeekend', 0)
        days_until_event = data.get('daysUntilEvent', 30)
        occupancy_rate = data.get('occupancyRate', 0.0)
        
        # Prepare Input for Model
        features = [[hour, is_weekend, days_until_event, occupancy_rate]]
        
        if model:
            predicted_multiplier = model.predict(features)[0]
        else:
            # Fallback logic if model fails to load
            predicted_multiplier = 1.0
            if occupancy_rate > 0.7: predicted_multiplier += 0.5
            if is_weekend: predicted_multiplier += 0.2
            
        # Ensure logical bounds
        final_multiplier = max(1.0, min(3.0, round(predicted_multiplier, 2)))
            
        return jsonify({
            "multiplier": final_multiplier,
            "inputs": {
                "hour": hour,
                "isWeekend": is_weekend,
                "daysUntilEvent": days_until_event,
                "occupancyRate": occupancy_rate
            },
            "model_version": "v2_advanced"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
