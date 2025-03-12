from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from src.database import init_db
from src.routes import register_routes

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize database connection
db = init_db()

# Register API routes
register_routes(app, db)

if __name__ == "__main__":
    # Get port from environment or default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
