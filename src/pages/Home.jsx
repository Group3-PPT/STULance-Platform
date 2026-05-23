import React from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Code, Layout, Briefcase, MapPin, 
  Building2, Bookmark, ChevronRight, ChevronLeft,
  UserPlus, MessagesSquare, FileText, CheckCircle2,
  Calendar, Eye, Clock, Wallet, Sparkles
} from 'lucide-react';
import '../CSS/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      
      {/* --- PHẦN 1: BRANDING & HERO SEARCH --- */}
      <section className="hero-search-section text-center animate-fade-in">
        <Container>
          <div className="hero-branding mb-5">
            <h1 className="main-title display-3 fw-bold text-white mb-3">
              STUDENT <span className="text-primary-glow">FREELANCE</span> PLATFORM
            </h1>
            <p className="hero-slogan h4 fw-light text-info mb-4">
              "Hành trình khởi nghiệp - Kết nối tri thức"
            </p>
            <p className="hero-description lead mx-auto text-white-80" style={{ maxWidth: '750px' }}>
              Nền tảng hàng đầu kết nối sinh viên tài năng với các dự án thực tế từ doanh nghiệp. 
              Nâng tầm kỹ năng, xây dựng hồ sơ năng lực chuyên nghiệp ngay từ khi còn ngồi trên ghế nhà trường.
            </p>
          </div>

          <div className="stats-info mb-3 text-white-50">
            Số lượng dự án hiện tại: <span className="text-danger fw-bold">363.191</span> 
            <small className="ms-2 opacity-50">| Cập nhật mới nhất hôm nay</small>
          </div>
          
          <div className="search-container glass-card mx-auto shadow-lg">
            <div className="search-header text-uppercase">Tìm kiếm các dự án tự do</div>
            <div className="search-body p-3">
              <Row className="g-2">
                <Col md={3}><Form.Select className="hub-select"><option>Loại công việc</option></Form.Select></Col>
                <Col md={3}><Form.Select className="hub-select"><option>Kỹ năng</option></Form.Select></Col>
                <Col md={2}><Form.Select className="hub-select"><option>Ngân sách</option></Form.Select></Col>
                <Col md={2}><Form.Select className="hub-select"><option>Khu vực</option></Form.Select></Col>
                <Col md={2}>
                  <Button variant="primary" className="w-100 h-100 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <Search size={18} /> TÌM KIẾM
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </section>

      {/* --- PHẦN 2: CATEGORY GRID --- */}
      <section className="category-section py-5">
        <Container>
          <div className="section-header-wrap mb-5">
            <h2 className="text-white fw-bold">Khám phá theo danh mục</h2>
            <p className="text-white-50">Tìm kiếm công việc phù hợp với chuyên môn của bạn</p>
          </div>
          <Row className="g-4">
            {[
              { icon: <Code size={32} />, title: "Lập trình & IT", count: "12,450", color: "#3b82f6" },
              { icon: <Layout size={32} />, title: "Thiết kế Đồ họa", count: "8,210", color: "#ec4899" },
              { icon: <Briefcase size={32} />, title: "Marketing & SEO", count: "5,340", color: "#10b981" },
              { icon: <Bookmark size={32} />, title: "Viết lách & Dịch", count: "3,120", color: "#f59e0b" },
              { icon: <MapPin size={32} />, title: "Dịch vụ địa phương", count: "1,200", color: "#ef4444" },
              { icon: <Building2 size={32} />, title: "Kinh doanh & Tư vấn", count: "2,450", color: "#8b5cf6" },
            ].map((item, index) => (
              <Col xs={12} sm={6} md={4} lg={2} key={index}>
                <div className="cat-card glass-card h-100" style={{"--border-color": item.color}}>
                  <div className="cat-icon-wrapper" style={{color: item.color, backgroundColor: `${item.color}15`}}>{item.icon}</div>
                  <div className="cat-content mt-3">
                    <h5 className="cat-title text-white">{item.title}</h5>
                    <div className="cat-stats"><span className="count-num" style={{color: item.color}}>{item.count}</span> <span className="text-white-50 ms-1">Dự án</span></div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 3: CÁC CÔNG TY MÔI GIỚI ĐỀ XUẤT --- */}
      <section className="agency-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">Đối tác tuyển dụng tiêu biểu</h2>
          </div>
          <div className="position-relative">
            <Button className="slider-btn prev"><ChevronLeft /></Button>
            <Row className="g-4">
              {[
                { name: "Levatech Freelance", projects: "98,325", desc: "Đơn vị cung cấp nhân sự tự do hàng đầu trong ngành công nghệ thông tin.", logo: "L" },
                { name: "Findy Freelance", projects: "2,269", desc: "Nền tảng môi giới dành riêng cho các kỹ sư tài năng với mức lương hấp dẫn.", logo: "F" },
                { name: "Coconala Tech", projects: "6,346", desc: "Dịch vụ giới thiệu dự án lớn nhất với hơn 30.000 đầu việc đang hoạt động.", logo: "C" }
              ].map((agency, i) => (
                <Col md={4} key={i}>
                  <div className="agency-card glass-card p-4 h-100 text-center">
                    <div className="agency-logo-wrapper mx-auto mb-3">{agency.logo}</div>
                    <h5 className="text-white fw-bold">{agency.name}</h5>
                    <div className="text-primary small mb-3"><Briefcase size={14} className="me-1"/> {agency.projects} dự án</div>
                    <p className="text-white-50 small mb-4">{agency.desc}</p>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" className="flex-grow-1">Xem tin</Button>
                      <Button variant="primary" size="sm" className="flex-grow-1">Chi tiết</Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <Button className="slider-btn next"><ChevronRight /></Button>
          </div>
        </Container>
      </section>

      {/* --- PHẦN 5: DANH SÁCH MỚI --- */}
      <section className="new-listings py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">Dự án mới đăng tải</h2>
          </div>
          <Row className="g-4">
            {[1, 2, 3].map((item) => (
              <Col md={4} key={item}>
                <div className="project-card-detail glass-card p-4">
                  <Badge bg="warning" className="mb-3 text-dark">MỚI</Badge>
                  <h6 className="text-primary fw-bold mb-3 line-clamp-2">
                    [Kỹ sư AI] Dự án phân tích dữ liệu ứng dụng y tế và giáo dục 2026
                  </h6>
                  <ul className="project-meta-list list-unstyled mb-4">
                    <li><Clock size={14}/> Có thể làm việc từ xa</li>
                    <li><Wallet size={14}/> <span className="text-danger fw-bold">12.000.000đ</span> /tháng</li>
                    <li><MapPin size={14}/> Quận 1, TP. Hồ Chí Minh</li>
                  </ul>
                  <div className="d-flex gap-2">
                    <Button variant="outline-light" className="w-25"><Bookmark size={18}/></Button>
                    <Button as={Link} to="/jobs" variant="primary" className="w-75 fw-bold">Xem chi tiết</Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 6: NỘI DUNG PHỔ BIẾN & MỚI --- */}
      <section className="blog-section py-5 mb-5">
        <Container>
          <Row className="g-5">
            <Col lg={8}>
              <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Nội dung phổ biến</h4>
              <Row className="g-3">
                <Col md={6}>
                  <div className="blog-item big glass-card overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" alt="blog" />
                    <div className="blog-overlay p-4">
                      <h6 className="text-white fw-bold mb-2">Làm việc tự do là gì? Hướng dẫn cho sinh viên</h6>
                      <p className="blog-item-desc">Khám phá định nghĩa Freelance và lộ trình bắt đầu công việc tự do ngay từ khi còn đi học.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="blog-item big glass-card overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" alt="blog" />
                    <div className="blog-overlay p-4">
                      <h6 className="text-white fw-bold mb-2">5 bước để trở thành một Freelancer thành công</h6>
                      <p className="blog-item-desc">Bí quyết xây dựng thương hiệu cá nhân và kỹ năng quản lý tài chính cho người mới.</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col lg={4}>
              <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Nội dung mới</h4>
              <div className="new-content-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="new-content-item d-flex gap-3 mb-4">
                    <div className="small-thumb glass-card"><Code size={20}/></div>
                    <div>
                      <h6 className="text-white small fw-bold mb-1">Nâng cao kiến thức lập trình hệ thống 2026</h6>
                      <div className="text-white-50 x-small"><Calendar size={10}/> 22/05/2024</div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 7: HƯỚNG DẪN SỬ DỤNG --- */}
      <section className="how-to-use-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="guide-title fw-bold text-white">Hướng dẫn sử dụng Student Freelance PLATFORM</h2>
            <div className="guide-underline mx-auto"></div>
          </div>
          <div className="steps-wrapper">
            <div className="steps-line d-none d-lg-block"></div>
            <Row className="g-4">
              {[
                { step: 1, img: "https://img.freepik.com/free-vector/isometric-working-character-design_23-2148498293.jpg", title: "Ứng tuyển", desc: "Tìm kiếm dự án từ hơn 360.000 tin đăng dựa trên kỹ năng của bạn." },
                { step: 2, img: "https://img.freepik.com/free-vector/isometric-business-consulting-illustration_23-2148332158.jpg", title: "Tư vấn & Đề xuất", desc: "Hệ thống AI sẽ gửi đến bạn các đề xuất việc làm phù hợp nhất." },
                { step: 3, img: "https://img.freepik.com/free-vector/flat-isometric-illustration-concept-strategic-analysis-business-meeting_130740-41.jpg", title: "Đàm phán", desc: "Thảo luận trực tiếp với doanh nghiệp về các điều khoản dự án." },
                { step: 4, img: "https://img.freepik.com/free-vector/isometric-business-agreement-illustration_23-2148354228.jpg", title: "Ký kết & Làm việc", desc: "Hợp đồng điện tử được ký kết và bạn bắt đầu hành trình của mình." }
              ].map((item, index) => (
                <Col lg={3} md={6} key={index} className="step-item p-3 text-center">
                  <div className="step-number-circle mx-auto mb-3">{item.step}</div>
                  <div className="guide-step-card p-4">
                    <div className="step-image-wrap mb-4">
                      <img src={item.img} alt={item.title} className="step-img-fluid" />
                    </div>
                    <h5 className="step-heading text-white fw-bold mb-3">{item.title}</h5>
                    <p className="step-description text-white-80 mb-0">{item.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;