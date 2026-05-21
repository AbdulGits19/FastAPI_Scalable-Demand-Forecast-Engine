from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.dataset import SalesData

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export/excel")
def export_excel(db: Session = Depends(get_db)):
    # Pull all sales data
    data = db.query(SalesData).all()
    df = pd.DataFrame([{
        "Product": d.product_name, 
        "Category": d.category, 
        "Date": d.sale_date, 
        "Qty": d.quantity
    } for d in data])
    
    # Create Excel in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Forecast_Report')
    
    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=forecast_report.xlsx"}
    )