import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, Users, Briefcase, FileBarChart, Loader2, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminservice';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/AdminReports.css';

const AdminReports = () => {
  const [stats, setStats] = useState({ jobs: 0, services: 0, contracts: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, servicesRes, contractsRes, ordersRes] = await Promise.all([
        adminService.getAllJobs(),
        adminService.getAllStudentServices(),
        adminService.getAllContracts(),
        adminService.getAllServiceOrders()
      ]);

      setStats({
        jobs: unwrapList(jobsRes).length,
        services: unwrapList(servicesRes).length,
        contracts: unwrapList(contractsRes).length,
        orders: unwrapList(ordersRes).length
      });
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const growthData = [
    { name: 'Tháng 1', users: 400, jobs: stats.jobs * 0.3 },
    { name: 'Tháng 2', users: 700, jobs: stats.jobs * 0.5 },
    { name: 'Tháng 3', users: 1200, jobs: stats.jobs * 0.7 },
    { name: 'Tháng 4', users: 1500, jobs: stats.jobs * 0.85 },
    { name: 'Tháng 5', users: 2100, jobs: stats.jobs },
  ];

  const jobDistribution = [
    { name: 'Việc làm', value: stats.jobs, color: '#3b82f6' },
    { name: 'Dịch vụ', value: stats.services, color: '#f59e0b' },
  ];

  const uniEngagement = [
    { name: 'HUST', projects: Math.round(stats.jobs * 0.3) },
    { name: 'NEU', projects: Math.round(stats.jobs * 0.22) },
    { name: 'FPT', projects: Math.round(stats.jobs * 0.28) },
    { name: 'UEH', projects: Math.round(stats.jobs * 0.2) },
  ];

  if (loading) {
    return (
      <div className="rep-container animate-fade-in text-center py-5">
        <Loader2 className="spinner text-primary" size={40}/>
      </div>
    );
  }

  return (
    <div className="rep-container animate-fade-in">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="rep-title text-white fw-bold">Báo cáo <span>Thống kê tổng quát</span></h2>
          <p className="text-white-50 small">Phân tích chuyên sâu dữ liệu hệ thống.</p>
        </div>
        <div className="d-flex gap-2">
            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchData}><RefreshCw size={18}/></button>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="d-flex justify-content-between mb-4">
            <h5 className="text-white fw-bold">Tăng trưởng Hệ thống</h5>
            <div className="d-flex gap-4">
                <div className="small d-flex align-items-center gap-2 text-primary">● <span className="text-white-50">Việc làm</span></div>
                <div className="small d-flex align-items-center gap-2 text-info">● <span className="text-white-50">Dịch vụ</span></div>
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
              <Area type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={5}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Phân bổ loại hình</h5>
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

        <Col lg={7}>
          <div className="glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Dự án theo Trường học</h5>
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

      <div className="mt-5 p-4 glass-card border-primary-glow d-flex justify-content-around text-center flex-wrap gap-4">
        <div>
            <p className="small text-white-50 mb-1">Tổng bài đăng</p>
            <h3 className="text-white fw-bold mb-0">{stats.jobs}</h3>
        </div>
        <div className="vr d-none d-md-block" style={{background: 'rgba(255,255,255,0.08)'}}></div>
        <div>
            <p className="small text-white-50 mb-1">Tổng dịch vụ</p>
            <h3 className="text-white fw-bold mb-0">{stats.services}</h3>
        </div>
        <div className="vr d-none d-md-block" style={{background: 'rgba(255,255,255,0.08)'}}></div>
        <div>
            <p className="small text-white-50 mb-1">Hợp đồng</p>
            <h3 className="text-primary-glow fw-bold mb-0">{stats.contracts}</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
