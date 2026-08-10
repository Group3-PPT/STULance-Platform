import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Form, Spinner, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import { Search, MoreVertical, Eye, Calendar, Loader2, Building2, ShieldAlert, CheckCircle, XCircle, PauseCircle, Lock, Archive, RefreshCw, Clock, DollarSign, Users, MapPin, Filter } from 'lucide-react';
import { jobService } from "../../services/jobservice";
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManagePosts.css';

const JOB_TYPES = ['Tất cả', 'Part-time', 'Full-time', 'Freelance', 'Internship'];
const STATUS_TABS = ["Tất cả", "Chờ duyệt", "Đang hiển thị", "Vi phạm/Khác"];

const ManagePosts = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách bài đăng
  const [posts, setPosts] = useState([]);

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Bộ lọc trạng thái
  const [filter, setFilter] = useState("Tất cả");

  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Bộ lọc loại công việc
  const [jobTypeFilter, setJobTypeFilter] = useState("Tất cả");

  // Bộ lọc khoảng lương
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Hiện modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Bài đăng đang xem chi tiết
  const [selectedPost, setSelectedPost] = useState(null);

  // ============================================================
  // PHÂN TRANG
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 15;

  // ============================================================
  // BẢN ĐỒ TRẠNG THÁI
  // ============================================================
  var statusMap = {
    "Tất cả": '',
    "Chờ duyệt": 'PENDING',
    "Đang hiển thị": 'OPEN',
    "Vi phạm/Khác": 'BLOCKED'
  };

  // ============================================================
  // HÀM TẢI DỮ LIỆU
  // ============================================================
  const fetchPosts = useCallback(async function (page, keyword, status, jobType, minSal, maxSal) {
    if (!page) page = 1;
    if (!keyword) keyword = '';
    if (!status) status = '';
    if (!jobType) jobType = '';
    if (!minSal) minSal = '';
    if (!maxSal) maxSal = '';

    setLoading(true);

    try {
      var params = { page: page, pageSize: pageSize };

      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      if (jobType && jobType !== 'Tất cả') params.jobType = jobType;
      if (minSal) params.minSalary = minSal;
      if (maxSal) params.maxSalary = maxSal;

      var res = await jobService.adminGetAllJobs(params);

      if (res.success && res.data) {
        var data = res.data;

        setPosts(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(data.page || 1);
      }

    } catch (err) {
      console.error("Lỗi tải bài đăng:", err);

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // EFFECT: Tải dữ liệu khi mount
  // ============================================================
  useEffect(function () {
    fetchPosts(1);
  }, [fetchPosts]);

  // ============================================================
  // HÀM XEM CHI TIẾT
  // ============================================================
  const handleViewDetail = function (post) {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  // ============================================================
  // HÀM CẬP NHẬT TRẠNG THÁI
  // ============================================================
  const handleStatusChange = async function (id, newStatus) {
    // Bản đồ trạng thái → mô tả tiếng Việt
    var statusLabels = {
      'OPEN': 'Mở công khai (Duyệt)',
      'REJECTED': 'Từ chối bài đăng',
      'PAUSED': 'Tạm dừng bài đăng',
      'BLOCKED': 'KHÓA (Vi phạm)',
      'CLOSED': 'Đóng bài đăng'
    };

    // Xác nhận trước khi thực hiện
    var confirmed = window.confirm("Xác nhận chuyển bài đăng sang trạng thái: " + statusLabels[newStatus] + "?");
    if (!confirmed) return;

    try {
      var res = await jobService.adminUpdateStatus(id, newStatus);

      if (res.success) {
        // Tải lại danh sách
        fetchPosts(currentPage, searchTerm);
      }

    } catch (err) {
      var msg = "Không thể cập nhật";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);
    }
  };

  // ============================================================
  // HÀM HIỂN THỊ BADGE TRẠNG THÁI
  // ============================================================
  const renderStatusBadge = function (status) {
    switch (status) {
      case 'OPEN':
        return <Badge bg="success" className="adm-status-pill">Đang hiển thị</Badge>;
      case 'PENDING':
        return <Badge bg="warning" className="adm-status-pill text-dark">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge bg="danger" className="adm-status-pill">Đã từ chối</Badge>;
      case 'PAUSED':
        return <Badge bg="info" className="adm-status-pill">Tạm dừng</Badge>;
      case 'BLOCKED':
        return <Badge bg="dark" className="adm-status-pill"><ShieldAlert size={10} className="me-1"/> Bị khóa</Badge>;
      case 'CLOSED':
        return <Badge bg="secondary" className="adm-status-pill">Đã đóng</Badge>;
      case 'DRAFT':
        return <Badge bg="light" className="adm-status-pill text-dark border">Bản nháp</Badge>;
      default:
        return <Badge bg="primary">{status}</Badge>;
    }
  };

  // ============================================================
  // HÀM XỬ LÝ BỘ LỌC
  // ============================================================
  const handleFilterChange = function (newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchPosts(1, searchTerm, statusMap[newFilter] || '', jobTypeFilter, minSalary, maxSalary);
  };

  // ============================================================
  // HÀM TÌM KIẾM
  // ============================================================
  const handleSearch = function () {
    setCurrentPage(1);
    fetchPosts(1, searchTerm, statusMap[filter] || '', jobTypeFilter, minSalary, maxSalary);
  };

  // ============================================================
  // HÀM CHUYỂN TRANG
  // ============================================================
  const handlePageChange = function (page) {
    fetchPosts(page, searchTerm, statusMap[filter] || '', jobTypeFilter, minSalary, maxSalary);
  };

  // ============================================================
  // HÀM XÓA BỘ LỌC
  // ============================================================
  const handleClearFilters = function () {
    setSearchTerm('');
    setFilter('Tất cả');
    setJobTypeFilter('Tất cả');
    setMinSalary('');
    setMaxSalary('');
    setCurrentPage(1);
    fetchPosts(1, '', '', 'Tất cả', '', '');
  };

  // Kiểm tra có bộ lọc nào đang_active không
  var hasActiveFilters = searchTerm || filter !== 'Tất cả' || jobTypeFilter !== 'Tất cả' || minSalary || maxSalary;

  // ============================================================
  // THỐNG KÊ
  // ============================================================
  var pendingCount = 0;
  var activeCount = 0;

  for (var i = 0; i < posts.length; i++) {
    if (posts[i].status === "PENDING") pendingCount++;
    if (posts[i].status === "OPEN") activeCount++;
  }

  return (
    <div className="adm-page-content animate-fade-in text-white py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Kiểm duyệt <span className="text-primary-glow">Việc làm</span></h2>
          <p className="text-white-50 small mb-0">DRAFT → PENDING → OPEN | Kiểm soát vi phạm. ({totalItems} bài đăng)</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-flex gap-3">
            <div className="glass-card px-3 py-2 text-center">
              <div className="x-small text-white-50 uppercase-tracking">Chờ duyệt</div>
              <div className="fw-bold text-warning">{pendingCount}</div>
            </div>
            <div className="glass-card px-3 py-2 text-center">
              <div className="x-small text-white-50 uppercase-tracking">Đang hiển thị</div>
              <div className="fw-bold text-success">{activeCount}</div>
            </div>
          </div>
          <div className="adm-search-wrapper" style={{ width: '280px', position: 'relative' }}>
            <Search size={16} className="text-white-50" style={{ position:'absolute', left:'12px', top:'11px' }}/>
            <input type="text" placeholder="Tìm tiêu đề..." className="w-100 bg-dark-input text-white border-0 rounded-3 ps-4 py-2" style={{fontSize: '13px'}}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn-icon-table text-white-50" title="Làm mới" onClick={handleSearch}><RefreshCw size={18}/></button>
        </div>
      </div>

      {/* ADVANCED FILTERS */}
      <div className="glass-card p-3 mb-4 d-flex gap-2 align-items-center flex-wrap" style={{borderRadius: '12px'}}>
        <div className="d-flex align-items-center gap-1 text-white-50 x-small fw-bold">
          <Filter size={14}/> LỌC:
        </div>
        <Form.Select
          className="bg-dark-input text-white border-0 rounded-3 py-1"
          style={{fontSize: '13px', width: '140px'}}
          value={jobTypeFilter}
          onChange={(e) => { setJobTypeFilter(e.target.value); }}
        >
          {JOB_TYPES.map(t => <option key={t} value={t}>{t === 'Tất cả' ? 'Loại công việc' : t}</option>)}
        </Form.Select>
        <input
          type="number"
          placeholder="Lương tối thiểu"
          className="bg-dark-input text-white border-0 rounded-3 py-1 px-2"
          style={{fontSize: '13px', width: '130px'}}
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
        />
        <input
          type="number"
          placeholder="Lương tối đa"
          className="bg-dark-input text-white border-0 rounded-3 py-1 px-2"
          style={{fontSize: '13px', width: '130px'}}
          value={maxSalary}
          onChange={(e) => setMaxSalary(e.target.value)}
        />
        <button className="btn btn-primary btn-sm rounded-3 fw-bold px-3" onClick={handleSearch} style={{fontSize: '13px'}}>
          Áp dụng
        </button>
        {hasActiveFilters && (
          <button className="btn btn-outline-light btn-sm rounded-3 px-2" onClick={handleClearFilters}>
            <RefreshCw size={14}/>
          </button>
        )}
      </div>

      <div className="post-filter-tabs glass-card p-2 mb-4 d-flex gap-2">
        {STATUS_TABS.map(t => (
          <button key={t} className={`post-tab-btn ${filter === t ? 'active' : ''}`} onClick={() => handleFilterChange(t)}>{t}</button>
        ))}
      </div>

      <div className="glass-card overflow-hidden shadow-lg border-0 min-vh-50">
        {loading ? <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div> : (
          <>
          <Table responsive variant="dark" className="mb-0 adm-custom-table align-middle">
            <thead>
              <tr className="text-white-50 x-small uppercase-tracking">
                <th className="ps-4 py-3">MÃ ID / LOẠI</th>
                <th>TIÊU ĐỀ TUYỂN DỤNG</th>
                <th>NGƯỜI ĐĂNG</th>
                <th>TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.jobId} className="border-bottom border-white border-opacity-5">
                  <td className="ps-4">
                    <div className="text-primary-glow fw-bold small">{post.jobId?.substring(0, 8)}</div>
                    <Badge bg="primary" style={{fontSize: '9px'}} className="opacity-75">{post.jobType || 'Dự án'}</Badge>
                  </td>
                  <td>
                    <div className="fw-bold text-white small mb-1">{post.title}</div>
                    <div className="x-small text-white-50"><Calendar size={10} className="me-1"/>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td>
                    <div className="small d-flex align-items-center gap-2 text-white-80">
                      <Building2 size={14} className="text-info"/> {post.requesterName || post.companyName || 'N/A'}
                    </div>
                  </td>
                  <td>{renderStatusBadge(post.status)}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn-icon-table text-info" title="Xem chi tiết" onClick={() => handleViewDetail(post)}><Eye size={16}/></button>
                      
                      <Dropdown>
                        <Dropdown.Toggle variant="link" className="text-white p-0 no-caret btn-icon-table" style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'}}>
                          <MoreVertical size={16}/>
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" className="glass-card border-secondary shadow-lg">
                          {post.status === 'PENDING' && (
                            <>
                              <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'OPEN')} className="text-success fw-bold"><CheckCircle size={16} className="me-2"/> DUYỆT BÀI</Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'REJECTED')} className="text-danger"><XCircle size={16} className="me-2"/> TỪ CHỐI</Dropdown.Item>
                            </>
                          )}

                          {post.status === 'OPEN' && (
                            <>
                              <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'PAUSED')} className="text-warning"><PauseCircle size={16} className="me-2"/> TẠM DỪNG</Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'BLOCKED')} className="text-danger fw-bold"><Lock size={16} className="me-2"/> KHÓA VI PHẠM</Dropdown.Item>
                            </>
                          )}

                          {['BLOCKED', 'PAUSED', 'REJECTED'].includes(post.status) && (
                             <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'OPEN')} className="text-info"><RefreshCw size={16} className="me-2"/> KHÔI PHỤC</Dropdown.Item>
                          )}

                          <Dropdown.Divider className="border-secondary" />
                          <Dropdown.Item onClick={() => handleStatusChange(post.jobId, 'CLOSED')} className="text-white-50"><Archive size={16} className="me-2"/> ĐÓNG VĨNH VIỄN</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan="5" className="text-center py-5 text-white-50">Không tìm thấy bài đăng nào.</td></tr>
              )}
            </tbody>
          </Table>

          <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          </>
        )}
      </div>

      {/* MODAL CHI TIẾT BÀI ĐĂNG */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold">
            <Eye size={20} className="me-2 text-info" />
            Chi tiết bài đăng <span className="text-primary-glow">#{selectedPost?.jobId?.substring(0, 8)}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          {selectedPost && (
            <div>
              <h5 className="text-white fw-bold mb-4">{selectedPost.title}</h5>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><Building2 size={12} className="me-1"/> Doanh nghiệp</div>
                    <div className="fw-bold text-white">{selectedPost.requesterName || selectedPost.companyName || 'N/A'}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><Calendar size={12} className="me-1"/> Ngày đăng</div>
                    <div className="fw-bold text-white">{new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><DollarSign size={12} className="me-1"/> Lương</div>
                    <div className="fw-bold text-warning">{selectedPost.salary ? selectedPost.salary.toLocaleString('vi-VN') + ' VND' : 'Chưa có lương'}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><Clock size={12} className="me-1"/> Hạn chót</div>
                    <div className="fw-bold text-white">{selectedPost.deadline ? new Date(selectedPost.deadline).toLocaleDateString('vi-VN') : 'Không có'}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><Users size={12} className="me-1"/> Số lượng</div>
                    <div className="fw-bold text-white">{selectedPost.quantity || 1}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1">Loại hình</div>
                    <div className="fw-bold text-info">{selectedPost.jobType || 'N/A'}</div>
                  </div>
                </Col>
              </Row>

              {selectedPost.description && (
                <div className="glass-card p-4 mb-3">
                  <h6 className="text-primary-glow fw-bold mb-2">Mô tả công việc</h6>
                  <p className="text-white-80 mb-0" style={{whiteSpace: 'pre-line'}}>{selectedPost.description}</p>
                </div>
              )}
              {selectedPost.requirements && (
                <div className="glass-card p-4 mb-3">
                  <h6 className="text-primary-glow fw-bold mb-2">Yêu cầu</h6>
                  <p className="text-white-80 mb-0" style={{whiteSpace: 'pre-line'}}>{selectedPost.requirements}</p>
                </div>
              )}
              {selectedPost.benefits && (
                <div className="glass-card p-4 mb-3">
                  <h6 className="text-primary-glow fw-bold mb-2">Quyền lợi</h6>
                  <p className="text-white-80 mb-0" style={{whiteSpace: 'pre-line'}}>{selectedPost.benefits}</p>
                </div>
              )}

              <div className="d-flex justify-content-end mt-4 pt-3 border-top border-white-10">
                {selectedPost.status === 'PENDING' && (
                  <>
                    <button className="btn btn-success fw-bold me-2" onClick={() => { handleStatusChange(selectedPost.jobId, 'OPEN'); setShowDetailModal(false); }}>
                      <CheckCircle size={16} className="me-1"/> DUYỆT BÀI
                    </button>
                    <button className="btn btn-danger fw-bold" onClick={() => { handleStatusChange(selectedPost.jobId, 'REJECTED'); setShowDetailModal(false); }}>
                      <XCircle size={16} className="me-1"/> TỪ CHỐI
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManagePosts;
