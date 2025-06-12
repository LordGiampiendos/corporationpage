import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/purchases");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '100vh' }}>
      <div className="text-center mb-4">
        <h1 style={{ fontSize: '4rem', fontWeight: '600', color: '#dc3545' }}>
          <FaExclamationTriangle style={{ fontSize: '5rem', marginRight: '10px', verticalAlign: 'middle' }} />
          Error
        </h1>
        <Alert variant="danger" className="shadow-lg mt-5">
          There was an issue with the payment. Please try again later.
        </Alert>
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={handleGoBack}
        className="mt-3"
        style={{ minWidth: '200px', fontWeight: '600', transition: 'all 0.3s ease' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.6)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 123, 255, 0.3)'}
      >
        Go back
      </Button>
    </Container>
  );
};

export default ErrorPage;