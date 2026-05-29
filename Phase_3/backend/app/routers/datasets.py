import os
import shutil
import pandas as pd
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData, Notification
# Phase 3 Upgrade: Import our stateful network broadcast engine
from app.routers.websocket import manager 

router = APIRouter(prefix="/datasets", tags=["datasets"])

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- 1. GEOGRAPHIC-AWARE CSV INGESTION PORTAL ---
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
        # 1. Save physical backup file tracking lines
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Process data stream into DataFrame memory vectors
        file.file.seek(0)
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # 3. Clean structural anomalies pipeline data shapes
        df = df.dropna(subset=['product_name', 'sale_date', 'quantity'])
        df = df.drop_duplicates()
        df['sale_date'] = pd.to_datetime(df['sale_date']).dt.date
        
        # 4. Process rows mapped directly with dataset identifier tags
        for _, row in df.iterrows():
            # Extract region string parameter from the current CSV row footprint
            raw_region = row.get('region') if 'region' in row and pd.notna(row.get('region')) else "Unassigned Region"
            raw_category = row.get('category') if 'category' in row and pd.notna(row.get('category')) else "General Catalog"

            new_record = SalesData(
                product_name=str(row['product_name']).strip(),
                category=str(raw_category).strip(),
                # 🔥 FIXED MATRIX: Extracts real geographic profiles down to MySQL schemas!
                region=str(raw_region).strip(),
                sale_date=row['sale_date'],
                quantity=int(row['quantity']),
                unit_price=float(row['unit_price']) if pd.notna(row.get('unit_price')) else 0.0,
                user_id=current_user.id,
                dataset_name=clean_dataset_name   
            )
            db.add(new_record)
        
        # 5. NOTIFICATIONS MODULE: Success Alert System Entry
        success_notif = Notification(
            user_id=current_user.id,
            title="Dataset Upload Complete",
            message=f"Successfully parsed and loaded '{file.filename}' containing {len(df)} regional records.",
            notification_type="report_gen"
        )
        db.add(success_notif)
        db.commit()

        # 🔥 PHASE 3 REAL-TIME BROADCAST INTERCEPTOR 🔥
        await manager.broadcast_to_user(
            user_id=current_user.id,
            message={
                "event": "DATASET_UPLOAD_COMPLETE",
                "dataset_name": clean_dataset_name,
                "rows_count": len(df),
                "message": "AI Engine baseline rows updated! Auto-refreshing layout graphs."
            }
        )
        
        return {
            "status": "success", 
            "dataset_name": clean_dataset_name,
            "rows_uploaded": len(df)
        }
        
    except Exception as e:
        db.rollback()
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
            
            await manager.broadcast_to_user(
                user_id=current_user.id,
                message={
                    "event": "DATASET_UPLOAD_FAILED",
                    "filename": file.filename,
                    "message": f"Upload aborted: {truncated_error}"
                }
            )
        except Exception:
            db.rollback()
        
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")


# --- 2. UNIQUE DATASET GROUP ENUMERATOR ---
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


# --- 3. DATASET PURGE ENGINE ---
@router.delete("/purge")
async def delete_entire_dataset(
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

    # 🔥 PHASE 3 REAL-TIME PURGE BROADCAST 🔥
    await manager.broadcast_to_user(
        user_id=current_user.id,
        message={
            "event": "DATASET_PURGED",
            "dataset_name": dataset_name,
            "message": f"Dataset '{dataset_name}' was removed from server storage arrays."
        }
    )
    
    return {"status": "success", "message": f"Successfully deleted '{dataset_name}' ({deleted_rows} rows removed)."}


# --- 4. CASCADING SELECTOR MENU FEED ---
@router.get("/{dataset_name}/products", dependencies=[Depends(get_current_user)])
def get_products_by_dataset(
    dataset_name: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns a distinct list of all unique products contained strictly 
    within a specific dataset file to populate cascading UI menus.
    """
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