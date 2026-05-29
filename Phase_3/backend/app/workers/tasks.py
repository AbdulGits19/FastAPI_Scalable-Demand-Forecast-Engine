import os
import numpy as np
import pandas as pd
from celery import Celery
from app.core.celery_app import celery_app
# Import your actual core forecasting engine function here
from app.services.forecast_service import train_linear_forecast

def calculate_metrics(y_true, y_pred):
    """
    Helper function to calculate error matrices for the validation leaderboard.
    """
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    # Prevent divide-by-zero errors in case true value is 0
    safe_true = np.where(y_true == 0, 1, y_true)
    
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    mape = float(np.mean(np.abs((y_true - y_pred) / safe_true)) * 100)
    
    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "MAPE": round(mape, 2)}

@celery_app.task(name="tasks.run_background_forecast")
def run_background_forecast(historical_data_json: list, horizon_days: int):
    """
    Runs your unified forecasting loop completely asynchronously.
    It trains all 4 models, cross-validates them against historical baselines,
    and returns predictions alongside a dynamic leaderboard.
    """
    print("🚀 Celery Worker: Initializing Cross-Validation Core...")
    
    # 1. Parse JSON objects back into dummy structural objects matching dot notation (item.quantity)
    class HistoricalItem:
        def __init__(self, dictionary):
            for k, v in dictionary.items():
                setattr(self, k, v)
                
    historical_data = [HistoricalItem(item) for item in historical_data_json]
    
    if len(historical_data) < 7:
        return {"status": "Error", "message": "Insufficient data points for background cross-validation."}

    # 2. Split historical data for validation evaluation (use last 20% or max 7 days as validation set)
    split_idx = max(len(historical_data) - min(7, int(len(historical_data) * 0.2)), 5)
    train_set = historical_data[:split_idx]
    val_set = historical_data[split_idx:]
    val_true = [item.quantity for item in val_set]
    val_days = len(val_set)

    # 3. Execution Loop: Cross-Validate all 4 models to build the leaderboard matrix
    model_types = ["linear", "multivariate", "xgboost", "prophet"]
    leaderboard_metrics = {}
    
    for m_type in model_types:
        try:
            # Train model on training set and predict across the validation window
            val_preds = train_linear_forecast(train_set, days=val_days, model_type=m_type)
            # Cap lengths to match exactly for metric scores
            leaderboard_metrics[m_type] = calculate_metrics(val_true, val_preds[:val_days])
        except Exception as e:
            print(f"⚠️ Model evaluation failed for {m_type}: {str(e)}")
            leaderboard_metrics[m_type] = {"MAE": 999.0, "RMSE": 999.0, "MAPE": 999.0}

    # 4. Determine the winner based on the lowest MAPE percentage value
    winner_model = min(leaderboard_metrics, key=lambda k: leaderboard_metrics[k]["MAPE"])
    
    # 5. Run the final forecast on the complete dataset using the winning model
    final_predictions = train_linear_forecast(historical_data, days=horizon_days, model_type=winner_model)

    # 6. Generate timeline string boundaries for the frontend Recharts line chart canvas
    last_date = pd.to_datetime(historical_data[-1].sale_date)
    timeline_dates = [
        (last_date + pd.Timedelta(days=step)).strftime('%Y-%m-%d')
        for step in range(1, horizon_days + 1)
    ]

    print(f"🏆 Background Loop Finished! Winning Model: {winner_model.upper()}")
    
    return {
        "status": "Success",
        "winning_model": winner_model,
        "leaderboard": leaderboard_metrics,
        "timeline_dates": timeline_dates,
        "forecast_values": final_predictions
    }