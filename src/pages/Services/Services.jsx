import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom'; 
import { Heart, Loader2, AlertTriangle, MapPin, Calendar, Clock, Star, Users, Zap, ShieldCheck, Search, Filter, X } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { savedItemsService } from '../../services/saveditemsservice';
import { studentService } from '../../services/studentservice'; 
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/Services.css'; 

const CATEGORIES = [
  'Tất cả', 'Lập trình', 'Thiết kế', 'Marketing', 'Viết nội dung',
  'Dịch thuật', 'Kinh doanh', 'Giáo dục', 'Khác'
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: '', max: '' },
  { label: 'Dưới 500K', min: '', max: 500000 },
  { label: '500K - 1 triệu', min: 500000, max: 1000000 },
  { label: '1 triệu - 3 triệu', min: 1000000, max: 3000000 },
  { label: '3 triệu - 5 triệu', min: 3000000, max: 5000000 },
  { label: 'Trên 5 triệu', min: 5000000, max: '' },
];

const Services = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [savedServiceIds, setSavedServiceIds] = useState(new Set());
  const [myStudentId, setMyStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);

  const token = localStorage.getItem('accessToken');
  const mainTitle = location.state?.mainTitle || "Tất cả dịch vụ";
  const subName = location.state?.subName;

  useEffect(() => {
    if (subName) setSelectedCategory(subName);
  }, [subName]);

  const fetchData = useCallback(async (page = 1, keyword = '', category = '', minPrice = '', maxPrice = '') => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (keyword) params.keyword = keyword;
      if (category && category !== 'Tất cả') params.category = category;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await studentServiceService.getAllPublic(params);
      
      if (res.success && res.data) {
        const data = res.data;
        const items = data.items || [];
        setServices(items.filter(s => s.studentId !== myStudentId));
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(data.page || 1);
      } else {
        setServices([]);
      }

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
          const savedData = savedRes.value?.data;
          const savedList = savedData?.items || (Array.isArray(savedData) ? savedData : []);
          if (savedList.length > 0) {
            const ids = new Set(savedList.map(item => item.serviceId));
            setSavedServiceIds(ids);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi tải trang:", err);
    } finally {
      setLoading(false);
    }
  }, [myStudentId, token]);

  useEffect(() => {
    const price = PRICE_RANGES[selectedPriceRange];
    fetchData(1, searchTerm, selectedCategory, price.min, price.max);
  }, [selectedCategory, selectedPriceRange]);

  const handleSearch = () => {
    const price = PRICE_RANGES[selectedPriceRange];
    setCurrentPage(1);
    fetchData(1, searchTerm, selectedCategory, price.min, price.max);
  };

  const handlePageChange = (page) => {
    const price = PRICE_RANGES[selectedPriceRange];
    fetchData(page, searchTerm, selectedCategory, price.min, price.max);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tất cả');
    setSelectedPriceRange(0);
    fetchData(1, '', 'Tất cả', '', '');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'Tất cả' || selectedPriceRange !== 0;

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

        <div className="d-flex justify-content-between align-items-center mb-4">
           <h1 className="fw-bold display-6">{subName || mainTitle} <span className="text-primary-glow">Freelance</span></h1>
           <Button as={Link} to="/post-service" variant="primary" className="fw-bold px-4 shadow-glow"><span className="me-2">+</span> ĐĂNG BÀI</Button>
        </div>

        {/* FILTER BAR */}
        <div className="glass-card p-3 mb-4" style={{borderRadius: '16px'}}>
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                <InputGroup.Text className="bg-transparent border-0 text-primary"><Search size={18}/></InputGroup.Text>
                <Form.Control
                  placeholder="Tìm dịch vụ..."
                  className="bg-transparent border-0 text-white shadow-none py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                className="bg-dark-input text-white border-0 rounded-pill py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                className="bg-dark-input text-white border-0 rounded-pill py-2"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
              >
                {PRICE_RANGES.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button variant="primary" className="rounded-pill fw-bold px-4" onClick={handleSearch}>
                  <Filter size={16} className="me-1"/> Tìm
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline-light" className="rounded-pill px-3" onClick={handleClearFilters}>
                    <X size={16}/>
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <p className="text-white-50 mb-0">Tìm thấy <strong className="text-white">{totalItems}</strong> dịch vụ</p>
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

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>
    </div>
  );
};

export default Services;
