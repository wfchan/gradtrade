from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_db():
    """Initialize database connection"""
    # Get MongoDB URI from environment variable or use default
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.environ.get("DB_NAME", "grid_trading")
    
    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client[db_name]
    
    # Create collections if they don't exist
    if "strategies" not in db.list_collection_names():
        db.create_collection("strategies")
    
    if "trades" not in db.list_collection_names():
        db.create_collection("trades")
    
    if "backtests" not in db.list_collection_names():
        db.create_collection("backtests")
    
    return db
