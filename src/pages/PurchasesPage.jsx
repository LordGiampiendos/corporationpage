import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Accordion, Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const PurchasesPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authToken } = useAuth();
    const [open, setOpen] = useState({});
    const [isLoading, setIsLoading] = useState(null);
    const [isLoadingO, setIsLoadingO] = useState(null);

    const fetchPurchases = useCallback(async () => {
        setError(null);
        try {
            const response = await axios.get('https://servercorporation.pagekite.me/api/purchases/user', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const sortedPurchases = response.data.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
            setPurchases(sortedPurchases);
            setLoading(false);
        } catch (err) {
            setError("Error retrieving purchases");
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        setLoading(true);
        fetchPurchases();
    }, [fetchPurchases]);

    const handleToggle = (id) => {
        setOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    };

    const refund = (purchaseId) => {
        setIsLoading(purchaseId);
        const formData = new FormData();
        formData.append('id', purchaseId);
        axios.post('https://servercorporation.pagekite.me/api/purchases/stateR', formData,
            { headers: { Authorization: `Bearer ${authToken}` } }
        )
            .then(() => {
                setError('');
                setIsLoading(null);
                window.location.reload();
            })
            .catch(() => {
                setError('Error refunding the product!');
                setIsLoading(null);
            });
    };

    const retire = (purchaseId) => {
        setIsLoading(purchaseId);
        const formData = new FormData();
        formData.append('id', purchaseId);
        axios.post('https://servercorporation.pagekite.me/api/purchases/stateAn', formData,
            { headers: { Authorization: `Bearer ${authToken}` } }
        )
            .then(() => {
                setError('');
                setIsLoading(null);
                window.location.reload();
            })
            .catch(() => {
                setError('Error canceling the product!');
                setIsLoading(null);
            });
    };

    const handlePayment = async (purchaseId) => {
        setIsLoadingO(purchaseId);
        const formData = new FormData();
        formData.append('id', purchaseId);
        try {
            const response = await axios.post('https://servercorporation.pagekite.me/api/purchases/PayPal/payA', formData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setError('');
            setIsLoadingO(null);
            window.location.href = response.data;
        } catch (error) {
            setError('Error in product payment!');
            setIsLoadingO(null);
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
            <h2 className="mb-5 text-center">🛒 Your Purchases</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {purchases.length === 0 ? (
                <Alert variant="info" className="text-center">You have not made any purchases.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {purchases.map((purchase, key) => (
                        <Col key={purchase.id} className="mb-4">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <Card.Title>
                                        Order #{purchases.length - key}<br />
                                        <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
                                            Number:
                                            {open[purchase.id] ? (
                                                <span> {purchase.id}</span>
                                            ) : (
                                                <span> {`${purchase.id.toString().slice(0, 6)}...`}</span>
                                            )}
                                        </span>
                                        <Button
                                            variant="link"
                                            onClick={() => handleToggle(purchase.id)}
                                            style={{ fontSize: '12px', padding: '0' }}
                                        >
                                            {open[purchase.id] ? 'Show less' : 'Expand'}
                                        </Button>
                                    </Card.Title>
                                    <Card.Text>
                                        <strong>Total:</strong> {purchase.amount.toFixed(2)}€<br />
                                        <strong>Date:</strong> {new Date(purchase.purchaseDate).toLocaleDateString()}<br />
                                        <strong>Status:</strong> {purchase.state}
                                    </Card.Text>

                                    <Accordion>
                                        <Accordion.Item eventKey={key} >
                                            <Accordion.Header>Product Details</Accordion.Header>
                                            <Accordion.Body>
                                                {purchase.productPurchases.map((product, index) => (
                                                    <Card key={index} className="mb-3 mt-3 p-2 border-light bg-light">
                                                        <Card.Body>
                                                            <Card.Subtitle className="mb-2 text-muted">Product {index + 1}</Card.Subtitle>
                                                            <div><strong>Name:</strong> {product.name}</div>
                                                            <div><strong>Unit Price:</strong> {product.unitPrice.toFixed(2)}€</div>
                                                            <div><strong>Quantity:</strong> {product.quantity}</div>
                                                            <div><strong>Total:</strong> {product.totalPrice.toFixed(2)}€</div>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>

                                    {purchase.state === 'Paid' && (
                                        <Button
                                            variant="danger"
                                            className="mt-3"
                                            onClick={() => refund(purchase.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading === purchase.id ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                </>
                                            ) : (
                                                'Refund Item'
                                            )}
                                        </Button>
                                    )}
                                    {purchase.state === 'Not Paid' && (
                                        <div className="d-flex justify-content-between">
                                            <Button
                                                variant="danger"
                                                className="mt-3"
                                                onClick={() => retire(purchase.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading === purchase.id ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    </>
                                                ) : (
                                                    'Cancel Purchase'
                                                )}
                                            </Button>
                                            <Button
                                                variant="success"
                                                className="mt-3"
                                                onClick={() => handlePayment(purchase.id)}
                                                disabled={isLoadingO}
                                            >
                                                {isLoadingO === purchase.id ? (
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    </>
                                                ) : (
                                                    'Pay'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default PurchasesPage;