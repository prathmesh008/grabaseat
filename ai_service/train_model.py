import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import pickle
import random

# 1. Advanced Synthetic Data Generation
def generate_synthetic_data(samples=5000):
    data = []
    
    for _ in range(samples):
        # --- Feature Generation ---
        
        # 1. Day of Week (0-6)
        day_of_week = random.randint(0, 6)
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # 2. Hour of Day (0-23)
        hour = random.randint(0, 23)
        
        # 3. Days Until Event (0 to 60 days)
        days_until_event = random.randint(0, 60)
        
        # 4. Occupancy Rate (0.0 to 1.0)
        occupancy_rate = random.uniform(0.0, 1.0)
        
        # --- Logic for "Target" Multiplier (The Rules we want the AI to learn) ---
        multiplier = 1.0
        
        # Rule 1: High Demand Hours (Evenings & Weekends)
        # CHANGE: Only apply "time of day" surge if there is at least SOME occupancy (>10%)
        # This prevents "empty" events from being expensive just because it's 7 PM.
        if occupancy_rate > 0.10:
            if is_weekend:
                multiplier += 0.15
            if 18 <= hour <= 22:
                multiplier += 0.25
        
        # Rule 2: Occupancy Milestones (Dominant Factor)
        if occupancy_rate > 0.80:
            multiplier += 0.6  # Super High surge
        elif occupancy_rate > 0.50:
            multiplier += 0.4  # High surge
        elif occupancy_rate > 0.30:
            multiplier += 0.2  # Moderate surge
            
        # Rule 3: Proximity to Event Date (Closer = More Expensive)
        if days_until_event <= 1:
            multiplier += 0.4  # Last minute
        elif days_until_event <= 3:
            multiplier += 0.2
        elif days_until_event <= 7:
            multiplier += 0.1
        
        # Add some noise/randomness to simulate real world imperfections
        noise = random.uniform(-0.05, 0.05)
        final_multiplier = max(1.0, round(multiplier + noise, 2))
        
        data.append({
            "hour": hour,
            "isWeekend": is_weekend,
            "daysUntilEvent": days_until_event,
            "occupancyRate": round(occupancy_rate, 2),
            "optimalMultiplier": final_multiplier
        })
            
    return pd.DataFrame(data)

# Generate Data
print("Generating 5000 synthetic booking scenarios...")
df = generate_synthetic_data()
df.to_csv("training_data_advanced.csv", index=False)
print("Data saved to training_data_advanced.csv")

# 2. Model Training
X = df[["hour", "isWeekend", "daysUntilEvent", "occupancyRate"]]
y = df["optimalMultiplier"]

# Using Random Forest to capture non-linear relationships (e.g., Weekend + High Occupancy = Super High Price)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save Model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Advanced AI Model Trained & Saved to model.pkl")
