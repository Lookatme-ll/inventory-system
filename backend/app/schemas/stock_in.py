from pydantic import BaseModel
from typing import Optional


class StockInCreate(BaseModel):
    product_id: int
    qty: int
    type: str = "restock"
    note: Optional[str] = None


class StockInResponse(BaseModel):
    id: int
    product_id: int
    product_name_snapshot: str
    qty: int
    type: str
    note: Optional[str] = None

    class Config:
        from_attributes = True