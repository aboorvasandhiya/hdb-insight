import asyncio
from db import mongo_db, DATABASE_URL
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def seed_postgres():
    rows_sql = """
    INSERT INTO resale_prices (town, flat_type, floor_area, price, year) VALUES
      ('ANG MO KIO','4 ROOM',95,450000,2023),
      ('BEDOK','3 ROOM',70,350000,2023),
      ('TAMPINES','5 ROOM',110,600000,2024)
    ;
    """
    async with engine.begin() as conn:
        await conn.exec_driver_sql(rows_sql)
    print("✅ Seeded PostgreSQL.")

async def seed_mongo():
    docs = [
        {"town":"ANG MO KIO","comment":"Quiet, near parks","sentiment":"positive","trend":"increasing"},
        {"town":"BEDOK","comment":"Convenient to MRT","sentiment":"neutral","trend":"stable"},
        {"town":"TAMPINES","comment":"Lots of amenities","sentiment":"positive","trend":"increasing"},
    ]
    await mongo_db["insights"].delete_many({})
    await mongo_db["insights"].insert_many(docs)
    print("✅ Seeded MongoDB.")

async def main():
    await seed_postgres()
    await seed_mongo()

if __name__ == "__main__":
    asyncio.run(main())
