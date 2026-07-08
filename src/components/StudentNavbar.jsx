import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, Layers, History, Check, CheckCheck, Wallet } from 'lucide-react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileservice';
import { studentService } from '../services/studentservice';
import { notificationService } from '../services/notificationService';
import '../CSS/Navbar.css';

const StudentNavbar = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    fullName: 'Đang tải...',
    avatar: '',
    studentCode: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const [profileRes, studentRes] = await Promise.allSettled([
          profileService.getBasicProfile(),
          studentService.getProfile()
        ]);

        const newState = { ...studentData };

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          newState.fullName = profileRes.value.data.fullName;
          newState.avatar = profileRes.value.data.avatarUrl;
        }

        if (studentRes.status === 'fulfilled' && studentRes.value.success) {
          newState.studentCode = studentRes.value.data.studentCode;
          setWalletBalance(studentRes.value.data.walletBalance || 0);
        } else {
          newState.studentCode = 'Chưa cập nhật';
        }

        setStudentData(newState);
      } catch (e) {
        console.error("Lỗi tải thông tin Student Navbar:", e);
        setStudentData(prev => ({ ...prev, fullName: 'Sinh viên' }));
      }
    };

    fetchNavbarData();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      const data = res.data || res || [];
      const list = Array.isArray(data) ? data : data.items || data.notifications || [];
      setNotifications(list.slice(0, 8));
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n =>
        n.id === notificationId || n.notificationId === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName || 'S')}&background=007bff&color=fff`;

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top shadow-sm">
      <Container fluid className="px-lg-5">
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">Lance</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="student-navbar" />
        <Navbar.Collapse id="student-navbar">
          <Nav className="mx-auto gap-lg-4 text-center fw-bold x-small">
            <Nav.Link as={Link} to="/" className="nav-hover-link">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/jobs" className="nav-hover-link">Việc làm</Nav.Link>
            <Nav.Link as={Link} to="/services" className="nav-hover-link">Dịch vụ</Nav.Link>
            <Nav.Link as={Link} to="/find-enterprises" className="nav-hover-link">Tìm DN</Nav.Link>
            <Nav.Link as={Link} to="/handbook" className="nav-hover-link">Cẩm nang</Nav.Link>
          </Nav>

          <Nav className="d-flex align-items-center gap-3">
            {/* WALLET */}
            <Link to="/payment" className="d-flex align-items-center gap-2 text-decoration-none" style={{ padding: '6px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Wallet size={16} style={{ color: '#22c55e' }} />
              <span className="fw-bold small mb-0" style={{ color: '#22c55e' }}>{walletBalance.toLocaleString('vi-VN')}đ</span>
            </Link>

            {/* NOTIFICATION BELL */}
            <div className="position-relative">
              <div
                className="pointer d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} className="text-white-50" />
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="position-absolute" style={{ top: 0, right: 0, fontSize: 10, padding: '2px 5px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>

              {showNotifications && (
                <>
                  <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={() => setShowNotifications(false)} />
                  <div className="position-absolute" style={{ top: '100%', right: 0, width: 340, zIndex: 1050, marginTop: 8 }}>
                    <div className="glass-card p-0 shadow-lg" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="small fw-bold text-white">Thông báo</span>
                        {unreadCount > 0 && (
                          <Button variant="link" size="sm" className="x-small p-0 text-primary" onClick={handleMarkAllRead}>
                            <CheckCheck size={14} className="me-1" /> Đọc tất cả
                          </Button>
                        )}
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-white-50 x-small">Chưa có thông báo</div>
                        ) : notifications.map(n => (
                          <div
                            key={n.id || n.notificationId}
                            className="d-flex gap-2 px-3 py-2 pointer"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.05)' }}
                            onClick={() => handleMarkRead(n.id || n.notificationId)}
                          >
                            {!n.isRead && <div className="mt-1" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                            <div className="flex-fill">
                              <p className="mb-0 small text-white" style={{ opacity: n.isRead ? 0.6 : 1 }}>{n.title || n.message || 'Thông báo mới'}</p>
                              <p className="mb-0 x-small text-white-50 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Button variant="link" size="sm" className="x-small text-primary text-decoration-none fw-bold">Xem tất cả</Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center gap-2">
                  <Image
                    src={studentData.avatar || defaultAvatar}
                    roundedCircle
                    width="34"
                    height="34"
                    className="border border-primary object-fit-cover"
                    onError={(e) => { e.target.src = defaultAvatar }}
                  />
                  <div className="text-start d-none d-xl-block" style={{ lineHeight: '1.2' }}>
                    <span className="small text-white d-block fw-bold text-truncate" style={{ maxWidth: '120px' }}>
                      {studentData.fullName}
                    </span>
                    <span className="x-small text-white-50">{studentData.studentCode}</span>
                  </div>
                </div>
              }
              id="student-dropdown" align="end" className="user-dropdown-custom"
            >
              <div className="px-3 py-2 border-bottom border-secondary mb-1">
                <p className="mb-0 x-small text-white-50 text-uppercase fw-bold">Tài khoản quản lý</p>
              </div>
              <NavDropdown.Item as={Link} to="/dashboardlancer">
                <LayoutDashboard size={18} className="me-3 text-primary" /> Bảng điều khiển
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile-settings">
                <User size={18} className="me-3 text-primary" /> Hồ sơ cá nhân
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payment">
                <History size={18} className="me-3 text-primary" /> Ví & Rút tiền
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                <LogOut size={18} className="me-3" /> Đăng xuất
              </NavDropdown.Item>
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
