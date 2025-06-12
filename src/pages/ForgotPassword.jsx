import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('email', email);

        axios.post('https://servercorporation.pagekite.me/api/users/recovery-password', formData)
            .then((response) => {
                setMessage(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.response.data);
                setLoading(false);
            })
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '400px', borderRadius: '10px' }}>
                <h2 className="text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Recover Your Password</h2>

                <Row className="justify-content-center">
                    <Col>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="email" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        <span className="ms-2">Sending...</span>
                                    </>
                                ) : (
                                    'Send Email'
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

export default ForgotPassword;