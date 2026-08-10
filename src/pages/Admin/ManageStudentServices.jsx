import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Modal, Row, Col } from 'react-bootstrap';
import { 
  Search, CheckCircle, Eye, Loader2, User, DollarSign, Clock, 
  Lock, Trash2, FileText, ListChecks, Star, Shield, TrendingUp,
  ChevronRight, X
} from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManageStudentServices.css';

const ManageStudentServices = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách dịch vụ
  const [services, setServices] = useState([]);

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Bộ lọc trạng thái
  const [filter, setFilter] = useState("Tất cả");

  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Hiện modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dịch vụ đang xem chi tiết
  const [selectedService, setSelectedService] = useState(null);

  // ============================================================
  // PHÂN TRANG
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 15;

  // ============================================================
  // HÀM TẢI DỮ LIỆU
  // ============================================================
  const fetchServices = useCallback(async function (page, keyword, status) {
    if (!page) page = 1;
    if (!keyword) keyword = '';
    if (!status) status = '';

    setLoading(true);

    try {
      var params = { page: page, pageSize: pageSize };

      if (keyword) {
        params.keyword = keyword;
      }
      if (status) {
        params.status = status;
      }

      var res = await studentServiceService.adminGetAll(params);

      if (res.success && res.data) {
        var data = res.data;

        setServices(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(data.page || 1);
      }

    } catch (err) {
      console.error("Lỗi tải dịch vụ hệ thống:", err);

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // EFFECT: Tải dữ liệu khi mount
  // ============================================================
  useEffect(function () {
    fetchServices(1);
  }, [fetchServices]);

  // ============================================================
  // HÀM XEM CHI TIẾT
  // ============================================================
  const handleViewDetail = function (service) {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  // ============================================================
  // HÀM CẬP NHẬT TRẠNG THÁI
  // ============================================================
  const handleUpdateStatus = async function (id, newStatus) {
    // Bản đồ trạng thái → mô tả tiếng Việt
    var statusMap = {
      'ACTIVE': 'phê duyệt hiển thị',
      'BLOCKED': 'khóa (vi phạm)',
      'HIDDEN': 'tạm ẩn',
      'DELETED': 'xóa vĩnh viễn'
    };

    // Xác nhận trước khi thực hiện
    var confirmed = window.confirm("Xác nhận " + statusMap[newStatus] + " gói dịch vụ này?");
    if (!confirmed) return;

    try {
      await studentServiceService.adminUpdateStatus(id, newStatus);
      alert("Đã cập nhật trạng thái thành công!");

      // Tải lại danh sách
      var statusFilter = '';
      if (filter === 'Đang bán') statusFilter = 'ACTIVE';
      else if (filter === 'Đã ẩn') statusFilter = 'HIDDEN';
      else if (filter === 'Bị khóa') statusFilter = 'BLOCKED';

      fetchServices(currentPage, searchTerm, statusFilter);

    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  // ============================================================
  // HÀM XỬ LÝ BỘ LỌC
  // ============================================================
  const handleFilterChange = function (tab) {
    setFilter(tab);
    setCurrentPage(1);

    // Chuyển tên tab → status code
    var statusMap = {
      'Tất cả': '',
      'Đang bán': 'ACTIVE',
      'Đã ẩn': 'HIDDEN',
      'Bị khóa': 'BLOCKED'
    };

    fetchServices(1, searchTerm, statusMap[tab] || '');
  };

  // ============================================================
  // HÀM TÌM KIẾM
  // ============================================================
  const handleSearch = function () {
    setCurrentPage(1);

    var statusMap = {
      'Tất cả': '',
      'Đang bán': 'ACTIVE',
      'Đã ẩn': 'HIDDEN',
      'Bị khóa': 'BLOCKED'
    };

    fetchServices(1, searchTerm, statusMap[filter] || '');
  };

  // ============================================================
  // HÀM CHUYỂN TRANG
  // ============================================================
  const handlePageChange = function (page) {
    var statusMap = {
      'Tất cả': '',
      'Đang bán': 'ACTIVE',
      'Đã ẩn': 'HIDDEN',
      'Bị khóa': 'BLOCKED'
    };

    fetchServices(page, searchTerm, statusMap[filter] || '');
  };

  // ============================================================
  // HÀM HIỂN THỊ BADGE TRẠNG THÁI
  // ============================================================
  const renderStatusBadge = function (status) {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="svc-badge svc-badge-active">
            <span className="svc-badge-dot"></span>
            Đang hiển thị
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="svc-badge svc-badge-hidden">
            <span className="svc-badge-dot"></span>
            Đang ẩn
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="svc-badge svc-badge-blocked">
            <span className="svc-badge-dot"></span>
            Bị khóa
          </span>
        );
      default:
        return <span className="svc-badge svc-badge-default">{status}</span>;
    }
  };

  // ============================================================
  // THỐNG KÊ
  // ============================================================
  var stats = {
    total: totalItems,
    active: 0,
    hidden: 0,
    blocked: 0
  };

  for (var i = 0; i < services.length; i++) {
    if (services[i].status === 'ACTIVE') stats.active++;
    else if (services[i].status === 'HIDDEN') stats.hidden++;
    else if (services[i].status === 'BLOCKED') stats.blocked++;
  }

  return (
    <div className="svc-manage-page animate-fade-in">
      {/* Header */}
      <div className="svc-header mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="svc-title">
              Quản lý <span className="text-primary-glow">Gói Dịch Vụ</span>
            </h2>
            <p className="svc-subtitle">Quản lý và kiểm duyệt dịch vụ sinh viên trên hệ thống</p>
          </div>
          <div className="d-flex gap-2">
            <div className="svc-search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Tìm tên dịch vụ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="svc-stats-row mb-4">
        <div className="svc-stat-card">
          <div className="svc-stat-icon svc-stat-total">
            <TrendingUp size={20} />
          </div>
          <div className="svc-stat-info">
            <span className="svc-stat-label">Tổng dịch vụ</span>
            <span className="svc-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="svc-stat-card">
          <div className="svc-stat-icon svc-stat-active">
            <CheckCircle size={20} />
          </div>
          <div className="svc-stat-info">
            <span className="svc-stat-label">Đang bán</span>
            <span className="svc-stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="svc-stat-card">
          <div className="svc-stat-icon svc-stat-hidden">
            <Eye size={20} />
          </div>
          <div className="svc-stat-info">
            <span className="svc-stat-label">Đã ẩn</span>
            <span className="svc-stat-value">{stats.hidden}</span>
          </div>
        </div>
        <div className="svc-stat-card">
          <div className="svc-stat-icon svc-stat-blocked">
            <Shield size={20} />
          </div>
          <div className="svc-stat-info">
            <span className="svc-stat-label">Bị khóa</span>
            <span className="svc-stat-value">{stats.blocked}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="svc-filter-tabs mb-4">
        {["Tất cả", "Đang bán", "Đã ẩn", "Bị khóa"].map(tab => (
          <button 
            key={tab}
            className={`svc-tab-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => handleFilterChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Services List */}
      {loading ? (
        <div className="svc-loading">
          <Loader2 className="spinner" size={40} />
          <span>Đang tải...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="svc-empty">
          <Search size={48} />
          <p>Không tìm thấy dịch vụ nào</p>
        </div>
      ) : (
        <>
        <div className="svc-list">
          {services.map((service) => (
            <div key={service.serviceId} className="svc-card">
              {/* Thumbnail */}
              <div className="svc-card-thumb">
                <img 
                  src={service.sampleImageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' fill='%231e293b'%3E%3Crect width='120' height='80'/%3E%3C/svg%3E"}
                  alt={service.title}
                  onError={function (e) { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' fill='%231e293b'%3E%3Crect width='120' height='80'/%3E%3C/svg%3E"; }}
                />
              </div>

              {/* Content */}
              <div className="svc-card-content">
                <div className="svc-card-header">
                  <h4 className="svc-card-title">{service.title}</h4>
                  <div className="svc-card-meta">
                    <span className="svc-meta-tag svc-meta-category">
                      {service.category}
                    </span>
                    <span className="svc-meta-tag svc-meta-author">
                      <User size={12} />
                      {service.studentName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="svc-card-price">
                <div className="svc-price-main">
                  <DollarSign size={14} />
                  <span>{service.price?.toLocaleString()}đ</span>
                </div>
                <div className="svc-price-delivery">
                  <Clock size={12} />
                  <span>{service.deliveryDays} ngày bàn giao</span>
                </div>
              </div>

              {/* Status */}
              <div className="svc-card-status">
                {renderStatusBadge(service.status)}
              </div>

              {/* Actions */}
              <div className="svc-card-actions">
                <button 
                  className="svc-action-btn svc-action-view" 
                  title="Xem chi tiết" 
                  onClick={() => handleViewDetail(service)}
                >
                  <Eye size={16} />
                </button>
                
                {service.status !== 'ACTIVE' && (
                  <button 
                    className="svc-action-btn svc-action-approve" 
                    title="Phê duyệt" 
                    onClick={() => handleUpdateStatus(service.serviceId, 'ACTIVE')}
                  >
                    <CheckCircle size={16} />
                  </button>
                )}

                {service.status === 'ACTIVE' && (
                  <button 
                    className="svc-action-btn svc-action-block" 
                    title="Khóa dịch vụ" 
                    onClick={() => handleUpdateStatus(service.serviceId, 'BLOCKED')}
                  >
                    <Lock size={16} />
                  </button>
                )}

                {service.status !== 'DELETED' && (
                  <button 
                    className="svc-action-btn svc-action-delete" 
                    title="Xóa" 
                    onClick={() => handleUpdateStatus(service.serviceId, 'DELETED')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        </>
      )}

      {/* MODAL CHI TIẾT */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered className="svc-detail-modal">
        <Modal.Header className="svc-modal-header">
          <div className="d-flex align-items-center gap-2">
            <div className="svc-modal-icon">
              <Eye size={18} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Chi tiết dịch vụ</h5>
              <span className="x-small text-white-50">#{selectedService?.serviceId?.substring(0, 8)}</span>
            </div>
          </div>
          <button className="svc-modal-close" onClick={() => setShowDetailModal(false)}>
            <X size={20} />
          </button>
        </Modal.Header>
        <Modal.Body className="svc-modal-body">
          {selectedService && (
            <div>
              <h4 className="text-white fw-bold mb-3">{selectedService.title}</h4>
              
              {selectedService.sampleImageUrl && (
                <div className="svc-modal-image mb-4">
                  <img src={selectedService.sampleImageUrl} alt="Sample" />
                </div>
              )}

              <div className="svc-modal-stats mb-4">
                <div className="svc-modal-stat">
                  <User size={16} />
                  <div>
                    <span className="svc-modal-stat-label">Sinh viên</span>
                    <span className="svc-modal-stat-value">{selectedService.studentName || 'N/A'}</span>
                  </div>
                </div>
                <div className="svc-modal-stat">
                  <DollarSign size={16} />
                  <div>
                    <span className="svc-modal-stat-label">Giá</span>
                    <span className="svc-modal-stat-value text-warning">{selectedService.price?.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                <div className="svc-modal-stat">
                  <Clock size={16} />
                  <div>
                    <span className="svc-modal-stat-label">Thời gian giao</span>
                    <span className="svc-modal-stat-value">{selectedService.deliveryDays} ngày</span>
                  </div>
                </div>
                <div className="svc-modal-stat">
                  <Star size={16} />
                  <div>
                    <span className="svc-modal-stat-label">Danh mục</span>
                    <span className="svc-modal-stat-value text-info">{selectedService.category || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedService.description && (
                <div className="svc-modal-section">
                  <h6 className="svc-modal-section-title">
                    <FileText size={14} /> Mô tả chi tiết
                  </h6>
                  <p className="svc-modal-section-content">{selectedService.description}</p>
                </div>
              )}

              {selectedService.features && (
                <div className="svc-modal-section">
                  <h6 className="svc-modal-section-title">
                    <ListChecks size={14} /> Tính năng đi kèm
                  </h6>
                  <p className="svc-modal-section-content">{selectedService.features}</p>
                </div>
              )}

              <div className="svc-modal-actions">
                {selectedService.status !== 'ACTIVE' && (
                  <button className="svc-modal-btn svc-modal-btn-approve" onClick={() => { handleUpdateStatus(selectedService.serviceId, 'ACTIVE'); setShowDetailModal(false); }}>
                    <CheckCircle size={16} /> PHÊ DUYỆT
                  </button>
                )}
                {selectedService.status === 'ACTIVE' && (
                  <button className="svc-modal-btn svc-modal-btn-block" onClick={() => { handleUpdateStatus(selectedService.serviceId, 'BLOCKED'); setShowDetailModal(false); }}>
                    <Lock size={16} /> KHÓA DỊCH VỤ
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageStudentServices;
