import asyncio, re, pathlib
from sqlalchemy.ext.asyncio import create_async_engine
from db import DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def main():
    sql = pathlib.Path("sql_schema.sql").read_text()

    # Split into individual statements so asyncpg doesn't complain
    statements = [s.strip() for s in re.split(r";\s*\n", sql) if s.strip()]
    async with engine.begin() as conn:
        for stmt in statements:
            await conn.exec_driver_sql(stmt)
    print("✅ PostgreSQL schema created.")

if __name__ == "__main__":
    asyncio.run(main())