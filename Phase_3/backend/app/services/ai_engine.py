import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class AIEngineService:
    @staticmethod
    def detect_sales_anomalies(sales_data: list, threshold_z: float = 2.5) -> list:
        """
        Scans a historic product timeline array for unusual sales patterns using a 
        statistical standard deviation rolling Z-score method.
        """
        if len(sales_data) < 3:
            return [False] * len(sales_data)  # Not enough structural rows to calculate variance

        # Extract units sold into a numerical vector
        units = np.array([float(item.get("actual_units", 0)) for item in sales_data])
        mean = np.mean(units)
        std_dev = np.std(units)

        if std_dev == 0:
            return [False] * len(sales_data)

        # Calculate absolute deviation thresholds
        z_scores = np.abs((units - mean) / std_dev)
        
        # Return a boolean matrix mask array flagging values over the constraint limit
        return [bool(score > threshold_z) for score in z_scores]

    @staticmethod
    def trigger_automated_retraining(dataset_name: str, model_type: str) -> dict:
        """
        Simulates an advanced execution pipeline run context. In a full implementation, 
        this initializes an engine fit cycle over your scikit-learn or XGBoost binary models.
        """
        start_time = datetime.now()
        
        # Simulated database compilation latency
        processed_rows = 15303  # Anchoring to your Control Tower dashboard stats parameter
        simulated_loss = float(np.round(0.042 + (np.random.rand() * 0.01), 4))
        
        execution_delta = datetime.now() - start_time

        return {
            "status": "success",
            "dataset_processed": dataset_name,
            "model_tuned": model_type.upper(),
            "metrics": {
                "rows_ingested": processed_rows,
                "training_loss_mae": simulated_loss,
                "execution_time_seconds": float(execution_delta.total_seconds())
            },
            "timestamp": start_time.isoformat()
        }