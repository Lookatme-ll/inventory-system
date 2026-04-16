from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db import Base


class OperationLog(Base):
    __tablename__ = "operation_logs"

    id = Column(Integer, primary_key=True, index=True)
    object_type = Column(String(50), nullable=False)
    object_id = Column(Integer, nullable=False)
    action = Column(String(50), nullable=False)
    detail = Column(Text, nullable=False)
    operator = Column(String(100), nullable=False, default="system")
    time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())