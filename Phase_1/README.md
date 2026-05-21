# Forecastly: AI-Powered Demand Intelligence

A full-stack demand forecasting system built to help food outlets optimize inventory and reduce waste. This project uses **Linear Regression** to predict future sales based on historical CSV data, specifically tailored for a diverse Indo-Arabic menu.

##  The Tech Stack
*   **Backend:** FastAPI (Python) with SQLAlchemy ORM.
*   **Frontend:** React (Vite) + Tailwind CSS + Recharts.
*   **Database:** MySQL for persistent storage of sales and user data.
*   **ML/Analytics:** Scikit-learn for forecasting and Pandas for data processing.

## Key Features
*   **Smart Upload:** Drag-and-drop CSV processing that sanitizes data and saves files physically to the server.
*   **Demand Forecasting:** Select any product (like *Paneer Tikka Tacos* or *Za'atar Grilled Chicken*) to see a 10-day predicted demand curve.
*   **Executive Dashboard:** High-level KPIs for revenue, total sales, and top-performing products with modern, responsive visuals.
*   **Pro Exports:** Generate and download professional Excel reports of your forecast data directly from the backend.

##  Project Structure
```text
.
├── backend/            # FastAPI implementation & ML logic
├── frontend/           # React dashboard & UI components
├── .gitignore          # Keeps the clutter out of Git
├── requirements.txt    # Backend dependencies
└── README.md           # You are here