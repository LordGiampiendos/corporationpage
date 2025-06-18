import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const SuccessPage = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentId = query.get('paymentId');
    const payerId = query.get('PayerID');

    if (paymentId && payerId) {
      axios
        .get(`https://servercorporation.pagekite.me/api/purchases/PayPal/success?paymentId=${paymentId}&PayerID=${payerId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })
        .then(() => {
          setPaymentStatus({ message: 'Payment completed successfully!', success: true });
        })
        .catch(() => {
          setPaymentStatus({ message: 'Error during payment execution', success: false });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setPaymentStatus({ message: 'No payment found.', success: false });
      setIsLoading(false);
    }
  }, [location, authToken]);

  const handleGoToOrders = () => {
    navigate('/purchases');
  };

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center px-4 py-5"
      style={{ minHeight: '100vh' }}
    >
      <div className="text-center mb-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h1
          className="mb-5"
          style={{
            fontSize: '3rem',
            color: paymentStatus?.success ? '#28a745' : '#dc3545',
            marginBottom: '30px',
          }}
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" className="me-10" />
          ) : paymentStatus?.success ? (
            <FaCheckCircle className="me-10" />
          ) : (
            <FaTimesCircle className="me-10" />
          )}
          {isLoading ? 'Processing...' : paymentStatus?.success ? 'Success' : 'Failed'}
        </h1>

        <Alert variant={paymentStatus?.success ? 'success' : 'danger'} className="shadow-lg mb-4">
          {isLoading ? 'Payment is being processed...' : paymentStatus?.message || 'Payment processing...'}
        </Alert>

        <Button
          variant="primary"
          size="lg"
          onClick={handleGoToOrders}
          style={{
            width: '100%',
            maxWidth: '250px',
            marginTop: '20px',
            fontWeight: '600',
            padding: '12px',
          }}
          className="mt-3"
        >
          Go to Orders
        </Button>
      </div>
    </Container>
  );
};

export default SuccessPage;
