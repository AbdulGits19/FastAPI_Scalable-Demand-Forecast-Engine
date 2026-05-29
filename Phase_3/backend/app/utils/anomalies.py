import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def identify_dataset_anomalies(historical_data_json: list, contamination_rate: float = 0.05):
    """
    Ingests raw dataset rows, parses sales via an Isolation Forest matrix, 
    and flags statistical anomalies (outliers) to prevent forecast skewing.
    """
    if len(historical_data_json) < 10:
        return []

    # 1. Convert incoming JSON rows into a standard Pandas DataFrame
    df = pd.DataFrame(historical_data_json)
    
    # Ensure numerical properties are clean
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0)
    df['unit_price'] = pd.to_numeric(df['unit_price'], errors='coerce').fillna(0)
    
    # 2. Extract feature matrices for the model (Quantity and rolling variation changes)
    # We create a feature mapping based on quantity volume and pricing
    features = df[['quantity', 'unit_price']].values

    # 3. Initialize and fit the Isolation Forest model
    # contamination represents the expected percentage of outlier points in the data
    iso_forest = IsolationForest(contamination=contamination_rate, random_state=42)
    df['anomaly_score'] = iso_forest.fit_predict(features)

    # Scikit-learn outputs -1 for anomalies/outliers and 1 for normal data rows
    anomalies_detected = []
    for idx, row in df.iterrows():
        if row['anomaly_score'] == -1:
            anomalies_detected.append({
                "index": int(idx),
                "sale_date": str(row.get('sale_date', 'Unknown')),
                "product_name": str(row.get('product_name', 'Unknown')),
                "quantity": int(row['quantity']),
                "unit_price": float(row['unit_price']),
                "reason": "Unusual volume/price distribution anomaly detected by AI."
            })

    return anomalies_detected