import os
import shutil
import pandas as pd
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData, Notification

router = APIRouter(prefix="/datasets", tags=["datasets"])

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file lacks a valid filename.")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    clean_dataset_name = os.path.splitext(file.filename)[0]
    file_path = os.path.join(str(UPLOAD_DIR or ""), file.filename)

    try:
        # 1. Save physical backup file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Process data stream into DataFrame
        file.file.seek(0)
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # 3. Clean Data pipeline
        df = df.dropna().drop_duplicates()
        df['sale_date'] = pd.to_datetime(df['sale_date']).dt.date
        
        # 4. Save rows mapped directly with dataset identifier tags
        for _, row in df.iterrows():
            new_record = SalesData(
                product_name=row['product_name'],
                category=row['category'],
                sale_date=row['sale_date'],
                quantity=int(row['quantity']),
                unit_price=float(row['unit_price']),
                user_id=current_user.id,          # FIXED: Object dot-notation
                dataset_name=clean_dataset_name   
            )
            db.add(new_record)
        
        # 5. NOTIFICATIONS MODULE: Success Alert Entry
        success_notif = Notification(
            user_id=current_user.id,
            title="Dataset Upload Complete",
            message=f"Successfully parsed and loaded '{file.filename}' containing {len(df)} records.",
            notification_type="report_gen"
        )
        db.add(success_notif)
        
        db.commit()
        return {
            "status": "success", 
            "dataset_name": clean_dataset_name,
            "rows_uploaded": len(df)
        }
        
    except Exception as e:
        db.rollback()
        
        # Safe-slice the raw error string to make sure it never overflows VARCHAR limits
        truncated_error = str(e)[:150]
        
        # 6. NOTIFICATIONS MODULE: Safe Failure Alert Entry
        try:
            fail_notif = Notification(
                user_id=current_user.id,
                title="Dataset Upload Failed",
                message=f"Processing aborted for '{file.filename}'. Error: {truncated_error}...",
                notification_type="upload_fail"
            )
            db.add(fail_notif)
            db.commit()
        except Exception:
            db.rollback() # Safe-fallback clause if tracking fails
        
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")


@router.get("/list")
def list_user_datasets(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns a distinct list of all unique file datasets 
    uploaded by the active user to populate the frontend dropdown selector.
    """
    unique_files = (
        db.query(distinct(SalesData.dataset_name))
        .filter(SalesData.user_id == current_user.id)
        .all()
    )
    return [f[0] for f in unique_files if f[0]]


@router.delete("/purge")
def delete_entire_dataset(
    dataset_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Wipes out an entire dataset cluster by its name identifier, isolated safely by user_id.
    """
    deleted_rows = (
        db.query(SalesData)
        .filter(SalesData.user_id == current_user.id, SalesData.dataset_name == dataset_name)
        .delete(synchronize_session=False)
    )
    
    if deleted_rows == 0:
        raise HTTPException(status_code=404, detail=f"No active datasets found matching '{dataset_name}'.")
    
    deletion_notif = Notification(
        user_id=current_user.id,
        title="Dataset Purged",
        message=f"Dataset '{dataset_name}' and all its {deleted_rows} related rows were permanently deleted.",
        notification_type="upload_fail"
    )
    db.add(deletion_notif)
    db.commit()
    
    return {"status": "success", "message": f"Successfully deleted '{dataset_name}' ({deleted_rows} rows removed)."}

@router.get("/{dataset_name}/products", dependencies=[Depends(get_current_user)])
def get_products_by_dataset(
    dataset_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Dynamic Selector Tweak: Returns a distinct list of all unique products 
    contained strictly within a specific dataset file to populate cascading UI menus.
    """
    # Double-check that your model class name is exactly what you have configured (e.g., SalesData)
    products = (
        db.query(distinct(SalesData.product_name))
        .filter(
            SalesData.user_id == current_user.id,
            SalesData.dataset_name == dataset_name
        )
        .all()
    )
    
    product_list = [p[0] for p in products if p[0]]
    
    if not product_list:
        raise HTTPException(
            status_code=404, 
            detail=f"No products found inside the dataset '{dataset_name}'."
        )
        
    return product_list