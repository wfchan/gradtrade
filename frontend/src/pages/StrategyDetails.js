import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Button, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStrategy, getStockData } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StrategyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [strategy, setStrategy] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch strategy details
        const strategyData = await getStrategy(id);
        setStrategy(strategyData);
        
        // Fetch stock data
        const stockResult = await getStockData(strategyData.symbol, '3mo', '1d');
        setStockData(stockResult);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch strategy data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Prepare chart data if stock data is available
  const chartData = stockData && strategy ? {
    labels: stockData.data.map(d => d.Date.substring(0, 10)),
    datasets: [
      {
        label: `${stockData.symbol} Price`,
        data: stockData.data.map(d => d.Close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      ...strategy.grid_levels.map((level, index) => ({
        label: `Grid Level ${index}`,
        data: stockData.data.map(() => level),
        borderColor: `rgba(255, 99, ${index * 20}, 0.8)`,
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
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
        text: strategy ? `${strategy.symbol} with Grid Levels` : 'Loading...',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Price ($)'
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

  if (!strategy) {
    return <Alert variant="warning">Strategy not found</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{strategy.symbol} Grid Strategy</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => navigate(`/backtest?strategy=${strategy._id}`)}
          >
            Run Backtest
          </Button>
          <Link to="/" className="btn btn-outline-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Strategy Visualization</h5>
            </Card.Header>
            <Card.Body>
              {chartData ? (
                <Line options={chartOptions} data={chartData} height={80} />
              ) : (
                <Alert variant="info">No stock data available</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Strategy Details</h5>
            </Card.Header>
            <Card.Body>
              <Table className="mb-0">
                <tbody>
                  <tr>
                    <td><strong>Symbol</strong></td>
                    <td>{strategy.symbol}</td>
                  </tr>
                  <tr>
                    <td><strong>Upper Price</strong></td>
                    <td>${strategy.upper_price}</td>
                  </tr>
                  <tr>
                    <td><strong>Lower Price</strong></td>
                    <td>${strategy.lower_price}</td>
                  </tr>
                  <tr>
                    <td><strong>Grid Levels</strong></td>
                    <td>{strategy.num_grids}</td>
                  </tr>
                  <tr>
                    <td><strong>Investment</strong></td>
                    <td>${strategy.investment_amount}</td>
                  </tr>
                  <tr>
                    <td><strong>Created</strong></td>
                    <td>{new Date(strategy.created_at).toLocaleDateString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Grid Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Buy Price</th>
                    <th>Sell Price</th>
                    <th>Shares</th>
                    <th>Allocation</th>
                    <th>Profit Potential</th>
                  </tr>
                </thead>
                <tbody>
                  {strategy.grids.map((grid) => (
                    <tr key={grid.level}>
                      <td>{grid.level}</td>
                      <td>${grid.buy_price.toFixed(2)}</td>
                      <td>${grid.sell_price.toFixed(2)}</td>
                      <td>{grid.shares}</td>
                      <td>${grid.allocation}</td>
                      <td>
                        <span className="positive-value">
                          ${grid.profit_potential}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StrategyDetails;
