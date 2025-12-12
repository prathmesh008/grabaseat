# BookMySeat: AI-Based Dynamic Pricing System

## Project Overview
This project transforms a standard seat booking application into an intelligent, AI-powered platform. It uses machine learning to predict booking demand based on the time of day and day of the week, automatically adjusting ticket prices in real-time.

**Key Features:**
- **Dynamic Pricing:** Prices surge during high-demand periods (Weekends, Evenings) using an AI model.
- **AI/ML Engine:** A Python Flask service runs a Random Forest model trained on synthetic data.
- **Real-Time Booking:** Users see live price updates and dynamic multipliers (e.g., 1.3x, 1.6x).
- **Fallback Mechanism:** Robust error handling ensures booking continues with rule-based pricing even if the AI service is offline.
- **Analytics Ready:** All bookings store the specific pricing multiplier used, enabling future model retraining with real-world data.

---

## Folder Structure
```
bookmyseat-main/
├── ai_service/                # [NEW] AI & ML Component
│   ├── app.py                 # Flask API for predictions
│   ├── train_model.py         # Data generation & Model training script
│   ├── model.pkl              # Trained Random Forest model (generated)
│   ├── training_data.csv      # Synthetic dataset (generated)
│   └── requirements.txt       # Python dependencies
├── server/
│   ├── models/
│   │   ├── clubData.model.js  # Updated with dynamic pricing fields
│   │   └── booking.model.js   # Updated to store multiplier history
│   ├── services/
│   │   └── pricing.service.js # [NEW] Service to talk to Flask API
│   ├── controllers/
│   │   ├── booking.controller.js # Logic to apply dynamic price
│   │   └── event.controller.js   # Fetches current multiplier for UI
│   └── ...
├── app/
│   └── (protected)/user/event/[id]/page.jsx # Updated UI to show dynamic prices
└── ...
```

---

## How it Works (Technical Flow)

1.  **Prediction:** When a user views an event, the backend sends the event's `hour` and `isWeekend` status to the Flask AI Service (`POST /predict`).
2.  **AI Logic:** The Random Forest model predicts the number of bookings.
    *   `> 60 bookings` -> **1.6x Price**
    *   `> 20 bookings` -> **1.3x Price**
    *   `Else` -> **1.0x Base Price**
3.  **Display:** The frontend displays the "High Demand" badge and the adjusted price.
4.  **Booking:** When "Book" is clicked, the backend verifies the demand *again* (or uses the passed multiplier) to calculate the final `totalAmount`.
5.  **Logging:** The booking is saved in MongoDB with the `dynamicMultiplier` used, creating a dataset for future training.

---

## Resume & Interview Prep

### Resume Bullet Points
*   **Designed and implemented an AI-driven dynamic pricing engine** using Python (scikit-learn) and Node.js, increasing theoretical revenue by capturing surge demand during peak hours.
*   **Integrate a Flask-based Microservice** with a Next.js/Express monolithic application to serve real-time demand predictions with a sub-100ms latency.

### Interview Questions

**Q1: Why did you use Random Forest instead of Linear Regression?**
*Answer:* I chose Random Forest because booking demand is often non-linear. For example, demand doesn't just go up linearly with the hour; it peaks at 7 PM and drops at 11 PM. Random Forest handles these non-linear relationships and interactions (like Weekend + Evening combination) much better than a simple linear line.

**Q2: How do you handle the situation where the Python AI service goes down?**
*Answer:* I implemented a "Circuit Breaker" pattern in the `pricing.service.js`. If the Flask API call fails (timeout or 500), the system catches the error and switches to a purely rule-based fallback (e.g., if Weekend, add 30%). This ensures the business never stops accepting bookings just because the AI is offline.

**Q3: How does the system prevent price manipulation (e.g., user loading page at low price time but booking at high price time)?**
*Answer:* The price is recalculated or validated on the backend during the `bookTickets` API call. Even if the frontend displays an old price, the final transaction is processed based on the server-side logic at the moment of booking (Or arguably, we 'lock' the price for a session, but typically verifying at booking time is safer).

**Q4: How would you improve the model with real data?**
*Answer:* Currently, we log `dynamicMultiplier` and timestamp for every real booking in MongoDB. Future improvements would involve an ETL pipeline (Extract, Transform, Load) to fetch this real history, merge it with the synthetic data, and retrain the model nightly to adjust weights based on actual user behavior.

**Q5: Why Microservices (Flask + Node) instead of running Python inside Node?**
*Answer:* Decoupling is key. Python is superior for ML libraries (pandas, sklearn), while Node is great for I/O heavy web servers. running them as separate services allows us to scale them independently—we might need 10 Node instances for traffic but only 1 AI instance. It also prevents heavy ML computations from blocking the Node.js event loop.

---

## Running the AI Service
1.  **Install Python Dependencies:**
    ```bash
    cd ai_service
    pip install -r requirements.txt
    ```
2.  **Train the Model:**
    ```bash
    python train_model.py
    ```
3.  **Start the Server:**
    ```bash
    python app.py
    ```
    *Runs on port 5001.*

The Node.js backend is configured to talk to `http://127.0.0.1:5001/predict`.
