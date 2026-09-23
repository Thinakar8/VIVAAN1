"""
VIVAAN – Direct Farmer-to-Buyer Digital Marketplace
Application Launcher
"""
import uvicorn
import os
import sys

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

from seed_data import seed
from database import DB_PATH

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=" * 65)
    print("VIVAAN - Direct Farmer-to-Buyer Digital Marketplace")
    print("=" * 65)

    # Initialize database and demo data if not already present
    if not os.path.exists(DB_PATH):
        print("🌱 Initializing and seeding demo database...")
        seed()
    else:
        print("✅ Database ready.")

    print("\n🚀 Starting VIVAAN Server...")
    print("🌐 Web Application available at:")
    print("   👉 http://localhost:8000")
    print("   👉 http://127.0.0.1:8000")
    print("📚 Interactive API Docs at:   http://localhost:8000/docs")
    print("=" * 65)

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, app_dir=BACKEND_DIR)

if __name__ == "__main__":
    main()
