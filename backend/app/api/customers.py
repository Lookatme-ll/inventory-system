from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.name == payload.name, Customer.status == "active")
        .first()
    )
    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Active customer with same name already exists"
        )

    customer = Customer(
        name=payload.name,
        note=payload.note,
        status="active",
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    status: Optional[str] = Query(default=None),
    keyword: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)

    if status:
        query = query.filter(Customer.status == status)

    if keyword:
        query = query.filter(Customer.name.ilike(f"%{keyword}%"))

    customers = query.order_by(Customer.id.desc()).all()
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    existing_customer = (
        db.query(Customer)
        .filter(
            Customer.name == payload.name,
            Customer.status == "active",
            Customer.id != customer_id
        )
        .first()
    )
    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Active customer with same name already exists"
        )

    customer.name = payload.name
    customer.note = payload.note

    db.commit()
    db.refresh(customer)
    return customer


@router.post("/{customer_id}/deactivate", response_model=CustomerResponse)
def deactivate_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.status = "inactive"
    db.commit()
    db.refresh(customer)
    return customer