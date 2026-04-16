from fastapi import FastAPI
from app.db import test_connection, engine, Base
from app.models import Product, Customer, Sale, SaleItem, StockIn, OperationLog
from app.api.products import router as products_router
from app.api.customers import router as customers_router
from app.api.sales import router as sales_router
from app.api.stock_in import router as stock_in_router
from app.api.inventory import router as inventory_router
from app.api.logs import router as logs_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://inventory-system-khaki-delta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(sales_router)
app.include_router(stock_in_router)
app.include_router(inventory_router)
app.include_router(logs_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    db_name = test_connection()
    return {"database": db_name, "status": "connected"}