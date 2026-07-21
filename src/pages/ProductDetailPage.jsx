import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Badge, Form, Button, Alert, Card, Col, Image, Spinner, Row } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [userComment, setUserComment] = useState(null);
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, authToken } = useAuth();
    const [editing, setEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState({ cart: false, wishlist: false });
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

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
                style={{ border: '1px solid #ddd', borderRadius: '8px' }}
            />
        );
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, commentsRes] = await Promise.all([
                    axios.get(`https://servercorporation.pagekite.me/api/products/public/${id}`),
                    axios.get(`https://servercorporation.pagekite.me/api/comments/users/external/${id}`)
                ]);
                setProduct(productRes.data);
                setComments(commentsRes.data);

                if (authToken) {
                    try {
                        const userCommentRes = await axios.get(`https://servercorporation.pagekite.me/api/comments/user/${id}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        setUserComment(userCommentRes.data);
                        setCommentContent(userCommentRes.data.content);
                    } catch {
                        setUserComment(null);
                        setCommentContent('');
                    }
                } else {
                    setUserComment(null);
                    setCommentContent('');
                }
            } catch (err) {
                setErrorMessage('Error loading data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, authToken]);

    const handleCreateComment = async (e) => {
        setLoadingSubmit(true);
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', commentContent);
        formData.append('productId', id);
        try {
            await axios.post('https://servercorporation.pagekite.me/api/comments', formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLoadingSubmit(false);
            window.location.reload();
        } catch (error) {
            setErrorMessage('You cannot comment because you have not purchased this product.');
            setLoadingSubmit(false);
        }
    };

    const handleUpdateComment = async (e) => {
        setLoadingSubmit(true);
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', commentContent);
        try {
            await axios.put(`https://servercorporation.pagekite.me/api/comments/users/${userComment.commentId}`, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLoadingSubmit(false);
            window.location.reload();
        } catch (error) {
            setErrorMessage('Error updating comment.');
            setLoadingSubmit(false);
        }
    };

    const handleDeleteComment = async () => {
        setLoadingDelete(true);
        try {
            await axios.delete(`https://servercorporation.pagekite.me/api/comments/users/${userComment.commentId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLoadingDelete(false);
            window.location.reload();
        } catch (error) {
            setErrorMessage('Error deleting comment.');
            setLoadingDelete(false);
        }
    };

    const handleAddToCart = () => {
        setIsLoading(prev => ({ ...prev, cart: true }));
        if (authToken) {
            axios.post('https://servercorporation.pagekite.me/api/cart',
                { "productId": product.id, "quantity": 1 },
                { headers: { Authorization: `Bearer ${authToken}` } }
            )
                .then(() => {
                    setSuccessMessage('Product added to cart!');
                    setErrorMessage('');
                    setIsLoading(prev => ({ ...prev, cart: false }));
                })
                .catch(() => {
                    setErrorMessage('Error adding product!');
                    setSuccessMessage('');
                    setIsLoading(prev => ({ ...prev, cart: false }));
                });
        } else {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const productIndex = cart.findIndex(item => item.id === id);

            if (productIndex === -1) {
                cart.push({ id, name: product.name, price: product.price, quantity: 1 });
                setSuccessMessage('Product added to cart!');
            } else {
                cart[productIndex].quantity += 1;
                setSuccessMessage('Product quantity updated in cart!');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            setErrorMessage('');
            setIsLoading(prev => ({ ...prev, cart: false }));
        }
    };

    const handleAddToWishlist = async () => {
        setIsLoading(prev => ({ ...prev, wishlist: true }));
        if (!authToken) {
            setErrorMessage('You need to be logged in to add to wishlist.');
            setSuccessMessage('');
            setIsLoading(prev => ({ ...prev, wishlist: false }));
            return;
        }
        try {
            const formData = new FormData();
            formData.append('productId', id);
            await axios.post('https://servercorporation.pagekite.me/api/wishlist',
                formData,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setSuccessMessage('Product added to wishlist!');
            setErrorMessage('');
            setIsLoading(prev => ({ ...prev, wishlist: false }));
        } catch (error) {
            setErrorMessage('Error adding product!');
            setSuccessMessage('');
            setIsLoading(prev => ({ ...prev, wishlist: false }));
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

    if (!product) return <Container>Product not found.</Container>;

    return (
        <Container className="mt-5">
            <Row className="justify-content-center mb-5">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title as="h2" className="fw-bold text-center">{product.name}</Card.Title>
                            <Card.Text className="text-center mt-3">{product.description}</Card.Text>
                            <Card.Text className="text-center fs-4 fw-bold">€{product.price}</Card.Text>
                            {product.demoUrl && (
                                <div className="text-center">
                                    <ProductIframe key={product.id} demoUrl={product.demoUrl} />
                                    <Button variant="link" href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                                        Go to demo
                                    </Button>
                                </div>
                            )}
                            <div className="d-flex justify-content-center mt-3">
                                <Badge bg="secondary" className="me-1">{product.tags}</Badge>
                            </div>

                            <div className="mt-5 d-flex justify-content-between">
                                <Button
                                    variant="success"
                                    onClick={handleAddToCart}
                                    disabled={isLoading.cart}
                                >
                                    {isLoading.cart ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            <span className="visually-hidden">Loading...</span>
                                        </>
                                    ) : (
                                        'Add to cart'
                                    )}
                                </Button>
                                <Button
                                    variant="warning"
                                    onClick={handleAddToWishlist}
                                    disabled={isLoading.wishlist}
                                >
                                    {isLoading.wishlist ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            <span className="visually-hidden">Loading...</span>
                                        </>
                                    ) : (
                                        'Add to wishlist'
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            {user && (
                <div className="mt-5">
                    {userComment && !editing ? (
                        <Card>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <Image
                                        src={user.user.img || 'data:image/png;base64,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'}
                                        roundedCircle
                                        width={40}
                                        height={40}
                                    />
                                    <div className="ms-3">
                                        <strong>You</strong>
                                        <p>{userComment.content}</p>
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={handleDeleteComment}
                                    >
                                        {loadingDelete ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Form onSubmit={editing ? handleUpdateComment : handleCreateComment}>
                            <Form.Control
                                as="textarea"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                rows={4}
                                placeholder="Write a comment..."
                                required
                            />
                            <Button variant="primary" type="submit" className="mt-3">
                                {loadingSubmit ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        {editing ? 'Updating...' : 'Posting...'}
                                    </>
                                ) : (
                                    editing ? 'Update Comment' : 'Post Comment'
                                )}
                            </Button>
                        </Form>
                    )}
                </div>
            )}

            <div className="mt-5 mb-5">
                <h4 className="mb-3">Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.commentId} className="mb-3">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <Image
                                        src={comment.img || 'data:image/png;base64,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'}
                                        roundedCircle
                                        width={40}
                                        height={40}
                                    />
                                    <div className="ms-3">
                                        <strong>{comment.firstName} {comment.lastName}</strong><br />
                                        <small className="text-muted">@{comment.username}</small>
                                    </div>
                                </div>
                                <Card.Text>{comment.content}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>
        </Container>
    );
};

export default ProductDetailPage;