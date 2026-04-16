from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    spec: Optional[str] = None
    unit: str
    default_price: int = 0
    note: Optional[str] = None


class ProductUpdate(BaseModel):
    name: str
    spec: Optional[str] = None
    unit: str
    default_price: int = 0
    note: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    spec: Optional[str] = None
    unit: str
    default_price: int
    current_stock: int
    status: str
    note: Optional[str] = None

    class Config:
        from_attributes = True