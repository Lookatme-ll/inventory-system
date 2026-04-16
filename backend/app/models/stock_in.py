from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.db import Base


class StockIn(Base):
    __tablename__ = "stock_in"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name_snapshot = Column(String(100), nullable=False)
    qty = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False, default="restock")
    in_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    note = Column(Text, nullable=True)