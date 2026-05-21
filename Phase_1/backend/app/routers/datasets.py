from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData
import pandas as pd
from io import BytesIO
import os
import shutil

router = APIRouter(prefix="/datasets", tags=["datasets"])

# Ensure the upload directory exists
UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # 1. Save the physical file to app/uploads
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            # We use file.file to access the actual spooled file object
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Reset file pointer to read it into Pandas
        # Since shutil consumed the stream, we seek back to start
        file.file.seek(0)
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # 3. Clean Data: Drop empty rows and duplicates
        df = df.dropna().drop_duplicates()
        
        # 4. Convert date column
        df['sale_date'] = pd.to_datetime(df['sale_date']).dt.date
        
        # 5. Save to MySQL
        for _, row in df.iterrows():
            new_record = SalesData(
                product_name=row['product_name'],
                category=row['category'],
                sale_date=row['sale_date'],
                quantity=row['quantity'],
                unit_price=row['unit_price'],
                user_id=current_user.id
            )
            db.add(new_record)
        
        db.commit()
        return {
            "status": "success", 
            "rows_uploaded": len(df),
            "file_saved_at": file_path
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")