from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class AuditHistory(Base):
    __tablename__ = "audit_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    endpoint_url = Column(String(500), nullable=False)
    request_method = Column(String(10), nullable=False)
    source_ip = Column(String(45), nullable=False)
    execution_time_ms = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)