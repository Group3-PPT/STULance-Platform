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
import { studentService } from '../services/studentservice';
import '../CSS/Home.css';

const Home = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Job và dịch vụ được đề xuất (dùng khi người dùng đã đăng nhập)
  const [recommendations, setRecommendations] = useState({
    jobs: [],
    studentServices: []
  });

  // Job và dịch vụ ngẫu nhiên (dùng khi chưa đăng nhập)
  const [randomJobs, setRandomJobs] = useState([]);
  const [randomServices, setRandomServices] = useState([]);

  // Top doanh nghiệp nổi bật
  const [topBusinesses, setTopBusinesses] = useState([]);

  // Sinh viên được đề xuất
  const [recommendedStudents, setRecommendedStudents] = useState([]);

  // Trạng thái loading
  const [loading, setLoading] = useState(true);

  // Vai trò người dùng (STUDENT, ENTERPRISE, ADMIN, hoặc null)
  const [userRole, setUserRole] = useState(null);

  // Token đăng nhập (null nếu chưa đăng nhập)
  const token = localStorage.getItem('accessToken');

  // ============================================================
  // TẢI DỮ LIỆU TRANG CHỦ
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy vai trò người dùng từ localStorage
        const role = localStorage.getItem('userRole');
        if (role) {
          setUserRole(role);
        }

        // ============================================================
        // BƯỚC 1: Luôn tải doanh nghiệp và sinh viên nổi bật
        // ============================================================
        const promises = [
          // Tải danh sách doanh nghiệp công khai
          enterpriseService.getAllPublicEnterprises()
            .catch(e => {
              console.error("Enterprises err:", e);
              return null;
            }),

          // Tải danh sách sinh viên công khai
          studentService.getAllPublicStudents()
            .catch(e => {
              console.error("Students err:", e);
              return null;
            }),
        ];

        // ============================================================
        // BƯỚC 2: Tải job/dịch vụ ngẫu nhiên (dùng cho KHách + fallback cho SV)
        // ============================================================
        promises.push(
          jobService.getAllPublicJobs().catch(() => null)
        );
        promises.push(
          studentServiceService.getAllPublic().catch(() => null)
        );

        // Chờ tất cả API hoàn thành
        const results = await Promise.all(promises);

        // Lấy kết quả theo thứ tự
        const bizRes = results[0];   // Doanh nghiệp
        const stuRes = results[1];   // Sinh viên
        const jobsRes = results[2];  // Viec lam
        const servicesRes = results[3]; // Dich vu

        // ============================================================
        // BƯỚC 3: Parse dữ liệu (xử lý nhiều dạng response)
        // ============================================================

        // Hàm unwrap: chuyển response thành mảng
        const unwrap = (res) => {
          if (!res) return [];

          if (Array.isArray(res)) return res;

          const data = res.data;

          if (Array.isArray(data)) return data;

          if (data && data.data && Array.isArray(data.data)) return data.data;

          return [];
        };

        // Lưu top 4 doanh nghiệp
        const allBusinesses = unwrap(bizRes);
        setTopBusinesses(allBusinesses.slice(0, 4));

        // Lưu top 4 sinh viên
        const allStudents = unwrap(stuRes);
        setRecommendedStudents(allStudents.slice(0, 4));

        // ============================================================
        // BƯỚC 4: Parse job và dịch vụ ngẫu nhiên (luon tai)
        // ============================================================
        const unwrapList = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;

          const d = res.data;
          if (Array.isArray(d)) return d;
          if (d && d.items && Array.isArray(d.items)) return d.items;
          if (d && d.data && Array.isArray(d.data)) return d.data;
          if (d && d.data && d.data.items && Array.isArray(d.data.items)) return d.data.items;

          return [];
        };

        var allJobs = unwrapList(jobsRes);
        var allServices = unwrapList(servicesRes);

        setRandomJobs(allJobs.slice(0, 6));
        setRandomServices(allServices.slice(0, 6));

        // ============================================================
        // BƯỚC 5: Neu dang nhap → tai recommendation ca nhan hoa
        // ============================================================
        if (token) {
          const res = await recommendationService.getMyRecommendations()
            .catch(() => null);

          if (res && res.success && res.data) {
            var recJobs = res.data.jobs || [];
            var recServices = res.data.studentServices || [];

            // Merge: recommendation truoc, fallback bang random neu trong
            setRecommendations({
              jobs: recJobs.length > 0 ? recJobs : allJobs.slice(0, 6),
              studentServices: recServices.length > 0 ? recServices : allServices.slice(0, 6)
            });
          }
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
            <h1 className="main-title display-5 fw-bold text-white mb-3" style={{fontSize: '2.8rem'}}>
              STUDENT <span className="text-primary-glow">FREELANCE</span> PLATFORM
            </h1>
            <p className="hero-slogan fw-light text-info mb-3" style={{fontSize: '0.9rem', letterSpacing: '2px'}}>
              "Hành trình khởi nghiệp - Kết nối tri thức"
            </p>
            <p className="hero-description mx-auto text-white-80" style={{ maxWidth: '650px', fontSize: '0.9rem', lineHeight: '1.7' }}>
              Nền tảng hàng đầu kết nối sinh viên tài năng với các dự án thực tế. 
              Nâng tầm kỹ năng, xây dựng hồ sơ năng lực chuyên nghiệp ngay từ khi còn đi học.
            </p>
          </div>

          <div className="hero-quick-stats mb-4">
            <div className="quick-stat-item">
              <Users size={18} className="text-primary"/>
              <span><strong className="text-white">2,500+</strong> Sinh viên</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Briefcase size={18} className="text-success"/>
              <span><strong className="text-white">800+</strong> Dự án</span>
            </div>
            <div className="quick-stat-divider"></div>
            <div className="quick-stat-item">
              <Building2 size={18} className="text-warning"/>
              <span><strong className="text-white">150+</strong> Doanh nghiệp</span>
            </div>
          </div>
          
          <div className="search-container glass-card mx-auto shadow-lg">
            <div className="search-header d-flex align-items-center justify-content-center gap-2">
              <Search size={12}/> TÌM KIẾM DỰ ÁN PHÙ HỢP
            </div>
            <div className="search-body p-2">
              <Row className="g-2 align-items-center">
                <Col md={6}>
                  <Button as={Link} to="/jobs" variant="primary" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Briefcase size={14}/> TÌM VIỆC LÀM
                  </Button>
                </Col>
                <Col md={6}>
                  <Button as={Link} to="/services" variant="outline-primary" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hero-search-btn">
                    <Sparkles size={14}/> KHÁM PHÁ DỊCH VỤ
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
                      <div className="job-card-h" style={{animationDelay: `${index * 0.08}s`}}>
                        <div className="job-card-h-header">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge className={`job-type-badge ${job.jobType === 'FULL_TIME' ? 'jt-full' : job.jobType === 'PART_TIME' ? 'jt-part' : 'jt-free'}`}>
                              {job.jobType === 'FULL_TIME' ? 'Toàn thời gian' : job.jobType === 'PART_TIME' ? 'Bán thời gian' : 'Freelance'}
                            </Badge>
                            <span className="job-time-ago">{timeAgo(job.createdAt)}</span>
                          </div>
                          <h6 className="job-card-h-title">{job.title}</h6>
                          <p className="job-card-h-desc">{job.description || 'Mô tả chi tiết...'}</p>
                        </div>
                        <div className="job-card-h-footer">
                          <div className="d-flex align-items-center gap-2">
                            <div className="job-company-avatar">
                              {job.enterpriseName?.[0] || 'D'}
                            </div>
                            <div>
                              <div className="job-company-name">{job.enterpriseName || 'Doanh nghiệp'}</div>
                              {job.location && <div className="job-location"><MapPin size={9}/> {job.location}</div>}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2 pt-2" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                            <div className="job-price">
                              {job.salary > 0 ? <><span>{formatMoney(job.salary)}</span><small>VND</small></> : <span className="text-info" style={{fontSize: '0.72rem'}}>Chưa có lương</span>}
                            </div>
                            <Button as={Link} to="/jobs" variant="primary" size="sm" className="job-apply-btn">
                              Ứng tuyển <ArrowRight size={10}/>
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

                <Row className="g-4">
                  {displayServices.slice(0, 6).map((svc, index) => (
                    <Col md={6} key={svc.serviceId || index}>
                      <Link to={`/service-detail/${svc.serviceId}`} className="text-decoration-none">
                        <div className="svc-card-h" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="svc-card-h-img">
                            <img 
                              src={svc.sampleImageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%230f172a'%3E%3Crect width='400' height='300'/%3E%3C/svg%3E"} 
                              alt={svc.title} 
                              loading="lazy"
                            />
                            {svc.recommendationReason && (
                              <div className="svc-card-h-tag">
                                {svc.recommendationReason === 'ORDER_HISTORY' ? 'Đã đặt hàng' : 'Phù hợp'}
                              </div>
                            )}
                          </div>
                          <div className="svc-card-h-body">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Badge bg="primary" className="svc-badge">{svc.category || 'Dịch vụ'}</Badge>
                              {svc.isStudentVerified && (
                                <Badge bg="success" className="svc-badge"><ShieldCheck size={9}/> Verified</Badge>
                              )}
                            </div>
                            <h6 className="svc-card-h-title">{svc.title}</h6>
                            <p className="svc-card-h-desc">{svc.description}</p>
                            <div className="svc-card-h-meta">
                              <span><Clock size={11}/> {svc.deliveryDays} ngày</span>
                            </div>
                            <div className="svc-card-h-bottom">
                              <div className="svc-card-h-author">
                                <img src={svc.studentAvatarUrl || 'https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff'} alt="" loading="lazy" />
                                <span>{svc.studentName}</span>
                              </div>
                              <span className="svc-card-h-price">{formatMoney(svc.price)}<small> VND</small></span>
                            </div>
                          </div>
                        </div>
                      </Link>
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

      {/* --- STUDENTS --- */}
      {recommendedStudents.length > 0 && (
        <section className="partner-section">
          <Container>
            <div className="section-header-wrap d-flex justify-content-between align-items-center mb-4">
              <div>
                <div className="section-badge mb-2"><GraduationCap size={12}/> ỨNG VIÊN NỔI BẬT</div>
                <h5 className="text-white fw-bold mb-1" style={{fontSize: '1.1rem'}}>Sinh viên tiềm năng</h5>
                <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)'}}>Đề xuất theo kỹ năng phù hợp với dự án của bạn</p>
              </div>
              <Button as={Link} to="/find-students" variant="outline-primary" className="fw-bold px-3 d-none d-md-flex align-items-center gap-2" style={{fontSize: '0.75rem'}}>
                Xem tất cả <ArrowRight size={14}/>
              </Button>
            </div>
            <Row className="g-3">
              {recommendedStudents.map((stu, index) => (
                <Col lg={3} md={6} key={stu.studentId || index}>
                  <Link to={`/portfolio/${stu.studentId}`} className="text-decoration-none">
                    <div className="home-partner-card glass-card h-100 text-center" style={{animationDelay: `${index * 0.08}s`}}>
                      <img
                        src={stu.avatarUrl || 'https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff&size=80'}
                        alt={stu.fullName}
                        loading="lazy"
                        style={{width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(59,130,246,0.3)', marginBottom: 8}}
                      />
                      <h6 className="text-white fw-bold mb-1" style={{fontSize: '0.8rem'}}>{stu.fullName}</h6>
                      <p className="mb-1" style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)'}}>{stu.major}</p>
                      <p className="mb-2" style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>{stu.school}</p>
                      {stu.averageRating > 0 && (
                        <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < Math.round(stu.averageRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(stu.averageRating) ? '#f59e0b' : 'none'} />
                          ))}
                          <span className="x-small fw-bold text-warning ms-1" style={{fontSize: '0.6rem'}}>{stu.averageRating}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-center align-items-center pt-2 border-top" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                        <div className="text-center">
                          <div className="fw-bold text-primary" style={{fontSize: '0.8rem'}}>{stu.gpa?.toFixed(2) || '—'}</div>
                          <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>GPA</div>
                        </div>
                      </div>
                      <Link to={`/cv/student/${stu.studentId}`} className="mt-2 d-block text-center" style={{fontSize: '0.65rem'}} onClick={function (e) { e.stopPropagation(); }}>
                        <FileText size={10} className="me-1 text-primary" />
                        <span className="text-primary fw-bold">Xem CV</span>
                      </Link>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* --- BUSINESSES --- */}
      {topBusinesses.length > 0 && (
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
                <Col lg={3} md={6} key={biz.enterpriseId || index}>
                  <div className="home-partner-card glass-card h-100 text-center" style={{animationDelay: `${index * 0.08}s`}}>
                    <img
                      src={biz.logoUrl || 'https://ui-avatars.com/api/?name=E&background=10b981&color=fff&size=80'}
                      alt={biz.companyName}
                      loading="lazy"
                      style={{width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(16,185,129,0.3)', marginBottom: 8}}
                    />
                    <h6 className="text-white fw-bold mb-1" style={{fontSize: '0.8rem'}}>{biz.companyName}</h6>
                    <p className="line-clamp-2 mb-2 px-2" style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)'}}>{biz.description}</p>
                    {biz.address && (
                      <div className="mb-2" style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)'}}>
                        <MapPin size={10} className="me-1"/>{biz.address}
                      </div>
                    )}
                    {biz.averageRating > 0 && (
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < Math.round(biz.averageRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(biz.averageRating) ? '#f59e0b' : 'none'} />
                        ))}
                        <span className="x-small fw-bold text-warning ms-1" style={{fontSize: '0.6rem'}}>{biz.averageRating}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-center align-items-center pt-2 border-top" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                      <Badge bg={biz.verificationStatus === 'VERIFIED' ? 'success' : 'secondary'} style={{fontSize: '0.55rem', padding: '3px 8px'}}>
                        {biz.verificationStatus === 'VERIFIED' ? 'Đã xác thực' : 'Chưa xác thực'}
                      </Badge>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-3 d-md-none">
              <Button as={Link} to="/businesses" variant="primary" className="fw-bold px-4" style={{fontSize: '0.75rem'}}>
                Xem tất cả doanh nghiệp <ArrowRight size={14} className="ms-1"/>
              </Button>
            </div>
          </Container>
        </section>
      )}

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
