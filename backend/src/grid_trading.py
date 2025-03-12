import numpy as np
from datetime import datetime
from src.data_fetcher import get_current_price

def calculate_grid_levels(upper_price, lower_price, num_grids):
    """
    Calculate grid price levels
    
    Parameters:
    - upper_price: Upper price boundary of the grid
    - lower_price: Lower price boundary of the grid
    - num_grids: Number of grid levels
    
    Returns:
    - List of grid price levels
    """
    if upper_price <= lower_price:
        raise ValueError("Upper price must be greater than lower price")
    
    if num_grids < 2:
        raise ValueError("Number of grids must be at least 2")
    
    # Calculate grid levels
    grid_levels = np.linspace(lower_price, upper_price, num_grids)
    
    # Round to 2 decimal places for readability
    grid_levels = [round(level, 2) for level in grid_levels]
    
    return grid_levels

def create_grid_strategy(params):
    """
    Create a grid trading strategy
    
    Parameters:
    - params: Dict with strategy parameters
        - symbol: Stock symbol
        - upper_price: Upper price boundary
        - lower_price: Lower price boundary
        - num_grids: Number of grid levels
        - investment_amount: Total investment amount
    
    Returns:
    - Strategy dict with grid levels and allocation
    """
    symbol = params["symbol"]
    upper_price = float(params["upper_price"])
    lower_price = float(params["lower_price"])
    num_grids = int(params["num_grids"])
    investment_amount = float(params["investment_amount"])
    
    # Calculate grid levels
    grid_levels = calculate_grid_levels(upper_price, lower_price, num_grids)
    
    # Calculate amount to allocate per grid
    grid_allocation = investment_amount / (num_grids - 1)
    
    # Create grid with buy/sell orders
    grids = []
    for i in range(len(grid_levels) - 1):
        buy_price = grid_levels[i]
        sell_price = grid_levels[i + 1]
        
        # Calculate number of shares to buy at this level
        shares = round(grid_allocation / buy_price, 2)
        
        grids.append({
            "level": i,
            "buy_price": buy_price,
            "sell_price": sell_price,
            "shares": shares,
            "allocation": round(grid_allocation, 2),
            "profit_potential": round((sell_price - buy_price) * shares, 2)
        })
    
    # Get current price to determine initial position
    try:
        current_price = get_current_price(symbol)
    except:
        # Use mid-price if current price cannot be fetched
        current_price = (upper_price + lower_price) / 2
    
    # Calculate initial position
    initial_position = calculate_initial_position(current_price, grid_levels, investment_amount)
    
    # Create strategy object
    strategy = {
        "symbol": symbol,
        "upper_price": upper_price,
        "lower_price": lower_price,
        "num_grids": num_grids,
        "investment_amount": investment_amount,
        "grid_levels": grid_levels,
        "grids": grids,
        "initial_position": initial_position,
        "created_at": datetime.now().isoformat()
    }
    
    return strategy

def calculate_initial_position(current_price, grid_levels, investment_amount):
    """
    Calculate initial position based on current price
    
    Parameters:
    - current_price: Current stock price
    - grid_levels: List of grid price levels
    - investment_amount: Total investment amount
    
    Returns:
    - Initial position dict
    """
    # Find which grid level the current price falls into
    current_grid = None
    for i in range(len(grid_levels) - 1):
        if grid_levels[i] <= current_price <= grid_levels[i + 1]:
            current_grid = i
            break
    
    # If current price is outside the grid range, use the closest grid
    if current_grid is None:
        if current_price < grid_levels[0]:
            current_grid = 0
        else:
            current_grid = len(grid_levels) - 2
    
    # Calculate initial cash and stock allocation
    grid_allocation = investment_amount / (len(grid_levels) - 1)
    initial_stock_allocation = current_grid * grid_allocation
    initial_cash_allocation = investment_amount - initial_stock_allocation
    
    # Calculate shares to buy initially
    if current_grid > 0:
        # Calculate average buy price for shares
        avg_buy_price = sum(grid_levels[:current_grid]) / current_grid
        initial_shares = round(initial_stock_allocation / avg_buy_price, 2)
    else:
        initial_shares = 0
    
    return {
        "current_grid": current_grid,
        "cash_allocation": round(initial_cash_allocation, 2),
        "stock_allocation": round(initial_stock_allocation, 2),
        "shares": initial_shares
    }

def generate_grid_orders(strategy, current_price):
    """
    Generate buy/sell orders based on current price and strategy
    
    Parameters:
    - strategy: Grid strategy dict
    - current_price: Current stock price
    
    Returns:
    - List of orders to execute
    """
    grid_levels = strategy["grid_levels"]
    current_grid = None
    
    # Find which grid level the current price falls into
    for i in range(len(grid_levels) - 1):
        if grid_levels[i] <= current_price <= grid_levels[i + 1]:
            current_grid = i
            break
    
    # If current price is outside the grid range, no orders
    if current_grid is None:
        return []
    
    # Get previous grid from strategy
    previous_grid = strategy.get("current_grid", current_grid)
    
    # If price moved up, generate sell orders
    if current_grid > previous_grid:
        return [{
            "type": "sell",
            "price": grid_levels[current_grid],
            "grid_level": current_grid,
            "shares": strategy["grids"][current_grid - 1]["shares"]
        }]
    
    # If price moved down, generate buy orders
    elif current_grid < previous_grid:
        return [{
            "type": "buy",
            "price": grid_levels[current_grid],
            "grid_level": current_grid,
            "shares": strategy["grids"][current_grid]["shares"]
        }]
    
    # No grid change, no orders
    return []
