from sqlalchemy import Column, Integer, String, Text
from app.db import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    spec = Column(String(100), nullable=True)
    unit = Column(String(20), nullable=False)
    default_price = Column(Integer, nullable=False, default=0)
    current_stock = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="active")
    note = Column(Text, nullable=True)