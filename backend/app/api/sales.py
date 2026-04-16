from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.logging_utils import write_log
from app.db import get_db
from app.models.customer import Customer
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate, SaleResponse

router = APIRouter(prefix="/sales", tags=["sales"])


@router.post("", response_model=SaleResponse)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    if not payload.items or len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="请至少添加一条商品明细！")

    customer_name_snapshot = None

    if payload.customer_id is not None:
        customer = (
            db.query(Customer)
            .filter(Customer.id == payload.customer_id, Customer.status == "active")
            .first()
        )
        if not customer:
            raise HTTPException(status_code=400, detail="客户不存在或已停用！")
        customer_name_snapshot = customer.name
    else:
        if not payload.customer_name or payload.customer_name.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="请选择客户或输入客户名称！"
            )
        customer_name_snapshot = payload.customer_name.strip()

    total_amount = 0
    sale_items_to_create = []
    products_to_update = []

    for item in payload.items:
        if item.qty <= 0:
            raise HTTPException(status_code=400, detail="Item quantity must be greater than 0")

        if item.unit_price < 0:
            raise HTTPException(status_code=400, detail="Item unit_price must be >= 0")

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.status == "active")
            .first()
        )
        if not product:
            raise HTTPException(status_code=400, detail=f"商品不存在或已停用！")

        if product.current_stock < item.qty:
            raise HTTPException(
                status_code=400,
                detail=f"商品【{product.name}】库存不够！"
            )

        subtotal = item.qty * item.unit_price
        total_amount += subtotal

        sale_items_to_create.append({
            "product_id": product.id,
            "product_name_snapshot": product.name,
            "qty": item.qty,
            "unit_price": item.unit_price,
            "subtotal": subtotal,
        })

        products_to_update.append((product, item.qty))

    sale = Sale(
        customer_id=payload.customer_id,
        customer_name_snapshot=customer_name_snapshot,
        total_amount=total_amount,
        received_amount=payload.received_amount,
        status="completed",
        note=payload.note,
    )

    try:
        db.add(sale)
        db.flush()

        for item_data in sale_items_to_create:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item_data["product_id"],
                product_name_snapshot=item_data["product_name_snapshot"],
                qty=item_data["qty"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
            )
            db.add(sale_item)

        for product, qty in products_to_update:
            product.current_stock -= qty

        write_log(
            db=db,
            object_type="sale",
            object_id=sale.id,
            action="create",
            detail=f"创建销售单：客户 {customer_name_snapshot}，总金额 {total_amount}",
        )

        db.commit()
        db.refresh(sale)

        return sale

    except Exception:
        db.rollback()
        raise


@router.get("", response_model=list[SaleResponse])
def list_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.id.desc()).all()
    return sales


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("/{sale_id}/void", response_model=SaleResponse)
def void_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    if sale.status == "voided":
        raise HTTPException(status_code=400, detail="Sale is already voided")

    try:
        for item in sale.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=400,
                    detail=f"Related product {item.product_id} not found"
                )
            product.current_stock += item.qty

        sale.status = "voided"

        write_log(
            db=db,
            object_type="sale",
            object_id=sale.id,
            action="void",
            detail=f"作废销售单：{sale.id}，已回补库存",
        )

        db.commit()
        db.refresh(sale)
        return sale

    except Exception:
        db.rollback()
        raise