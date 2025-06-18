import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Image, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaLaptop, FaShoppingCart, FaBullhorn } from 'react-icons/fa';

const HomePage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        updateComments();
    }, []);

    const updateComments = () => {
        setLoading(true);
        axios.get('https://servercorporation.pagekite.me/api/comments/comments')
            .then(response => {
                setComments(response.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
            });
    }

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
        <>
            <Container
                fluid
                style={{ background: 'rgba(169, 169, 169, 0.5)' }}
                className="text-center py-5 mb-5 rounded-lg shadow-lg"
            >
                <h1 className="display-4 mb-4 text-secondary font-weight-bold" style={{ lineHeight: '1.2' }}>
                    We Create Your Professional Website
                </h1>
                <p
                    className="lead mb-4 text-darkslategray glowing-text"
                    style={{ fontSize: '1.2rem', fontWeight: '300' }}
                >
                    Tailored digital solutions to grow your business online.
                </p>
                <Button
                    href="#services"
                    variant="light"
                    size="lg"
                    className="shadow-lg rounded-pill px-4 py-2"
                    style={{ textTransform: 'uppercase', fontWeight: '600' }}
                >
                    Discover Our Services
                </Button>
            </Container>
            
            <Container id="services" className="mb-5">
                <h2 className="mb-5 text-center display-4 text-secondary">Our Services</h2>
                <Row className="d-flex justify-content-center">
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-lg border-0 rounded-lg transition-all" style={{ backgroundColor: 'rgba(169, 169, 169, 0.1)' }}>
                            <Card.Body className="p-5 text-center">
                                <FaLaptop size={60} className="mb-4 text-secondary" />
                                <Card.Title className="h4 text-dark">Professional Websites</Card.Title>
                                <Card.Text className="text-muted">
                                    Modern and responsive design to increase your online visibility.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-lg border-0 rounded-lg transition-all" style={{ backgroundColor: 'rgba(169, 169, 169, 0.1)' }}>
                            <Card.Body className="p-5 text-center">
                                <FaShoppingCart size={60} className="mb-4 text-secondary" />
                                <Card.Title className="h4 text-dark">E-commerce</Card.Title>
                                <Card.Text className="text-muted">
                                    Sell your products online with easy-to-use and secure platforms.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-lg border-0 rounded-lg transition-all" style={{ backgroundColor: 'rgba(169, 169, 169, 0.1)' }}>
                            <Card.Body className="p-5 text-center">
                                <FaBullhorn size={60} className="mb-4 text-secondary" />
                                <Card.Title className="h4 text-dark">SEO & Digital Marketing</Card.Title>
                                <Card.Text className="text-muted">
                                    Personalized strategies to improve ranking and reach new customers.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Container className="mb-5">
                <h2 className="mb-5 text-center display-4 text-secondary">What Our Clients Say</h2>
                <Row>
                    {comments.length > 0 ? comments.map(comment => (
                        <Col md={6} lg={4} key={comment.commentId}>
                            <Card className="mb-4 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <Image
                                            src={comment.img || 'data:image/png;base64,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'}
                                            roundedCircle
                                            width={50}
                                            height={50}
                                            className="me-3"
                                            alt={`${comment.username}'s avatar`}
                                        />
                                        <div>
                                            <strong>{comment.firstName} {comment.lastName}</strong><br />
                                            <small className="text-muted">@{comment.username}</small>
                                        </div>
                                    </div>
                                    <Card.Text>{comment.content}</Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-muted">
                                    <small>{new Date(comment.createdAt).toLocaleDateString()}</small><br />
                                    <em>Product: {comment.productName}</em><br />
                                    {comment.demoUrl && (
                                        <a href={comment.demoUrl} target="_blank" rel="noopener noreferrer">Demo</a>
                                    )}
                                </Card.Footer>
                            </Card>
                        </Col>
                    )) : (
                        <p className="text-center">No comments available.</p>
                    )}
                </Row>
            </Container>
        </>
    );
}

export default HomePage;
