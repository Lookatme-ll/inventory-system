from pydantic import BaseModel
from typing import Optional


class CustomerCreate(BaseModel):
    name: str
    note: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: str
    note: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    note: Optional[str] = None
    status: str

    class Config:
        from_attributes = True