from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.core.database import Base

class SalesData(Base):
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category = Column(String(50)) # Added for better analytics
    sale_date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float) # Added to calculate Total Revenue
    user_id = Column(Integer, ForeignKey("users.id"))