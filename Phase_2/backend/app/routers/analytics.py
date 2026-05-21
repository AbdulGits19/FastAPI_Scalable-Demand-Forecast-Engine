from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.database import get_db
from app.models.dataset import SalesData
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary(
    dataset_name: str = Query(None, description="Optional target dataset filter string"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Dynamic KPI Summary: Computes total revenue, quantities sold, and top 
    products scoped tightly to an individual user, with an optional dataset-specific toggle.
    """
    # 1. Base query filtered by the active authorized user context
    query = db.query(SalesData).filter(SalesData.user_id == current_user.id)
    
    # 2. Dynamic Dataset Switch: If the user passes a target name parameter, lock it down
    if dataset_name:
        query = query.filter(SalesData.dataset_name == dataset_name)
        
    # Check if any data exists at all for this context
    records = query.all()
    if not records:
        return {
            "total_revenue": 0.0,
            "total_sales": 0,
            "top_products": []
        }

    # 3. Compute KPI Aggregations mathematically via SQL functions or list expressions
    total_sales = sum(item.quantity for item in records)
    total_revenue = sum(item.quantity * float(item.unit_price) for item in records)

    # 4. Extract Top 3 Products sorted descending by sales volume within this scope
    product_totals = {}
    for item in records:
        product_totals[item.product_name] = product_totals.get(item.product_name, 0) + item.quantity

    top_products_sorted = sorted(product_totals.items(), key=lambda x: x[1], reverse=True)[:3]
    
    top_products_payload = [
        {"name": name, "value": qty} for name, qty in top_products_sorted
    ]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_sales": total_sales,
        "top_products": top_products_payload
    }


@router.get("/sales-trends")
def get_historical_sales_trends(
    dataset_name: Optional[str] = Query(None, description="Isolate trend line to a single dataset"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Time-Series Aggregator: Groups transactions chronologically by date.
    Perfect for feeding your React frontend interactive trend charts.
    """
    query = db.query(
        SalesData.sale_date,
        func.sum(SalesData.quantity).label("total_units"),
        func.sum(SalesData.quantity * SalesData.unit_price).label("total_revenue")
    ).filter(SalesData.user_id == current_user.id)

    if dataset_name:
        query = query.filter(SalesData.dataset_name == dataset_name)

    results = query.group_by(SalesData.sale_date).order_by(SalesData.sale_date.asc()).all()

    return [
        {
            "date": str(row[0]),
            "units_sold": int(row[1]),
            "revenue": round(float(row[2]), 2)
        }
        for row in results
    ]