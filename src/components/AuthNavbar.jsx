import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import '../CSS/Navbar.css';

const AuthNavbar = () => {
  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top shadow-sm">
      <Container fluid className="px-lg-5">
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">LANCE</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="auth-navbar" />
        <Navbar.Collapse id="auth-navbar">
          <Nav className="mx-auto nav-links-gap">
            <Nav.Link as={Link} to="/jobs">Việc Làm</Nav.Link>
            <Nav.Link as={Link} to="/services-list">Dịch Vụ</Nav.Link>
            <Nav.Link as={Link} to="/businesses">Doanh nghiệp</Nav.Link>
            <Nav.Link as={Link} to="/handbook">Cẩm Nang</Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-3">
            <Nav.Link as={Link} to="/login" className="text-white fw-semibold">Đăng nhập</Nav.Link>
            <Button as={Link} to="/register" variant="primary" className="btn-post-nav fw-bold shadow-glow">
              Tham gia ngay
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AuthNavbar;