import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Badge, Form, Spinner } from 'react-bootstrap';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  ShoppingCart, DollarSign, CreditCard, Users,
  ArrowUpRight, ArrowDownRight,
  ChevronLeft, ChevronRight,
  TrendingUp, Loader2, RefreshCw, Briefcase, FileText
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import '../../CSS/AdminDashboard.css';

const StatCard = ({ title, value, icon, color, trend, isUp }) => (
  <Col xl={3} md={6}>
    <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
      <div className="adm-icon-box" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div>
        <p className="text-white-50 x-small mb-1 fw-bold uppercase-tracking">{title}</p>
        <h4 className="text-white fw-bold mb-1">{value}</h4>
        <div className={`x-small fw-bold ${isUp ? 'text-success' : 'text-danger'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {trend}
          <span className="text-white-50 fw-normal ms-1">(30 days)</span>
        </div>
      </div>
    </div>
  </Col>
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getAdminDashboard();
      console.log("Admin dashboard response:", res);
      // Handle different API response structures
      setDashboard(res?.data || res || null);
    } catch (err) {
      console.error("Lỗi tải admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = dashboard?.overview || {};
  const recentActivity = dashboard?.recentActivity || [];
  const monthlyData = dashboard?.monthlyData || [];

  const forecastData = monthlyData.length > 0 ? monthlyData.map(m => ({
    name: m.month || m.name,
    revenue: m.revenue || 0,
    profit: m.profit || 0,
    order: m.orders || 0
  })) : [
    { name: 'Jan', revenue: 100, profit: 120, order: 180 },
    { name: 'Feb', revenue: 150, profit: 130, order: 130 },
    { name: 'Mar', revenue: 120, profit: 160, order: 140 },
    { name: 'Apr', revenue: 170, profit: 150, order: 100 },
    { name: 'May', revenue: 140, profit: 210, order: 110 },
    { name: 'Jun', revenue: 150, profit: 160, order: 130 },
  ];

  const trafficData = dashboard?.traffic || [
    { name: 'Jan', visits: 600, visitors: 700 },
    { name: 'Feb', visits: 700, visitors: 750 },
    { name: 'Mar', visits: 1000, visitors: 720 },
    { name: 'Apr', visits: 700, visitors: 500 },
    { name: 'May', visits: 650, visitors: 850 },
    { name: 'Jun', visits: 800, visitors: 900 },
  ];

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <Badge bg="success" className="status-badge-sm">Active</Badge>;
      case 'ACTIVE': return <Badge bg="success" className="status-badge-sm">Active</Badge>;
      case 'PENDING': return <Badge bg="warning" className="status-badge-sm text-dark">Pending</Badge>;
      case 'BLOCKED': return <Badge bg="danger" className="status-badge-sm">Blocked</Badge>;
      case 'COMPLETED': return <Badge bg="info" className="status-badge-sm">Completed</Badge>;
      default: return <Badge bg="secondary" className="status-badge-sm">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="adm-dashboard-content animate-fade-in text-center py-5">
        <Loader2 className="spinner text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="adm-dashboard-content animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">STULance <span className="text-primary-glow">Analytics</span></h2>
        <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchData}><RefreshCw size={18} /></button>
      </div>

      <Row className="g-3 mb-4">
        <StatCard title="Bài đăng việc làm" value={stats.totalJobs || 0} icon={<Briefcase />} color="#8b5cf6" trend="+12%" isUp={true} />
        <StatCard title="Dịch vụ sinh viên" value={stats.totalServices || 0} icon={<FileText />} color="#10b981" trend="+8%" isUp={true} />
        <StatCard title="Hợp đồng" value={stats.totalContracts || 0} icon={<CreditCard />} color="#3b82f6" trend="+5%" isUp={true} />
        <StatCard title="Người dùng" value={stats.totalUsers || 0} icon={<Users />} color="#f59e0b" trend="+15%" isUp={true} />
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="text-white fw-bold">Dự báo doanh thu</h5>
              <Form.Select size="sm" className="adm-select-sm"><option>Last Month</option></Form.Select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px' }} />
                  <Area type="monotone" dataKey="profit" stroke="#a855f7" strokeWidth={3} fill="transparent" />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorBlue)" />
                  <Area type="monotone" dataKey="order" stroke="#f59e0b" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="text-white fw-bold">Lưu lượng truy cập</h5>
              <Form.Select size="sm" className="adm-select-sm"><option>Last 6 Months</option></Form.Select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={trafficData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px' }} />
                  <Bar dataKey="visits" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={8} />
                  <Bar dataKey="visitors" fill="#ef4444" radius={[5, 5, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="text-white fw-bold mb-0">Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</h6>
              <div className="d-flex gap-2">
                <ChevronLeft size={16} className="text-white-50 pointer" />
                <ChevronRight size={16} className="text-white-50 pointer" />
              </div>
            </div>
            <div className="calendar-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="cal-day-head">{d}</div>)}
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className={`cal-date ${i + 1 === new Date().getDate() ? 'active' : ''}`}>{i + 1}</div>
              ))}
            </div>
          </div>
        </Col>

        <Col lg={8}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="text-white fw-bold">Hoạt động gần đây</h5>
            </div>
            <Table responsive variant="dark" className="admin-table-clean align-middle">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Chi tiết</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, i) => (
                  <tr key={i}>
                    <td><span className="small fw-bold">{item.type || 'N/A'}</span></td>
                    <td className="text-white-50 small">{item.detail || item.name || 'N/A'}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td className="text-white-50 small">{item.date || 'N/A'}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-4 text-white-50">Chưa có hoạt động nào.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
