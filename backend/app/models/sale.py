from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name_snapshot = Column(String(100), nullable=False)
    sale_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    total_amount = Column(Integer, nullable=False, default=0)
    received_amount = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="completed")
    note = Column(Text, nullable=True)

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")