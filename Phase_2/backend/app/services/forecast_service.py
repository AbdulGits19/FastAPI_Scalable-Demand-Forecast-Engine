import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor
from prophet import Prophet
from datetime import timedelta, datetime

def train_linear_forecast(historical_data, days: int, model_type: str = "linear"):
    """
    Unified Forecasting Engine supporting:
    1. 'linear'        - Single Variable Linear Regression
    2. 'multivariate'  - Multi-Variable Linear Regression
    3. 'xgboost'       - Advanced Gradient Boosting with Day-of-Week Seasonality
    4. 'prophet'       - Meta's Time-Series Forecasting Engine
    """
    if not historical_data:
        return []

    # Extract target values
    y = np.array([item.quantity for item in historical_data])

    # --- MODEL 1: SINGLE-VARIABLE LINEAR REGRESSION ---
    if model_type == "linear":
        X = np.array(range(len(historical_data))).reshape(-1, 1)
        model = LinearRegression()
        model.fit(X, y)
        future_X = np.array(range(len(historical_data), len(historical_data) + days)).reshape(-1, 1)
        predictions = model.predict(future_X).tolist()

    # --- MODEL 2: MULTI-VARIABLE LINEAR REGRESSION ---
    elif model_type == "multivariate":
        X = np.array([[idx, float(item.unit_price)] for idx, item in enumerate(historical_data)])
        model = LinearRegression()
        model.fit(X, y)
        last_known_price = float(historical_data[-1].unit_price) if historical_data else 0.0
        future_X = np.array([[idx, last_known_price] for idx in range(len(historical_data), len(historical_data) + days)])
        predictions = model.predict(future_X).tolist()

    # --- MODEL 3: XGBOOST ENGINE ---
    elif model_type == "xgboost":
        # 1. Extract the actual day of the week (0=Monday, 6=Sunday) from the historical sale dates
        X = np.array([
            [
                pd.to_datetime(item.sale_date).weekday(), 
                float(item.unit_price)
            ] 
            for item in historical_data
        ])
        
        model = XGBRegressor(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42)
        model.fit(X, y)

        # 2. Project future timestamps and extract their weekday boundary values
        last_date_str = historical_data[-1].sale_date
        last_date = pd.to_datetime(last_date_str)
        last_known_price = float(historical_data[-1].unit_price) if historical_data else 0.0
        
        future_features = []
        for step in range(1, days + 1):
            future_date = last_date + pd.Timedelta(days=step)
            future_features.append([future_date.weekday(), last_known_price])
            
        future_X = np.array(future_features)
        predictions = model.predict(future_X).tolist()

    # --- MODEL 4: META PROPHET ENGINE ---
    elif model_type == "prophet":
        # Prophet strictly requires a Pandas DataFrame with columns 'ds' (datestamps) and 'y' (values)
        df = pd.DataFrame({
            'ds': [pd.to_datetime(item.sale_date) for item in historical_data],
            'y': y
        })
        
        # Initialize and fit Prophet model
        # changepoint_prior_scale handles flexibility in trend shifts
        model = Prophet(changepoint_prior_scale=0.05, yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
        model.fit(df)
        
        # Create future dates dataframe
        future = model.make_future_dataframe(periods=days, freq='D')
        forecast = model.predict(future)
        
        # Extract only the newly predicted rows (the tail end of the dataframe)
        predictions = forecast['yhat'].tail(days).values.tolist()

    else:
        return []

    # Post-Processing: Clean up numbers cleanly and prevent negative predictions
    return [max(0, round(float(p), 2)) for p in predictions]