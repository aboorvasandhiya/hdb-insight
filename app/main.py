from fastapi import FastAPI

from app.core.db import engine, Base
from app.routers import transactions

app = FastAPI(title="HDB API")

Base.metadata.create_all(bind=engine)

app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])

@app.get("/health")
def health():
    return {"status": "ok"}
