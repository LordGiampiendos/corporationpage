import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const EditProfilePopup = ({ show, handleClose, user, authToken }) => {
  const [firstName, setFirstName] = useState(user.user.firstName);
  const [lastName, setLastName] = useState(user.user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.user.phoneNumber);
  const [image, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState(user.user.img);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImgUrl(URL.createObjectURL(file));
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      setError("First Name and Last Name are required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    if (phoneNumber) {
      formData.append('phoneNumber', phoneNumber);
    }
    if (image) {
      if (profileImage) {
        const compressedFile = await compressImage(profileImage);
        if (compressedFile) {
          formData.append('image', compressedFile);
        }
      }
    } else if (imgUrl) {
      formData.append('img', imgUrl);
    }

    axios.post('https://servercorporation.pagekite.me/api/users/profile', formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then(() => {
        setLoading(false);
        handleClose();
        window.location.reload();
      })
      .catch(error => {
        setLoading(false);
        setError(error.response.data);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
            />
          </Form.Group>

          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </Form.Group>

          <Form.Group controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
            />
          </Form.Group>

          <Form.Group controlId="formImage">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {imgUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                <img
                  src={imgUrl}
                  alt="preview"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    document.getElementById('imageInput').value = null;
                    setImage(null);
                    setImgUrl(null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProfilePopup;