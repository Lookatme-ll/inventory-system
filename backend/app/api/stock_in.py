from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.logging_utils import write_log
from app.db import get_db
from app.models.product import Product
from app.models.stock_in import StockIn
from app.schemas.stock_in import StockInCreate, StockInResponse

router = APIRouter(prefix="/stock-in", tags=["stock_in"])


@router.post("", response_model=StockInResponse)
def create_stock_in(payload: StockInCreate, db: Session = Depends(get_db)):
    if payload.qty <= 0:
        raise HTTPException(status_code=400, detail="qty must be greater than 0")

    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id, Product.status == "active")
        .first()
    )
    if not product:
        raise HTTPException(status_code=400, detail="Product not found or inactive")

    stock_in = StockIn(
        product_id=product.id,
        product_name_snapshot=product.name,
        qty=payload.qty,
        type=payload.type,
        note=payload.note,
    )

    try:
        db.add(stock_in)
        db.flush()

        product.current_stock += payload.qty

        write_log(
            db=db,
            object_type="stock_in",
            object_id=stock_in.id,
            action="create",
            detail=f"创建入库：{product.name} +{payload.qty}，类型 {payload.type}",
        )

        db.commit()
        db.refresh(stock_in)
        return stock_in
    except Exception:
        db.rollback()
        raise