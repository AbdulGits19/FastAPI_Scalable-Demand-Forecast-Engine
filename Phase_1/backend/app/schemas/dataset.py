from pydantic import BaseModel
from datetime import date

class SalesDataSchema(BaseModel):
    product_name: str
    category: str
    sale_date: date
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True