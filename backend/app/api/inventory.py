from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=list[ProductResponse])
def get_inventory(
    status: Optional[str] = Query(default=None),
    keyword: Optional[str] = Query(default=None),
    in_stock_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if status:
        query = query.filter(Product.status == status)

    if keyword:
        query = query.filter(Product.name.ilike(f"%{keyword}%"))

    if in_stock_only:
        query = query.filter(Product.current_stock > 0)

    products = query.order_by(Product.id.desc()).all()
    return products