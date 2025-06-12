import React, { useEffect } from 'react';
import { Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();

    setTimeout(() => {
      navigate('/login');
    }, 1500);
  }, [logout, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card 
        className="shadow-lg p-4 text-center" 
        style={{
          maxWidth: '400px', 
          width: '100%', 
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Spinner className="my-3" animation="border" role="status" size="sm" />
        <Alert variant="info">
          Logging out...
        </Alert>
        <p>You will be redirected shortly.</p>
      </Card>
    </Container>
  );
};

export default LogoutPage;