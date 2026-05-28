import React from 'react';
import { Container, Row, Col, Table, Badge, Form, Button } from 'react-bootstrap';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  ShoppingCart, DollarSign, CreditCard, Users, 
  ArrowUpRight, ArrowDownRight, Settings, 
  MoreVertical, Edit2, ChevronLeft, ChevronRight, 
  Search, Bell, TrendingUp 
} from 'lucide-react';
import '../../CSS/AdminDashboard.css';

// --- DỮ LIỆU GIẢ LẬP ---
const forecastData = [
  { name: 'Jan', revenue: 100, profit: 120, order: 180 },
  { name: 'Feb', revenue: 150, profit: 130, order: 130 },
  { name: 'Mar', revenue: 120, profit: 160, order: 140 },
  { name: 'Apr', revenue: 170, profit: 150, order: 100 },
  { name: 'May', revenue: 140, profit: 210, order: 110 },
  { name: 'Jun', revenue: 150, profit: 160, order: 130 },
  { name: 'Jul', revenue: 140, profit: 140, order: 120 },
  { name: 'Aug', revenue: 180, profit: 130, order: 110 },
  { name: 'Sep', revenue: 160, profit: 170, order: 110 },
  { name: 'Oct', revenue: 180, profit: 160, order: 120 },
  { name: 'Nov', revenue: 190, profit: 150, order: 130 },
  { name: 'Dec', revenue: 210, profit: 200, order: 150 },
];

const trafficData = [
  { name: 'Jan', visits: 600, visitors: 700 },
  { name: 'Feb', visits: 700, visitors: 750 },
  { name: 'Mar', visits: 1000, visitors: 720 },
  { name: 'Apr', visits: 700, visitors: 500 },
  { name: 'May', visits: 650, visitors: 850 },
  { name: 'Jun', visits: 800, visitors: 900 },
];

// --- COMPONENT CON CHO THẺ THỐNG KÊ ---
const StatCard = ({ title, value, icon, color, trend, isUp }) => (
  <Col xl={3} md={6}>
    <div className="glass-card p-4 d-flex align-items-center gap-3 h-100">
      <div className="adm-icon-box" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div>
        <p className="text-muted x-small mb-1 fw-bold uppercase-tracking">{title}</p>
        <h4 className="text-white fw-bold mb-1">{value}</h4>
        <div className={`x-small fw-bold ${isUp ? 'text-success' : 'text-danger'}`}>
          {isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {trend} 
          <span className="text-muted fw-normal ms-1">{isUp ? '(30 days)' : 'Earning'}</span>
        </div>
      </div>
    </div>
  </Col>
);

// --- COMPONENT CHÍNH ---
const AdminDashboard = () => {
  return (
    <div className="adm-dashboard-content animate-fade-in">
      {/* 1. HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">STULance <span className="text-primary-glow">Analytics</span></h2>
        <div className="breadcrumb-adm x-small text-muted">
          Dashboard / <span className="text-primary">Analytics</span>
        </div>
      </div>

      {/* 2. 4 THẺ THỐNG KÊ TRÊN CÙNG */}
      <Row className="g-3 mb-4">
        <StatCard title="Dự án mới" value="34,567" icon={<ShoppingCart />} color="#8b5cf6" trend="+2.00%" isUp={true} />
        <StatCard title="Phí sàn thu" value="$74,567" icon={<DollarSign />} color="#10b981" trend="+5.45%" isUp={true} />
        <StatCard title="Chi phí HT" value="$24,567" icon={<CreditCard />} color="#3b82f6" trend="-2.00%" isUp={false} />
        <StatCard title="Sinh viên mới" value="34,567" icon={<Users />} color="#f59e0b" trend="-25.00%" isUp={false} />
      </Row>

      {/* 3. BIỂU ĐỒ TĂNG TRƯỞNG & TRAFFIC */}
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '10px'}} />
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
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '10px'}} />
                  <Bar dataKey="visits" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={8} />
                  <Bar dataKey="visitors" fill="#ef4444" radius={[5, 5, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>

      {/* 4. LỊCH & LỊCH SỬ DỰ ÁN */}
      <Row className="g-3">
        <Col lg={4}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="text-white fw-bold mb-0">Tháng 5, 2026</h6>
              <div className="d-flex gap-2">
                <ChevronLeft size={16} className="text-muted pointer" />
                <ChevronRight size={16} className="text-muted pointer" />
              </div>
            </div>
            <div className="calendar-grid">
               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="cal-day-head">{d}</div>)}
               {Array.from({length: 31}, (_, i) => (
                 <div key={i} className={`cal-date ${i+1 === 28 ? 'active' : ''}`}>{i+1}</div>
               ))}
            </div>
          </div>
        </Col>

        <Col lg={8}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="text-white fw-bold">Dự án hoàn thành gần đây</h5>
              <Form.Select size="sm" className="adm-select-sm"><option>Today</option></Form.Select>
            </div>
            <Table responsive variant="dark" className="admin-table-clean align-middle">
              <thead>
                <tr>
                  <th>Dự án</th>
                  <th>Chuyên mục</th>
                  <th>Ngân sách</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Website E-commerce", cat: "Web Dev", price: "$345", status: "Pending", color: "warning" },
                  { name: "Logo Branding", cat: "Design", price: "$145", status: "Refund", color: "danger" },
                  { name: "Mobile UI Kit", cat: "Design", price: "$550", status: "Completed", color: "success" },
                  { name: "AI Chatbot", cat: "AI Tech", price: "$980", status: "Canceled", color: "secondary" },
                ].map((item, i) => (
                  <tr key={i}>
                    <td><span className="small fw-bold">{item.name}</span></td>
                    <td className="text-muted small">{item.cat}</td>
                    <td className="fw-bold">{item.price}</td>
                    <td><Badge bg={item.color} className="status-badge-sm">{item.status}</Badge></td>
                    <td className="text-center"><button className="btn-icon-table"><Edit2 size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      <button className="adm-fab-settings"><Settings size={20} /></button>
    </div>
  );
};

export default AdminDashboard;