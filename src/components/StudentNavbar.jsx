import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, Layers, History } from 'lucide-react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileservice'; // Lấy tên + avatar
import { studentService } from '../services/studentservice'; // Lấy MSSV
import '../CSS/Navbar.css';

const StudentNavbar = () => {
  const navigate = useNavigate();

  // State lưu trữ thông tin hiển thị
  const [studentData, setStudentData] = useState({
    fullName: 'Đang tải...',
    avatar: '',
    studentCode: ''
  });

  // 1. Tải dữ liệu khi Navbar xuất hiện
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        // Gọi song song cả 2 API
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
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { 
      if (refreshToken) await authService.logout(refreshToken); 
    } 
    catch (e) { 
      console.error(e); 
    } 
    finally { 
      localStorage.clear(); 
      navigate('/login'); 
    }
  };

  // Avatar mặc định dựa trên tên
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName || 'S')}&background=0D8ABC&color=fff`;

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
            <Nav.Link as={Link} to="/portfolio-manager">Portfolio</Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-3">
            <div className="position-relative pointer me-2">
              <Bell size={22} className="text-white-50" />
              <span className="notification-dot"></span>
            </div>

            <NavDropdown 
              title={
                <div className="d-inline-flex align-items-center gap-2">
                  {/* HIỂN THỊ AVATAR THỰC TẾ */}
                  <Image 
                    src={studentData.avatar || defaultAvatar} 
                    roundedCircle 
                    width="34" 
                    height="34" 
                    className="border border-primary object-fit-cover"
                    onError={(e) => { e.target.src = defaultAvatar }}
                  />
                  <div className="text-start d-none d-xl-block" style={{lineHeight: '1.2'}}>
                    {/* HIỂN THỊ TÊN THỰC TẾ */}
                    <span className="small text-white d-block fw-bold text-truncate" style={{maxWidth: '120px'}}>
                        {studentData.fullName}
                    </span>
                    {/* HIỂN THỊ MSSV THỰC TẾ */}
                    <span className="x-small text-muted">{studentData.studentCode}</span>
                  </div>
                </div>
              } 
              id="student-dropdown" align="end" className="user-dropdown-custom"
            >
              <div className="px-3 py-2 border-bottom border-secondary mb-1">
                 <p className="mb-0 x-small text-muted text-uppercase fw-bold">Tài khoản quản lý</p>
              </div>
              <NavDropdown.Item as={Link} to="/dashboardlancer">
                <LayoutDashboard size={18} className="me-3 text-primary" /> Bảng điều khiển
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile-settings">
                <User size={18} className="me-3 text-primary" /> Hồ sơ cá nhân
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payment">
                <History size={18} className="me-3 text-primary" /> Ví của tôi
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