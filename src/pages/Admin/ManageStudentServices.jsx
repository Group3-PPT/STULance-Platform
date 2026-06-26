import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Search, CheckCircle, XCircle, Eye, Loader2, User, DollarSign, Clock, Lock, EyeOff, Trash2 } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import '../../CSS/ManagePosts.css';

const ManageStudentServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Tải dữ liệu từ API Admin
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await studentServiceService.adminGetAll(); // Sử dụng hàm adminGetAll mới
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải dịch vụ hệ thống:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  // 2. Cập nhật trạng thái (Dựa trên tài liệu: ACTIVE, HIDDEN, BLOCKED, DELETED)
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
      fetchServices(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  // 3. Logic lọc & tìm kiếm theo Status mới
  const filteredServices = services.filter(s => {
    const statusMatch = filter === "Tất cả" || 
      (filter === "Đang bán" && s.status === "ACTIVE") ||
      (filter === "Đã ẩn" && s.status === "HIDDEN") ||
      (filter === "Bị khóa" && s.status === "BLOCKED");
    
    const searchMatch = (s.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Helper: Hiển thị Badge theo trạng thái mới
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return <Badge bg="success" className="py-2 px-3">Đang hiển thị</Badge>;
      case 'HIDDEN': return <Badge bg="secondary" className="py-2 px-3">Đang ẩn</Badge>;
      case 'BLOCKED': return <Badge bg="danger" className="py-2 px-3">Bị khóa</Badge>;
      case 'DELETED': return <Badge bg="dark" className="py-2 px-3 text-white-50">Đã xóa</Badge>;
      default: return <Badge bg="warning" className="text-dark">{status}</Badge>;
    }
  };

  return (
    <div className="adm-page-content animate-fade-in text-white py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý <span className="text-primary-glow">Gói Dịch Vụ</span></h2>
          <p className="text-white opacity-75 small mb-0">Hệ thống kiểm duyệt dựa trên trạng thái ACTIVE / BLOCKED / HIDDEN.</p>
        </div>
        
        <div className="adm-search-wrapper" style={{ width: '320px', position: 'relative' }}>
            <Search size={18} className="text-white opacity-50" style={{ position:'absolute', left:'15px', top:'12px' }}/>
            <input 
                type="text" 
                placeholder="Tìm tiêu đề dịch vụ..." 
                className="w-100 bg-dark-input text-white border-0 rounded-3 ps-5 py-2 shadow-none"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* FILTER TABS (CẬP NHẬT THEO TÀI LIỆU) */}
      <div className="post-filter-tabs glass-card p-2 mb-4 d-flex gap-2">
        {["Tất cả", "Đang bán", "Đã ẩn", "Bị khóa"].map(tab => (
          <button 
            key={tab}
            className={`post-tab-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      <div className="glass-card overflow-hidden shadow-lg border-0">
        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
          <Table responsive variant="dark" className="mb-0 adm-custom-table align-middle">
            <thead>
              <tr className="text-white border-bottom border-white border-opacity-10 uppercase-tracking x-small">
                <th className="ps-4 py-3">NỘI DUNG DỊCH VỤ</th>
                <th>GIÁ & GIAO HÀNG</th>
                <th>TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.serviceId} className="border-bottom border-white border-opacity-5">
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="service-img-mini rounded bg-secondary overflow-hidden shadow" style={{width: '65px', height: '45px'}}>
                         <img src={service.sampleImageUrl || 'https://via.placeholder.com/65x45'} className="w-100 h-100 object-fit-cover" />
                      </div>
                      <div>
                        <div className="fw-bold text-white small mb-1">{service.title}</div>
                        <div className="d-flex align-items-center gap-2">
                            <Badge bg="info" className="text-dark fw-bold" style={{fontSize: '9px'}}>{service.category}</Badge>
                            <span className="x-small text-white opacity-50"><User size={10}/> {service.studentName || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-warning fw-bold small"><DollarSign size={12}/>{service.price?.toLocaleString()}đ</div>
                    <div className="text-white opacity-50 x-small"><Clock size={10}/> {service.deliveryDays} ngày bàn giao</div>
                  </td>
                  <td>
                    {renderStatusBadge(service.status)}
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="adm-btn-action text-info bg-white bg-opacity-10 p-2 rounded" title="Xem chi tiết">
                        <Eye size={18}/>
                      </button>
                      
                      {/* NÚT DUYỆT (Nếu bài đang ẩn hoặc đang khóa) */}
                      {service.status !== 'ACTIVE' && (
                        <button className="adm-btn-action text-success bg-white bg-opacity-10 p-2 rounded" title="Phê duyệt mở bán" onClick={() => handleUpdateStatus(service.serviceId, 'ACTIVE')}>
                           <CheckCircle size={18}/>
                        </button>
                      )}

                      {/* NÚT KHÓA (Nếu bài đang bán bình thường) */}
                      {service.status === 'ACTIVE' && (
                        <button className="adm-btn-action text-danger bg-white bg-opacity-10 p-2 rounded" title="Khóa dịch vụ" onClick={() => handleUpdateStatus(service.serviceId, 'BLOCKED')}>
                           <Lock size={18}/>
                        </button>
                      )}

                      {/* NÚT XÓA MỀM */}
                      {service.status !== 'DELETED' && (
                        <button className="adm-btn-action text-white opacity-50 bg-white bg-opacity-10 p-2 rounded" title="Xóa dịch vụ" onClick={() => handleUpdateStatus(service.serviceId, 'DELETED')}>
                           <Trash2 size={18}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ManageStudentServices;