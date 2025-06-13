import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import imageCompression from 'browser-image-compression';

const RegisterPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const usernameCheckTimeout = useRef(null);
  const clientId = '608372132439-b6gpetv4i83u76qe3rho3u4t4dfmog24.apps.googleusercontent.com';
  const [profileImage, setProfileImage] = useState(null);

  const validationSchema = Yup.object({
    username: Yup.string().required('Username required'),
    email: Yup.string().email('Invalid email').required('Email required'),
    password: Yup.string().required('Password required'),
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required')
  });

  const handleImageRemove = (setFieldValue) => {
    document.getElementById('imageInput').value = null;
    setProfileImage(null);
    setFieldValue('img', null);
  };

  useEffect(() => {
    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);

    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
  }, [username]);

  const checkUsernameAvailability = (username) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);

    axios
      .get(`https://servercorporation.pagekite.me/api/users/check-username?username=${encodeURIComponent(username)}`)
      .then((res) => {
        setUsernameAvailable(!res.data.exists);
      })
      .catch(() => {
        setUsernameAvailable(null);
      })
      .finally(() => {
        setCheckingUsername(false);
      });
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

  const handleRegister = async (values) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('password', values.password);
    if (profileImage) {
      const compressedFile = await compressImage(profileImage);
      if (compressedFile) {
        formData.append('img', compressedFile);
      } 
    }

    try {
      const response = await axios.post(
        'https://servercorporation.pagekite.me/api/users/register',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200) {
        setSuccess(true);
        navigate('/login');
      }
    } catch (error) {
      setError(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (response) => {
    setLoading(true);
    setError('');

    const { credential } = response;
    axios.post('https://servercorporation.pagekite.me/api/users/register-google', {
      tokenId: credential,
    })
      .then(() => {
        navigate("/login");
        setLoading(false);
      })
      .catch(error => {
        setError(error.response.data);
        setLoading(false);
      })
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '500px', borderRadius: '10px' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Create an Account</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Registration successful! Redirecting to login page...</Alert>}

        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            img: null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleSubmit, handleChange, values, errors, touched, setFieldValue }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={(e) => {
                    handleChange(e);
                    setUsername(e.target.value);
                  }}
                  isInvalid={(touched.username && errors.username) || (usernameAvailable === false)}
                  isValid={usernameAvailable === true && !errors.username}
                  placeholder="Choose a username"
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username || (usernameAvailable === false && 'Username is already taken')}
                </Form.Control.Feedback>
                {checkingUsername && <Form.Text className="text-muted">Checking availability...</Form.Text>}
                {usernameAvailable === true && !errors.username && (
                  <Form.Text className="text-success">Username available ✅</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={touched.email && errors.email}
                  placeholder="Enter your email"
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && errors.password}
                  placeholder="Create a password"
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  isInvalid={touched.firstName && errors.firstName}
                  placeholder="Enter your first name"
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  isInvalid={touched.lastName && errors.lastName}
                  placeholder="Enter your last name"
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Profile Picture (optional)</Form.Label>
                <Form.Control
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFieldValue('img', file);
                    setProfileImage(file);
                  }}
                  style={{ borderRadius: '8px', padding: '12px 16px' }}
                />
                {profileImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                    <img src={URL.createObjectURL(profileImage)} alt="preview" style={{ width: '100px', height: '100px', borderRadius: '50%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <Button variant="danger" className="mt-2" onClick={() => handleImageRemove(setFieldValue)}>Remove Image</Button>
                  </div>
                )}
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading || usernameAvailable === false} className="w-100 mb-3" style={{ borderRadius: '8px', padding: '12px 16px' }}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-4 d-flex justify-content-center">
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google Login failed')}
              useOneTap
              className="btn btn-danger w-100"
            />
          </GoogleOAuthProvider>
        </div>

        <div className="text-center mt-3">
          <span>Already have an account? <a href="/login">Log In</a></span>
        </div>
      </Card>
    </Container>
  );
};

export default RegisterPage;