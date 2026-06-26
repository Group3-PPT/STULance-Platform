import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom'; 
import { Heart, Bookmark, Play, Plus, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { savedItemsService } from '../../services/saveditemsservice';
import { studentService } from '../../services/studentservice'; 
import '../../CSS/Services.css'; 

const Services = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [savedServiceIds, setSavedServiceIds] = useState(new Set());
  const [myStudentId, setMyStudentId] = useState(null); // ID thực tế từ bảng Student
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('accessToken');
  const mainTitle = location.state?.mainTitle || "Tất cả dịch vụ";
  const subName = location.state?.subName;

  // 1. TẢI DỮ LIỆU & LẤY ID CHUẨN TỪ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await studentServiceService.getAllPublic({ category: subName });
      const servicesData = res.data || [];

      if (token) {
        // GỌI API ĐỂ LẤY ID SINH VIÊN THẬT TRONG DATABASE
        const [profileRes, savedRes] = await Promise.allSettled([
          studentService.getProfile(),
          savedItemsService.getMySavedServices()
        ]);

        let currentId = null;
        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          currentId = profileRes.value.data.studentId;
          setMyStudentId(currentId);
        }

        if (savedRes.status === 'fulfilled' && savedRes.value.success) {
          const ids = new Set(savedRes.value.data.map(item => item.serviceId));
          setSavedServiceIds(ids);
        }
      }

      // Lọc bỏ bài của mình (Chống lỗi 403 tự like bài mình)
      setServices(servicesData.filter(s => s.studentId !== myStudentId));

    } catch (err) {
      console.error("Lỗi tải trang:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [subName, myStudentId]);

  // 2. XỬ LÝ THẢ TIM (Bọc lót lỗi 403)
  const handleToggleAction = async (e, serviceId, ownerId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      alert("Vui lòng đăng nhập!");
      return navigate('/login');
    }

    // CHẶN NGAY NẾU LÀ CHỦ BÀI ĐĂNG (Frontend Check)
    if (myStudentId === ownerId) {
      alert("Bạn không thể thả tim vào dịch vụ của chính mình.");
      return;
    }

    // CHẶN NẾU CHƯA CÓ HỒ SƠ SINH VIÊN (Tránh lỗi 403 Database)
    if (!myStudentId) {
      alert("Hồ sơ sinh viên của bạn chưa tồn tại trên hệ thống. Vui lòng cập nhật MSSV tại trang Cài đặt.");
      return navigate('/profile-settings');
    }

    const isCurrentlyActive = savedServiceIds.has(serviceId);
    setActionLoading(serviceId);

    try {
      if (isCurrentlyActive) {
        await savedItemsService.unsaveService(serviceId);
        const newIds = new Set(savedServiceIds);
        newIds.delete(serviceId);
        setSavedServiceIds(newIds);
      } else {
        await savedItemsService.saveService(serviceId);
        const newIds = new Set(savedServiceIds);
        newIds.add(serviceId);
        setSavedServiceIds(newIds);
      }
    } catch (err) {
      // BẮT LỖI 403 CHI TIẾT TỪ SERVER
      if (err.response?.status === 403) {
        alert("Server từ chối: Tài khoản của bạn có thể đang bị khóa hoặc chưa đủ quyền xác minh để thực hiện hành động này.");
      } else {
        alert("Lỗi kết nối server.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="services-page py-5 text-white">
      <Container>
        {/* CẢNH BÁO NẾU CHƯA CÓ ID STUDENT */}
        {token && !myStudentId && (
            <Alert variant="danger" className="bg-danger bg-opacity-10 border-danger text-white mb-4 d-flex align-items-center gap-3">
                <AlertTriangle size={20} className="text-danger" />
                <div>
                    Tài khoản của bạn chưa được liên kết với hồ sơ Sinh viên. 
                    Bạn không thể Thả tim hoặc Lưu bài. <Link to="/profile-settings" className="text-info fw-bold">Cập nhật ngay</Link>
                </div>
            </Alert>
        )}

        {/* Header... */}
        <div className="d-flex justify-content-between align-items-center mb-5">
           <h1 className="fw-bold display-6">{subName || mainTitle} <span className="text-primary-glow">Freelance</span></h1>
           <Button as={Link} to="/post-service" variant="primary" className="fw-bold px-4 shadow-glow"><Plus size={18} className="me-2"/> ĐĂNG BÀI</Button>
        </div>

        <Row xs={1} sm={2} md={3} lg={5} className="g-3">
          {services.map((s) => {
            const isActive = savedServiceIds.has(s.serviceId);
            return (
              <Col key={s.serviceId}>
                <div className="tiktok-card glass-card shadow-lg animate-fade-in">
                  <Link to={`/service-detail/${s.serviceId}`}>
                    <img src={s.sampleImageUrl || "https://placehold.co/300x500/020617/white?text=STULance"} alt={s.title} className="tiktok-bg-img" />
                  </Link>
                  
                  <div className="tiktok-side-actions">
                    <div className={`action-circle ${isActive ? 'active-red' : ''}`} onClick={(e) => handleToggleAction(e, s.serviceId, s.studentId)}>
                      {actionLoading === s.serviceId ? <Loader2 size={18} className="spinner" /> : <Heart size={22} fill={isActive ? "#ff4d4d" : "none"} color={isActive ? "#ff4d4d" : "white"} />}
                      <span>{isActive ? (s.totalOrders || 0) + 1 : (s.totalOrders || 0)}</span>
                    </div>
                    <div className={`action-circle ${isActive ? 'active-blue' : ''}`} onClick={(e) => handleToggleAction(e, s.serviceId, s.studentId)}>
                      <Bookmark size={22} fill={isActive ? "#3b82f6" : "none"} color={isActive ? "#3b82f6" : "white"} />
                    </div>
                  </div>

                  <div className="tiktok-overlay-content">
                    <Link to={`/portfolio/${s.studentId}`} className="text-decoration-none text-white fw-bold x-small-text">@{s.studentName}</Link>
                    <h6 className="service-card-title text-white line-clamp-2 mt-1">{s.title}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="service-price-tag text-white fw-bold">{s.price?.toLocaleString()}đ</div>
                      <Link to={`/service-detail/${s.serviceId}`} className="btn-buy-now-sm text-decoration-none">THUÊ</Link>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default Services;