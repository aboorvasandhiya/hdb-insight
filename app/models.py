from sqlalchemy import Column, Integer, String, Numeric
from app.core.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, index=True)
    town = Column(String, index=True)
    flat_type = Column(String, index=True)
    flat_model = Column(String, index=True)
    floor_area_sqm = Column(Numeric)
    storey_range = Column(String)
    remaining_lease = Column(String)
    resale_price = Column(Numeric)
    block = Column(String)
    street_name = Column(String)
