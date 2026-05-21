from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class SalesData(Base):
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category = Column(String(50)) # Added for better analytics
    sale_date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float) # Added to calculate Total Revenue
    user_id = Column(Integer, ForeignKey("users.id"))
    dataset_name = Column(String(255), default="default_dataset", index=True)

class ForecastHistory(Base):
    __tablename__ = "forecast_history"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), index=True)
    model_used = Column(String(50))                # e.g., 'linear' or 'multivariate'
    forecast_run_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(Date, index=True)
    predicted_units = Column(Float, nullable=False)
    
    # Accuracy Monitoring (Filled later when actual dates pass)
    actual_units = Column(Float, nullable=True)     
    error_metric_mae = Column(Float, nullable=True)  # Mean Absolute Error
    user_id = Column(Integer, ForeignKey("users.id"))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String(150))
    message = Column(String(500))
    notification_type = Column(String(50)) # 'forecast_complete', 'upload_fail', 'report_gen'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
