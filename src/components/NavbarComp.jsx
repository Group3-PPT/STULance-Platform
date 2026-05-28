import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, PlusSquare } from 'lucide-react';
import '../CSS/Navbar.css';

const NavbarComp = () => {
  const location = useLocation();

  // Hàm kiểm tra xem link có đang active không để đổi màu
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top">
      <Container fluid className="px-lg-5">
        {/* LOGO SÁT LỀ TRÁI */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">LANCE</span>
        </Navbar.Brand>

        {/* NÚT Ô SỌC CHO MOBILE */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* MENU CHÍNH CĂN GIỮA */}
          <Nav className="mx-auto nav-links-gap">
            <Nav.Link as={Link} to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Việc Làm</Nav.Link>
            <Nav.Link as={Link} to="/businesses" className={isActive('/businesses') ? 'active' : ''}>Doanh nghiệp</Nav.Link>
            <Nav.Link as={Link} to="/services-list" className={isActive('/services-list') ? 'active' : ''}>Dịch vụ</Nav.Link>
            <Nav.Link as={Link} to="/handbook" className={isActive('/handbook') ? 'active' : ''}>Cẩm nang</Nav.Link>
            <Nav.Link as={Link} to="/cv-maker" className={isActive('/cv-maker') ? 'active' : ''}>Tạo CV</Nav.Link>
          </Nav>

          {/* CỤM NÚT SÁT LỀ PHẢI */}
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/auth" className="text-white me-3 login-text-link">
               Đăng nhập
            </Nav.Link>
            <Button 
              as={Link} 
              to="/post-job" 
              variant="primary" 
              className="btn-post-nav d-flex align-items-center gap-2 fw-bold"
            >
              <PlusSquare size={18} /> Đăng bài
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComp;