import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavbarComp = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top border-bottom border-secondary py-2">
      {/* 1. Thay đổi thành fluid để sát lề 2 bên */}
      <Container fluid className="px-4"> 
        
        {/* Logo sát lề trái */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
          STU<span className="text-primary">LANCE</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* 2. Dùng mx-auto để các link chính nằm cân đối ở giữa */}
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/jobs" className="px-3">Việc Làm</Nav.Link>
            <Nav.Link as={Link} to="/businesses" className="px-3">Doanh nghiệp</Nav.Link>
            <Nav.Link as={Link} to="/services-list" className="px-3">Dịch vụ</Nav.Link>
            <Nav.Link as={Link} to="/handbook" className="px-3">Cẩm nang</Nav.Link>
            <Nav.Link as={Link} to="/cv-maker" className="px-3">Tạo CV</Nav.Link>
          </Nav>

          {/* 3. Cụm nút sát lề phải */}
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/auth" className="text-white me-3 fw-semibold">
              Đăng nhập
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/post-job" 
              className="btn btn-primary px-4 py-2 text-white fw-bold shadow-sm"
              style={{ borderRadius: '10px' }}
            >
              Đăng bài
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComp;