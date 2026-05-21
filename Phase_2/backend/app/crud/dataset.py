from sqlalchemy.orm import Session
from app.models.dataset import SalesData

def save_sales_record(db: Session, data, user_id: int):
    new_record = SalesData(**data, user_id=user_id)
    db.add(new_record)
    db.commit()
    return new_record