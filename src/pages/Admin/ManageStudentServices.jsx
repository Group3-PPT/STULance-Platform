import React, { useState, useEffect } from 'react';
import { Badge, Modal, Row, Col } from 'react-bootstrap';
import { 
  Search, CheckCircle, Eye, Loader2, User, DollarSign, Clock, 
  Lock, Trash2, FileText, ListChecks, Star, Shield, TrendingUp,
  ChevronRight, X
} from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/ManageStudentServices.css';

const ManageStudentServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await studentServiceService.adminGetAll();
      if (res.success) {
        setServices(unwrapList(res));
      }
    } catch (err) {
      console.error("Lỗi tải dịch vụ hệ thống:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleViewDetail = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const statusMap = {
      'ACTIVE': 'phê duyệt hiển thị',
      'BLOCKED': 'khóa (vi phạm)',
      'HIDDEN': 'tạm ẩn',
      'DELETED': 'xóa vĩnh viễn'
    };

    if (!window.confirm(`Xác nhận ${statusMap[newStatus]} gói dịch vụ này?`)) return;

    try {
      await studentServiceService.adminUpdateStatus(id, newStatus);
      alert("Đã cập nhật trạng thái thành công!");
      fetchServices();
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  const filteredServices = services.filter(s => {
    const statusMatch = filter === "Tất cả" || 
      (filter === "Đang bán" && s.status === "ACTIVE") ||
      (filter === "Đã ẩn" && s.status === "HIDDEN") ||
      (filter === "Bị khóa" && s.status === "BLOCKED");
    
    const searchMatch = (s.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const renderStatusBadge = (status) => {
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

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'ACTIVE').length,
    hidden: services.filter(s => s.status === 'HIDDEN').length,
    blocked: services.filter(s => s.status === 'BLOCKED').length,
  };

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
            onClick={() => setFilter(tab)}
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
      ) : filteredServices.length === 0 ? (
        <div className="svc-empty">
          <Search size={48} />
          <p>Không tìm thấy dịch vụ nào</p>
        </div>
      ) : (
        <div className="svc-list">
          {filteredServices.map((service) => (
            <div key={service.serviceId} className="svc-card">
              {/* Thumbnail */}
              <div className="svc-card-thumb">
                <img 
                  src={service.sampleImageUrl || 'https://via.placeholder.com/120x80'} 
                  alt={service.title}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/120x80'}
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
