import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, FileText, 
  BarChart3, LogOut, Bell, Search, Settings, ShieldCheck
} from 'lucide-react';
import { Badge } from 'react-bootstrap';
import '../../CSS/AdminLayout.css'; // File CSS tách riêng

const AdminLayout = () => {
  const location = useLocation();

  // Danh sách các mục menu điều hướng bên trái
  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20}/>, label: 'Tổng quan' },
    { path: '/admin/accounts', icon: <Users size={20}/>, label: 'Người dùng' },
    { path: '/admin/posts', icon: <FileText size={20}/>, label: 'Bài đăng' },
    { path: '/admin/payments', icon: <CreditCard size={20}/>, label: 'Thanh toán' },
    { path: '/admin/reports', icon: <BarChart3 size={20}/>, label: 'Báo cáo' },
    { path: '/admin/manage-reports', icon: <BarChart3 size={20}/>, label: 'Quản lý báo cáo' },
    { path: '/admin/skills', icon: <ShieldCheck size={20}/>, label: 'Quản lý kỹ năng' },


  ];

  return (
    <div className="adm-container">
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <aside className="adm-sidebar">
        <div className="adm-logo-section">
          <Link to="/" className="text-decoration-none">
            <h4 className="fw-bold text-white mb-0">STU<span className="text-primary-glow">LANCE</span></h4>
          </Link>
          <div className="adm-tag mt-1">ADMIN CONTROL</div>
        </div>

        <nav className="adm-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`adm-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="d-flex align-items-center gap-3">
                {item.icon}
                <span className="adm-nav-text">{item.label}</span>
              </div>
              {item.label === 'Báo cáo' && <span className="adm-pro-badge">Hot</span>}
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-nav-link text-muted mb-2 pointer">
            <Settings size={20}/> <span className="adm-nav-text">Cài đặt</span>
          </div>
          <Link to="/" className="adm-nav-link adm-logout-btn">
            <LogOut size={20}/> <span className="adm-nav-text">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="adm-main">
        {/* Top Header nội bộ */}
        <header className="adm-topbar d-flex justify-content-between align-items-center px-4">
          <div className="adm-search-wrapper d-none d-md-flex">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Tìm kiếm nhanh hệ thống..." />
          </div>

          <div className="adm-user-actions d-flex align-items-center gap-4">
            <div className="adm-icon-notify position-relative pointer">
              <Bell size={20} className="text-muted" />
              <span className="adm-dot"></span>
            </div>
            
            <div className="adm-profile-pill d-flex align-items-center gap-3">
              <div className="text-end d-none d-lg-block">
                <p className="adm-admin-name">Lê Trung Hiếu</p>
                <p className="adm-admin-role">Super Admin</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
                alt="avatar" 
                className="adm-avatar-img shadow" 
              />
            </div>
          </div>
        </header>

        {/* Nơi hiển thị các trang Dashboard, Accounts, Posts... */}
        <section className="adm-content-wrapper p-4">
            <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;