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
    // ĐỔI 'token' THÀNH 'accessToken' Ở ĐÂY
    const token = localStorage.getItem('accessToken'); 
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
    console.log("Navbar check - Token:", token ? "Exist" : "Empty");
    console.log("Navbar check - Current Role:", role);
}, [location]); // Chạy lại khi chuyển từ trang /login sang trang dashboard

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