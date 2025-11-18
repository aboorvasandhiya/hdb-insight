from fastapi import APIRouter
from sqlalchemy import text
from db import engine, mongo_db

router = APIRouter(prefix="/combine", tags=["Combine"])

@router.get("/avg-price-with-insights")
async def combined():
    # 1) SQL: avg price by town
    sql = text("""
        SELECT town, AVG(price) AS avg_price
        FROM resale_prices
        GROUP BY town
        ORDER BY town
    """)
    async with engine.connect() as conn:
        result = await conn.execute(sql)
        sql_rows = result.mappings().all()
    by_town = {r["town"]: float(r["avg_price"]) for r in sql_rows}

    # 2) Mongo: insights per town
    mongo_docs = await mongo_db["insights"].find({}).to_list(200)
    insights_map = {}
    for d in mongo_docs:
        town = d.get("town")
        if not town:
            continue
        entry = insights_map.setdefault(town, {"examples": [], "count": 0})
        entry["count"] += 1
        if len(entry["examples"]) < 3:
            entry["examples"].append(d.get("comment") or d.get("sentiment") or "note")

    # 3) Merge
    merged = []
    for town, avg_price in by_town.items():
        info = insights_map.get(town, {"examples": [], "count": 0})
        merged.append({
            "town": town,
            "avg_price": avg_price,
            "insight_count": info["count"],
            "sample_insights": info["examples"]
        })
    return merged
