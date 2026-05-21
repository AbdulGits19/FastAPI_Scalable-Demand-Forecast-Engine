from fastapi import APIRouter, Depends, Query # Added Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dataset import SalesData
from app.services.forecast_service import train_linear_forecast

router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/{product_name}")
def get_forecast(
    product_name: str, 
    days: int = Query(default=7, gt=0, le=30), # Accepts 1-30 days
    db: Session = Depends(get_db)
):
    # 1. Pull data for this specific food item
    history = db.query(SalesData).filter(SalesData.product_name == product_name).all()
    
    # 2. Run the math with the dynamic day count
    predictions = train_linear_forecast(history, days)
    
    return {
        "product": product_name,
        "historical_count": len(history),
        "prediction_days": days,
        "next_forecast": predictions # Renamed for clarity
    }