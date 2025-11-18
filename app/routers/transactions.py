from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models import Transaction

router = APIRouter()



@router.post("/transactions")
def create_transaction(
    month: str,
    town: str,
    flat_type: str,
    flat_model: str,
    floor_area_sqm: float,
    storey_range: str,
    remaining_lease: str,
    resale_price: float,
    block: str,
    street_name: str,
    db: Session = Depends(get_db)
):
    txn = Transaction(
        month=month,
        town=town,
        flat_type=flat_type,
        flat_model=flat_model,
        floor_area_sqm=floor_area_sqm,
        storey_range=storey_range,
        remaining_lease=remaining_lease,
        resale_price=resale_price,
        block=block,
        street_name=street_name
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn
