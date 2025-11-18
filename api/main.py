# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.metrics import router as metrics_router
from routers.insights import router as insights_router
from routers.combine import router as combine_router



app = FastAPI(title="HDB Resale Analysis API")

# Allow your frontend (Vite) to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:5175",  # if you sometimes use other ports
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"ok": True, "message": "Backend is running 🚀"}

# Include your routers properly
app.include_router(metrics_router, prefix="/metrics", tags=["Metrics"])
app.include_router(insights_router, prefix="/insights", tags=["Insights"])
app.include_router(combine_router,  prefix="/combine",  tags=["Combine"])


