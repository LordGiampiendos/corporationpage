import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Spinner, Button, Alert, Modal, InputGroup, Form, Badge, Row, Col, Image } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EditProfilePopup from './EditProfilePopup';
import EditEmailPopup from './EditEmailPopup';
import EditPasswordPopup from './EditPasswordPopup';
import InsertPasswordPopup from './InsertPasswordPopup';
import { QRCodeCanvas } from 'qrcode.react';
import { FaEdit, FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorOtp, setErrorOtp] = useState(null);
  const navigate = useNavigate();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showInsertPassword, setShowInsertPassword] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmDisableAppMfa, setShowConfirmDisableAppMfa] = useState(false);
  const [showConfirmDisableEmailMfa, setShowConfirmDisableEmailMfa] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [showModal1, setShowModal1] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingR, setIsLoadingR] = useState(false);
  const [secret, setSecret] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCloseEditProfile = () => setShowEditProfile(false);
  const handleShowEditProfile = () => setShowEditProfile(true);

  const handleCloseEditEmail = () => setShowEditEmail(false);
  const handleShowEditEmail = () => setShowEditEmail(true);

  const handleCloseEditPassword = () => setShowEditPassword(false);
  const handleShowEditPassword = () => setShowEditPassword(true);

  const handleCloseInsertPassword = () => setShowInsertPassword(false);
  const handleShowInsertPassword = () => setShowInsertPassword(true);

  useEffect(() => {
    if (user) {
      setPhoneNumber(user?.user.phoneNumber || '');
      setIsPasswordSet(user.provider === 'LOCAL');
    }
  }, [user]);

  const generateQRCode = () => {
    setLoadingOtp(true);
    axios.get("https://servercorporation.pagekite.me/api/users/generate-qr", {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(response => {
        setQrUrl(response.data);
        const match = response.data.match(/[?&]secret=([^&]*)/);
        setSecret(match ? match[1] : null);
        setLoadingOtp(false);
        setShowModal1(true);
      })
      .catch(() => {
        setErrorOtp('Error retrieving QR Code');
        setLoadingOtp(false);
      });
  };

  const handleDeleteProfile = () => {
    setIsLoadingR(true);
    axios.get("https://servercorporation.pagekite.me/api/users/removeU", {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(() => {
        navigate("/logout");
        setIsLoadingR(false);
      })
      .catch(() => {
        setError('Error deleting profile...');
        setIsLoadingR(false);
      });
  };

  const verifyMFA = () => {
    setErrorOtp(null);
    if (!mfaCode.trim()) {
      setError('Please enter an MFA code');
      return;
    }
    setIsLoadingOtp(true);
    let formData = new FormData();
    formData.append("code", mfaCode.trim());
    formData.append("secret", secret);
    axios.post("https://servercorporation.pagekite.me/api/users/verify-code", formData, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(response => {
        if (response.data) {
          setShowModal1(false);
          setMfaCode('');
          setErrorOtp(null);
          window.location.reload();
        } else {
          setErrorOtp('Invalid code');
        }
        setIsLoadingOtp(false);
      })
      .catch(error => {
        setErrorOtp(error.response.data);
        setIsLoadingOtp(false);
      });
  };

  const toggleMFAServerCall = (url, successMessage) => {
    setLoading(true);
    setError(null);
    axios.get(url, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })
      .then(() => {
        setLoading(false);
        setError(null);
        window.location.reload();
      })
      .catch(error => {
        setLoading(false);
        setError(error.response?.data);
      });
  };

  const enableMFAemail = () => toggleMFAServerCall('https://servercorporation.pagekite.me/api/users/insert-MFAe');
  const disableMFAapp = () => toggleMFAServerCall('https://servercorporation.pagekite.me/api/users/mfaA-off');
  const disableMFAemail = () => toggleMFAServerCall('https://servercorporation.pagekite.me/api/users/mfaE-off');

  const copiaInClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret).then(() => setCopied(true));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderMfaStatus = (enabled) => (
    enabled ? <Badge bg="success"><FaCheckCircle /> Enabled</Badge> : <Badge bg="secondary"><FaTimesCircle /> Disabled</Badge>
  );

  return (
    <>
      {user ? (
        <Container className="mt-5 mb-5">
          <h2 className="mb-5">User Details</h2>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">User Details</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row className='align-items-center mb-4'>
                    <Col md={5}><strong>Profile Image:</strong></Col>
                    <Col>
                      <Image
                        className='mt-3'
                        src={user.user.img || 'data:image/png;base64,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'}
                        roundedCircle
                        width={120}
                        height={120}
                        alt="Profile Image"
                      />
                    </Col>
                    <Col>
                      <Button className='float-end' variant="outline-secondary" size="sm" onClick={handleShowEditProfile}>
                        <FaEdit /> Edit Profile
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={5}><strong>Username:</strong></Col>
                    <Col>{user.user.username}</Col>
                    <Col>
                      <Button className='float-end' variant="outline-danger" size="sm" onClick={() => setShowConfirmDelete(true)}>
                        <FaEdit /> {isLoadingR ? <Spinner animation="border" size="sm" /> : 'Delete Profile'}
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row className='align-items-center'>
                    <Col md={5}><strong>Email:</strong></Col>
                    <Col>{user.user.email}</Col>
                    <Col>
                      <Button className='float-end' variant="outline-primary" size="sm" onClick={handleShowEditEmail}>
                        <FaEdit /> Edit Email
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={5}><strong>First Name:</strong></Col>
                    <Col>{user.user.firstName}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={5}><strong>Last Name:</strong></Col>
                    <Col>{user.user.lastName}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row className='align-items-center'>
                    <Col md={5}><strong>Phone Number:</strong></Col>
                    <Col>{phoneNumber || <em>No number registered</em>}</Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Security</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div><strong>Password</strong></div>
                  {isPasswordSet ? (
                    <Button variant="outline-primary" size="sm" onClick={handleShowEditPassword}>
                      Edit Password
                    </Button>
                  ) : (
                    <Button variant="outline-success" size="sm" onClick={handleShowInsertPassword}>
                      Insert Password
                    </Button>
                  )}
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Multi-Factor Authentication by app:  </strong> {renderMfaStatus(user.isMfaApp)}
                  </div>
                  {user.isMfaApp ? (
                    <Button variant="outline-danger" size="sm" disabled={loading} onClick={() => setShowConfirmDisableAppMfa(true)}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Disable'}
                    </Button>
                  ) : (
                    <Button variant="outline-success" size="sm" disabled={loading} onClick={generateQRCode}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Enable'}
                    </Button>
                  )}
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Multi-Factor Authentication by email:  </strong> {renderMfaStatus(user.isMfaEmail)}
                  </div>
                  {user.isMfaEmail ? (
                    <Button variant="outline-danger" size="sm" disabled={loading} onClick={() => setShowConfirmDisableEmailMfa(true)}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Disable'}
                    </Button>
                  ) : (
                    <Button variant="outline-success" size="sm" disabled={loading} onClick={enableMFAemail}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Enable'}
                    </Button>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <EditProfilePopup show={showEditProfile} handleClose={handleCloseEditProfile} user={user} authToken={authToken} />
          <EditEmailPopup show={showEditEmail} handleClose={handleCloseEditEmail} authToken={authToken} />
          <EditPasswordPopup show={showEditPassword} handleClose={handleCloseEditPassword} authToken={authToken} />
          <InsertPasswordPopup show={showInsertPassword} handleClose={handleCloseInsertPassword} authToken={authToken} />

          <Modal centered show={showModal1} onHide={() => setShowModal1(false)} size="md" >
            <Modal.Header closeButton>
              <Modal.Title>Configure Multi-Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body className='text-center'>
              {loadingOtp && !qrUrl ? (
                <div className="d-flex justify-content-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : qrUrl ? (
                <>
                  <p>Scan the QR Code with your authenticator app:</p>
                  <div className="text-center mb-3">
                    <QRCodeCanvas value={qrUrl} size={200} />
                  </div>
                  <InputGroup className="mb-3">
                    <Form.Control type="text" value={secret || ''} readOnly />
                    <Button style={{ height: '38px' }} variant={copied ? "success" : "outline-primary"} onClick={copiaInClipboard} disabled={copied} title="Copy secret code">
                      <FaCopy /> {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </InputGroup>
                  <Form.Group controlId="mfaCode" className="mb-3">
                    <Form.Label>Enter the MFA code generated by the app</Form.Label>
                    <Form.Control
                      type="text"
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value)}
                      placeholder="MFA Code"
                      autoFocus
                      style={{ textAlign: "center" }}
                    />
                  </Form.Group>
                </>
              ) : (
                <Alert variant="warning">Error loading QR Code.</Alert>
              )}
              {errorOtp && <Alert variant="danger">{errorOtp}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal1(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={verifyMFA} disabled={isLoadingOtp}>
                {isLoadingOtp ? <Spinner animation="border" size="sm" /> : 'Verify Code'}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>delete your profile</strong>? This action is irreversible.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteProfile} disabled={isLoadingR}>
                {isLoadingR ? <Spinner animation="border" size="sm" /> : 'Delete'}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showConfirmDisableAppMfa} onHide={() => setShowConfirmDisableAppMfa(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Disable MFA (App)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>disable MFA by authenticator app</strong>?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirmDisableAppMfa(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { disableMFAapp(); setShowConfirmDisableAppMfa(false); }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Disable'}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showConfirmDisableEmailMfa} onHide={() => setShowConfirmDisableEmailMfa(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Disable MFA (Email)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to <strong>disable MFA via email</strong>?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirmDisableEmailMfa(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { disableMFAemail(); setShowConfirmDisableEmailMfa(false); }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Disable'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      ) : (
        <Container className="mt-4">
          <div className="loader">
            <Spinner animation="border" variant="primary" />
            <span className="ms-2">Loading...</span>
          </div>
        </Container>
      )}
    </>
  );
};

export default ProfilePage;