import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Code, Layout, Briefcase, MapPin, Building2, Bookmark, 
  ChevronRight, UserPlus, MessagesSquare, FileText, CheckCircle2,
  Calendar, Eye, Clock, Wallet, Sparkles, Database, GraduationCap,
  Heart, ExternalLink, Star, ShieldCheck, Loader2, Zap, TrendingUp,
  ArrowRight, PlayCircle, Users, Award, School
} from 'lucide-react';
import { recommendationService } from '../services/recommendationservice';
import { jobService } from '../services/jobservice';
import { studentServiceService } from '../services/studentserviceservice';
import '../CSS/Home.css';

const Home = () => {
  const [recommendations, setRecommendations] = useState({ jobs: [], studentServices: [] });
  const [randomJobs, setRandomJobs] = useState([]);
  const [randomServices, setRandomServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (token) {
          const res = await recommendationService.getMyRecommendations();
          if (res.success && res.data) {
            setRecommendations({ jobs: res.data.jobs || [], studentServices: res.data.studentServices || [] });
            setUserRole(res.data.role);
          }
        } else {
          const [jobsRes, servicesRes] = await Promise.allSettled([
            jobService.getAllPublicJobs(),
            studentServiceService.getAllPublic()
          ]);
          if (jobsRes.status === 'fulfilled') setRandomJobs((jobsRes.value?.data || []).slice(0, 6));
          if (servicesRes.status === 'fulfilled') setRandomServices((servicesRes.value?.data || []).slice(0, 6));
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topUniversities = [
    { id: 1, name: "ĐH Bách Khoa Hà Nội", type: "Kỹ thuật", students: "15,000+", projects: 450, abbr: "BK", color: "#3b82f6" },
    { id: 2, name: "ĐH Kinh tế Quốc dân", type: "Kinh tế", students: "12,000+", projects: 320, abbr: "NEU", color: "#10b981" },
    { id: 3, name: "ĐH FPT", type: "CNTT", students: "20,000+", projects: 680, abbr: "FPT", color: "#f59e0b" },
    { id: 4, name: "ĐH Ngoại thương", type: "Kinh tế", students: "15,000+", projects: 400, abbr: "FTU", color: "#8b5cf6" },
  ];

  const topBusinesses = [
    { id: 1, name: "FPT Software", desc: "Tập đoàn công nghệ hàng đầu", jobs: 45, abbr: "FPT", color: "#3b82f6" },
    { id: 2, name: "VinAI Research", desc: "Viện nghiên cứu AI hàng đầu", jobs: 8, abbr: "VIN", color: "#10b981" },
    { id: 3, name: "TechNova Solutions", desc: "Giải pháp chuyển đổi số", jobs: 12, abbr: "TN", color: "#f59e0b" },
    { id: 4, name: "Creative Lab VN", desc: "Agency Marketing sáng tạo", jobs: 5, abbr: "CL", color: "#8b5cf6" },
  ];

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  const displayJobs = token ? recommendations.jobs : randomJobs;
  const displayServices = token ? recommendations.studentServices : randomServices;
  const hasRecommendations = displayJobs.length > 0 || displayServices.length > 0;

  return (
    <div className="home-page">

      {/* --- HERO SEARCH --- */}
      <section className="hero-search-section text-center animate-fade-in">
        <Container>
          <div className="hero-floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="hero-branding mb-5">
            <div className="hero-badge-inline mb-3">
              <Zap size={14}/> NỀN TẢNG #1 SINH VIÊN FREELANCER
            </div>
            <h1 className="main-title display-3 fw-bold text-white mb-3">
              STUDENT <span className="text-primary-glow">FREELANCE</span> PLATFORM
            </h1>
            <p className="hero-slogan h4 fw-light text-info mb-4">
              "Hành trình khởi nghiệp - Kết nối tri thức"
            </p>
            <p className="hero-description lead mx-auto text-white-80" style={{ maxWidth: '750px' }}>
              Nền tảng hàng đầu kết nối sinh viên tài năng với các dự án thực tế. 
              Nâng tầm kỹ năng, xây dựng hồ sơ năng lực chuyên nghiệp ngay từ khi còn đi học.
            </p>
          </div>

          <div className="hero-quick-stats mb-4">
            <div className="quick-stat-item">
              <Users size={20} className="text-primary"/>
              <span><strong className="text-white">2,500+</strong> Sinh viên</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Briefcase size={20} className="text-success"/>
              <span><strong className="text-white">800+</strong> Dự án</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Building2 size={20} className="text-warning"/>
              <span><strong className="text-white">150+</strong> Doanh nghiệp</span>
            </div>
          </div>
          
          <div className="search-container glass-card mx-auto shadow-lg">
            <div className="search-header d-flex align-items-center justify-content-center gap-2">
              <Search size={14}/> TÌM KIẾM DỰ ÁN PHÙ HỢP
            </div>
            <div className="search-body p-3">
              <Row className="g-2 align-items-center">
                <Col md={4}>
                  <Button as={Link} to="/jobs" variant="primary" className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Briefcase size={18}/> TÌM VIỆC LÀM
                  </Button>
                </Col>
                <Col md={4}>
                  <Button as={Link} to="/services" variant="outline-primary" className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Sparkles size={18}/> KHÁM PHÁ DỊCH VỤ
                  </Button>
                </Col>
                <Col md={4}>
                  <Button as={Link} to="/services-list" variant="outline-light" className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Layout size={18}/> DANH MỤC
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </section>

      {/* --- RECOMMENDATIONS / RANDOM SECTION --- */}
      {loading ? (
        <section className="py-5">
          <Container className="text-center">
            <Loader2 className="spinner text-primary mb-3" size={36} />
            <p className="text-muted">Đang tải đề xuất...</p>
          </Container>
        </section>
      ) : hasRecommendations && (
        <>
          {/* JOB RECOMMENDATIONS */}
          {displayJobs.length > 0 && (
            <section className="recommendation-section py-5">
              <Container>
                <div className="section-header-wrap d-flex justify-content-between align-items-center mb-5">
                  <div>
                    <div className="section-badge mb-2">
                      {token ? <><Sparkles size={14}/> ĐỀ XUẤT CHO BẠN</> : <><TrendingUp size={14}/> VIỆC LÀM NỔI BẬT</>}
                    </div>
                    <h2 className="text-white fw-bold mb-1">
                      {token ? 'Việc làm phù hợp' : 'Việc làm mới nhất'}
                    </h2>
                    <p className="text-white-50 mb-0">Khám phá các dự án phù hợp với kỹ năng của bạn</p>
                  </div>
                  <Button as={Link} to="/jobs" variant="outline-primary" className="fw-bold px-4 d-none d-md-flex align-items-center gap-2">
                    Xem tất cả <ArrowRight size={16}/>
                  </Button>
                </div>

                <Row className="g-4">
                  {displayJobs.slice(0, 6).map((job, index) => (
                    <Col md={6} lg={4} key={job.jobId || index}>
                      <div className="home-recommend-card glass-card h-100" style={{animationDelay: `${index * 0.08}s`}}>
                        <div className="recommend-card-top">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Badge bg={job.jobType === 'FULL_TIME' ? 'primary' : job.jobType === 'PART_TIME' ? 'info' : 'secondary'} className="x-small-badge">
                              {job.jobType || 'Freelance'}
                            </Badge>
                            <span className="x-small text-white-50">{timeAgo(job.createdAt)}</span>
                          </div>
                          <h5 className="fw-bold text-white mb-2 line-clamp-2">{job.title}</h5>
                          <p className="text-white-50 small line-clamp-2 mb-3">{job.description || 'Mô tả chi tiết...'}</p>
                        </div>
                        <div className="recommend-card-bottom">
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <div className="recommend-company-avatar">
                              {job.enterpriseName?.[0] || 'E'}
                            </div>
                            <div>
                              <div className="small fw-bold text-white">{job.enterpriseName || 'Doanh nghiệp'}</div>
                              {job.location && <div className="x-small text-white-50"><MapPin size={10}/> {job.location}</div>}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="recommend-price">
                              {job.salary > 0 ? <>{formatMoney(job.salary)}<small className="text-white-50"> VND</small></> : <span className="text-info">Thỏa thuận</span>}
                            </div>
                            <Button as={Link} to="/jobs" variant="primary" size="sm" className="fw-bold px-3">
                              Ứng tuyển
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-4 d-md-none">
                  <Button as={Link} to="/jobs" variant="primary" className="fw-bold px-5">
                    Xem tất cả việc làm <ArrowRight size={16} className="ms-1"/>
                  </Button>
                </div>
              </Container>
            </section>
          )}

          {/* SERVICE RECOMMENDATIONS */}
          {displayServices.length > 0 && (
            <section className="recommendation-section py-5">
              <Container>
                <div className="section-header-wrap d-flex justify-content-between align-items-center mb-5">
                  <div>
                    <div className="section-badge mb-2">
                      {token ? <><Award size={14}/> DỊCH VỤ ĐỀ XUẤT</> : <><Star size={14}/> DỊCH VỤ NỔI BẬT</>}
                    </div>
                    <h2 className="text-white fw-bold mb-1">
                      {token ? 'Dịch vụ dành cho bạn' : 'Dịch vụ sinh viên'}
                    </h2>
                    <p className="text-white-50 mb-0">Tìm kiếm dịch vụ chất lượng từ sinh viên tài năng</p>
                  </div>
                  <Button as={Link} to="/services" variant="outline-primary" className="fw-bold px-4 d-none d-md-flex align-items-center gap-2">
                    Xem tất cả <ArrowRight size={16}/>
                  </Button>
                </div>

                <Row className="g-4">
                  {displayServices.slice(0, 6).map((svc, index) => (
                    <Col md={6} lg={4} key={svc.serviceId || index}>
                      <div className="home-service-card glass-card h-100" style={{animationDelay: `${index * 0.08}s`}}>
                        <div className="service-card-img-wrapper">
                          <img 
                            src={svc.sampleImageUrl || 'https://via.placeholder.com/600x340/0f172a/3b82f6?text=Service'} 
                            alt={svc.title} 
                            className="service-card-img"
                          />
                          <div className="service-card-img-overlay">
                            <Button as={Link} to={`/service-detail/${svc.serviceId}`} className="service-view-btn">
                              <Eye size={16}/> Xem ngay
                            </Button>
                          </div>
                          {svc.recommendationReason && (
                            <div className="service-reason-badge">
                              {svc.recommendationReason === 'ORDER_HISTORY' ? 'Đã đặt hàng' : 'Phù hợp'}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Badge bg="primary" className="x-small-badge">{svc.category || 'Dịch vụ'}</Badge>
                            {svc.isStudentVerified && (
                              <Badge bg="success" className="x-small-badge d-flex align-items-center gap-1">
                                <ShieldCheck size={10}/> Verified
                              </Badge>
                            )}
                          </div>
                          <h5 className="fw-bold text-white mb-2 line-clamp-1">{svc.title}</h5>
                          <p className="text-white-50 small line-clamp-2 mb-3">{svc.description}</p>
                          
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <img src={svc.studentAvatarUrl || 'https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff'} alt="" className="recommend-student-avatar" />
                            <span className="small text-white-50">{svc.studentName}</span>
                            <span className="x-small text-white-50 ms-auto"><Eye size={12}/> {svc.viewsCount || 0}</span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10">
                            <div className="recommend-price">
                              {formatMoney(svc.price)}<small className="text-white-50"> VND</small>
                            </div>
                            <div className="x-small text-white-50">
                              <Clock size={12} className="me-1"/> {svc.deliveryDays} ngày
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-4 d-md-none">
                  <Button as={Link} to="/services" variant="primary" className="fw-bold px-5">
                    Xem tất cả dịch vụ <ArrowRight size={16} className="ms-1"/>
                  </Button>
                </div>
              </Container>
            </section>
          )}
        </>
      )}

      {/* --- CATEGORIES --- */}
      <section className="category-section py-5">
        <Container>
          <div className="section-header-wrap mb-5 text-center">
            <div className="section-badge mb-2 mx-auto"><Layout size={14}/> KHÁM PHÁ</div>
            <h2 className="text-white fw-bold">Danh mục phổ biến</h2>
            <p className="text-white-50">Tìm kiếm theo lĩnh vực chuyên môn</p>
          </div>
          <Row className="g-4 justify-content-center">
            {[
              { icon: <Code size={28} />, title: "Lập trình & IT", color: "#3b82f6", link: "/services" },
              { icon: <Layout size={28} />, title: "Thiết kế Đồ họa", color: "#ec4899", link: "/services" },
              { icon: <Briefcase size={28} />, title: "Marketing & SEO", color: "#10b981", link: "/services" },
              { icon: <FileText size={28} />, title: "Viết lách & Dịch thuật", color: "#f59e0b", link: "/services" },
              { icon: <Building2 size={28} />, title: "Kinh doanh & Tư vấn", color: "#8b5cf6", link: "/services" },
              { icon: <Database size={28} />, title: "Data & AI", color: "#06b6d4", link: "/services" },
            ].map((item, index) => (
              <Col xs={6} sm={4} md={3} lg={2} key={index}>
                <Link to={item.link} className="text-decoration-none">
                  <div className="cat-card glass-card h-100" style={{"--border-color": item.color}}>
                    <div className="cat-icon-wrapper" style={{color: item.color, backgroundColor: `${item.color}15`}}>{item.icon}</div>
                    <div className="cat-content mt-3 text-center">
                      <h6 className="cat-title text-white fw-bold">{item.title}</h6>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* --- UNIVERSITIES --- */}
      <section className="partner-section py-5">
        <Container>
          <div className="section-header-wrap d-flex justify-content-between align-items-center mb-5">
            <div>
              <div className="section-badge mb-2"><GraduationCap size={14}/> ĐỐI TÁC HỌC THUẬT</div>
              <h2 className="text-white fw-bold mb-1">Trường đại học đối tác</h2>
              <p className="text-white-50 mb-0">Nguồn nhân lực chất lượng cao từ các trường hàng đầu</p>
            </div>
            <Button as={Link} to="/universities" variant="outline-primary" className="fw-bold px-4 d-none d-md-flex align-items-center gap-2">
              Xem tất cả <ArrowRight size={16}/>
            </Button>
          </div>
          <Row className="g-4">
            {topUniversities.map((uni, index) => (
              <Col lg={3} md={6} key={uni.id}>
                <div className="home-partner-card glass-card h-100 p-4" style={{animationDelay: `${index * 0.08}s`}}>
                  <div className="partner-logo-wrap mb-3" style={{background: `${uni.color}15`, color: uni.color}}>
                    <GraduationCap size={28} />
                  </div>
                  <h6 className="text-white fw-bold mb-1">{uni.name}</h6>
                  <p className="x-small text-primary fw-bold mb-3 uppercase-tracking">{uni.type}</p>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10">
                    <div className="text-center">
                      <div className="fw-bold text-white small">{uni.students}</div>
                      <div className="x-small text-white-50">Sinh viên</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold text-primary small">{uni.projects}</div>
                      <div className="x-small text-white-50">Dự án</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4 d-md-none">
            <Button as={Link} to="/universities" variant="primary" className="fw-bold px-5">
              Xem tất cả trường <ArrowRight size={16} className="ms-1"/>
            </Button>
          </div>
        </Container>
      </section>

      {/* --- BUSINESSES --- */}
      <section className="partner-section py-5">
        <Container>
          <div className="section-header-wrap d-flex justify-content-between align-items-center mb-5">
            <div>
              <div className="section-badge mb-2"><Building2 size={14}/> ĐỐI TÁC DOANH NGHIỆP</div>
              <h2 className="text-white fw-bold mb-1">Doanh nghiệp hàng đầu</h2>
              <p className="text-white-50 mb-0">Kết nối với các doanh nghiệp uy tín đang tìm kiếm nhân sự</p>
            </div>
            <Button as={Link} to="/businesses" variant="outline-primary" className="fw-bold px-4 d-none d-md-flex align-items-center gap-2">
              Xem tất cả <ArrowRight size={16}/>
            </Button>
          </div>
          <Row className="g-4">
            {topBusinesses.map((biz, index) => (
              <Col lg={3} md={6} key={biz.id}>
                <div className="home-partner-card glass-card h-100 p-4 text-center" style={{animationDelay: `${index * 0.08}s`}}>
                  <div className="partner-logo-wrap mb-3 mx-auto" style={{background: `${biz.color}15`, color: biz.color}}>
                    <Building2 size={28} />
                  </div>
                  <h6 className="text-white fw-bold mb-2">{biz.name}</h6>
                  <p className="x-small text-white-50 mb-3 line-clamp-2">{biz.desc}</p>
                  <div className="d-flex justify-content-center align-items-center pt-3 border-top border-white border-opacity-10">
                    <div className="text-center">
                      <div className="fw-bold text-primary small">{biz.jobs}</div>
                      <div className="x-small text-white-50">Việc làm</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4 d-md-none">
            <Button as={Link} to="/businesses" variant="primary" className="fw-bold px-5">
              Xem tất cả doanh nghiệp <ArrowRight size={16} className="ms-1"/>
            </Button>
          </div>
        </Container>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="how-to-use-section py-5 mb-5">
        <Container>
          <div className="text-center mb-5">
            <div className="section-badge mb-2 mx-auto"><PlayCircle size={14}/> CÁCH THỨC</div>
            <h2 className="guide-title fw-bold text-white">Bắt đầu trong 4 bước</h2>
          </div>
          <div className="steps-wrapper">
            <Row className="g-4">
              {[
                { step: 1, title: "Tạo tài khoản", desc: "Đăng ký miễn phí và hoàn thiện hồ sơ cá nhân.", icon: <UserPlus size={24}/> },
                { step: 2, title: "Tìm dự án", desc: "Duyệt qua hàng ngàn dự án phù hợp với kỹ năng.", icon: <Search size={24}/> },
                { step: 3, title: "Làm việc", desc: "Thực hiện dự án và báo cáo tiến độ qua hệ thống.", icon: <MessagesSquare size={24}/> },
                { step: 4, title: "Nhận tiền", desc: "Nhận thanh toán an toàn sau khi hoàn thành.", icon: <Wallet size={24}/> }
              ].map((item, index) => (
                <Col lg={3} md={6} key={index} className="step-item text-center"> 
                  <div className="guide-step-card p-4 h-100 glass-card">
                    <div className="step-icon-wrapper mx-auto mb-3">{item.icon}</div>
                    <div className="step-number-circle mx-auto mb-3">{item.step}</div>
                    <h5 className="step-heading text-white fw-bold mb-2">{item.title}</h5>
                    <p className="step-description text-white-50 small mb-0">{item.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* --- CTA --- */}
      <section className="cta-section py-5 mb-5">
        <Container>
          <div className="cta-card glass-card p-5 text-center position-relative overflow-hidden">
            <div className="cta-bg-glow"></div>
            <div className="position-relative">
              <h2 className="fw-bold text-white display-6 mb-3">Sẵn sàng bắt đầu?</h2>
              <p className="text-white-50 mb-4 mx-auto" style={{maxWidth: '500px'}}>
                Tham gia cộng đồng sinh viên freelancer lớn nhất Việt Nam ngay hôm nay.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button as={Link} to={token ? "/jobs" : "/register"} variant="primary" size="lg" className="px-5 fw-bold shadow-glow">
                  {token ? "TÌM VIỆC NGAY" : "ĐĂNG KÝ MIỄN PHÍ"}
                </Button>
                <Button as={Link} to="/services" variant="outline-light" size="lg" className="px-5 fw-bold">
                  KHÁM PHÁ DỊCH VỤ
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
