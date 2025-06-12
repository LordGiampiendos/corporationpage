import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const EditEmailPopup = ({ show, handleClose, authToken }) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!newEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const requestData = { newEmail, password };
    axios.post('https://servercorporation.pagekite.me/api/users/edit-email', requestData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then(() => {
        setLoading(false);
        setNewEmail('');
        setPassword('');
        handleClose();
      })
      .catch(error => {
        setLoading(false);
        setError(error.response.data);
      });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Edit Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group controlId="formNewEmail" className="mb-3">
            <Form.Label>New Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter the new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
              autoFocus
              isInvalid={error && !newEmail}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              isInvalid={error && !password}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !newEmail || !password}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Loading...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEmailPopup;