import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, FileText, 
  BarChart3, LogOut, Bell, Search, Settings, ShieldCheck, Briefcase
} from 'lucide-react';
import '../../CSS/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20}/>, label: 'Tổng quan' },
    { path: '/admin/accounts', icon: <Users size={20}/>, label: 'Người dùng' },
    { path: '/admin/posts', icon: <FileText size={20}/>, label: 'Bài đăng' },
    { path: '/admin/payments', icon: <CreditCard size={20}/>, label: 'Thanh toán' },
    { path: '/admin/student-services', icon: <Briefcase size={20}/>, label: 'Dịch vụ SV' },
    { path: '/admin/manage-reports', icon: <BarChart3 size={20}/>, label: 'Tố cáo' },
    { path: '/admin/skills', icon: <ShieldCheck size={20}/>, label: 'Kỹ năng' },
    { path: '/admin/reports', icon: <BarChart3 size={20}/>, label: 'Báo cáo' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="adm-container">
      <aside className="adm-sidebar">
        <div className="adm-logo-section">
          <Link to="/" className="text-decoration-none">
            <h4 className="fw-bold text-white mb-0">STU<span className="text-primary-glow">LANCE</span></h4>
          </Link>
          <div className="adm-tag mt-1">ADMIN</div>
        </div>

        <nav className="adm-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`adm-nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <div className="d-flex align-items-center gap-3">
                {item.icon}
                <span className="adm-nav-text">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-nav-link">
            <LogOut size={20}/> <span className="adm-nav-text">Đăng xuất</span>
          </Link>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar d-flex justify-content-between align-items-center px-4">
          <div className="adm-search-wrapper d-none d-md-flex">
            <Search size={18} className="text-white-50" />
            <input type="text" placeholder="Tìm kiếm nhanh..." />
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="position-relative pointer">
              <Bell size={20} className="text-white-50" />
              <span className="adm-dot"></span>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-lg-block">
                <p className="adm-admin-name mb-0">Admin</p>
                <p className="adm-admin-role mb-0">Super Admin</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
                alt="avatar" 
                className="adm-avatar-img" 
              />
            </div>
          </div>
        </header>

        <section className="p-4" style={{flex: 1, overflowY: 'auto'}}>
            <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
