import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, Users, Briefcase, FileBarChart } from 'lucide-react';
import '../../CSS/AdminReports.css';

const AdminReports = () => {
  // Dữ liệu 1: Tăng trưởng doanh thu & người dùng
  const growthData = [
    { name: 'Tháng 1', users: 400, revenue: 2400 },
    { name: 'Tháng 2', users: 700, revenue: 3500 },
    { name: 'Tháng 3', users: 1200, revenue: 6800 },
    { name: 'Tháng 4', users: 1500, revenue: 5900 },
    { name: 'Tháng 5', users: 2100, revenue: 9200 },
  ];

  // Dữ liệu 2: Phân bổ loại hình công việc
  const jobDistribution = [
    { name: 'Lương tháng', value: 65, color: '#3b82f6' },
    { name: 'Theo dự án', value: 35, color: '#f59e0b' },
  ];

  // Dữ liệu 3: Top trường đại học năng động nhất
  const uniEngagement = [
    { name: 'HUST', projects: 450 },
    { name: 'NEU', projects: 320 },
    { name: 'FPT', projects: 580 },
    { name: 'UEH', projects: 290 },
  ];

  return (
    <div className="rep-container animate-fade-in">
      {/* HEADER BÁO CÁO */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="rep-title text-white fw-bold">Báo cáo <span>Thống kê tổng quát</span></h2>
          <p className="text-muted small">Phân tích chuyên sâu dữ liệu hệ thống năm 2026.</p>
        </div>
        <div className="d-flex gap-2">
            <Button variant="outline-primary" className="d-flex align-items-center gap-2">
                <Calendar size={18} /> Khoảng thời gian
            </Button>
            <Button variant="primary" className="d-flex align-items-center gap-2 shadow-glow">
                <Download size={18} /> Xuất báo cáo (PDF)
            </Button>
        </div>
      </div>

      {/* BIỂU ĐỒ TỔNG QUAN (CHIẾM HÀNG ĐẦU) */}
      <div className="glass-card p-4 mb-4">
        <div className="d-flex justify-content-between mb-4">
            <h5 className="text-white fw-bold">Tăng trưởng Doanh thu & Người dùng</h5>
            <div className="d-flex gap-4">
                <div className="small d-flex align-items-center gap-2 text-primary">● <span className="text-muted">Doanh thu</span></div>
                <div className="small d-flex align-items-center gap-2 text-info">● <span className="text-muted">Người dùng</span></div>
            </div>
        </div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
              <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Row className="g-4">
        {/* BIỂU ĐỒ TRÒN: PHÂN BỔ CÔNG VIỆC */}
        <Col lg={5}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Loại hình công việc (%)</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={jobDistribution}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jobDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* BIỂU ĐỒ CỘT: TRƯỜNG LIÊN KẾT */}
        <Col lg={7}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Số lượng dự án theo Trường học</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={uniEngagement}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="projects" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>

      {/* FOOTER STATS */}
      <div className="mt-5 p-4 glass-card border-primary-glow d-flex justify-content-around text-center flex-wrap gap-4">
        <div>
            <p className="small text-muted mb-1">Tỷ lệ hoàn thành task</p>
            <h3 className="text-white fw-bold mb-0">94.2%</h3>
        </div>
        <div className="vr d-none d-md-block opacity-25"></div>
        <div>
            <p className="small text-muted mb-1">Thời gian duyệt bài TB</p>
            <h3 className="text-white fw-bold mb-0">45 phút</h3>
        </div>
        <div className="vr d-none d-md-block opacity-25"></div>
        <div>
            <p className="small text-muted mb-1">Điểm uy tín hệ thống</p>
            <h3 className="text-primary-glow fw-bold mb-0">4.9/5</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;