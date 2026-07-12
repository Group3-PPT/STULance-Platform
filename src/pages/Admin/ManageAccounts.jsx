import React, { useState, useEffect } from 'react';
import { Table, Badge, Form, InputGroup, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { UserCheck, UserX, Mail, Calendar, Search, Loader2, RefreshCw, Building2, GraduationCap, CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { studentService } from '../../services/studentservice';
import { enterpriseService } from '../../services/enterprise.service';
import { adminService } from '../../services/adminservice';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/ManageAccounts.css';

const STATUS_CONFIG = {
  UNVERIFIED: { color: 'secondary', icon: <HelpCircle size={12} />, label: 'Chưa xác minh' },
  PENDING: { color: 'warning', icon: <Clock size={12} />, label: 'Chờ duyệt' },
  VERIFIED: { color: 'success', icon: <CheckCircle size={12} />, label: 'Đã xác minh' },
  REJECTED: { color: 'danger', icon: <XCircle size={12} />, label: 'Bị từ chối' },
};

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [studentsRes, enterprisesRes] = await Promise.allSettled([
        studentService.getAllStudents(),
        enterpriseService.getAllEnterprises()
      ]);

      const usersList = [];

      if (studentsRes.status === 'fulfilled') {
        const students = unwrapList(studentsRes.value);
        if (Array.isArray(students)) {
          students.forEach(s => {
            usersList.push({
              id: s.studentId || s.id,
              name: s.fullName || s.studentName || 'Sinh viên',
              type: 'Sinh viên',
              email: s.email || '',
              status: s.verificationStatus || s.status || 'UNVERIFIED',
              date: new Date(s.createdAt || Date.now()).toLocaleDateString('vi-VN'),
              rawData: s
            });
          });
        }
      }

      if (enterprisesRes.status === 'fulfilled') {
        const enterprises = unwrapList(enterprisesRes.value);
        if (Array.isArray(enterprises)) {
          enterprises.forEach(e => {
            usersList.push({
              id: e.enterpriseId || e.id,
              name: e.companyName || e.enterpriseName || 'Doanh nghiệp',
              type: 'Doanh nghiệp',
              email: e.email || '',
              status: e.verificationStatus || e.status || 'UNVERIFIED',
              date: new Date(e.createdAt || Date.now()).toLocaleDateString('vi-VN'),
              rawData: e
            });
          });
        }
      }

      setUsers(usersList);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleVerify = async (user) => {
    if (!window.confirm(`Duyệt xác thực "${user.name}"?`)) return;
    try {
      if (user.type === 'Sinh viên') {
        await adminService.verifyStudent(user.id, 'VERIFIED');
      } else {
        await adminService.verifyEnterprise(user.id, 'VERIFIED');
      }
      alert("Duyệt thành công!");
      fetchUsers();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Từ chối xác thực "${user.name}"?`)) return;
    try {
      if (user.type === 'Sinh viên') {
        await adminService.verifyStudent(user.id, 'REJECTED');
      } else {
        await adminService.verifyEnterprise(user.id, 'REJECTED');
      }
      alert("Đã từ chối!");
      fetchUsers();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleResetStatus = async (user) => {
    if (!window.confirm(`Đặt lại trạng thái "${user.name}" về Chờ duyệt?`)) return;
    try {
      if (user.type === 'Sinh viên') {
        await adminService.verifyStudent(user.id, 'PENDING');
      } else {
        await adminService.verifyEnterprise(user.id, 'PENDING');
      }
      fetchUsers();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter(user => {
    const typeMatch = filterType === "Tất cả" || user.type === filterType;
    const statusMatch = filterStatus === "Tất cả" || user.status === filterStatus;
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()));
    return typeMatch && statusMatch && searchMatch;
  });

  const studentCount = users.filter(u => u.type === 'Sinh viên').length;
  const businessCount = users.filter(u => u.type === 'Doanh nghiệp').length;
  const verifiedCount = users.filter(u => u.status === 'VERIFIED').length;
  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  return (
    <div className="acc-manage-container animate-fade-in">
      <Row className="align-items-center mb-4 g-3">
        <Col md={6}>
          <h3 className="acc-title mb-0">Quản lý <span>Tài khoản</span></h3>
          <div className="d-flex gap-3 mt-2 flex-wrap">
            <span className="x-small text-white-50"><GraduationCap size={12} className="me-1"/> {studentCount} sinh viên</span>
            <span className="x-small text-white-50"><Building2 size={12} className="me-1"/> {businessCount} doanh nghiệp</span>
            <span className="x-small text-success"><CheckCircle size={12} className="me-1"/> {verifiedCount} đã xác minh</span>
            <span className="x-small text-warning"><Clock size={12} className="me-1"/> {pendingCount} chờ duyệt</span>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-md-end align-items-center flex-wrap">
            <div className="d-flex gap-1 glass-card p-1">
              {["Tất cả", "Sinh viên", "Doanh nghiệp"].map(t => (
                <button key={t} className={`post-tab-btn ${filterType === t ? 'active' : ''}`} style={{fontSize: '12px', padding: '6px 14px'}} onClick={() => setFilterType(t)}>{t}</button>
              ))}
            </div>
            <div className="d-flex gap-1 glass-card p-1">
              {["Tất cả", "UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"].map(s => (
                <button key={s} className={`post-tab-btn ${filterStatus === s ? 'active' : ''}`} style={{fontSize: '11px', padding: '5px 10px'}} onClick={() => setFilterStatus(s)}>
                  {s === "Tất cả" ? s : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>
            <InputGroup className="acc-search-group glass-card" style={{width: '220px'}}>
              <InputGroup.Text className="bg-transparent border-0 text-white-50">
                <Search size={14} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm tên, email, ID..."
                className="bg-transparent border-0 text-white shadow-none"
                style={{fontSize: '12px'}}
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
                <th>Loại</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, idx) => {
                  const st = STATUS_CONFIG[u.status] || STATUS_CONFIG.UNVERIFIED;
                  return (
                    <tr key={`${u.type}-${u.id}-${idx}`}>
                      <td className="ps-4 acc-id" style={{fontSize: '11px'}}>{u.id?.substring(0, 8)}</td>
                      <td>
                        <div className="acc-name" style={{fontSize: '13px'}}>{u.name}</div>
                        <div className="text-white-50 x-small d-flex align-items-center gap-1">
                          <Calendar size={10}/> {u.date}
                        </div>
                      </td>
                      <td>
                        <Badge bg={u.type === 'Sinh viên' ? 'info' : 'primary'} className="x-small fw-bold">
                          {u.type === 'Sinh viên' ? <GraduationCap size={10} className="me-1"/> : <Building2 size={10} className="me-1"/>}
                          {u.type}
                        </Badge>
                      </td>
                      <td>
                        <div className="small text-white-50" style={{fontSize: '12px'}}><Mail size={11} className="me-1"/>{u.email || 'N/A'}</div>
                      </td>
                      <td>
                        <Badge bg={st.color} className="d-inline-flex align-items-center gap-1 x-small">
                          {st.icon} {st.label}
                        </Badge>
                      </td>
                      <td>
                        <div className="acc-actions justify-content-center gap-1">
                          {u.status !== 'VERIFIED' && (
                            <button className="acc-btn check" title="Duyệt xác thực" onClick={() => handleVerify(u)}>
                              <UserCheck size={14}/>
                            </button>
                          )}
                          {u.status !== 'REJECTED' && (
                            <button className="acc-btn block" title="Từ chối" onClick={() => handleReject(u)}>
                              <UserX size={14}/>
                            </button>
                          )}
                          {u.status === 'REJECTED' && (
                            <button className="acc-btn" title="Đặt lại chờ duyệt" onClick={() => handleResetStatus(u)} style={{background: 'rgba(255,193,7,0.1)', color: '#ffc107'}}>
                              <RefreshCw size={14}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-white-50">
                    Không tìm thấy tài khoản nào
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
