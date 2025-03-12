import axios from 'axios';
import { 
  mockStockData, 
  mockGridLevels, 
  mockStrategies, 
  mockBacktestResults 
} from './mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USE_MOCK_DATA = true; // Set to false when backend is available

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Stock data API calls
export const getStockData = async (symbol, period = '1y', interval = '1d') => {
  if (USE_MOCK_DATA) {
    console.log('Using mock stock data');
    return mockStockData;
  }
  
  try {
    const response = await api.get(`/stock/${symbol}`, {
      params: { period, interval }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Grid calculation API calls
export const calculateGridLevels = async (params) => {
  if (USE_MOCK_DATA) {
    console.log('Using mock grid levels');
    return mockGridLevels;
  }
  
  try {
    const response = await api.post('/grid/calculate', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Strategy API calls
export const createStrategy = async (strategyData) => {
  if (USE_MOCK_DATA) {
    console.log('Creating mock strategy');
    return { 
      message: "Strategy created successfully",
      strategy_id: "mock-strategy-1" 
    };
  }
  
  try {
    const response = await api.post('/strategy', strategyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStrategy = async (strategyId) => {
  if (USE_MOCK_DATA) {
    console.log('Getting mock strategy');
    return mockStrategies.find(s => s._id === strategyId) || mockStrategies[0];
  }
  
  try {
    const response = await api.get(`/strategy/${strategyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllStrategies = async () => {
  if (USE_MOCK_DATA) {
    console.log('Getting all mock strategies');
    return mockStrategies;
  }
  
  try {
    const response = await api.get('/strategies');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Backtest API calls
export const runBacktest = async (backtestData) => {
  if (USE_MOCK_DATA) {
    console.log('Running mock backtest for strategy:', backtestData.strategy_id);
    return mockBacktestResults[backtestData.strategy_id] || mockBacktestResults['mock-strategy-1'];
  }
  
  try {
    const response = await api.post('/backtest', backtestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBacktestResult = async (backtestId) => {
  if (USE_MOCK_DATA) {
    console.log('Getting mock backtest result');
    // For simplicity, we'll map backtest IDs to strategy IDs
    if (backtestId === 'mock-backtest-2') {
      return mockBacktestResults['mock-strategy-2'];
    }
    return mockBacktestResults['mock-strategy-1'];
  }
  
  try {
    const response = await api.get(`/backtest/${backtestId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const apiService = {
  getStockData,
  calculateGridLevels,
  createStrategy,
  getStrategy,
  getAllStrategies,
  runBacktest,
  getBacktestResult
};

export default apiService;
