import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const EditPasswordPopup = ({ show, handleClose, authToken }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!currentPassword || !newPassword) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    const requestData = { password: currentPassword, newPassword };

    axios.post('https://servercorporation.pagekite.me/api/users/edit-password', requestData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then(() => {
        setLoading(false);
        setCurrentPassword('');
        setNewPassword('');
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
        <Modal.Title>Edit Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="formCurrentPassword" className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              isInvalid={error && !currentPassword}
            />
          </Form.Group>

          <Form.Group controlId="formNewPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
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
          disabled={loading || !currentPassword || !newPassword}
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

export default EditPasswordPopup;