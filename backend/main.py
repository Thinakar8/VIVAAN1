"""
VIVAAN Main Application Server
Full-stack Python FastAPI server connecting Farmers, Buyers, Delivery Agencies & Drivers.
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure backend directory is in sys.path when imported as a package
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import init_db
from routers import auth, farmers, agencies, drivers, buyers, orders, admin, i18n, routing

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

app = FastAPI(
    title="VIVAAN – Direct Farmer-to-Buyer Digital Marketplace",
    description="Empowering verified Indian farmers with direct market access, verified logistics, and escrow security.",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(agencies.router)
app.include_router(drivers.router)
app.include_router(buyers.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(i18n.router)
app.include_router(routing.router)

# Mount Frontend static files
CLIENT_DIST = os.path.join(PROJECT_ROOT, "client", "dist")
if os.path.exists(os.path.join(CLIENT_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(CLIENT_DIST, "assets")), name="client-assets")

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def serve_index():
    client_index = os.path.join(CLIENT_DIST, "index.html")
    if os.path.exists(client_index):
        return FileResponse(client_index)
    root_index = os.path.join(PROJECT_ROOT, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    frontend_index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(frontend_index):
        return FileResponse(frontend_index)
    return {"message": "VIVAAN Backend API is active. Frontend is initializing."}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VIVAAN Platform",
        "version": "2.0.0",
        "supported_languages": 14,
        "features": ["Farmers", "Logistics Agencies", "Drivers", "Buyers", "Escrow", "Leaflet Maps", "AI Assistant", "Admin Cockpit"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
