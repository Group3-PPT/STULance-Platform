import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, Settings, History, PlusSquare } from 'lucide-react';
import { authService } from '../services/authService';
import { enterpriseService } from '../services/enterprise.service'; // Import service doanh nghiệp
import '../CSS/Navbar.css';

const BusinessNavbar = () => {
  const navigate = useNavigate();
  
  // State để lưu thông tin hiển thị
  const [bizInfo, setBizInfo] = useState({
    name: 'Đang tải...',
    logo: '',
    taxCode: ''
  });

  // 1. Lấy thông tin doanh nghiệp khi Component mount
  useEffect(() => {
    const fetchBizData = async () => {
      try {
        const res = await enterpriseService.getMe();
        if (res.success && res.data) {
          setBizInfo({
            name: res.data.companyName,
            logo: res.data.logoUrl, // URL ảnh từ Azure
            taxCode: res.data.companyTaxCode
          });
        }
      } catch (e) {
        console.error("Không thể lấy thông tin Navbar:", e);
        setBizInfo(prev => ({ ...prev, name: 'Doanh nghiệp' }));
      }
    };

    fetchBizData();
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

  // Hàm tạo avatar mặc định nếu không có logo
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeLookUp(bizInfo.name)}&background=E91E63&color=fff`;

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom fixed-top shadow-sm">
      <Container fluid className="px-lg-5">
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 brand-logo">
          STU<span className="text-primary-glow">LANCE</span>
          <Badge bg="danger" className="ms-2 x-small align-middle" style={{fontSize: '10px'}}>ENTERPRISE</Badge>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="business-navbar" />
        <Navbar.Collapse id="business-navbar">
          <Nav className="mx-auto nav-links-gap">
            <Nav.Link as={Link} to="/find-students">Tìm Ứng Viên</Nav.Link>
            <Nav.Link as={Link} to="/manage-jobs">Dự Án Đã Đăng</Nav.Link>
            <Nav.Link as={Link} to="/services-list">Dịch Vụ SV</Nav.Link>
            <Nav.Link as={Link} to="/businesses/business-profile">Hồ Sơ Công Ty</Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-3">
            <div className="position-relative pointer me-2">
              <Bell size={22} className="text-white-50" />
              <span className="notification-dot"></span>
            </div>

            <NavDropdown 
              title={
                <div className="d-inline-flex align-items-center gap-2">
                  {/* HIỂN THỊ LOGO THỰC TẾ */}
                  <Image 
                    src={bizInfo.logo || defaultAvatar} 
                    roundedCircle 
                    width="34" 
                    height="34" 
                    className="border border-danger object-fit-cover"
                    onError={(e) => { e.target.src = defaultAvatar }} // Fallback nếu link ảnh lỗi
                  />
                  <div className="text-start d-none d-xl-block" style={{lineHeight: '1.2'}}>
                    {/* HIỂN THỊ TÊN CÔNG TY THỰC TẾ */}
                    <span className="small text-white d-block fw-bold text-truncate" style={{maxWidth: '120px'}}>
                        {bizInfo.name}
                    </span>
                    <span className="x-small text-muted">{bizInfo.taxCode || 'MST'}</span>
                  </div>
                </div>
              } 
              id="business-dropdown" align="end" className="user-dropdown-custom"
            >
              <div className="px-3 py-2 border-bottom border-secondary mb-1">
                 <p className="mb-0 x-small text-muted text-uppercase fw-bold">Tài khoản quản lý</p>
              </div>
              <NavDropdown.Item as={Link} to="/manage-jobs">
                <LayoutDashboard size={18} className="me-3 text-primary" /> Quản lý bài đăng
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/businesses/business-profile-settings">
                <Settings size={18} className="me-3 text-primary" /> Cài đặt hồ sơ
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payment">
                <History size={18} className="me-3 text-primary" /> Ví doanh nghiệp
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                <LogOut size={18} className="me-3" /> Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>

            <Button as={Link} to="/post-job" variant="primary" className="btn-post-nav btn-sm fw-bold px-3">
              <PlusSquare size={16} className="me-1" /> ĐĂNG TIN
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Helper để xử lý tên tiếng Việt khi gọi UI-Avatars
const encodeLookUp = (name) => encodeURIComponent(name || 'B');

export default BusinessNavbar;