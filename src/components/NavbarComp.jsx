import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import BusinessNavbar from './BusinessNavbar';
import AuthNavbar from './AuthNavbar';

const NavbarComp = () => {
  const location = useLocation(); // Hook quan trọng để theo dõi chuyển trang
  
  // State quản lý trạng thái đăng nhập
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    userRole: null
  });

  // TỰ ĐỘNG CHẠY MỖI KHI URL THAY ĐỔI
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
      setAuth({
        isLoggedIn: true,
        userRole: role
      });
    } else {
      setAuth({
        isLoggedIn: false,
        userRole: null
      });
    }
    // Log để kiểm tra thực tế (F12)
    console.log("Navbar check - Current Role in Storage:", role);
  }, [location]); // useEffect sẽ chạy lại mỗi khi bấm chuyển trang (sau khi Login xong)

  // ĐỊNH NGHĨA CÁC MÃ ROLE (Khớp với Swagger của bạn)
  const ROLE_STUDENT = 'odl1dDNm';   // Hoặc 'STUDENT'
  const ROLE_ENTERPRISE = 'Jx7ze2Kd'; // Hoặc 'ENTERPRISE'

  // 1. Nếu chưa đăng nhập -> Hiện Navbar cho khách
  if (!auth.isLoggedIn) {
    return <AuthNavbar />;
  }

  // 2. Nếu đã đăng nhập -> Dùng Switch để đổi giao diện
  // Lưu ý: So sánh cả mã ID và Tên chữ in hoa để phòng hờ API trả về khác nhau
  switch (auth.userRole) {
    case ROLE_STUDENT:
    case 'STUDENT':
      return <StudentNavbar />;

    case ROLE_ENTERPRISE:
    case 'ENTERPRISE':
      return <BusinessNavbar />;

    default:
      // Nếu có token nhưng role không khớp, quay về Navbar khách
      return <AuthNavbar />;
  }
};

export default NavbarComp;