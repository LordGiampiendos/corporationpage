import React, { useState } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const clientId = '608372132439-b6gpetv4i83u76qe3rho3u4t4dfmog24.apps.googleusercontent.com';

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://servercorporation.pagekite.me/api/users/login', {
        email: values.email,
        password: values.password,
      });

      if (response.data?.mfa_required) {
        navigate('/otp', {
          state: {
            preToken: response.data.pre_auth_token,
            isMfaApp: response.data.isMfaApp,
            isMfaEmail: response.data.isMfaEmail,
          }
        });
      } else {
        login(response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setError('');

    try {
      const { credential } = response;
      const googleResponse = await axios.post('https://servercorporation.pagekite.me/api/users/google-login', {
        tokenId: credential,
      });

      if (googleResponse.data?.mfa_required) {
        navigate('/otp', {
          state: {
            preToken: googleResponse.data.pre_auth_token,
            isMfaApp: googleResponse.data.isMfaApp,
            isMfaEmail: googleResponse.data.isMfaEmail,
          }
        });
      } else {
        login(googleResponse.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '400px', borderRadius: '10px' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Login</h2>

        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={touched.email && errors.email}
                  placeholder="Enter your email"
                  style={{
                    borderRadius: '8px', 
                    padding: '12px 16px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && errors.password}
                  placeholder="Enter your password"
                  style={{
                    borderRadius: '8px', 
                    padding: '12px 16px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading} 
                className="w-100 mb-3" 
                style={{
                  backgroundColor: '#0069d9',
                  borderColor: '#0062cc',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Login'
                )}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-4 d-flex">
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google Login failed')}
              useOneTap
              className="btn btn-danger w-100 mb-3"
              style={{
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            />
          </GoogleOAuthProvider>
        </div>

        <div className="text-center mt-3">
          <a href="/forgot-password" className="text-muted" style={{ fontSize: '14px' }}>Forgot your password?</a>
        </div>
      </Card>
    </Container>
  );
};

export default LoginPage;
