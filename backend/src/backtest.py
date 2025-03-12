import pandas as pd
import numpy as np
from datetime import datetime
from src.data_fetcher import get_stock_data
from src.grid_trading import calculate_grid_levels

def run_backtest(strategy, start_date, end_date):
    """
    Run a backtest for a grid trading strategy
    
    Parameters:
    - strategy: Grid strategy dict
    - start_date: Start date for backtest (YYYY-MM-DD)
    - end_date: End date for backtest (YYYY-MM-DD)
    
    Returns:
    - Backtest results dict
    """
    symbol = strategy["symbol"]
    upper_price = strategy["upper_price"]
    lower_price = strategy["lower_price"]
    num_grids = strategy["num_grids"]
    investment_amount = strategy["investment_amount"]
    grid_levels = strategy["grid_levels"]
    
    # Fetch historical data
    period_data = get_stock_data(symbol, period="max", interval="1d")
    df = pd.DataFrame(period_data["data"])
    
    # Convert Date to datetime
    df["Date"] = pd.to_datetime(df["Date"])
    
    # Filter data for backtest period
    mask = (df["Date"] >= start_date) & (df["Date"] <= end_date)
    backtest_data = df.loc[mask].copy()
    
    if len(backtest_data) == 0:
        raise ValueError("No data available for the specified date range")
    
    # Initialize portfolio
    portfolio = {
        "cash": investment_amount,
        "shares": 0,
        "trades": [],
        "daily_values": []
    }
    
    # Run backtest
    for i, row in backtest_data.iterrows():
        date = row["Date"]
        high = row["High"]
        low = row["Low"]
        close = row["Close"]
        
        # Check for each grid level if price crossed it during the day
        trades_today = process_price_movements(date, low, high, grid_levels, portfolio)
        
        # Calculate portfolio value at end of day
        portfolio_value = portfolio["cash"] + portfolio["shares"] * close
        
        # Add daily value to tracking
        portfolio["daily_values"].append({
            "date": date.strftime('%Y-%m-%d'),
            "close": close,
            "cash": portfolio["cash"],
            "shares": portfolio["shares"],
            "value": portfolio_value
        })
    
    # Calculate performance metrics
    metrics = calculate_performance_metrics(portfolio, backtest_data)
    
    # Prepare result
    result = {
        "strategy": {
            "symbol": symbol,
            "upper_price": upper_price,
            "lower_price": lower_price,
            "num_grids": num_grids,
            "investment_amount": investment_amount,
            "grid_levels": grid_levels
        },
        "backtest_period": {
            "start_date": start_date,
            "end_date": end_date,
            "days": len(backtest_data)
        },
        "trades": portfolio["trades"],
        "daily_values": portfolio["daily_values"],
        "metrics": metrics,
        "created_at": datetime.now().isoformat()
    }
    
    return result

def process_price_movements(date, low, high, grid_levels, portfolio):
    """
    Process price movements within a day and execute trades
    
    Parameters:
    - date: Date of the price data
    - low: Day's low price
    - high: Day's high price
    - grid_levels: List of grid price levels
    - portfolio: Current portfolio state
    
    Returns:
    - List of trades executed
    """
    trades = []
    
    # Check each grid level
    for level in range(1, len(grid_levels)):
        grid_price = grid_levels[level]
        
        # If price crossed above this grid level, check for sell opportunity
        if low <= grid_price <= high:
            # Calculate how many shares to sell at this level
            grid_allocation = portfolio["investment_amount"] / (len(grid_levels) - 1)
            shares_to_sell = grid_allocation / grid_levels[level - 1]
            shares_to_sell = min(shares_to_sell, portfolio["shares"])
            
            if shares_to_sell > 0:
                # Execute sell
                sell_amount = shares_to_sell * grid_price
                portfolio["cash"] += sell_amount
                portfolio["shares"] -= shares_to_sell
                
                trade = {
                    "date": date.strftime('%Y-%m-%d'),
                    "type": "sell",
                    "price": grid_price,
                    "shares": shares_to_sell,
                    "amount": sell_amount,
                    "grid_level": level
                }
                
                portfolio["trades"].append(trade)
                trades.append(trade)
    
    # Now check for buy opportunities (in reverse order to prioritize lower prices)
    for level in range(len(grid_levels) - 1, 0, -1):
        grid_price = grid_levels[level - 1]
        
        # If price crossed below this grid level, check for buy opportunity
        if low <= grid_price <= high:
            # Calculate how many shares to buy at this level
            grid_allocation = portfolio["investment_amount"] / (len(grid_levels) - 1)
            shares_to_buy = grid_allocation / grid_price
            cost = shares_to_buy * grid_price
            
            # Make sure we have enough cash
            if cost <= portfolio["cash"]:
                # Execute buy
                portfolio["cash"] -= cost
                portfolio["shares"] += shares_to_buy
                
                trade = {
                    "date": date.strftime('%Y-%m-%d'),
                    "type": "buy",
                    "price": grid_price,
                    "shares": shares_to_buy,
                    "amount": cost,
                    "grid_level": level - 1
                }
                
                portfolio["trades"].append(trade)
                trades.append(trade)
    
    return trades

def calculate_performance_metrics(portfolio, backtest_data):
    """
    Calculate performance metrics for the backtest
    
    Parameters:
    - portfolio: Portfolio state after backtest
    - backtest_data: DataFrame with price data
    
    Returns:
    - Dict with performance metrics
    """
    daily_values = pd.DataFrame(portfolio["daily_values"])
    
    # Calculate metrics
    initial_value = portfolio["investment_amount"]
    final_value = daily_values.iloc[-1]["value"]
    
    # Calculate returns
    total_return = (final_value - initial_value) / initial_value
    annualized_return = (1 + total_return) ** (365 / len(daily_values)) - 1
    
    # Calculate drawdown
    daily_values["drawdown"] = 1 - daily_values["value"] / daily_values["value"].cummax()
    max_drawdown = daily_values["drawdown"].max()
    
    # Calculate Sharpe ratio (assuming risk-free rate of 0)
    daily_returns = daily_values["value"].pct_change().dropna()
    sharpe_ratio = 0
    if len(daily_returns) > 0:
        sharpe_ratio = np.sqrt(252) * daily_returns.mean() / daily_returns.std()
    
    # Count trades
    num_trades = len(portfolio["trades"])
    buy_trades = sum(1 for trade in portfolio["trades"] if trade["type"] == "buy")
    sell_trades = sum(1 for trade in portfolio["trades"] if trade["type"] == "sell")
    
    # Calculate profit from trades
    trade_profit = sum(trade["amount"] for trade in portfolio["trades"] if trade["type"] == "sell") - \
                  sum(trade["amount"] for trade in portfolio["trades"] if trade["type"] == "buy")
    
    return {
        "initial_value": initial_value,
        "final_value": final_value,
        "total_return": total_return,
        "total_return_pct": total_return * 100,
        "annualized_return": annualized_return,
        "annualized_return_pct": annualized_return * 100,
        "max_drawdown": max_drawdown,
        "max_drawdown_pct": max_drawdown * 100,
        "sharpe_ratio": sharpe_ratio,
        "num_trades": num_trades,
        "buy_trades": buy_trades,
        "sell_trades": sell_trades,
        "trade_profit": trade_profit
    }
