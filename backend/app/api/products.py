from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.logging_utils import write_log
from app.db import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing_product = (
        db.query(Product)
        .filter(Product.name == payload.name, Product.status == "active")
        .first()
    )
    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Active product with same name already exists"
        )

    product = Product(
        name=payload.name,
        spec=payload.spec,
        unit=payload.unit,
        default_price=payload.default_price,
        current_stock=0,
        status="active",
        note=payload.note,
    )
    db.add(product)
    db.flush()

    write_log(
        db=db,
        object_type="product",
        object_id=product.id,
        action="create",
        detail=f"新增商品：{product.name}",
    )

    db.commit()
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductResponse])
def list_products(
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if status:
        query = query.filter(Product.status == status)

    products = query.order_by(Product.id.desc()).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_product = (
        db.query(Product)
        .filter(
            Product.name == payload.name,
            Product.status == "active",
            Product.id != product_id
        )
        .first()
    )
    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Active product with same name already exists"
        )

    product.name = payload.name
    product.spec = payload.spec
    product.unit = payload.unit
    product.default_price = payload.default_price
    product.note = payload.note

    write_log(
        db=db,
        object_type="product",
        object_id=product.id,
        action="update",
        detail=f"编辑商品：{product.name}",
    )

    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/deactivate", response_model=ProductResponse)
def deactivate_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.status = "inactive"
    write_log(
        db=db,
        object_type="product",
        object_id=product.id,
        action="deactivate",
        detail=f"停用商品：{product.name}",
    )
    db.commit()
    db.refresh(product)
    return product