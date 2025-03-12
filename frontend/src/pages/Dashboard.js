import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllStrategies, getStockData } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [strategies, setStrategies] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Example stock (AAPL.US)
  const exampleStock = 'AAPL';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all strategies
        const strategiesData = await getAllStrategies();
        setStrategies(strategiesData);
        
        // Fetch stock data for example stock
        const stockResult = await getStockData(exampleStock, '6mo', '1d');
        setStockData(stockResult);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data if stock data is available
  const chartData = stockData ? {
    labels: stockData.data.map(d => d.Date.substring(0, 10)),
    datasets: [
      {
        label: `${stockData.symbol} Price`,
        data: stockData.data.map(d => d.Close),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
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
        text: `${exampleStock} Stock Price`,
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

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Stock Price Chart</h5>
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
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/create-strategy" className="btn btn-primary">Create New Strategy</Link>
                <Link to="/backtest" className="btn btn-outline-primary">Run Backtest</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="dashboard-card mb-4">
        <Card.Header>
          <h5 className="mb-0">Your Trading Strategies</h5>
        </Card.Header>
        <Card.Body>
          {strategies.length > 0 ? (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price Range</th>
                  <th>Grid Levels</th>
                  <th>Investment</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((strategy) => (
                  <tr key={strategy._id}>
                    <td>{strategy.symbol}</td>
                    <td>${strategy.lower_price} - ${strategy.upper_price}</td>
                    <td>{strategy.num_grids}</td>
                    <td>${strategy.investment_amount}</td>
                    <td>{new Date(strategy.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/strategy/${strategy._id}`} className="btn btn-sm btn-primary me-2">
                        View
                      </Link>
                      <Link to={`/backtest?strategy=${strategy._id}`} className="btn btn-sm btn-outline-primary">
                        Backtest
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              No strategies found. <Link to="/create-strategy">Create your first strategy</Link>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
