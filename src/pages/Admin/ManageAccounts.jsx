import React, { useState, useEffect } from 'react';
import { Table, Badge, Form, InputGroup, Row, Col, Spinner } from 'react-bootstrap';
import { UserCheck, UserX, ShieldAlert, Mail, Calendar, Search, Filter, Loader2, RefreshCw, Building2, GraduationCap } from 'lucide-react';
import { adminService } from '../../services/adminservice';
import '../../CSS/ManageAccounts.css'; 

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [jobsRes, servicesRes] = await Promise.all([
        adminService.getAllJobs(),
        adminService.getAllStudentServices()
      ]);
      
      const usersMap = new Map();
      
      if (jobsRes.success && jobsRes.data) {
        jobsRes.data.forEach(job => {
          if (job.enterpriseId && !usersMap.has(job.enterpriseId)) {
            usersMap.set(job.enterpriseId, {
              id: job.enterpriseId,
              name: job.enterpriseName || 'Doanh nghiệp',
              type: 'Doanh nghiệp',
              email: 'enterprise@stulance.vn',
              status: 'Hoạt động',
              date: new Date(job.createdAt).toLocaleDateString('vi-VN'),
              icon: <Building2 size={14} className="text-info"/>
            });
          }
        });
      }
      
      if (servicesRes.success && servicesRes.data) {
        servicesRes.data.forEach(svc => {
          if (svc.studentId && !usersMap.has(svc.studentId)) {
            usersMap.set(svc.studentId, {
              id: svc.studentId,
              name: svc.studentName || 'Sinh viên',
              type: 'Sinh viên',
              email: 'student@stulance.vn',
              status: 'Hoạt động',
              date: new Date(svc.createdAt || Date.now()).toLocaleDateString('vi-VN'),
              icon: <GraduationCap size={14} className="text-primary"/>
            });
          }
        });
      }
      
      setUsers(Array.from(usersMap.values()));
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleVerify = async (user) => {
    if (!window.confirm(`Xác nhận duyệt tài khoản "${user.name}"?`)) return;
    try {
      if (user.type === 'Sinh viên') {
        await adminService.verifyStudent(user.id, 'VERIFIED');
      } else {
        await adminService.verifyEnterprise(user.id, 'VERIFIED');
      }
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi xác thực: " + (err.response?.data?.message || err.message));
    }
  };

  const handleBlock = async (user) => {
    if (!window.confirm(`Khóa tài khoản "${user.name}"?`)) return;
    try {
      if (user.type === 'Sinh viên') {
        await adminService.verifyStudent(user.id, 'BLOCKED');
      } else {
        await adminService.verifyEnterprise(user.id, 'BLOCKED');
      }
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi khóa: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter(user => {
    const typeMatch = filterType === "Tất cả" || 
      (filterType === "Sinh viên" && user.type === "Sinh viên") ||
      (filterType === "Doanh nghiệp" && user.type === "Doanh nghiệp");
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const studentCount = users.filter(u => u.type === 'Sinh viên').length;
  const businessCount = users.filter(u => u.type === 'Doanh nghiệp').length;

  return (
    <div className="acc-manage-container animate-fade-in">
      <Row className="align-items-center mb-4 g-3">
        <Col md={6}>
          <h3 className="acc-title mb-0">Quản lý <span>Tài khoản</span></h3>
          <div className="d-flex gap-3 mt-2">
            <span className="x-small text-white-50"><GraduationCap size={12} className="me-1"/> {studentCount} sinh viên</span>
            <span className="x-small text-white-50"><Building2 size={12} className="me-1"/> {businessCount} doanh nghiệp</span>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-md-end align-items-center">
            <div className="d-flex gap-1 glass-card p-1">
              {["Tất cả", "Sinh viên", "Doanh nghiệp"].map(t => (
                <button key={t} className={`post-tab-btn ${filterType === t ? 'active' : ''}`} style={{fontSize: '12px', padding: '6px 14px'}} onClick={() => setFilterType(t)}>{t}</button>
              ))}
            </div>
            <InputGroup className="acc-search-group glass-card" style={{width: '250px'}}>
              <InputGroup.Text className="bg-transparent border-0 text-white-50">
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm tên, email hoặc ID..."
                className="bg-transparent border-0 text-white shadow-none"
                style={{fontSize: '13px'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchUsers}><RefreshCw size={16}/></button>
          </div>
        </Col>
      </Row>

      <div className="acc-table-box shadow-lg">
        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
          <Table responsive variant="dark" className="acc-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Mã ID</th>
                <th>Họ tên / Đơn vị</th>
                <th>Loại tài khoản</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td className="ps-4 acc-id">{u.id?.substring(0, 8)}</td>
                    <td>
                        <div className="acc-name">{u.name}</div>
                        <div className="text-white-50 x-small d-flex align-items-center gap-1">
                            <Calendar size={10}/> {u.date}
                        </div>
                    </td>
                    <td>
                      <Badge 
                          bg={u.type === 'Sinh viên' ? 'info' : 'primary'} 
                          className={`x-small fw-bold ${u.type === 'Doanh nghiệp' ? 'badge-enterprise' : ''}`}
                      >
                        {u.icon} {u.type}
                      </Badge>
                    </td>
                    <td>
                       <div className="small text-white-50"><Mail size={12} className="me-2"/>{u.email}</div>
                    </td>
                    <td>
                      <span className={`status-pill-acc ${
                          u.status === 'Hoạt động' ? 'bg-success-glow' : 
                          u.status === 'Bị khóa' ? 'bg-danger-glow' : 'bg-warning-glow'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="acc-actions justify-content-center">
                        <button className="acc-btn check" title="Xác thực" onClick={() => handleVerify(u)}>
                            <UserCheck size={16}/>
                        </button>
                        <button className="acc-btn block" title="Khóa tài khoản" onClick={() => handleBlock(u)}>
                            <UserX size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                  <tr>
                      <td colSpan="6" className="text-center py-5 text-white-50">
                          Không tìm thấy người dùng nào khớp với từ khóa "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;
