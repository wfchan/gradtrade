import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Grid Trading System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/create-strategy" 
              active={location.pathname === '/create-strategy'}
            >
              Create Strategy
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/backtest" 
              active={location.pathname === '/backtest'}
            >
              Backtest
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
