// Mock data for frontend development
export const mockStockData = {
  symbol: "AAPL",
  period: "1y",
  interval: "1d",
  data: Array(180).fill().map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (180 - index));
    
    // Generate a somewhat realistic stock price pattern
    const basePrice = 150;
    const trend = Math.sin(index / 20) * 20;
    const noise = (Math.random() - 0.5) * 5;
    const price = basePrice + trend + noise;
    
    return {
      Date: date.toISOString().split('T')[0],
      Open: price - 1 + Math.random() * 2,
      High: price + 1 + Math.random() * 2,
      Low: price - 2 - Math.random() * 2,
      Close: price,
      Volume: Math.floor(Math.random() * 10000000) + 5000000,
      "Adj Close": price
    };
  })
};

export const mockGridLevels = {
  grid_levels: [140, 145, 150, 155, 160, 165, 170]
};

export const mockStrategies = [
  {
    _id: "mock-strategy-1",
    symbol: "AAPL",
    upper_price: 170,
    lower_price: 140,
    num_grids: 7,
    investment_amount: 10000,
    grid_levels: [140, 145, 150, 155, 160, 165, 170],
    grids: [
      { level: 0, buy_price: 140, sell_price: 145, shares: 14.28, allocation: 2000, profit_potential: 71.4 },
      { level: 1, buy_price: 145, sell_price: 150, shares: 13.79, allocation: 2000, profit_potential: 68.95 },
      { level: 2, buy_price: 150, sell_price: 155, shares: 13.33, allocation: 2000, profit_potential: 66.65 },
      { level: 3, buy_price: 155, sell_price: 160, shares: 12.90, allocation: 2000, profit_potential: 64.5 },
      { level: 4, buy_price: 160, sell_price: 165, shares: 12.5, allocation: 2000, profit_potential: 62.5 },
      { level: 5, buy_price: 165, sell_price: 170, shares: 12.12, allocation: 2000, profit_potential: 60.6 }
    ],
    initial_position: {
      current_grid: 2,
      cash_allocation: 6000,
      stock_allocation: 4000,
      shares: 27.07
    },
    created_at: "2025-03-10T10:30:00.000Z"
  },
  {
    _id: "mock-strategy-2",
    symbol: "MSFT",
    upper_price: 400,
    lower_price: 350,
    num_grids: 6,
    investment_amount: 15000,
    grid_levels: [350, 360, 370, 380, 390, 400],
    grids: [
      { level: 0, buy_price: 350, sell_price: 360, shares: 8.57, allocation: 3000, profit_potential: 85.7 },
      { level: 1, buy_price: 360, sell_price: 370, shares: 8.33, allocation: 3000, profit_potential: 83.3 },
      { level: 2, buy_price: 370, sell_price: 380, shares: 8.11, allocation: 3000, profit_potential: 81.1 },
      { level: 3, buy_price: 380, sell_price: 390, shares: 7.89, allocation: 3000, profit_potential: 78.9 },
      { level: 4, buy_price: 390, sell_price: 400, shares: 7.69, allocation: 3000, profit_potential: 76.9 }
    ],
    initial_position: {
      current_grid: 3,
      cash_allocation: 9000,
      stock_allocation: 6000,
      shares: 16.44
    },
    created_at: "2025-03-11T14:15:00.000Z"
  }
];

export const mockBacktestResult = {
  _id: "mock-backtest-1",
  strategy: {
    symbol: "AAPL",
    upper_price: 170,
    lower_price: 140,
    num_grids: 7,
    investment_amount: 10000,
    grid_levels: [140, 145, 150, 155, 160, 165, 170]
  },
  backtest_period: {
    start_date: "2024-03-12",
    end_date: "2025-03-12",
    days: 365
  },
  trades: Array(48).fill().map((_, index) => {
    // Create evenly distributed trades across the year
    const date = new Date("2024-03-12");
    date.setDate(date.getDate() + Math.floor(index * (365 / 48)));
    
    const type = index % 2 === 0 ? "buy" : "sell";
    const gridLevel = index % 7; // Ensure we use all grid levels
    const price = 140 + (gridLevel * 5); // Exact grid level price for better visualization
    const shares = 10 + Math.floor(index / 10); // More consistent share amounts
    const amount = price * shares;
    
    return {
      date: date.toISOString().split('T')[0],
      type,
      price,
      shares,
      amount,
      grid_level: gridLevel
    };
  }),
  daily_values: Array(365).fill().map((_, index) => {
    const date = new Date("2024-03-12");
    date.setDate(date.getDate() + index);
    
    // Generate a somewhat realistic portfolio value pattern
    const baseValue = 10000;
    const trend = Math.sin(index / 40) * 500 + (index / 365) * 2000;
    const noise = (Math.random() - 0.5) * 100;
    const value = baseValue + trend + noise;
    
    // Generate a somewhat realistic stock price pattern
    const basePrice = 150;
    const priceTrend = Math.sin(index / 20) * 20;
    const priceNoise = (Math.random() - 0.5) * 5;
    const close = basePrice + priceTrend + priceNoise;
    
    return {
      date: date.toISOString().split('T')[0],
      close,
      cash: value * 0.4 + (Math.random() - 0.5) * 200,
      shares: (value * 0.6) / close,
      value
    };
  }),
  metrics: {
    initial_value: 10000,
    final_value: 11250,
    total_return: 0.125,
    total_return_pct: 12.5,
    annualized_return: 0.24,
    annualized_return_pct: 24,
    max_drawdown: 0.08,
    max_drawdown_pct: 8,
    sharpe_ratio: 1.8,
    num_trades: 48,
    buy_trades: 24,
    sell_trades: 24,
    trade_profit: 1250
  },
  created_at: "2025-03-12T05:30:00.000Z"
};

export default {
  mockStockData,
  mockGridLevels,
  mockStrategies,
  mockBacktestResult
};
