import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getAllStrategies, runBacktest } from '../services/api';

const Backtest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const strategyIdFromQuery = queryParams.get('strategy');

  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    strategy_id: strategyIdFromQuery || '',
    start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end_date: new Date()
  });

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const data = await getAllStrategies();
        setStrategies(data);
        
        // Set default strategy if none is selected
        if (!formData.strategy_id && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            strategy_id: data[0]._id
          }));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch strategies. Please try again.');
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.strategy_id) {
      setError('Please select a strategy');
      return;
    }
    
    setLoadingBacktest(true);
    setError(null);
    
    try {
      // Get the selected strategy to extract the symbol
      const selectedStrategy = strategies.find(s => s._id === formData.strategy_id);
      const symbol = selectedStrategy ? selectedStrategy.symbol : '';
      
      // Format dates for API
      const start_date = formData.start_date.toISOString().split('T')[0];
      const end_date = formData.end_date.toISOString().split('T')[0];
      
      const result = await runBacktest({
        ...formData,
        start_date,
        end_date,
        symbol // Pass the symbol to the API
      });
      
      // Include the symbol as a query parameter for proper results display
      navigate(`/backtest-results/${result._id}?symbol=${symbol}`);
    } catch (err) {
      setError(err.message || 'Failed to run backtest');
      setLoadingBacktest(false);
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

  return (
    <div>
      <h1 className="mb-4">Backtest Strategy</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="form-container">
        <Card.Body>
          {strategies.length === 0 ? (
            <Alert variant="info">
              No strategies found. Please create a strategy first.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Strategy</Form.Label>
                <Form.Select
                  name="strategy_id"
                  value={formData.strategy_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a strategy</option>
                  {strategies.map((strategy) => (
                    <option key={strategy._id} value={strategy._id}>
                      {strategy.symbol} (${strategy.lower_price} - ${strategy.upper_price})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <br />
                <DatePicker
                  selected={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  selectsStart
                  startDate={formData.start_date}
                  endDate={formData.end_date}
                  maxDate={new Date()}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <br />
                <DatePicker
                  selected={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  selectsEnd
                  startDate={formData.start_date}
                  endDate={formData.end_date}
                  minDate={formData.start_date}
                  maxDate={new Date()}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </Form.Group>
              
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loadingBacktest}
                >
                  {loadingBacktest ? 'Running Backtest...' : 'Run Backtest'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Backtest;
