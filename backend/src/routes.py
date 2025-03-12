from flask import request, jsonify
from src.data_fetcher import get_stock_data
from src.grid_trading import create_grid_strategy, calculate_grid_levels
from src.backtest import run_backtest

def register_routes(app, db):
    """Register all API routes"""
    
    @app.route('/api/stock/<symbol>', methods=['GET'])
    def get_stock(symbol):
        """Get stock data for a given symbol"""
        period = request.args.get('period', '1y')
        interval = request.args.get('interval', '1d')
        
        try:
            data = get_stock_data(symbol, period, interval)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/grid/calculate', methods=['POST'])
    def grid_calculate():
        """Calculate grid levels for a strategy"""
        data = request.json
        
        symbol = data.get('symbol')
        upper_price = data.get('upper_price')
        lower_price = data.get('lower_price')
        num_grids = data.get('num_grids')
        
        if not all([symbol, upper_price, lower_price, num_grids]):
            return jsonify({"error": "Missing required parameters"}), 400
        
        try:
            grid_levels = calculate_grid_levels(
                float(upper_price), 
                float(lower_price), 
                int(num_grids)
            )
            return jsonify({"grid_levels": grid_levels})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/strategy', methods=['POST'])
    def create_strategy():
        """Create a new grid trading strategy"""
        data = request.json
        
        # Validate required fields
        required_fields = ['symbol', 'upper_price', 'lower_price', 'num_grids', 'investment_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        try:
            strategy = create_grid_strategy(data)
            
            # Save strategy to database
            strategy_id = db.strategies.insert_one(strategy).inserted_id
            
            return jsonify({
                "message": "Strategy created successfully",
                "strategy_id": str(strategy_id)
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/strategy/<strategy_id>', methods=['GET'])
    def get_strategy(strategy_id):
        """Get a strategy by ID"""
        from bson.objectid import ObjectId
        
        try:
            strategy = db.strategies.find_one({"_id": ObjectId(strategy_id)})
            if not strategy:
                return jsonify({"error": "Strategy not found"}), 404
            
            # Convert ObjectId to string for JSON serialization
            strategy["_id"] = str(strategy["_id"])
            
            return jsonify(strategy)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/strategies', methods=['GET'])
    def get_all_strategies():
        """Get all strategies"""
        try:
            strategies = list(db.strategies.find())
            
            # Convert ObjectId to string for JSON serialization
            for strategy in strategies:
                strategy["_id"] = str(strategy["_id"])
            
            return jsonify(strategies)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/backtest', methods=['POST'])
    def backtest():
        """Run a backtest for a strategy"""
        data = request.json
        
        required_fields = ['strategy_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        from bson.objectid import ObjectId
        
        try:
            # Get strategy from database
            strategy = db.strategies.find_one({"_id": ObjectId(data['strategy_id'])})
            if not strategy:
                return jsonify({"error": "Strategy not found"}), 404
            
            # Run backtest
            result = run_backtest(
                strategy, 
                data['start_date'], 
                data['end_date']
            )
            
            # Save backtest result to database
            result['strategy_id'] = str(strategy['_id'])
            backtest_id = db.backtests.insert_one(result).inserted_id
            
            # Return backtest result
            result['_id'] = str(backtest_id)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/backtest/<backtest_id>', methods=['GET'])
    def get_backtest(backtest_id):
        """Get a backtest result by ID"""
        from bson.objectid import ObjectId
        
        try:
            backtest = db.backtests.find_one({"_id": ObjectId(backtest_id)})
            if not backtest:
                return jsonify({"error": "Backtest not found"}), 404
            
            # Convert ObjectId to string for JSON serialization
            backtest["_id"] = str(backtest["_id"])
            
            return jsonify(backtest)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
