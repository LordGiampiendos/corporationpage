import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavbarComponent = () => {
  const { user } = useAuth();

  return (
    <Navbar
      variant="dark"
      expand="lg"
      fixed="top"
      className="shadow-sm backdrop-blur"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">Corporation</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/purchases">Purchases</Nav.Link>
                <Nav.Link as={Link} to="/wishlist">Wishlist</Nav.Link>
                <NavDropdown
                  title={<Image src={user.user.img || 'data:image/png;base64,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'} roundedCircle width="20" height="20" />}
                  align="end"
                >
                  {(user.role === "ADMIN" || user.role === "TECHNICIAN") && (
                    <NavDropdown.Item as={Link} to="/purchases-management">Purchases Management</NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;