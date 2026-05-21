from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.dataset import SalesData
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # 1. Total Revenue (Quantity * Price)
    total_revenue = db.query(func.sum(SalesData.quantity * SalesData.unit_price)).filter(SalesData.user_id == current_user.id).scalar() or 0
    
    # 2. Total Sales (Total Quantity Sold)
    total_sales = db.query(func.sum(SalesData.quantity)).filter(SalesData.user_id == current_user.id).scalar() or 0
    
    # 3. Top Products
    top_products = db.query(
        SalesData.product_name, 
        func.sum(SalesData.quantity).label("total")
    ).filter(SalesData.user_id == current_user.id).group_by(SalesData.product_name).order_by(func.sum(SalesData.quantity).desc()).limit(3).all()

    return {
        "total_revenue": round(total_revenue, 2),
        "total_sales": total_sales,
        "top_products": [{"name": p[0], "value": p[1]} for p in top_products]
    }