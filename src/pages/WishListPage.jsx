import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authToken } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState({ cart: null, remove: null });

    const fetchWishlist = useCallback(() => {
        setError(null);
        try {
            axios.get('https://servercorporation.pagekite.me/api/wishlist', {
                headers: { Authorization: `Bearer ${authToken}` }
            })
                .then(response => {
                    setWishlist(response.data);
                    setLoading(false);
                });
        } catch (err) {
            setError('Error loading wishlist');
            setLoading(false);
        }
    }, [authToken]);

    function ProductIframe({ demoUrl }) {
        const iframeRef = useRef(null);

        useEffect(() => {
            const iframe = iframeRef.current;
            if (iframe) {
                const origin = new URL(demoUrl).origin;
                iframe.onload = () => {
                    iframe.contentWindow?.postMessage({ type: "HIDE_COOKIES_BANNER" }, origin);
                };
            }
        }, [demoUrl]);

        return (
            <iframe
                ref={iframeRef}
                src={demoUrl}
                width="100%"
                height="100%"
                title="Product Demo"
                style={{ objectFit: 'cover', height: '180px' }}
            />
        );
    }

    useEffect(() => {
        setLoading(true);
        fetchWishlist();
    }, [fetchWishlist]);

    const removeFromWishlist = async (productId) => {
        setIsLoading(prev => ({ ...prev, remove: productId }));
        try {
            const formData = new FormData();
            formData.append("productId", productId);
            await axios.post(`https://servercorporation.pagekite.me/api/wishlist/delete`, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setWishlist(prev => prev.filter(item => item.id !== productId));
            setIsLoading(prev => ({ ...prev, remove: null }));
        } catch (err) {
            setError('Error removing item');
            setIsLoading(prev => ({ ...prev, remove: null }));
        }
    };

    const handleAddToCart = (productId, name, price) => {
        setIsLoading(prev => ({ ...prev, cart: productId }));
        if (authToken) {
            axios.post('https://servercorporation.pagekite.me/api/cart',
                { "productId": productId, "quantity": 1 },
                { headers: { Authorization: `Bearer ${authToken}` } }
            )
                .then(() => {
                    setSuccessMessage('Product added to cart!');
                    setError('');
                    setIsLoading(prev => ({ ...prev, cart: null }));
                })
                .catch(() => {
                    setError('Error adding product!');
                    setSuccessMessage('');
                    setIsLoading(prev => ({ ...prev, cart: null }));
                });
        } else {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const productIndex = cart.findIndex(item => item.id === productId);

            if (productIndex === -1) {
                cart.push({ productId, name: name, price: price, quantity: 1 });
                setSuccessMessage('Product added to cart!');
            } else {
                cart[productIndex].quantity += 1;
                setSuccessMessage('Product quantity updated in the cart!');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            setError('');
            setIsLoading(prev => ({ ...prev, cart: null }));
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="loader">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-2">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-5 text-center">🎁 Wishlist</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            {wishlist.length === 0 ? (
                <Alert variant="info" className="text-center">Your wishlist is empty.</Alert>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {wishlist.map(item => (
                        <Col key={item.id}>
                            <Card className="h-100 shadow-sm">
                                {item.demoUrl ? (
                                    <ProductIframe key={item.id} demoUrl={item.demoUrl} />
                                ) : (
                                    <div style={{ height: '180px', backgroundColor: '#f0f0f0' }} className="d-flex align-items-center justify-content-center">
                                        <span className="text-muted">No image</span>
                                    </div>
                                )}
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text className="text-muted small flex-grow-1">
                                        {item.description?.slice(0, 80)}...
                                    </Card.Text>
                                    <div className="d-flex justify-content-between">
                                        <Button
                                            className='me-1'
                                            variant="outline-success"
                                            onClick={() => handleAddToCart(item.id, item.name, item.price)}
                                        >
                                            {isLoading.cart === item.id ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    <span className="visually-hidden">Loading...</span>
                                                </>
                                            ) : (
                                                '🛒 Add to Cart'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            {isLoading.remove === item.id ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    <span className="visually-hidden">Loading...</span>
                                                </>
                                            ) : (
                                                '❌ Remove'
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default WishlistPage;