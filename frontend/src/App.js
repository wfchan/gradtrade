import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CreateStrategy from './pages/CreateStrategy';
import Backtest from './pages/Backtest';
import StrategyDetails from './pages/StrategyDetails';
import BacktestResults from './pages/BacktestResults';

function App() {
  return (
    <Router basename="/gradtrade">
      <div className="App">
        <Navigation />
        <Container className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-strategy" element={<CreateStrategy />} />
            <Route path="/strategy/:id" element={<StrategyDetails />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/backtest-results/:id" element={<BacktestResults />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
