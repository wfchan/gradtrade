import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getBacktestResult } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import GridTradeChart from '../components/GridTradeChart';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BacktestResults = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const symbol = queryParams.get('symbol');
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch backtest results, passing the symbol parameter
        const data = await getBacktestResult(id, symbol);
        setResult(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch backtest results. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, symbol]);

  // Prepare portfolio value chart data
  const portfolioChartData = result ? {
    labels: result.daily_values.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio Value ($)',
        data: result.daily_values.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ],
  } : null;

  // Prepare stock price chart data
  const priceChartData = result ? {
    labels: result.daily_values.map(d => d.date),
    datasets: [
      {
        label: `${result.strategy.symbol} Price ($)`,
        data: result.daily_values.map(d => d.close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y'
      },
      ...result.strategy.grid_levels.map((level, index) => ({
        label: `Grid Level ${index}`,
        data: result.daily_values.map(() => level),
        borderColor: `rgba(255, 99, ${index * 20}, 0.8)`,
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        yAxisID: 'y'
      }))
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Backtest Results',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Value ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!result) {
    return <Alert variant="warning">Backtest results not found</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Backtest Results: {result.strategy.symbol}</h1>
        <Link to="/backtest" className="btn btn-outline-primary">
          Run Another Backtest
        </Link>
      </div>
      
      <Card className="mb-4">
        <Card.Header as="h5">Performance Summary</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Card className="metric-card">
                <h6>Total Return</h6>
                <h3 className={result.metrics.total_return >= 0 ? "positive-value" : "negative-value"}>
                  {result.metrics.total_return_pct.toFixed(2)}%
                </h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="metric-card">
                <h6>Annualized Return</h6>
                <h3 className={result.metrics.annualized_return >= 0 ? "positive-value" : "negative-value"}>
                  {result.metrics.annualized_return_pct.toFixed(2)}%
                </h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="metric-card">
                <h6>Maximum Drawdown</h6>
                <h3 className="negative-value">
                  {result.metrics.max_drawdown_pct.toFixed(2)}%
                </h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="metric-card">
                <h6>Sharpe Ratio</h6>
                <h3 className={result.metrics.sharpe_ratio >= 0 ? "positive-value" : "negative-value"}>
                  {result.metrics.sharpe_ratio.toFixed(2)}
                </h3>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">Portfolio Value Over Time</Card.Header>
            <Card.Body>
              {portfolioChartData && (
                <Line options={chartOptions} data={portfolioChartData} height={60} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">Stock Price with Grid Levels</Card.Header>
            <Card.Body style={{ height: '700px' }}>
              {result && (
                <GridTradeChart 
                  stockData={{
                    symbol: result.strategy.symbol,
                    data: result.daily_values.map(d => ({
                      Date: new Date(d.date).toISOString().split('T')[0],
                      Close: d.close
                    }))
                  }}
                  gridLevels={result.strategy.grid_levels}
                  trades={result.trades.map(trade => ({
                    ...trade,
                    date: new Date(trade.date).toISOString().split('T')[0]
                  }))}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Strategy Details</Card.Header>
            <Card.Body>
              <Table striped>
                <tbody>
                  <tr>
                    <td><strong>Symbol</strong></td>
                    <td>{result.strategy.symbol}</td>
                  </tr>
                  <tr>
                    <td><strong>Price Range</strong></td>
                    <td>${result.strategy.lower_price} - ${result.strategy.upper_price}</td>
                  </tr>
                  <tr>
                    <td><strong>Grid Levels</strong></td>
                    <td>{result.strategy.num_grids}</td>
                  </tr>
                  <tr>
                    <td><strong>Investment</strong></td>
                    <td>${result.strategy.investment_amount}</td>
                  </tr>
                  <tr>
                    <td><strong>Backtest Period</strong></td>
                    <td>{result.backtest_period.start_date} to {result.backtest_period.end_date}</td>
                  </tr>
                  <tr>
                    <td><strong>Days</strong></td>
                    <td>{result.backtest_period.days}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Trading Statistics</Card.Header>
            <Card.Body>
              <Table striped>
                <tbody>
                  <tr>
                    <td><strong>Initial Value</strong></td>
                    <td>${result.metrics.initial_value.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Final Value</strong></td>
                    <td>${result.metrics.final_value.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Profit</strong></td>
                    <td className={result.metrics.final_value - result.metrics.initial_value >= 0 ? "positive-value" : "negative-value"}>
                      ${(result.metrics.final_value - result.metrics.initial_value).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Trades</strong></td>
                    <td>{result.metrics.num_trades}</td>
                  </tr>
                  <tr>
                    <td><strong>Buy Trades</strong></td>
                    <td>{result.metrics.buy_trades}</td>
                  </tr>
                  <tr>
                    <td><strong>Sell Trades</strong></td>
                    <td>{result.metrics.sell_trades}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header as="h5">Trade History</Card.Header>
        <Card.Body>
          {result.trades.length > 0 ? (
            <Table striped responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Shares</th>
                  <th>Amount</th>
                  <th>Grid Level</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.map((trade, index) => (
                  <tr key={index}>
                    <td>{trade.date}</td>
                    <td>
                      <Badge bg={trade.type === 'buy' ? 'success' : 'danger'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td>${trade.price.toFixed(2)}</td>
                    <td>{trade.shares.toFixed(2)}</td>
                    <td>${trade.amount.toFixed(2)}</td>
                    <td>{trade.grid_level}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No trades were executed during the backtest period.</Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BacktestResults;
