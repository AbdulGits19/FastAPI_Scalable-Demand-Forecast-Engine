import csv
from io import BytesIO, StringIO
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd

# Structural Document Layout Generation Drivers
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData

router = APIRouter(prefix="/reports", tags=["reports"])


# 🔒 ROLE ACCESS CONTROL GUARD
def verify_reporting_clearance(current_user):
    """
    Role-Based Access Control: Restricts file generation to Super Admins and Analysts.
    Viewers receive a 403 Forbidden error response automatically.
    """
    user_role = getattr(current_user, "role", "Viewer")
    if hasattr(user_role, "value"):
        user_role = user_role.value
    else:
        user_role = str(user_role)

    # Standardize access strings
    if user_role not in ["Super Admin", "Analyst", "SUPER_ADMIN", "ANALYST"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Your profile tier does not have permission to download system reports."
        )


# --- 1. METRICS PREVIEW PIPELINE ---
@router.get("/preview")
def get_report_preview(
    dataset_name: str = Query(..., description="Name of the dataset to preview metrics for"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Fetches the metadata summary for a dataset to populate preview blocks before export.
    """
    verify_reporting_clearance(current_user)

    records = db.query(SalesData).filter(
        SalesData.user_id == current_user.id,
        SalesData.dataset_name == dataset_name
    ).all()

    if not records:
        raise HTTPException(status_code=404, detail=f"No active data found matching dataset '{dataset_name}'.")

    total_items = len(records)
    total_qty = sum(r.quantity for r in records)
    total_rev = sum(r.quantity * r.unit_price for r in records)
    categories = list(set(r.category for r in records))
    regions = list(set(r.region for r in records if hasattr(r, 'region') and r.region))

    return {
        "dataset_name": dataset_name,
        "metrics_summary": {
            "total_recorded_rows": total_items,
            "aggregate_units_moved": total_qty,
            "gross_revenue_value": round(total_rev, 2),
            "unique_categories_tracked": categories,
            "geographical_regions_tracked": regions
        }
    }


# --- 2. REGION-AWARE EXCEL EXPORTER ---
@router.get("/export/excel")
def export_excel(
    dataset_name: str = Query(..., description="Dataset filter name for excel sheet isolation"),
    product_name: str = Query(None, description="Optional specific product line filter"),
    region_name: str = Query(None, description="Optional regional filter override"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generates a dynamic, multi-column Excel spreadsheet.
    Includes the region field to track data by specific urban market areas.
    """
    verify_reporting_clearance(current_user)

    query = db.query(SalesData).filter(
        SalesData.user_id == current_user.id,
        SalesData.dataset_name == dataset_name
    )
    if product_name:
        query = query.filter(SalesData.product_name == product_name)
    if region_name:
        query = query.filter(SalesData.region == region_name)
        
    data = query.all()

    if not data:
        raise HTTPException(status_code=404, detail="No metrics found to export for selected options.")

    # Build rows using the full database column footprint
    export_rows = []
    for d in data:
        qty = d.quantity
        price = float(d.unit_price)
        export_rows.append({
            "Product Name": d.product_name, 
            "Category": d.category, 
            "Geographic Region": getattr(d, "region", "Unassigned Region"), # Track locations
            "Sale Date": str(d.sale_date), 
            "Quantity Ordered": qty,
            "Unit Price (INR)": price,
            "Gross Revenue Generated": round(qty * price, 2)
        })

    df = pd.DataFrame(export_rows)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Forecast_Report')
        
        # Apply professional column width formatting automatically
        workbook  = writer.book
        worksheet = writer.sheets['Forecast_Report']
        for i, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 3
            worksheet.set_column(i, i, max_len)
    
    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={dataset_name}_forecast_report.xlsx"}
    )


# --- 3. LIVE-DATA BRANDED PDF GENERATION ENGINE ---
@router.get("/export/pdf-summary")
def export_branded_summary_report(
    dataset_name: str = Query(..., description="Dataset name for summary logging"),
    product_name: str = Query(..., description="Product selection context"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generates a stylized PDF summary report.
    Pulls historical data points dynamically to generate clean tabular previews.
    """
    verify_reporting_clearance(current_user)

    # Fetch rows matching the targeted parameters
    records = db.query(SalesData).filter(
        SalesData.user_id == current_user.id,
        SalesData.dataset_name == dataset_name,
        SalesData.product_name == product_name
    ).order_by(SalesData.sale_date.desc()).limit(10).all()
    
    if not records:
        raise HTTPException(
            status_code=404, 
            detail=f"No metrics historical context logs found for '{product_name}' to compile PDF."
        )

    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor('#8b5cf6'), spaceAfter=4
    )
    meta_style = ParagraphStyle(
        'DocMeta', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#64748b'), spaceAfter=20
    )
    section_title = ParagraphStyle(
        'SecTitle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor('#1e1b4b'), spaceAfter=10
    )

    # Document Header Elements
    story.append(Paragraph("AI Demand Forecast Report", title_style))
    story.append(Paragraph(f"System Operator ID: {current_user.id} | Generated: {pd.Timestamp.now().strftime('%m/%d/%Y %H:%M:%S')}", meta_style))
    
    story.append(Paragraph(f"Target Entity: <b>{product_name}</b> Analysis Summary", section_title))
    story.append(Spacer(1, 5))

    # Formulate tabular records pulling directly from database instances
    table_data = [["Date", "Category", "Market Region", "Qty Sold", "Price (INR)", "Revenue (INR)"]]
    
    for r in records:
        rev = r.quantity * r.unit_price
        table_data.append([
            str(r.sale_date),
            str(r.category),
            str(getattr(r, "region", "Unassigned")), # Render locations
            f"{r.quantity:,}",
            f"{float(r.unit_price):,.2f}",
            f"{rev:,.2f}"
        ])

    report_table = Table(table_data, colWidths=[85, 95, 110, 65, 85, 100])
    report_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    
    story.append(report_table)
    doc.build(story)
    
    pdf_buffer.seek(0)
    safe_filename = product_name.replace(' ', '_').replace('/', '_')
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=AI_Forecast_Report_{safe_filename}.pdf"}
    )