import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge } from 'react-bootstrap';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, CreditCard, Users, Briefcase,
  ChevronLeft, ChevronRight,
  Loader2, RefreshCw, AlertTriangle, TrendingUp, ShieldCheck
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { adminService } from '../../services/adminservice';
import { contractService } from '../../services/contractservice';
import '../../CSS/AdminDashboard.css';

const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const StatCard = ({ title, value, icon, color, sub }) => (
  <Col xl={3} md={6}>
    <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
      <div className="adm-icon-box" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div className="flex-fill">
        <p className="text-white-50 x-small mb-1 fw-bold uppercase-tracking">{title}</p>
        <h4 className="text-white fw-bold mb-1">{value}</h4>
        {sub && <div className="x-small text-white-50">{sub}</div>}
      </div>
    </div>
  </Col>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentContracts, setRecentContracts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, contractsRes, ordersRes] = await Promise.allSettled([
        dashboardService.getAdminDashboard(),
        contractService.adminGetAllContracts({ pageSize: 100 }),
        adminService.getAllServiceOrders({ pageSize: 100 }),
      ]);

      if (dashRes.status === 'fulfilled') {
        const d = dashRes.value?.data || dashRes.value;
        setStats(d);
      }

      if (contractsRes.status === 'fulfilled') {
        const items = contractsRes.value?.data?.items || [];
        setRecentContracts(items);

        const now = new Date();
        const monthlyMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('vi-VN', { month: 'short' });
          monthlyMap[key] = { name: label, contracts: 0, revenue: 0, completed: 0 };
        }
        items.forEach(item => {
          const date = item.createdAt;
          if (!date) return;
          const d = new Date(date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyMap[key]) {
            monthlyMap[key].contracts++;
            if (item.status === 'COMPLETED') {
              monthlyMap[key].revenue += (item.totalBudget || item.totalAmount || 0);
              monthlyMap[key].completed++;
            }
          }
        });
        setChartData(Object.values(monthlyMap));
      }

      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value?.data || ordersRes.value;
        setRecentOrders(d?.items || []);
      }
    } catch (err) {
      console.error("Lỗi tải dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const renderStatusBadge = (status) => {
    const map = {
      'IN_PROGRESS': { bg: 'primary', text: 'Đang thực hiện' },
      'SIGNING': { bg: 'info', text: 'Ký kết' },
      'DELIVERED': { bg: 'info', text: 'Đã giao' },
      'COMPLETED': { bg: 'success', text: 'Hoàn thành' },
      'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
      'DISPUTED': { bg: 'danger', text: 'Tranh chấp' },
      'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
      'ACCEPTED': { bg: 'primary', text: 'Đã chấp nhận' },
      'REJECTED': { bg: 'danger', text: 'Bị từ chối' },
      'OPEN': { bg: 'success', text: 'Đang mở' },
      'BLOCKED': { bg: 'danger', text: 'Bị khóa' },
    };
    const s = map[status] || { bg: 'secondary', text: status };
    return <Badge bg={s.bg} className="status-badge-sm">{s.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="adm-dashboard-content animate-fade-in text-center py-5">
        <Loader2 className="spinner text-primary" size={40} />
      </div>
    );
  }

  const s = stats || {};

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };
  const selectDate = (day) => {
    setSelectedDate(new Date(calendarYear, calendarMonth, day));
  };
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const allActivity = [
    ...recentContracts.map(c => ({
      type: 'Hợp đồng',
      detail: `${c.clientName || c.enterpriseName || 'N/A'} → ${c.providerName || c.studentName || 'N/A'}`,
      amount: c.totalBudget || c.totalAmount || 0,
      status: c.status,
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : 'N/A',
      sortDate: new Date(c.createdAt || 0),
    })),
    ...recentOrders.map(o => ({
      type: 'Đơn hàng DV',
      detail: `${o.buyerName || 'N/A'} → ${o.sellerName || 'N/A'}`,
      amount: o.totalBudget || o.totalAmount || 0,
      status: o.status,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'N/A',
      sortDate: new Date(o.createdAt || 0),
    })),
  ].sort((a, b) => b.sortDate - a.sortDate);

  const recentActivity = selectedDate
    ? allActivity.filter(item => isSameDay(item.sortDate, selectedDate))
    : allActivity.slice(0, 10);

  const dayActivityCount = (day) => {
    const d = new Date(calendarYear, calendarMonth, day);
    return allActivity.filter(item => isSameDay(item.sortDate, d)).length;
  };

  const pieData = [
    { name: 'Đang thực hiện', value: s.activeContracts || 0 },
    { name: 'Đã phát hành', value: s.openJobs || 0 },
    { name: 'Chờ duyệt', value: s.pendingJobs || 0 },
    { name: 'Tranh chấp', value: s.disputedContracts || 0 },
  ].filter(d => d.value > 0);

  const rolePieData = [
    { name: 'Sinh viên', value: s.totalStudents || 0 },
    { name: 'Doanh nghiệp', value: s.totalEnterprises || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="adm-dashboard-content animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">STULance <span className="text-primary-glow">Analytics</span></h2>
        <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchAll}><RefreshCw size={18} /></button>
      </div>

      <Row className="g-3 mb-4">
        <StatCard title="Người dùng" value={s.totalUsers || 0} icon={<Users />} color="#f59e0b"
          sub={`${s.totalStudents || 0} SV · ${s.totalEnterprises || 0} DN`} />
        <StatCard title="Bài đăng việc làm" value={s.openJobs || 0} icon={<Briefcase />} color="#8b5cf6"
          sub={s.pendingJobs > 0 ? `${s.pendingJobs} chờ duyệt` : 'Đã xử lý hết'} />
        <StatCard title="Hợp đồng hoạt động" value={s.activeContracts || 0} icon={<CreditCard />} color="#3b82f6"
          sub={s.disputedContracts > 0 ? `${s.disputedContracts} tranh chấp` : 'Không có tranh chấp'} />
        <StatCard title="Báo cáo chờ xử lý" value={s.pendingReports || 0} icon={<AlertTriangle />} color="#ef4444"
          sub={s.pendingWithdrawals > 0 ? `${s.pendingWithdrawals} chờ rút tiền` : 'Không chờ rút tiền'} />
      </Row>

      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <DollarSign size={14} className="text-primary" />
              <p className="text-white-50 x-small mb-0 fw-bold uppercase-tracking">TỔNG GIAO DỊCH</p>
            </div>
            <h4 className="text-primary-glow fw-bold mb-0">{formatMoney(s.totalContractPaymentVolume)}</h4>
          </div>
        </Col>
        <Col xl={3} md={6}>
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-success" />
              <p className="text-white-50 x-small mb-0 fw-bold uppercase-tracking">PHÍ HỆ THỐNG</p>
            </div>
            <h4 className="text-success fw-bold mb-0">{formatMoney(s.totalSystemFees)}</h4>
          </div>
        </Col>
        <Col xl={3} md={6}>
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-info" />
              <p className="text-white-50 x-small mb-0 fw-bold uppercase-tracking">ĐÃ GIẢI PHÓNG</p>
            </div>
            <h4 className="text-info fw-bold mb-0">{formatMoney(s.totalReleasedAmount)}</h4>
          </div>
        </Col>
        <Col xl={3} md={6}>
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <CreditCard size={14} className="text-warning" />
              <p className="text-white-50 x-small mb-0 fw-bold uppercase-tracking">ĐÃ RÚT</p>
            </div>
            <h4 className="text-warning fw-bold mb-0">{formatMoney(s.totalWithdrawnAmount)}</h4>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Giao dịch 6 tháng gần đây</h5>
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [
                  { name: 'T1', contracts: 0, revenue: 0 },
                  { name: 'T2', contracts: 0, revenue: 0 },
                  { name: 'T3', contracts: 0, revenue: 0 },
                  { name: 'T4', contracts: 0, revenue: 0 },
                  { name: 'T5', contracts: 0, revenue: 0 },
                  { name: 'T6', contracts: 0, revenue: 0 },
                ]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }} />
                  <Area type="monotone" dataKey="contracts" stroke="#a855f7" strokeWidth={2} fill="transparent" name="Hợp đồng" />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenue)" name="Doanh thu" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="transparent" name="Hoàn thành" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Phân bổ hệ thống</h5>
            {pieData.length > 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                      paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11} fill="rgba(255,255,255,0.7)">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-white-50 small">Chưa có dữ liệu</div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={5}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Người dùng theo vai trò</h5>
            {rolePieData.length > 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 260, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11} fill="rgba(255,255,255,0.7)">
                      {rolePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-white-50 small">Chưa có dữ liệu</div>
            )}
          </div>
        </Col>
        <Col lg={7}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Hợp đồng theo tháng</h5>
            <div style={{ width: '100%', height: 260, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length > 0 ? chartData : [
                  { name: 'T1', contracts: 0, completed: 0 },
                  { name: 'T2', contracts: 0, completed: 0 },
                  { name: 'T3', contracts: 0, completed: 0 },
                  { name: 'T4', contracts: 0, completed: 0 },
                  { name: 'T5', contracts: 0, completed: 0 },
                  { name: 'T6', contracts: 0, completed: 0 },
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="contracts" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={12} name="Tổng hợp đồng" />
                  <Bar dataKey="completed" fill="#10b981" radius={[5, 5, 0, 0]} barSize={12} name="Hoàn thành" />
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
              <h6 className="text-white fw-bold mb-0">{monthNames[calendarMonth]}, {calendarYear}</h6>
              <div className="d-flex gap-2">
                <ChevronLeft size={16} className="text-white-50 pointer" onClick={prevMonth} style={{ cursor: 'pointer' }} />
                <ChevronRight size={16} className="text-white-50 pointer" onClick={nextMonth} style={{ cursor: 'pointer' }} />
              </div>
            </div>
            <div className="calendar-grid">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="cal-day-head">{d}</div>)}
              {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isSelected = selectedDate && isSameDay(selectedDate, new Date(calendarYear, calendarMonth, day));
                const isToday = isSameDay(new Date(), new Date(calendarYear, calendarMonth, day));
                const count = dayActivityCount(day);
                return (
                  <div key={day}
                    className={`cal-date ${isSelected ? 'active' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                    onClick={() => selectDate(day)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    {day}
                    {count > 0 && <span className="cal-dot" />}
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-3 pt-3 border-top border-secondary text-center">
                <button className="btn btn-sm btn-outline-primary fw-bold"
                  onClick={() => setSelectedDate(null)}>
                  Hiển thị tất cả
                </button>
              </div>
            )}
          </div>
        </Col>

        <Col lg={8}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">
                {selectedDate
                  ? `Hoạt động ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
                  : 'Hoạt động gần đây'}
              </h5>
              {selectedDate && recentActivity.length > 0 && (
                <Badge bg="primary" className="px-3 py-2">{recentActivity.length} hoạt động</Badge>
              )}
            </div>
            <Table responsive variant="dark" className="admin-table-clean align-middle">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Chi tiết</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, i) => (
                  <tr key={i}>
                    <td><span className="small fw-bold">{item.type}</span></td>
                    <td className="text-white-50 small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</td>
                    <td className="small fw-bold text-primary-glow">{formatMoney(item.amount)}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td className="text-white-50 small">{item.date}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-4 text-white-50">
                    {selectedDate ? 'Không có hoạt động nào trong ngày này.' : 'Chưa có hoạt động nào.'}
                  </td></tr>
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
