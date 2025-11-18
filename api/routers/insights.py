# api/routers/insights.py
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId

from db import mongo_db  # Motor AsyncIOMotorDatabase

router = APIRouter(tags=["Insights"])  # <-- NO prefix here

# ---------- Pydantic models ----------
class InsightIn(BaseModel):
    town: str = Field(min_length=1)
    rating: int = Field(ge=1, le=5)
    key_factor: Optional[str] = None
    review: str = Field(min_length=1)

class InsightOut(BaseModel):
    id: str
    town: str
    rating: int
    key_factor: Optional[str] = None
    review: str
    status: str
    created_at: Optional[str] = None

def _doc_to_out(doc: Dict[str, Any]) -> InsightOut:
    return InsightOut(
        id=str(doc.get("_id")),
        town=doc.get("town", ""),
        rating=int(doc.get("rating", 0)),
        key_factor=doc.get("key_factor"),
        review=doc.get("review", ""),
        status=doc.get("status", "pending"),
        created_at=doc.get("created_at"),
    )

def _oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid insight id")

# ---------- Routes (paths start with "/") ----------
@router.get("/approved", response_model=List[InsightOut])
async def list_approved() -> List[InsightOut]:
    cur = mongo_db["insights"].find({"status": "approved"}).sort("created_at", -1)
    docs = await cur.to_list(length=200)
    return [_doc_to_out(d) for d in docs]

@router.get("/pending", response_model=List[InsightOut])
async def list_pending() -> List[InsightOut]:
    cur = mongo_db["insights"].find({"status": "pending"}).sort("created_at", 1)
    docs = await cur.to_list(length=200)
    return [_doc_to_out(d) for d in docs]

@router.post("/create", response_model=dict)
async def create_insight(payload: InsightIn):
    doc = payload.model_dump()
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await mongo_db["insights"].insert_one(doc)
    return {"ok": True, "id": str(result.inserted_id)}

@router.post("/{id}/approve", response_model=dict)
async def approve_insight(id: str):
    res = await mongo_db["insights"].update_one({"_id": _oid(id)}, {"$set": {"status": "approved"}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Insight not found")
    return {"ok": True}

@router.post("/{id}/reject", response_model=dict)
async def reject_insight(id: str):
    res = await mongo_db["insights"].update_one({"_id": _oid(id)}, {"$set": {"status": "rejected"}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Insight not found")
    return {"ok": True}

@router.get("/by-town", response_model=List[InsightOut])
async def insights_by_town(town: Optional[str] = None) -> List[InsightOut]:
    q: Dict[str, Any] = {}
    if town:
        q["town"] = town
    cur = mongo_db["insights"].find(q).sort("created_at", -1)
    docs = await cur.to_list(length=200)
    return [_doc_to_out(d) for d in docs]

