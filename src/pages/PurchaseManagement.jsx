import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Card, Row, Col, Spinner, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaCheckCircle } from 'react-icons/fa';

const PurchaseManagement = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const { user, authToken } = useAuth();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await axios.get('https://servercorporation.pagekite.me/api/purchases/admin', {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                setPurchases(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching purchases", error);
                setLoading(false);
            }
        };
        fetchPurchases();
    }, [authToken]);

    const handleChangeState = async (id) => {
        setLoadingVerify(true);
        const formData = new FormData();
        formData.append('id', id);
        try {
            await axios.post('https://servercorporation.pagekite.me/api/purchases/stateA', formData, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            setPurchases(purchases.map(purchase =>
                purchase.id === id ? { ...purchase, state: 'Purchased' } : purchase
            ));
            setShowVerifyModal(false);
        } catch (error) {
            console.error('Error changing state', error);
        } finally {
            setLoadingVerify(false);
        }
    };

    const handleDelete = (id) => {
        setSelectedPurchaseId(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setLoadingDelete(true);
        try {
            await axios.delete(`https://servercorporation.pagekite.me/api/purchases/admin/${selectedPurchaseId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            setPurchases(purchases.filter(purchase => purchase.id !== selectedPurchaseId));
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting purchase', error);
            setShowModal(false);
        } finally {
            setLoadingDelete(false);
        }
    };

    const cancelDelete = () => {
        setShowModal(false);
    };

    const cancelVerify = () => {
        setShowVerifyModal(false);
    };

    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <div className="loader">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-2">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <>
            <Container className="mt-5">
                <h2 className="text-center mb-5">Purchases Management</h2>
                <Row>
                    <Col>
                        <Card className="shadow-lg">
                            <Card.Body>
                                <Table striped bordered hover responsive>
                                    <thead className="bg-dark text-white">
                                        <tr>
                                            <th>ID</th>
                                            <th>User ID</th>
                                            <th>Description</th>
                                            <th>State</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchases.map((purchase) => (
                                            <tr key={purchase.id}>
                                                <td>{purchase.id}</td>
                                                <td>{purchase.userId}</td>
                                                <td>{purchase.description}</td>
                                                <td>
                                                    <span className={`badge ${purchase.state === "Paid" ? "bg-warning" : "bg-success"}`}>
                                                        {purchase.state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center">
                                                        {purchase.state === 'Paid' && (
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={<Tooltip>Verify Purchase</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="success"
                                                                    className="me-2 mb-2 mb-sm-0"
                                                                    onClick={() => setShowVerifyModal(true)}
                                                                >
                                                                    <FaCheckCircle className='mb-1' /> Verify
                                                                </Button>
                                                            </OverlayTrigger>
                                                        )}
                                                        {user?.role === 'ADMIN' && (
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={<Tooltip>Delete Purchase</Tooltip>}
                                                            >
                                                                <Button
                                                                    variant="danger"
                                                                    onClick={() => handleDelete(purchase.id)}
                                                                >
                                                                    <FaTrash className='mb-1' /> Delete
                                                                </Button>
                                                            </OverlayTrigger>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={cancelDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingDelete ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" />
                            <span className="ms-2">Deleting...</span>
                        </div>
                    ) : (
                        <p>Are you sure you want to delete this purchase?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete} disabled={loadingDelete}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loadingDelete}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showVerifyModal} onHide={cancelVerify}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Verification</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingVerify ? (
                        <div className="d-flex justify-content-center">
                            <Spinner animation="border" variant="primary" />
                            <span className="ms-2">Verifying...</span>
                        </div>
                    ) : (
                        <p>Are you sure you want to verify this purchase?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelVerify} disabled={loadingVerify}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={() => handleChangeState(selectedPurchaseId)} disabled={loadingVerify}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PurchaseManagement;
