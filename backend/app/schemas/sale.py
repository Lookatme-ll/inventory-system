from pydantic import BaseModel
from typing import Optional


class SaleItemCreate(BaseModel):
    product_id: int
    qty: int
    unit_price: int


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    received_amount: int
    note: Optional[str] = None
    items: list[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name_snapshot: str
    qty: int
    unit_price: int
    subtotal: int

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    customer_name_snapshot: str
    total_amount: int
    received_amount: int
    status: str
    note: Optional[str] = None
    items: list[SaleItemResponse]

    class Config:
        from_attributes = True