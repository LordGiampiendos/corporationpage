import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const EmailVerification = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = () => {
            axios.get(`https://servercorporation.pagekite.me/api/users/verify-email?token=${token}`)
            .then(() => {
                setSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                setError(error.response?.data);
                setLoading(false);
            });
        };

        if (token) {
            verifyEmail();
        } else {
            setError('Missing token.');
            setLoading(false);
        }
    }, [token]);

    const handleRedirect = () => {
        navigate('/login');
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Row className="w-100">
                <Col xs={12} md={8} lg={6} className="mx-auto">
                    <div className="text-center p-4 rounded shadow-lg" style={{ backgroundColor: '#fff' }}>
                        {loading ? (
                            <div className="text-center">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3">Verifying...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="danger" className="d-flex align-items-center">
                                <FaTimesCircle className="mr-2" style={{ color: '#e74c3c' }} />
                                <strong>Error:</strong> {error}
                            </Alert>
                        ) : success ? (
                            <Alert variant="success" className="d-flex align-items-center">
                                <FaCheckCircle className="mr-2" style={{ color: '#2ecc71' }} />
                                <strong>Success!</strong> Your email has been successfully verified.
                            </Alert>
                        ) : (
                            <Alert variant="warning">
                                An error occurred. Please try again later.
                            </Alert>
                        )}

                        {success && (
                            <Button 
                                variant="primary" 
                                onClick={handleRedirect} 
                                className="w-100 mt-4 py-2" 
                                style={{ fontSize: '1.2rem', borderRadius: '50px' }}>
                                Login now
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default EmailVerification;