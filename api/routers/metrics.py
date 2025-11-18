# routers/metrics.py
from fastapi import APIRouter, Query
from sqlalchemy import text
from db import engine  # Make sure this imports your async SQLAlchemy engine

# Router setup (no prefix here — prefix is added in main.py)
router = APIRouter()

# ---------------------------------------------------------------------
# 1️⃣ Average resale price across all transactions
# ---------------------------------------------------------------------
@router.get("/avg-price")
@router.get("/avg_price", include_in_schema=False)  # alias for compatibility
async def get_avg_price():
    sql = text("SELECT AVG(price) AS avg_price FROM resale_prices;")
    async with engine.connect() as conn:
        row = (await conn.execute(sql)).first()
    return {
        "avg_price": float(row.avg_price) if row and row.avg_price is not None else 0.0
    }

# ---------------------------------------------------------------------
# 2️⃣ Average price per square metre (price / floor_area)
# ---------------------------------------------------------------------
@router.get("/price-per-sqm")
@router.get("/price_per_sqm", include_in_schema=False)
async def get_price_per_sqm():
    # Avoid divide-by-zero using NULLIF
    sql = text("""
        SELECT AVG(price / NULLIF(floor_area, 0)) AS avg_price_per_sqm
        FROM resale_prices;
    """)
    async with engine.connect() as conn:
        row = (await conn.execute(sql)).first()
    return {
        "avg_price_per_sqm": float(row.avg_price_per_sqm)
        if row and row.avg_price_per_sqm is not None
        else 0.0
    }

# ---------------------------------------------------------------------
# 3️⃣ Average price grouped by town
# ---------------------------------------------------------------------
@router.get("/avg-price-by-town")
@router.get("/avg_price_by_town", include_in_schema=False)
async def get_avg_price_by_town():
    sql = text("""
        SELECT town, AVG(price) AS avg_price
        FROM resale_prices
        GROUP BY town
        ORDER BY town;
    """)
    async with engine.connect() as conn:
        result = await conn.execute(sql)
        rows = result.mappings().all()

    # Convert Decimal → float to make JSON serializable
    return [{"town": r["town"], "avg_price": float(r["avg_price"])} for r in rows]


# ---------------------------------------------------------------------
# 4️⃣ Paginated resale transactions (used by Data Management page)
#     GET /metrics/transactions?search=&page=1&limit=20
# ---------------------------------------------------------------------
from fastapi import Query

@router.get("/transactions")
async def list_transactions(
    search: str = "",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit

    # Where clause for optional search across town / flat_type / year
    where_sql = text("""
        WHERE (:search = '')
           OR town ILIKE :pat
           OR flat_type ILIKE :pat
           OR CAST(year AS TEXT) ILIKE :pat
    """)

    # total count for pagination
    count_sql = text(f"""
        SELECT COUNT(*) AS total
        FROM resale_prices
        {where_sql.text}
    """)

    # page of rows
    rows_sql = text(f"""
        SELECT
            town,
            flat_type,
            floor_area,
            price,
            year,
            CASE WHEN floor_area = 0 THEN NULL
                 ELSE price / floor_area
            END AS price_per_sqm
        FROM resale_prices
        {where_sql.text}
        ORDER BY year DESC, town ASC
        LIMIT :limit OFFSET :offset
    """)

    params = {
        "search": search,
        "pat": f"%{search}%",
        "limit": limit,
        "offset": offset,
    }

    async with engine.connect() as conn:
        total = (await conn.execute(count_sql, params)).scalar_one()
        rows = (await conn.execute(rows_sql, params)).mappings().all()

    items = [{
        "town": r["town"],
        "flat_type": r["flat_type"],
        "floor_area": r["floor_area"],
        "price": float(r["price"]),
        "year": r["year"],
        "price_per_sqm": float(r["price_per_sqm"]) if r["price_per_sqm"] is not None else None,
    } for r in rows]

    return {"items": items, "total": total, "page": page, "limit": limit}

