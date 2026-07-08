import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, FileText, 
  BarChart3, LogOut, Bell, Search, Settings, ShieldCheck, Briefcase, CheckCheck, Handshake
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import '../../CSS/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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
      setNotifications(list.slice(0, 10));
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

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20}/>, label: 'Tổng quan' },
    { path: '/admin/accounts', icon: <Users size={20}/>, label: 'Người dùng' },
    { path: '/admin/posts', icon: <FileText size={20}/>, label: 'Bài đăng' },
    { path: '/admin/payments', icon: <CreditCard size={20}/>, label: 'Thanh toán' },
    { path: '/admin/student-services', icon: <Briefcase size={20}/>, label: 'Dịch vụ SV' },
    { path: '/admin/contracts', icon: <Handshake size={20}/>, label: 'Hợp đồng' },
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
            {/* NOTIFICATION BELL */}
            <div className="position-relative">
              <div
                className="pointer d-flex align-items-center justify-content-center"
                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} className="text-white-50" />
                {unreadCount > 0 && (
                  <span className="position-absolute badge bg-danger rounded-pill" style={{ top: 0, right: 0, fontSize: 10, padding: '2px 6px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              {showNotifications && (
                <>
                  <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={() => setShowNotifications(false)} />
                  <div className="position-absolute" style={{ top: '100%', right: 0, width: 360, zIndex: 1050, marginTop: 8 }}>
                    <div className="shadow-lg" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)' }}>
                      <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="small fw-bold text-white">Thông báo</span>
                        {unreadCount > 0 && (
                          <button className="btn btn-link x-small p-0 text-primary fw-bold" onClick={handleMarkAllRead}>
                            <CheckCheck size={14} className="me-1" /> Đọc tất cả
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-white-50 x-small">Chưa có thông báo</div>
                        ) : notifications.map(n => (
                          <div
                            key={n.id || n.notificationId}
                            className="d-flex gap-2 px-3 py-2 pointer"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.06)', transition: '0.2s' }}
                            onClick={() => handleMarkRead(n.id || n.notificationId)}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(59,130,246,0.06)'}
                          >
                            {!n.isRead && <div className="mt-1" style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                            <div className="flex-fill" style={{ opacity: n.isRead ? 0.6 : 1 }}>
                              <p className="mb-0 small text-white" style={{ lineHeight: 1.4 }}>{n.title || n.message || 'Thông báo mới'}</p>
                              <p className="mb-0 x-small text-white-50 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <Link to="/admin/manage-reports" className="x-small text-primary text-decoration-none fw-bold" onClick={() => setShowNotifications(false)}>
                          Xem tất cả
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
