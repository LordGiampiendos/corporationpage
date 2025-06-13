import React, { useEffect, useState } from 'react';
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
                console.error('Error loading data:', err);
                setErrorMessage('Error loading data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, authToken]);

    const handleCreateComment = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', commentContent);
        formData.append('productId', id);
        try {
            await axios.post('https://servercorporation.pagekite.me/api/comments', formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error creating comment:', error);
            setErrorMessage('Error creating comment.');
        }
    };

    const handleUpdateComment = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', commentContent);
        try {
            await axios.put(`https://servercorporation.pagekite.me/api/comments/users/${userComment.commentId}`, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error updating comment:', error);
            setErrorMessage('Error updating comment.');
        }
    };

    const handleDeleteComment = async () => {
        try {
            await axios.delete(`https://servercorporation.pagekite.me/api/comments/users/${userComment.commentId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error deleting comment:', error);
            setErrorMessage('Error deleting comment.');
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
                                    <iframe
                                        src={product.demoUrl}
                                        width="100%"
                                        height="100%"
                                        title="Product Demo"
                                        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
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
                                <div className="d-flex align-items-center mb-3">
                                    <Image
                                        src={user.user.img || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAQlBMVEX////y8vK0tLT19fWwsLD6+vr4+Piurq7ExMS4uLjw8PC1tbXl5eXZ2dm9vb3IyMjf39/c3NzQ0NDMzMzU1NTk5PUEbEoQ+jEwdmhqxF8AiVqltY85RFS9gdnYAAA2kj9Oj3+VBxMgIFMjGAqA1mruRnl6NppvKv1XZr+zvUbbLYqvIbxzL+a4g+HqS23HLhkpPO3TZVgB17khD0g5Wr1Yjt0gDFZ28/fvMr90Wbg2gMxyRM8jlZAQDYbpBpj3qOW9zIg4Y5aqnZ5H8oWpEJlSm6cml94rME5y7w6A80UQAAAe0lEQVR4nOzda3LkqBgG4XzrcAStAGIFhE2gEJl5Tktt4PgsBMT9+m9VyyHqMvql5zOs4yAEw5ckDk4u7w4+nd5CjNRjt4IgD++nZP47dq/gp6jmJp9IzlSh0n2NBh+LgFc4u4J0+jf5LRvbwAlskF+wJrdw6hLBcCqu+nSmheV3OBZtEXHt0g6jmMNOvhx8sMIvhfoL8RswZz4aeT4hSZlbQzqIUR0t+VZoxEu/nQFCkZXKnw1A0O2Mz3V0zJXpfk8Uw19DE+wG4P8eF/dmVrlk8w/wgg7j8d11VmFfZL7reZpClcUlSfgC3ZoSl9g5hN59l6AAGd7mfSkNktTf9H4hbP7QAAAABJRU5ErkJggg=='}
                                        roundedCircle
                                        width={40}
                                        height={40}
                                    />
                                    <div className="ms-3">
                                        <strong>{user.username}</strong>
                                        <p>{userComment.content}</p>
                                    </div>
                                    <div>
                                        <Button variant="link" onClick={() => setEditing(true)}>Edit</Button>
                                        <Button variant="link" onClick={handleDeleteComment}>Delete</Button>
                                    </div>
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
                                {editing ? 'Update Comment' : 'Post Comment'}
                            </Button>
                        </Form>
                    )}
                </div>
            )}

            <div className="mt-5">
                <h4 className="mb-2">Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.commentId} className="mb-3">
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <Image
                                        src={comment.img || 'data:image/png;base64,...'}
                                        roundedCircle
                                        width={40}
                                        height={40}
                                    />
                                    <div className="ms-3">
                                        <strong>{comment.username}</strong>
                                        <p>{comment.content}</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>
        </Container>
    );
};

export default ProductDetailPage;
