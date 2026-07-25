import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, FileText,
  BarChart3, ShieldCheck, Briefcase, Handshake, Bell, LogOut, Home
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import '../CSS/Navbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      const data = res.data || res || [];
      const list = Array.isArray(data) ? data : data.items || data.notifications || [];
      setNotifications(list.slice(0, 8));
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/admin/accounts', icon: <Users size={16} />, label: 'Người dùng' },
    { to: '/admin/posts', icon: <FileText size={16} />, label: 'Bài đăng' },
    { to: '/admin/contracts', icon: <Handshake size={16} />, label: 'Hợp đồng' },
    { to: '/admin/payments', icon: <CreditCard size={16} />, label: 'Thanh toán' },
    { to: '/admin/manage-reports', icon: <BarChart3 size={16} />, label: 'Tố cáo' },
  ];

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top shadow-sm" style={{ zIndex: 1060 }}>
      <Container fluid className="px-lg-5">
        <Navbar.Brand as={Link} to="/admin" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">LANCE</span>
          <Badge bg="danger" className="ms-2" style={{ fontSize: 10, padding: '3px 8px', verticalAlign: 'middle' }}>ADMIN</Badge>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar">
          <Nav className="mx-auto nav-links-gap">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-1">
              <Home size={14} /> Trang chủ
            </Nav.Link>
            {navItems.map(item => (
              <Nav.Link key={item.to} as={Link} to={item.to} className="d-flex align-items-center gap-1">
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-center gap-3">
            <div className="position-relative">
              <div
                className="pointer d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => navigate('/admin/manage-reports')}
              >
                <Bell size={18} className="text-white-50" />
                {unreadCount > 0 && (
                  <span className="position-absolute badge bg-danger rounded-pill" style={{ top: -2, right: -2, fontSize: 9, padding: '2px 5px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>

            <NavDropdown
              align="end"
              title={
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff&size=32"
                    alt="avatar"
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                  <span className="text-white fw-semibold small d-none d-lg-inline">Admin</span>
                </div>
              }
              id="admin-dropdown"
              className="custom-dropdown"
            >
              <NavDropdown.Item as={Link} to="/admin" className="d-flex align-items-center gap-2">
                <LayoutDashboard size={16} /> Dashboard
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/" className="d-flex align-items-center gap-2">
                <Home size={16} /> Trang chủ
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2 text-danger">
                <LogOut size={16} /> Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
