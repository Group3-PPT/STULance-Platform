import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom'; 
import { Heart, Loader2, AlertTriangle, MapPin, Calendar, Clock, Star, Users, Zap, ShieldCheck } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { savedItemsService } from '../../services/saveditemsservice';
import { studentService } from '../../services/studentservice'; 
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/Services.css'; 

const Services = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [savedServiceIds, setSavedServiceIds] = useState(new Set());
  const [myStudentId, setMyStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('accessToken');
  const mainTitle = location.state?.mainTitle || "Tất cả dịch vụ";
  const subName = location.state?.subName;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await studentServiceService.getAllPublic({ category: subName });
      const servicesData = unwrapList(res);

      if (token) {
        const role = localStorage.getItem('userRole');
        const promises = [savedItemsService.getMySavedServices()];
        if (role === 'STUDENT') promises.push(studentService.getProfile());
        else promises.push(Promise.resolve(null));

        const [savedRes, profileRes] = await Promise.allSettled(promises);

        if (role === 'STUDENT' && profileRes.status === 'fulfilled' && profileRes.value?.success) {
          const currentId = profileRes.value.data.studentId;
          setMyStudentId(currentId);
        }

        if (savedRes.status === 'fulfilled') {
          const savedData = unwrapList(savedRes.value);
          if (savedData.length > 0) {
            const ids = new Set(savedData.map(item => item.serviceId));
            setSavedServiceIds(ids);
          }
        }
      }

      setServices(servicesData.filter(s => s.studentId !== myStudentId));

    } catch (err) {
      console.error("Lỗi tải trang:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [subName, myStudentId]);

  const handleToggleSave = async (e, serviceId, ownerId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      alert("Vui lòng đăng nhập!");
      return navigate('/login');
    }

    const role = localStorage.getItem('userRole');
    if (role === 'STUDENT' && myStudentId === ownerId) {
      alert("Bạn không thể thả tim vào dịch vụ của chính mình.");
      return;
    }

    if (role === 'STUDENT' && !myStudentId) {
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
        {token && localStorage.getItem('userRole') === 'STUDENT' && !myStudentId && (
            <Alert variant="danger" className="bg-danger bg-opacity-10 border-danger text-white mb-4 d-flex align-items-center gap-3">
                <AlertTriangle size={20} className="text-danger" />
                <div>
                    Tài khoản của bạn chưa được liên kết với hồ sơ Sinh viên. 
                    Bạn không thể Thả tim hoặc Lưu bài. <Link to="/profile-settings" className="text-info fw-bold">Cập nhật ngay</Link>
                </div>
            </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-5">
           <h1 className="fw-bold display-6">{subName || mainTitle} <span className="text-primary-glow">Freelance</span></h1>
           <Button as={Link} to="/post-service" variant="primary" className="fw-bold px-4 shadow-glow"><span className="me-2">+</span> ĐĂNG BÀI</Button>
        </div>

        <Row xs={1} sm={2} lg={3} className="g-4">
          {services.map((s, index) => {
            const isSaved = savedServiceIds.has(s.serviceId);
            return (
              <Col key={s.serviceId}>
                <Link to={`/service-detail/${s.serviceId}`} className="text-decoration-none">
                  <div className="svc-card-v" style={{animationDelay: `${index * 0.08}s`}}>
                    <div className="svc-card-v-img">
                      <img 
                        src={s.sampleImageUrl || 'https://placehold.co/400x280/0f172a/3b82f6?text=Service'} 
                        alt={s.title} 
                        loading="lazy"
                      />
                      <div className="svc-card-v-badges-top">
                        <Badge className="svc-badge-category">{s.category || 'Dịch vụ'}</Badge>
                        <div className="svc-badge-zap"><Zap size={14} fill="#fff" /></div>
                        {s.isStudentVerified && (
                          <Badge className="svc-badge-verified"><ShieldCheck size={10}/> Verified</Badge>
                        )}
                      </div>
                      <div className="svc-card-v-price-tag">
                        {s.price?.toLocaleString('vi-VN')}<small>đ</small>
                      </div>
                      <button 
                        className={`svc-card-v-heart ${isSaved ? 'saved' : ''}`}
                        onClick={(e) => handleToggleSave(e, s.serviceId, s.studentId)}
                      >
                        {actionLoading === s.serviceId ? (
                          <Loader2 size={16} className="spinner" />
                        ) : (
                          <Heart size={16} fill={isSaved ? "#ef4444" : "none"} />
                        )}
                      </button>
                    </div>
                    <div className="svc-card-v-body">
                      <div className="svc-card-v-location">
                        <MapPin size={12} /> {s.studentName || 'Sinh viên'}
                      </div>
                      <h6 className="svc-card-v-title">{s.title}</h6>
                      <div className="svc-card-v-author">
                        <img src={s.studentAvatarUrl || 'https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff'} alt="" loading="lazy" />
                        <span className="svc-card-v-author-name">{s.studentName}</span>
                        <span className="svc-card-v-author-dot">·</span>
                        <span className="svc-card-v-author-time">
                          <Calendar size={10}/> {s.deliveryDays || '?'} ngày
                        </span>
                      </div>
                      <div className="svc-card-v-divider"></div>
                      <div className="svc-card-v-stats">
                        <div className="svc-card-v-stat">
                          <Clock size={12} /> <span>{s.deliveryDays || '?'} ngày</span>
                        </div>
                        <div className="svc-card-v-stat">
                          <Star size={12} /> <span>{s.rating || 'Mới'}</span>
                        </div>
                        <div className="svc-card-v-stat">
                          <Users size={12} /> <span>{s.totalOrders || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default Services;
