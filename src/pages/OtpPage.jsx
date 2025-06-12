import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const OtpPage = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { preToken, isMfaApp, isMfaEmail } = location.state || {};
  const { login } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    if (method !== 'app') {
      setTimeout(() => sendOtp(method), 0);
    }
  };

  const sendOtp = async (method) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      let endpoint;
      if (method === 'email') endpoint = '/send-otpE';
      else if (method === 'app') {
        setMessage('Open your authenticator app to generate the OTP code');
        return;
      }

      await axios.post(`https://servercorporation.pagekite.me/api/users${endpoint}`, {
        preAuthToken: preToken,
      });

      setMessage(`Code sent via ${method.toUpperCase()}`);
      setResendTimer(60);
    } catch (err) {
      setError("Error sending OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);

    try {
      let endpoint;
      if (selectedMethod === 'app') endpoint = '/verify-otpA';
      if (selectedMethod === 'email') endpoint = '/verify-otpE';

      const res = await axios.post(`https://servercorporation.pagekite.me/api/users${endpoint}`, {
        preAuthToken: preToken,
        code,
      });

      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center text-center">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '500px', borderRadius: '10px' }}>
        <h2 className="text-center mb-4">Two-Factor Authentication</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        {!selectedMethod && (
          <>
            <p className='mb-4'>Select an authentication method:</p>
            {isMfaApp && (
              <Button className="me-2 mb-2" onClick={() => handleMethodSelection('app')}>Authenticator App</Button>
            )}
            {isMfaEmail && (
              <Button className="me-2 mb-2" onClick={() => handleMethodSelection('email')}>Email</Button>
            )}
          </>
        )}

        {selectedMethod && (
          <Form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
            <Form.Group className="mb-3 mt-3">
              <Form.Label>Enter the OTP code received via {selectedMethod.toUpperCase()}</Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center">
              <Button type="submit" disabled={loading} style={{ borderRadius: '8px', padding: '12px 16px' }}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Verify'}
              </Button>

              {selectedMethod === 'email' && (
                <>
                  {resendTimer === 0 ? (
                    <Button variant="link" onClick={() => sendOtp(selectedMethod)}>
                      Resend OTP
                    </Button>
                  ) : (
                    <span>Resend in {resendTimer}s</span>
                  )}
                </>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedMethod('');
                  setCode('');
                  setMessage('');
                  setError('');
                }}
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              >
                Go Back
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default OtpPage;