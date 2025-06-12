import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const InsertPasswordPopup = ({ show, handleClose, authToken }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!newPassword) {
      setError('Please enter a password.');
      return;
    }

    setLoading(true);
    const requestData = { password: newPassword };

    axios.post('https://servercorporation.pagekite.me/api/users/insert-password', requestData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then(() => {
        setLoading(false);
        setNewPassword('');
        handleClose();
      })
      .catch(() => {
        setLoading(false);
        setError('Error while inserting the password.');
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
        <Modal.Title>Enter Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="formNewPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter the new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoFocus
              isInvalid={error && !newPassword}
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
          disabled={loading || !newPassword}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InsertPasswordPopup;