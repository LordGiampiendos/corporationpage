import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState({ cart: false, checkout: false });

  const updateCart = useCallback(() => {
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
          setLoading(false);
        })
        .catch(() => {
          setAlertMessage('Error in updating or loading the cart');
          setShowAlert(true);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    setLoading(true);
    updateCart();
  }, [updateCart]);

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    if (authToken) {
      axios.put('https://servercorporation.pagekite.me/api/cart', { productId, quantity }, { headers: { Authorization: `Bearer ${authToken}` } })
        .catch(() => {
          setAlertMessage('Error in updating the cart.');
          setShowAlert(true);
        });
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    updatedCart.length === 0
      ? localStorage.removeItem('cart')
      : localStorage.setItem('cart', JSON.stringify(updatedCart));

    if (authToken) {
      const formData = new FormData();
      formData.append("productId", productId);
      axios.post('https://servercorporation.pagekite.me/api/cart/delete', formData, { headers: { Authorization: `Bearer ${authToken}` } })
        .catch(() => {
          setAlertMessage('Error in removing from the cart.');
          setShowAlert(true);
        });
    }
  };

  const clearCart = () => {
    setIsLoading(prev => ({ ...prev, cart: true }));
    setCart([]);
    localStorage.removeItem('cart');

    if (authToken) {
      axios.delete('https://servercorporation.pagekite.me/api/cart/clear', { headers: { Authorization: `Bearer ${authToken}` } })
        .then(() => {
          setIsLoading(prev => ({ ...prev, cart: true }));
        })
        .catch(() => {
          setAlertMessage('Error in clearing the cart...');
          setShowAlert(true);
          setIsLoading(prev => ({ ...prev, cart: true }));
        });
    }
  };

  const checkOut = () => {
    setIsLoading(prev => ({ ...prev, checkout: true }));
    if (authToken) {
      navigate("/checkout");
    }
    else {
      setIsLoading(prev => ({ ...prev, checkout: false }));
      navigate("/login");
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
      <h2 className="mb-5 text-center">🛒 Your Cart</h2>

      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}

      {cart.length === 0 ? (
        <Alert variant="info">Your cart is empty.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="bg-light">
              <tr>
                <th>Product</th>
                <th className="text-center">Quantity</th>
                <th className="text-end">Total</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>{' '}
                    <span className="mx-2">{item.quantity}</span>
                    <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                  </td>
                  <td className="text-end">
                    <strong>{(item.quantity * item.price).toFixed(2)} €</strong>
                  </td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-danger" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Card className="text-end p-3 my-3 shadow-sm">
            <h5>Order Total: <strong>{totalPrice.toFixed(2)} €</strong></h5>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="danger" onClick={clearCart}>
                {isLoading.cart ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  'Clear Cart'
                )}
              </Button>
              <Button variant="success" onClick={checkOut}>
                {isLoading.checkout ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="visually-hidden">Loading...</span>
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </div>
          </Card>
        </>
      )}
    </Container>
  );
};

export default CartPage;