import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { calculateGridLevels, createStrategy } from '../services/api';

const CreateStrategy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symbol: 'AAPL',
    upper_price: '',
    lower_price: '',
    num_grids: 5,
    investment_amount: ''
  });
  const [gridLevels, setGridLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { upper_price, lower_price, num_grids } = formData;
      
      if (!upper_price || !lower_price || !num_grids) {
        throw new Error('Please fill all required fields');
      }

      const result = await calculateGridLevels({
        symbol: formData.symbol,
        upper_price: parseFloat(upper_price),
        lower_price: parseFloat(lower_price),
        num_grids: parseInt(num_grids)
      });

      setGridLevels(result.grid_levels);
    } catch (err) {
      setError(err.message || 'Failed to calculate grid levels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createStrategy({
        ...formData,
        upper_price: parseFloat(formData.upper_price),
        lower_price: parseFloat(formData.lower_price),
        num_grids: parseInt(formData.num_grids),
        investment_amount: parseFloat(formData.investment_amount)
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/strategy/${result.strategy_id}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Create Grid Trading Strategy</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          Strategy created successfully! Redirecting...
        </Alert>
      )}
      
      <Card className="form-container">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Symbol</Form.Label>
                  <Form.Control
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    placeholder="e.g., AAPL"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter stock symbol (e.g., AAPL for Apple Inc.)
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Investment Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="investment_amount"
                    value={formData.investment_amount}
                    onChange={handleChange}
                    placeholder="Enter investment amount"
                    min="100"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Upper Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="upper_price"
                    value={formData.upper_price}
                    onChange={handleChange}
                    placeholder="Enter upper price bound"
                    step="0.01"
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lower Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="lower_price"
                    value={formData.lower_price}
                    onChange={handleChange}
                    placeholder="Enter lower price bound"
                    step="0.01"
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Grid Levels</Form.Label>
                  <Form.Control
                    type="number"
                    name="num_grids"
                    value={formData.num_grids}
                    onChange={handleChange}
                    placeholder="Enter number of grid levels"
                    min="2"
                    max="20"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-between mb-4">
              <Button 
                variant="secondary" 
                onClick={handleCalculate}
                disabled={loading}
              >
                Calculate Grid Levels
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || gridLevels.length === 0}
              >
                {loading ? 'Creating...' : 'Create Strategy'}
              </Button>
            </div>
          </Form>
          
          {gridLevels.length > 0 && (
            <div className="mt-4">
              <h5>Grid Levels</h5>
              <div className="grid-container">
                {gridLevels.map((level, index) => (
                  <div key={index} className="grid-level">
                    <span>Level {index}</span>
                    <span className="grid-level-price">${level.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateStrategy;
