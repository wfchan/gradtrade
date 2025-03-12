import yfinance as yf
import pandas as pd
import json

def get_stock_data(symbol, period='1y', interval='1d'):
    """
    Fetch stock data using yfinance
    
    Parameters:
    - symbol: Stock symbol (e.g., 'AAPL')
    - period: Data period (e.g., '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
    - interval: Data interval (e.g., '1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo')
    
    Returns:
    - JSON-serializable dict with stock data
    """
    try:
        # Add .US suffix if not present
        if '.US' not in symbol and '.' not in symbol:
            ticker = f"{symbol}.US"
        else:
            ticker = symbol
            
        # Fetch data
        data = yf.download(ticker, period=period, interval=interval, progress=False)
        
        # Reset index to make Date a column
        data = data.reset_index()
        
        # Convert dates to string for JSON serialization
        data['Date'] = data['Date'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Convert NaN values to None for JSON serialization
        data = data.where(pd.notnull(data), None)
        
        # Convert DataFrame to list of dictionaries
        data_list = data.to_dict('records')
        
        return {
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "data": data_list
        }
    except Exception as e:
        raise Exception(f"Failed to fetch stock data: {str(e)}")

def get_current_price(symbol):
    """
    Get the current price of a stock
    
    Parameters:
    - symbol: Stock symbol (e.g., 'AAPL')
    
    Returns:
    - Current price as float
    """
    try:
        # Add .US suffix if not present
        if '.US' not in symbol and '.' not in symbol:
            ticker = f"{symbol}.US"
        else:
            ticker = symbol
            
        ticker_obj = yf.Ticker(ticker)
        current_price = ticker_obj.history(period='1d')['Close'].iloc[-1]
        return float(current_price)
    except Exception as e:
        raise Exception(f"Failed to get current price: {str(e)}")
