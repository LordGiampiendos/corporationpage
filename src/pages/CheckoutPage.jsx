import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Toast, Table, Card, Container } from 'react-bootstrap';
import { FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
    const { authToken } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [loadingCart, setLoadingCart] = useState(true);
    const amount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const description = cart.map(item => item.name).join(', ') || 'No product';

    const loadCart = useCallback(() => {
        setLoadingCart(true);
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        if (authToken) {
            axios.get('https://servercorporation.pagekite.me/api/cart', {
                headers: { Authorization: `Bearer ${authToken}` }
            })
                .then(response => {
                    setCart(response.data);
                    localStorage.setItem('cart', JSON.stringify(response.data));
                    setLoadingCart(false);
                })
                .catch(() => {
                    setToastMessage('Error loading the cart.');
                    setShowToast(true);
                    setLoadingCart(false);
                });
        } else {
            setLoadingCart(false);
        }
    }, [authToken]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handlePayment = async () => {
        if (cart.length === 0) {
            setToastMessage('The cart is empty.');
            setShowToast(true);
            return;
        }

        setLoading(true);
        setToastMessage('');
        try {
            const response = await axios.get('https://servercorporation.pagekite.me/api/purchases/PayPal/pay', {
                params: {
                    amount: amount.toFixed(2),
                    currency: 'EUR',
                    description
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            window.location.href = response.data;
        } catch (error) {
            setLoading(false);
            setToastMessage(error.response?.data?.message || 'Error while creating the payment session.');
            setShowToast(true);
        }
    };

    if (loadingCart) {
        return (
            <Container className="mt-4">
                <div className="loader text-center">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-2">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-5 text-center text-primary d-flex justify-content-center align-items-center" style={{ fontWeight: '700', fontSize: '2.8rem', letterSpacing: '1.5px' }}>
                <FaShoppingCart style={{ marginRight: '10px' }} />
                Checkout
            </h2>

            {cart.length === 0 ? (
                <p className="text-center">The cart is empty.</p>
            ) : (
                <>
                    <Table striped bordered hover responsive className="shadow-sm mb-4">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.toFixed(2)} €</td>
                                    <td>{(item.price * item.quantity).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Card className="p-3 mb-4 text-end shadow-lg rounded" style={{ backgroundColor: '#f8f9fa' }}>
                        <h4 style={{ fontWeight: '600' }}>Total: <strong>{amount.toFixed(2)} €</strong></h4>
                        <p><strong>Description:</strong> {description}</p>
                    </Card>
                </>
            )}

            <Button
                variant="success"
                onClick={handlePayment}
                disabled={loading || cart.length === 0}
                style={{ minWidth: '180px', fontWeight: '600', transition: 'all 0.3s ease' }}
                className="d-block mx-auto mb-4 shadow-lg"
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.6)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(40,167,69,0.3)'}
            >
                <div className='d-flex justify-content-center align-items-center'>{loading ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-2" /> Pay</>}</div>
            </Button>

            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                delay={3000}
                autohide
                bg={toastMessage.includes('Error') ? 'danger' : 'success'}
                className="position-fixed bottom-0 end-0 m-3"
            >
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </Container>
    );
};

export default CheckoutPage;