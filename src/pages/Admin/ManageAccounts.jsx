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
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách người dùng
  const [users, setUsers] = useState([]);

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Bộ lọc loại tài khoản
  const [filterType, setFilterType] = useState("Tất cả");

  // bộ lọc tên tài khoản
 const  [filterName, setFilterName] = useState("Tất cả");
  // Bộ lọc trạng thái
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  // ============================================================
  // PHÂN TRANG
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ============================================================
  // THỐNG KÊ
  // ============================================================
  const [studentCount, setStudentCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const pageSize = 20;

  // ============================================================
  // HÀM TẢI DỮ LIỆU
  // ============================================================
  const fetchUsers = useCallback(async function (page, keyword, status, type) {
    if (!page) page = 1;
    if (!keyword) keyword = '';
    if (!status) status = '';
    if (!type) type = '';

    setLoading(true);

    try {
      var params = { page: page, pageSize: pageSize };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;

      var res = await userService.adminGetAllUsers(params);
      var data = res.data || res;
      var items = data.items || [];

      // Đếm số lượng sinh viên và doanh nghiệp
      var studentCnt = 0;
      var businessCnt = 0;

      // Chuyển đổi dữ liệu
      var usersList = [];
      for (var i = 0; i < items.length; i++) {
        var u = items[i];
        var role = (u.roles && u.roles.length > 0) ? u.roles[0] : '';
        var isStudent = role === 'STUDENT';
        var isEnterprise = role === 'ENTERPRISE' || role === 'BUSINESS';

        if (isStudent) studentCnt++;
        if (isEnterprise) businessCnt++;

        var name = 'N/A';
        if (u.fullName) name = u.fullName;
        else if (u.displayName) name = u.displayName;
        else if (u.email) name = u.email.split('@')[0];

        usersList.push({
          id: u.userId,
          name: name,
          type: isEnterprise ? 'Doanh nghiệp' : 'Sinh viên',
          email: u.email || '',
          status: u.status || 'UNVERIFIED',
          date: new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN'),
          rawData: u
        });
      }

      // Lọc theo loại (client-side)
      var filteredList = usersList;
      if (type === 'Sinh viên') {
        filteredList = usersList.filter(function (u) { return u.type === 'Sinh viên'; });
      } else if (type === 'Doanh nghiệp') {
        filteredList = usersList.filter(function (u) { return u.type === 'Doanh nghiệp'; });
      }

      setUsers(filteredList);
      setStudentCount(studentCnt);
      setBusinessCount(businessCnt);
      setVerifiedCount(filteredList.filter(function (u) { return u.status === 'ACTIVE' || u.status === 'VERIFIED'; }).length);
      setPendingCount(filteredList.filter(function (u) { return u.status === 'PENDING'; }).length);
      setTotalItems(data.totalItems || items.length);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || page);

    } catch (err) {
      console.error("Lỗi tải danh sách:", err);

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // EFFECT: Tải dữ liệu khi mount
  // ============================================================
  useEffect(function () {
    fetchUsers(1);
  }, [fetchUsers]);

  // ============================================================
  // HÀM DUYỆT XÁC THỰC
  // ============================================================
  const handleVerify = async function (user) {
    var confirmed = window.confirm('Duyệt xác thực "' + user.name + '"?');
    if (!confirmed) return;

    try {
      await userService.getUserByUsername(user.id, 'ACTIVE', 'Approved by admin');
      alert("Duyệt thành công!");
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      var msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);
    }
  };

  // ============================================================
  // HÀM TỪ CHỐI XÁC THỰC
  // ============================================================
  const handleReject = async function (user) {
    var confirmed = window.confirm('Từ chối xác thực "' + user.name + '"?');
    if (!confirmed) return;

    try {
      await userService.adminUpdateUserStatus(user.id, 'REJECTED', 'Rejected by admin');
      alert("Đã từ chối!");
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      var msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);
    }
  };
  
  
  // ============================================================
  // HÀM ĐẶT LẠI TRẠNG THÁI
  // ============================================================
  const handleResetStatus = async function (user) {
    var confirmed = window.confirm('Đặt lại trạng thái "' + user.name + '" về Chờ duyệt?');
    if (!confirmed) return;

    try {
      await userService.adminUpdateUserStatus(user.id, 'PENDING', 'Reset by admin');
      fetchUsers(currentPage, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
    } catch (err) {
      var msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);
    }
  };

  // ============================================================
  // HÀM XỬ LÝ BỘ LỌC
  // ============================================================
  const handleFilterTypeChange = function (type) {
    setFilterType(type);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, type);
  };

  const handleFilterStatusChange = function (status) {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, status === 'Tất cả' ? '' : status, filterType);
  };

  // ============================================================
  // HÀM TÌM KIẾM
  // ============================================================
  const handleSearch = function () {
    setCurrentPage(1);
    fetchUsers(1, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
  };

  // ============================================================
  // HÀM CHUYỂN TRANG
  // ============================================================
  const handlePageChange = function (page) {
    fetchUsers(page, searchTerm, filterStatus === 'Tất cả' ? '' : filterStatus, filterType);
  };

  var filteredUsers = users;

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
