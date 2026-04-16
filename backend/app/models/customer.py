from sqlalchemy import Column, Integer, String, Text
from app.db import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    note = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="active")