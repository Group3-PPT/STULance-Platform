import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image,Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, Briefcase, Bookmark, Layers, Settings, History } from 'lucide-react';
import { authService } from '../services/authService';
import '../CSS/Navbar.css';

const StudentNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { if (refreshToken) await authService.logout(refreshToken); } 
    catch (e) { console.error(e); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top shadow-sm">
      <Container fluid className="px-lg-5">
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">LANCE</span>
          <Badge bg="info" className="ms-2 x-small align-middle text-dark" style={{fontSize: '10px'}}>STUDENT</Badge>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="student-navbar" />
        <Navbar.Collapse id="student-navbar">
          <Nav className="mx-auto nav-links-gap">
            <Nav.Link as={Link} to="/jobs">Việc Làm</Nav.Link>
            <Nav.Link as={Link} to="/services-list">Gói Dịch Vụ</Nav.Link>
            <Nav.Link as={Link} to="/handbook">Cẩm Nang</Nav.Link>
            <Nav.Link as={Link} to="/cv-maker">Tạo CV</Nav.Link>
            <Nav.Link as={Link} to="/portfolio">Portfolio</Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-3">
            <div className="position-relative pointer me-2">
              <Bell size={22} className="text-white-50" />
              <span className="notification-dot"></span>
            </div>

            <NavDropdown 
              title={
                <div className="d-inline-flex align-items-center gap-2">
                  <Image src="https://ui-avatars.com/api/?name=Student&background=0D8ABC&color=fff" roundedCircle width="34" height="34" className="border border-primary"/>
                  <div className="text-start d-none d-xl-block" style={{lineHeight: '1.2'}}>
                    <span className="small text-white d-block fw-bold">Sinh viên</span>
                    <span className="x-small text-muted">odl1dDNm</span>
                  </div>
                </div>
              } 
              id="student-dropdown" align="end" className="user-dropdown-custom"
            >
              <div className="px-3 py-2 border-bottom border-secondary mb-1">
                 <p className="mb-0 x-small text-muted text-uppercase fw-bold">Tài khoản quản lý</p>
              </div>
              <NavDropdown.Item as={Link} to="/dashboardlancer"><LayoutDashboard size={18} className="me-3 text-primary" /> Bảng điều khiển</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile-settings"><User size={18} className="me-3 text-primary" /> Hồ sơ cá nhân</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payment"><History size={18} className="me-3 text-primary" /> Ví của tôi</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold"><LogOut size={18} className="me-3" /> Đăng xuất</NavDropdown.Item>
            </NavDropdown>

            <Button as={Link} to="/post-service" variant="outline-primary" className="btn-sm fw-bold border-2 px-3">
              <Layers size={16} className="me-1" /> BÁN DỊCH VỤ
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default StudentNavbar;