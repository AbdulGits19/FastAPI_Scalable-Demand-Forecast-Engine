import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import timedelta


def train_linear_forecast(historical_data, days: int): # Added days parameter
    if not historical_data:
        return []

    # 1. Convert dates to numbers
    X = np.array(range(len(historical_data))).reshape(-1, 1)
    y = np.array([item.quantity for item in historical_data])

    # 2. Train the model
    model = LinearRegression()
    model.fit(X, y)

    # 3. Predict the next X days (Dynamic)
    # Instead of '+ 7', we use '+ days'
    future_X = np.array(range(len(historical_data), len(historical_data) + days)).reshape(-1, 1)
    predictions = model.predict(future_X)

    # Clean up: Linear regression can sometimes predict negative numbers 
    # if the trend is down; we'll clip those at 0.
    return [max(0, round(p, 2)) for p in predictions.tolist()]