# Grid Trading System

A complete stock grid trading system with Python backend, MongoDB storage, React frontend, and backtesting capabilities.

## Features

- Grid trading strategy implementation
- Real-time and historical stock data using yfinance
- MongoDB for storing trading data and configurations
- React-based dashboard for visualization and control
- Backtesting engine for strategy evaluation
- Example implementation with AAPL.US

## Project Structure

- `/backend` - Python backend for trading logic and API
- `/frontend` - React frontend application
- `/docs` - Documentation

## Setup

### Backend Setup

1. Install Python dependencies:
```
pip install -r backend/requirements.txt
```

2. Start MongoDB:
```
mongod --dbpath /path/to/your/data/directory
```

3. Run the backend server:
```
python backend/app.py
```

### Frontend Setup

1. Install Node.js dependencies:
```
cd frontend
npm install
```

2. Run the frontend development server:
```
npm start
```

## Usage

1. Configure your grid trading parameters through the UI
2. Run backtests to evaluate performance
3. Deploy the strategy for live trading

## License

MIT
