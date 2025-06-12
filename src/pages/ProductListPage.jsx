import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(null);
  const { user, authToken } = useAuth();

  const productValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    price: Yup.number().required('Price is required').positive('Price must be positive'),
    demoUrl: Yup.string().url('Invalid URL').required('Demo URL is required'),
    tags: Yup.string().required('Tags are required')
  });

  useEffect(() => {
    axios.get('https://servercorporation.pagekite.me/api/products/products')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('An error occurred while fetching the data.');
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleDelete = (id) => {
    setIsDeletingProduct(id);
    axios.delete(`https://servercorporation.pagekite.me/api/products/admin/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(() => {
        setProducts(products.filter(product => product.id !== id));
        setFilteredProducts(filteredProducts.filter(product => product.id !== id));
        setIsDeletingProduct(null);
      })
      .catch(err => {
        setError('Error occurred while deleting the product.');
        setIsDeletingProduct(null);
      });
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (values) => {
    setIsAddingProduct(true);
    axios.post('https://servercorporation.pagekite.me/api/products/admin', values, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(response => {
        setProducts([response.data, ...products]);
        setFilteredProducts([response.data, ...filteredProducts]);
        setShowAddModal(false);
        setIsAddingProduct(false);
      })
      .catch(err => {
        setError('Error occurred while adding the product.');
        setIsAddingProduct(false);
      });
  };

  const handleUpdateSubmit = (values) => {
    setIsUpdatingProduct(true);
    axios.put(`https://servercorporation.pagekite.me/api/products/admin/${selectedProduct.id}`, values, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(response => {
        const updatedProducts = products.map(product =>
          product.id === selectedProduct.id ? response.data : product
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        setShowUpdateModal(false);
        setIsUpdatingProduct(false);
      })
      .catch(err => {
        setError('Error occurred while updating the product.');
        setIsUpdatingProduct(false);
      });
  };

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleCloseUpdateModal = () => setShowUpdateModal(false);

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

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-5">Product List</h2>

      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by product name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Form>

      {user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' ? (
        <div className='text-center'>
          <Button
            variant="success"
            onClick={handleAddProduct}
            className="mb-4"
            disabled={isAddingProduct}
          >
            {isAddingProduct ? <Spinner animation="border" size="sm" /> : 'Add Product'}
          </Button>
        </div>
      ) : null}

      <Row>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <div className="product-card">
                <Link to={`/product/${product.id}`} className="text-decoration-none">
                  <h5>{product.name}</h5>
                </Link>
                <div className="d-flex justify-content-between mt-4">
                  {user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' ? (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleUpdate(product)}
                        disabled={isUpdatingProduct}
                      >
                        Update
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeletingProduct}
                      >
                        {isDeletingProduct === product.id ? <Spinner animation="border" size="sm" /> : 'Delete'}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <iframe
                src={product.demoUrl}
                width="100%"
                height="100%"
                title="Product demo"
                style={{ border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <Alert variant="info">No products found.</Alert>
          </Col>
        )}
      </Row>

      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              name: '',
              description: '',
              price: '',
              demoUrl: '',
              tags: ''
            }}
            validationSchema={productValidationSchema}
            onSubmit={handleAddSubmit}
          >
            {({ handleChange, handleBlur, values, touched, errors }) => (
              <FormikForm>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Field
                    type="text"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="name" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Field
                    as="textarea"
                    rows={3}
                    name="description"
                    className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="description" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="price">
                  <Form.Label>Price</Form.Label>
                  <Field
                    type="number"
                    name="price"
                    className={`form-control ${touched.price && errors.price ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="price" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="demoUrl">
                  <Form.Label>Demo URL</Form.Label>
                  <Field
                    type="text"
                    name="demoUrl"
                    className={`form-control ${touched.demoUrl && errors.demoUrl ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="demoUrl" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="tags">
                  <Form.Label>Tags</Form.Label>
                  <Field
                    type="text"
                    name="tags"
                    className={`form-control ${touched.tags && errors.tags ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="tags" component="div" className="invalid-feedback" />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={handleCloseAddModal}>Close</Button>
                  <Button variant="primary" type="submit" disabled={isAddingProduct}>
                    {isAddingProduct ? <Spinner animation="border" size="sm" /> : 'Add'}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              name: selectedProduct?.name || '',
              description: selectedProduct?.description || '',
              price: selectedProduct?.price || '',
              demoUrl: selectedProduct?.demoUrl || '',
              tags: selectedProduct?.tags || ''
            }}
            validationSchema={productValidationSchema}
            onSubmit={handleUpdateSubmit}
          >
            {({ handleChange, handleBlur, values, touched, errors }) => (
              <FormikForm>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Field
                    type="text"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="name" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Field
                    as="textarea"
                    rows={3}
                    name="description"
                    className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="description" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="price">
                  <Form.Label>Price</Form.Label>
                  <Field
                    type="number"
                    name="price"
                    className={`form-control ${touched.price && errors.price ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="price" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="demoUrl">
                  <Form.Label>Demo URL</Form.Label>
                  <Field
                    type="text"
                    name="demoUrl"
                    className={`form-control ${touched.demoUrl && errors.demoUrl ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="demoUrl" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group controlId="tags">
                  <Form.Label>Tags</Form.Label>
                  <Field
                    type="text"
                    name="tags"
                    className={`form-control ${touched.tags && errors.tags ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="tags" component="div" className="invalid-feedback" />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={handleCloseUpdateModal}>Close</Button>
                  <Button variant="primary" type="submit" disabled={isUpdatingProduct}>
                    {isUpdatingProduct ? <Spinner animation="border" size="sm" /> : 'Update'}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductListPage;