import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        axios.post('https://servercorporation.pagekite.me/api/users/reset-password', { token, newPassword })
            .then(response => {
                setMessage(response.data);
                setLoading(false);
                navigate("/login");
            })
            .catch(error => {
                setError(error.response?.data);
                setLoading(false);
            })
    };

    useEffect(() => {
        if (!token) {
            setError('Invalid token.');
        }
    }, [token]);

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '400px', borderRadius: '10px' }}>
                <h2 className="text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Reset Your Password</h2>

                <Row className="justify-content-center">
                    <Col>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="newPassword" className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={{
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Form.Group>

                            <Form.Group controlId="confirmPassword" className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Form.Group>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {message && <Alert variant="success">{message}</Alert>}

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
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span className="ms-2">Resetting...</span>
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </Form>
                    </Col>
                </Row>

                <div className="text-center mt-4">
                    <a href="/login" className="text-muted" style={{ fontSize: '14px' }}>
                        Remembered your password? Log in
                    </a>
                </div>
            </Card>
        </Container>
    );
};

export default ResetPassword;