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
import { enterpriseService } from '../services/enterprise.service';
import '../CSS/Home.css';

const Home = () => {
  const [recommendations, setRecommendations] = useState({ jobs: [], studentServices: [] });
  const [randomJobs, setRandomJobs] = useState([]);
  const [randomServices, setRandomServices] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);
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

        const [bizRes] = await Promise.allSettled([
          enterpriseService.getAllEnterprises()
        ]);
        if (bizRes.status === 'fulfilled') {
          const bizData = bizRes.value?.data || bizRes.value || [];
          setTopBusinesses((Array.isArray(bizData) ? bizData : []).slice(0, 4));
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <div className="hero-branding mb-4">
            <div className="hero-badge-inline mb-2">
              <Zap size={12}/> NỀN TẢNG #1 SINH VIÊN FREELANCER
            </div>
            <h1 className="main-title display-5 fw-bold text-white mb-2" style={{fontSize: '2rem'}}>
              STUDENT <span className="text-primary-glow">FREELANCE</span> PLATFORM
            </h1>
            <p className="hero-slogan fw-light text-info mb-3" style={{fontSize: '0.85rem', letterSpacing: '1px'}}>
              "Hành trình khởi nghiệp - Kết nối tri thức"
            </p>
            <p className="hero-description mx-auto text-white-80" style={{ maxWidth: '600px', fontSize: '0.85rem' }}>
              Nền tảng hàng đầu kết nối sinh viên tài năng với các dự án thực tế. 
              Nâng tầm kỹ năng, xây dựng hồ sơ năng lực chuyên nghiệp ngay từ khi còn đi học.
            </p>
          </div>

          <div className="hero-quick-stats mb-3">
            <div className="quick-stat-item">
              <Users size={16} className="text-primary"/>
              <span><strong className="text-white">2,500+</strong> Sinh viên</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Briefcase size={16} className="text-success"/>
              <span><strong className="text-white">800+</strong> Dự án</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Building2 size={16} className="text-warning"/>
              <span><strong className="text-white">150+</strong> Doanh nghiệp</span>
            </div>
          </div>
          
          <div className="search-container glass-card mx-auto shadow-lg">
            <div className="search-header d-flex align-items-center justify-content-center gap-2">
              <Search size={12}/> TÌM KIẾM DỰ ÁN PHÙ HỢP
            </div>
            <div className="search-body p-2">
              <Row className="g-2 align-items-center">
                <Col md={4}>
                  <Button as={Link} to="/jobs" variant="primary" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Briefcase size={14}/> TÌM VIỆC LÀM
                  </Button>
                </Col>
                <Col md={4}>
                  <Button as={Link} to="/services" variant="outline-primary" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Sparkles size={14}/> KHÁM PHÁ DỊCH VỤ
                  </Button>
                </Col>
                <Col md={4}>
                  <Button as={Link} to="/services-list" variant="outline-light" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Layout size={14}/> DANH MỤC
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
            <section className="recommendation-section">
              <Container>
                <div className="section-header-wrap d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <div className="section-badge mb-2">
                      {token ? <><Sparkles size={12}/> ĐỀ XUẤT CHO BẠN</> : <><TrendingUp size={12}/> VIỆC LÀM NỔI BẬT</>}
                    </div>
                    <h5 className="text-white fw-bold mb-1" style={{fontSize: '1.1rem'}}>
                      {token ? 'Việc làm phù hợp' : 'Việc làm mới nhất'}
                    </h5>
                    <p className="text-white-50 mb-0" style={{fontSize: '0.75rem'}}>Khám phá các dự án phù hợp với kỹ năng của bạn</p>
                  </div>
                  <Button as={Link} to="/jobs" variant="outline-primary" className="fw-bold px-3 d-none d-md-flex align-items-center gap-2" style={{fontSize: '0.75rem'}}>
                    Xem tất cả <ArrowRight size={14}/>
                  </Button>
                </div>

                <Row className="g-3">
                  {displayJobs.slice(0, 6).map((job, index) => (
                    <Col md={6} lg={4} key={job.jobId || index}>
                      <div className="home-recommend-card glass-card h-100" style={{animationDelay: `${index * 0.08}s`}}>
                        <div className="recommend-card-top">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge bg={job.jobType === 'FULL_TIME' ? 'primary' : job.jobType === 'PART_TIME' ? 'info' : 'secondary'} style={{fontSize: '0.55rem', padding: '3px 6px'}}>
                              {job.jobType || 'Freelance'}
                            </Badge>
                            <span style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>{timeAgo(job.createdAt)}</span>
                          </div>
                          <h6 className="fw-bold text-white mb-1 line-clamp-2" style={{fontSize: '0.85rem'}}>{job.title}</h6>
                          <p className="line-clamp-2 mb-2" style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{job.description || 'Mô tả chi tiết...'}</p>
                        </div>
                        <div className="recommend-card-bottom">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="recommend-company-avatar">
                              {job.enterpriseName?.[0] || 'E'}
                            </div>
                            <div>
                              <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'white'}}>{job.enterpriseName || 'Doanh nghiệp'}</div>
                              {job.location && <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}><MapPin size={8}/> {job.location}</div>}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="recommend-price" style={{fontSize: '0.8rem'}}>
                              {job.salary > 0 ? <>{formatMoney(job.salary)}<small style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem'}}> VND</small></> : <span className="text-info" style={{fontSize: '0.75rem'}}>Thỏa thuận</span>}
                            </div>
                            <Button as={Link} to="/jobs" variant="primary" size="sm" className="fw-bold" style={{fontSize: '0.65rem', padding: '4px 10px'}}>
                              Ứng tuyển
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-3 d-md-none">
                  <Button as={Link} to="/jobs" variant="primary" className="fw-bold px-4" style={{fontSize: '0.75rem'}}>
                    Xem tất cả việc làm <ArrowRight size={14} className="ms-1"/>
                  </Button>
                </div>
              </Container>
            </section>
          )}

          {/* SERVICE RECOMMENDATIONS */}
          {displayServices.length > 0 && (
            <section className="recommendation-section">
              <Container>
                <div className="section-header-wrap d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <div className="section-badge mb-2">
                      {token ? <><Award size={12}/> DỊCH VỤ ĐỀ XUẤT</> : <><Star size={12}/> DỊCH VỤ NỔI BẬT</>}
                    </div>
                    <h5 className="text-white fw-bold mb-1" style={{fontSize: '1.1rem'}}>
                      {token ? 'Dịch vụ dành cho bạn' : 'Dịch vụ sinh viên'}
                    </h5>
                    <p className="text-white-50 mb-0" style={{fontSize: '0.75rem'}}>Tìm kiếm dịch vụ chất lượng từ sinh viên tài năng</p>
                  </div>
                  <Button as={Link} to="/services" variant="outline-primary" className="fw-bold px-3 d-none d-md-flex align-items-center gap-2" style={{fontSize: '0.75rem'}}>
                    Xem tất cả <ArrowRight size={14}/>
                  </Button>
                </div>

                <Row className="g-3">
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
                              <Eye size={14}/> Xem ngay
                            </Button>
                          </div>
                          {svc.recommendationReason && (
                            <div className="service-reason-badge">
                              {svc.recommendationReason === 'ORDER_HISTORY' ? 'Đã đặt hàng' : 'Phù hợp'}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Badge bg="primary" style={{fontSize: '0.55rem', padding: '3px 6px'}}>{svc.category || 'Dịch vụ'}</Badge>
                            {svc.isStudentVerified && (
                              <Badge bg="success" className="d-flex align-items-center gap-1" style={{fontSize: '0.55rem', padding: '3px 6px'}}>
                                <ShieldCheck size={8}/> Verified
                              </Badge>
                            )}
                          </div>
                          <h6 className="fw-bold text-white mb-1 line-clamp-1" style={{fontSize: '0.85rem'}}>{svc.title}</h6>
                          <p className="line-clamp-2 mb-2" style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{svc.description}</p>
                          
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <img src={svc.studentAvatarUrl || 'https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff'} alt="" className="recommend-student-avatar" />
                            <span style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{svc.studentName}</span>
                            <span style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto'}}><Eye size={10}/> {svc.viewsCount || 0}</span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                            <div className="recommend-price" style={{fontSize: '0.8rem'}}>
                              {formatMoney(svc.price)}<small style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem'}}> VND</small>
                            </div>
                            <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>
                              <Clock size={10} className="me-1"/> {svc.deliveryDays} ngày
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-3 d-md-none">
                  <Button as={Link} to="/services" variant="primary" className="fw-bold px-4" style={{fontSize: '0.75rem'}}>
                    Xem tất cả dịch vụ <ArrowRight size={14} className="ms-1"/>
                  </Button>
                </div>
              </Container>
            </section>
          )}
        </>
      )}

      {/* --- CATEGORIES --- */}
      <section className="category-section py-4">
        <Container>
          <div className="section-header-wrap mb-4 text-center">
            <div className="section-badge mb-2 mx-auto"><Layout size={12}/> KHÁM PHÁ</div>
            <h5 className="text-white fw-bold" style={{fontSize: '1.1rem'}}>Danh mục phổ biến</h5>
            <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)'}}>Tìm kiếm theo lĩnh vực chuyên môn</p>
          </div>
          <Row className="g-3 justify-content-center">
            {[
              { icon: <Code size={22} />, title: "Lập trình & IT", color: "#3b82f6", link: "/services" },
              { icon: <Layout size={22} />, title: "Thiết kế Đồ họa", color: "#ec4899", link: "/services" },
              { icon: <Briefcase size={22} />, title: "Marketing & SEO", color: "#10b981", link: "/services" },
              { icon: <FileText size={22} />, title: "Viết lách & Dịch thuật", color: "#f59e0b", link: "/services" },
              { icon: <Building2 size={22} />, title: "Kinh doanh & Tư vấn", color: "#8b5cf6", link: "/services" },
              { icon: <Database size={22} />, title: "Data & AI", color: "#06b6d4", link: "/services" },
            ].map((item, index) => (
              <Col xs={6} sm={4} md={3} lg={2} key={index}>
                <Link to={item.link} className="text-decoration-none">
                  <div className="cat-card glass-card h-100" style={{"--border-color": item.color}}>
                    <div className="cat-icon-wrapper" style={{color: item.color, backgroundColor: `${item.color}15`}}>{item.icon}</div>
                    <div className="cat-content mt-2 text-center">
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
      <section className="partner-section">
        <Container>
          <div className="section-header-wrap d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="section-badge mb-2"><GraduationCap size={12}/> ĐỐI TÁC HỌC THUẬT</div>
              <h5 className="text-white fw-bold mb-1" style={{fontSize: '1.1rem'}}>Trường đại học đối tác</h5>
              <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)'}}>Nguồn nhân lực chất lượng cao từ các trường hàng đầu</p>
            </div>
            <Button as={Link} to="/universities" variant="outline-primary" className="fw-bold px-3 d-none d-md-flex align-items-center gap-2" style={{fontSize: '0.75rem'}}>
              Xem tất cả <ArrowRight size={14}/>
            </Button>
          </div>
          <Row className="g-3">
            <Col className="text-center py-4">
              <p className="text-white-50" style={{fontSize: '0.8rem'}}>Đang cập nhật danh sách trường đại học đối tác</p>
            </Col>
          </Row>
          <div className="text-center mt-3 d-md-none">
            <Button as={Link} to="/universities" variant="primary" className="fw-bold px-4" style={{fontSize: '0.75rem'}}>
              Xem tất cả trường <ArrowRight size={14} className="ms-1"/>
            </Button>
          </div>
        </Container>
      </section>

      {/* --- BUSINESSES --- */}
      <section className="partner-section">
        <Container>
          <div className="section-header-wrap d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="section-badge mb-2"><Building2 size={12}/> ĐỐI TÁC DOANH NGHIỆP</div>
              <h5 className="text-white fw-bold mb-1" style={{fontSize: '1.1rem'}}>Doanh nghiệp hàng đầu</h5>
              <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)'}}>Kết nối với các doanh nghiệp uy tín đang tìm kiếm nhân sự</p>
            </div>
            <Button as={Link} to="/businesses" variant="outline-primary" className="fw-bold px-3 d-none d-md-flex align-items-center gap-2" style={{fontSize: '0.75rem'}}>
              Xem tất cả <ArrowRight size={14}/>
            </Button>
          </div>
          <Row className="g-3">
            {topBusinesses.map((biz, index) => (
              <Col lg={3} md={6} key={biz.enterpriseId || biz.id || index}>
                <div className="home-partner-card glass-card h-100 text-center" style={{animationDelay: `${index * 0.08}s`}}>
                  <div className="partner-logo-wrap mb-2 mx-auto" style={{background: 'rgba(16,185,129,0.15)', color: '#10b981'}}>
                    <Building2 size={22} />
                  </div>
                  <h6 className="text-white fw-bold mb-1" style={{fontSize: '0.8rem'}}>{biz.companyName || biz.name}</h6>
                  <p className="line-clamp-2 mb-2" style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)'}}>{biz.description || biz.bio || 'Doanh nghiệp uy tín'}</p>
                  <div className="d-flex justify-content-center align-items-center pt-2 border-top" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                    <div className="text-center">
                      <div className="fw-bold text-primary" style={{fontSize: '0.8rem'}}>{biz.totalJobs || biz.jobs || 0}</div>
                      <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>Việc làm</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
            {topBusinesses.length === 0 && (
              <Col className="text-center py-4">
                <p className="text-white-50" style={{fontSize: '0.8rem'}}>Chưa có dữ liệu doanh nghiệp</p>
              </Col>
            )}
          </Row>
          <div className="text-center mt-3 d-md-none">
            <Button as={Link} to="/businesses" variant="primary" className="fw-bold px-4" style={{fontSize: '0.75rem'}}>
              Xem tất cả doanh nghiệp <ArrowRight size={14} className="ms-1"/>
            </Button>
          </div>
        </Container>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="how-to-use-section py-4 mb-3">
        <Container>
          <div className="text-center mb-4">
            <div className="section-badge mb-2 mx-auto"><PlayCircle size={12}/> CÁCH THỨC</div>
            <h5 className="guide-title fw-bold text-white" style={{fontSize: '1.1rem'}}>Bắt đầu trong 4 bước</h5>
          </div>
          <div className="steps-wrapper">
            <Row className="g-3">
              {[
                { step: 1, title: "Tạo tài khoản", desc: "Đăng ký miễn phí và hoàn thiện hồ sơ.", icon: <UserPlus size={20}/> },
                { step: 2, title: "Tìm dự án", desc: "Duyệt qua dự án phù hợp với kỹ năng.", icon: <Search size={20}/> },
                { step: 3, title: "Làm việc", desc: "Thực hiện và báo cáo tiến độ qua hệ thống.", icon: <MessagesSquare size={20}/> },
                { step: 4, title: "Nhận tiền", desc: "Nhận thanh toán an toàn sau khi hoàn thành.", icon: <Wallet size={20}/> }
              ].map((item, index) => (
                <Col lg={3} md={6} key={index} className="step-item text-center"> 
                  <div className="guide-step-card h-100 glass-card">
                    <div className="step-icon-wrapper mx-auto mb-2">{item.icon}</div>
                    <div className="step-number-circle mx-auto mb-2">{item.step}</div>
                    <h6 className="step-heading text-white fw-bold mb-1" style={{fontSize: '0.85rem'}}>{item.title}</h6>
                    <p className="step-description mb-0" style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{item.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* --- CTA --- */}
      <section className="cta-section mb-4">
        <Container>
          <div className="cta-card glass-card text-center position-relative overflow-hidden">
            <div className="cta-bg-glow"></div>
            <div className="position-relative">
              <h5 className="fw-bold text-white mb-2" style={{fontSize: '1.2rem'}}>Sẵn sàng bắt đầu?</h5>
              <p className="mb-3 mx-auto" style={{maxWidth: '400px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>
                Tham gia cộng đồng sinh viên freelancer lớn nhất Việt Nam ngay hôm nay.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Button as={Link} to={token ? "/jobs" : "/register"} variant="primary" className="fw-bold" style={{fontSize: '0.8rem', padding: '10px 24px'}}>
                  {token ? "TÌM VIỆC NGAY" : "ĐĂNG KÝ MIỄN PHÍ"}
                </Button>
                <Button as={Link} to="/services" variant="outline-light" className="fw-bold" style={{fontSize: '0.8rem', padding: '10px 24px'}}>
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
