import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { UserCheck, UserX, Mail, Calendar, Search, Loader2, RefreshCw, Building2, GraduationCap, CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { userService } from '../../services/userservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManageAccounts.css';

const STATUS_CONFIG = {
  UNVERIFIED: { color: 'secondary', icon: <HelpCircle size={12} />, label: 'Chưa xác minh' },
  PENDING: { color: 'warning', icon: <Clock size={12} />, label: 'Chờ duyệt' },
  ACTIVE: { color: 'success', icon: <CheckCircle size={12} />, label: 'Đã xác minh' },
  VERIFIED: { color: 'success', icon: <CheckCircle size={12} />, label: 'Đã xác minh' },
  INACTIVE: { color: 'danger', icon: <XCircle size={12} />, label: 'Bị khóa' },
  REJECTED: { color: 'danger', icon: <XCircle size={12} />, label: 'Bị từ chối' },
};

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const pageSize = 20;

  const fetchUsers = useCallback(async (page = 1, keyword = '', status = '', type = '') => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;

      const res = await userService.adminGetAllUsers(params);
      const data = res.data || res;
      const items = data.items || [];

      let studentCnt = 0;
      let businessCnt = 0;
      const usersList = items.map(u => {
        const role = (u.roles && u.roles[0]) || '';
        const isStudent = role === 'STUDENT';
        const isEnterprise = role === 'ENTERPRISE' || role === 'BUSINESS';
        if (isStudent) studentCnt++;
        if (isEnterprise) businessCnt++;
        return {
          id: u.userId,
          name: u.fullName || u.displayName || u.email?.split('@')[0] || 'N/A',
          type: isEnterprise ? 'Doanh nghiệp' : 'Sinh viên',
          email: u.email || '',
          status: u.status || 'UNVERIFIED',
          date: new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN'),
          rawData: u
        };
      }).filter(u => {
        if (type === 'Sinh viên' && u.type !== 'Sinh viên') return false;
        if (type === 'Doanh nghiệp' && u.type !== 'Doanh nghiệp') return false;
        return true;
      });

      setUsers(usersList);
      setStudentCount(studentCnt);
      setBusinessCount(businessCnt);
      setVerifiedCount(usersList.filter(u => u.status === 'ACTIVE' || u.status === 'VERIFIED').length);
      setPendingCount(usersList.filter(u => u.status === 'PENDING').length);
      setTotalItems(data.totalItems || items.length);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || page);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleVerify = async (user) => {
    if (!window.confirm(`Duyệt xác thực "${user.name}"?`)) return;
    try {
      await userService.adminUpdateUserStatus(user.id, 'ACTIVE', 'Approved by admin');
      alert("Duyệt thành công!");
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Từ chối xác thực "${user.name}"?`)) return;
    try {
      await userService.adminUpdateUserStatus(user.id, 'REJECTED', 'Rejected by admin');
      alert("Đã từ chối!");
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleResetStatus = async (user) => {
    if (!window.confirm(`Đặt lại trạng thái "${user.name}" về Chờ duyệt?`)) return;
    try {
      await userService.adminUpdateUserStatus(user.id, 'PENDING', 'Reset by admin');
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, type);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, status === 'Tất cả' ? '' : status, filterType);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
  };

  const filteredUsers = users;

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
                <button key={t} className={`post-tab-btn ${filterType === t ? 'active' : ''}`} style={{fontSize: '12px', padding: '6px 14px'}} onClick={() => handleFilterTypeChange(t)}>{t}</button>
              ))}
            </div>
            <div className="d-flex gap-1 glass-card p-1">
              {["Tất cả", "UNVERIFIED", "PENDING", "ACTIVE", "INACTIVE"].map(s => (
                <button key={s} className={`post-tab-btn ${filterStatus === s ? 'active' : ''}`} style={{fontSize: '11px', padding: '5px 10px'}} onClick={() => handleFilterStatusChange(s)}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </InputGroup>
            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={handleSearch}><RefreshCw size={16}/></button>
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
                          {(u.status !== 'ACTIVE' && u.status !== 'VERIFIED') && (
                            <button className="acc-btn check" title="Duyệt xác thực" onClick={() => handleVerify(u)}>
                              <UserCheck size={14}/>
                            </button>
                          )}
                          {u.status !== 'REJECTED' && u.status !== 'INACTIVE' && (
                            <button className="acc-btn block" title="Từ chối" onClick={() => handleReject(u)}>
                              <UserX size={14}/>
                            </button>
                          )}
                          {(u.status === 'REJECTED' || u.status === 'INACTIVE') && (
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

      <div className="mt-3">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ManageAccounts;
