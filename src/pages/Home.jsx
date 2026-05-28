import React from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Code, Layout, Briefcase, MapPin, 
  Building2, Bookmark, ChevronRight, ChevronLeft,
  UserPlus, MessagesSquare, FileText, CheckCircle2,
  Calendar, Eye, Clock, Wallet, Sparkles, Database,GraduationCap
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
              Nền tảng hàng đầu kết nối sinh viên tài năng với các dự án thực tế. 
              Nâng tầm kỹ năng, xây dựng hồ sơ năng lực chuyên nghiệp ngay từ khi còn đi học.
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
          <div className="section-header-wrap mb-5 text-center">
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
                  <div className="cat-content mt-3 text-center">
                    <h5 className="cat-title text-white">{item.title}</h5>
                    <div className="cat-stats"><span className="count-num" style={{color: item.color}}>{item.count}</span> <span className="text-white-50 ms-1">Dự án</span></div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 3: ĐỐI TÁC TIÊU BIỂU (4 CỘT) --- */}
      <section className="agency-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">Đối tác tuyển dụng tiêu biểu</h2>
          </div>
          <div className="position-relative">
            <Row className="g-4">
              {[
                { name: "Levatech Freelance", projects: "98,325", desc: "Đơn vị cung cấp nhân sự tự do hàng đầu trong ngành IT.", logo: "L" },
                { name: "Findy Freelance", projects: "2,269", desc: "Nền tảng môi giới dành riêng cho các kỹ sư tài năng.", logo: "F" },
                { name: "Coconala Tech", projects: "6,346", desc: "Dịch vụ giới thiệu dự án lớn nhất với hơn 30.000 đầu việc.", logo: "C" },
                { name: "Global Hub", projects: "1,150", desc: "Kết nối sinh viên với các dự án outsourcing quốc tế.", logo: "G" }
              ].map((agency, i) => (
                <Col md={6} lg={3} key={i}>
                  <div className="agency-card glass-card p-4 h-100 text-center">
                    <div className="agency-logo-wrapper mx-auto mb-3">{agency.logo}</div>
                    <h5 className="text-white fw-bold">{agency.name}</h5>
                    <div className="text-primary small mb-3"><Briefcase size={14} className="me-1"/> {agency.projects} dự án</div>
                    <p className="text-white-50 small mb-4 line-clamp-2">{agency.desc}</p>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" className="flex-grow-1">Xem tin</Button>
                      <Button variant="primary" size="sm" className="flex-grow-1">Chi tiết</Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>
      {/* --- PHẦN 4: MẠNG LƯỚI TRƯỜNG LIÊN KẾT (4 CỘT) --- */}
<section className="university-section py-5">
  <Container>
    <div className="text-center mb-5">
      <h2 className="fw-bold text-white">Mạng lưới trường học đối tác</h2>
      <p className="text-white-50">StudentLance tự hào đồng hành cùng các đơn vị đào tạo hàng đầu</p>
    </div>
    <Row className="g-4">
      {[
        { 
          name: "ĐH Bách Khoa Hà Nội", 
          type: "Kỹ thuật & Công nghệ", 
          stats: "15,000+ SV", 
          logo: "https://upload.wikimedia.org/wikipedia/vi/1/1b/Logo_Đại_học_Bách_Khoa_Hà_Nội.png" 
        },
        { 
          name: "ĐH Kinh tế Quốc dân", 
          type: "Kinh tế & Quản lý", 
          stats: "12,000+ SV", 
          logo: "https://upload.wikimedia.org/wikipedia/vi/8/82/Logo_Đại_học_Kinh_tế_Quốc_dân.svg" 
        },
        { 
          name: "Đại học FPT", 
          type: "CNTT & Mỹ thuật số", 
          stats: "20,000+ SV", 
          logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo.svg" 
        },
        { 
          name: "ĐH Ngoại thương", 
          type: "Kinh tế & Đối ngoại", 
          stats: "10,000+ SV", 
          logo: "https://upload.wikimedia.org/wikipedia/vi/a/a2/Logo_Đại_học_Ngoại_thương.png" 
        }
      ].map((uni, i) => (
        <Col md={6} lg={3} key={i}>
          <div className="uni-card-home glass-card p-4 h-100 text-center">
            {/* Logo Wrapper với hiệu ứng Grayscale */}
            <div className="uni-logo-box mx-auto mb-3">
              <img src={uni.logo} alt={uni.name} className="uni-logo-img" />
            </div>
            
            <h6 className="text-white fw-bold mb-2" style={{minHeight: '40px'}}>{uni.name}</h6>
            
            <div className="d-flex flex-column gap-1 mb-3">
               <span className="x-small text-primary-glow fw-bold">{uni.type}</span>
               <span className="x-small text-white-50"><GraduationCap size={12} className="me-1"/> {uni.stats} tham gia</span>
            </div>

            <Button as={Link} to="/universities" variant="outline-light" size="sm" className="w-100 py-2 btn-uni-more">
              XEM CHI TIẾT <ChevronRight size={14} className="ms-1"/>
            </Button>
          </div>
        </Col>
      ))}
    </Row>
  </Container>
</section>

      {/* --- PHẦN 5: DỰ ÁN MỚI (4 CỘT - NỘI DUNG THEO YÊU CẦU) --- */}
      <section className="new-listings py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white">Dự án mới đăng tải</h2>
          </div>
          <Row className="g-4">
            {[
              {
                tag: "SV HỖ TRỢ",
                tagColor: "info",
                title: "[SV Hỗ Trợ] Hướng dẫn & Fix lỗi Đồ án Tốt nghiệp ngành IT",
                location: "Online / Thủ Đức",
                price: "250.000đ",
                unit: "gói",
                icon: <Sparkles size={16}/>
              },
              {
                tag: "VIỆC LÀM NHANH",
                tagColor: "success",
                title: "Tuyển cộng tác viên nhập liệu Data sản phẩm TMĐT",
                location: "Làm việc từ xa",
                price: "10.000đ",
                unit: "giờ",
                icon: <Database size={16}/>
              },
              {
                tag: "SV HỖ TRỢ",
                tagColor: "info",
                title: "[Gấp] Hỗ trợ vẽ CAD & làm báo cáo Đồ án cơ khí",
                location: "Quận 9, TP. HCM",
                price: "300.000đ",
                unit: "dự án",
                icon: <Layout size={16}/>
              },
              {
                tag: "DATA ENTRY",
                tagColor: "warning",
                title: "Xử lý số liệu thô và dán nhãn dữ liệu AI (Data Labeling)",
                location: "Làm việc từ xa",
                price: "10.000đ",
                unit: "giờ",
                icon: <FileText size={16}/>
              }
            ].map((project, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="project-card-detail glass-card p-4 h-100 d-flex flex-column">
                  <Badge bg={project.tagColor} className="mb-3 text-dark w-fit-content py-2 px-3">
                    {project.tag}
                  </Badge>
                  <h6 className="text-primary fw-bold mb-3 line-clamp-2" style={{minHeight: '44px'}}>
                    {project.title}
                  </h6>
                  <ul className="project-meta-list list-unstyled mb-4 flex-grow-1">
                    <li className="text-white-50 small mb-2"><Clock size={14}/> Vừa xong</li>
                    <li className="text-white-50 small mb-2"><MapPin size={14}/> {project.location}</li>
                    <li className="mt-3">
                      <div className="text-danger fw-bold h5 mb-0">
                        {project.price} <small className="text-white-50 fw-light fs-6">/{project.unit}</small>
                      </div>
                    </li>
                  </ul>
                  <div className="d-flex gap-2">
                    <Button variant="outline-light" className="px-2"><Bookmark size={18}/></Button>
                    <Button as={Link} to="/jobs" variant="primary" className="w-100 fw-bold">Chi tiết</Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 6: NỘI DUNG PHỔ BIẾN & MỚI --- */}
      <section className="blog-section py-5">
        <Container>
          <Row className="g-5">
            <Col lg={8}>
              <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Nội dung phổ biến</h4>
              <Row className="g-3">
                <Col md={6}>
                  <div className="blog-item big glass-card overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" alt="blog" className="w-100" />
                    <div className="blog-overlay p-4">
                      <h6 className="text-white fw-bold mb-2">Làm việc tự do là gì? Hướng dẫn cho sinh viên</h6>
                      <p className="blog-item-desc small text-white-50">Khám phá định nghĩa Freelance và lộ trình bắt đầu công việc.</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="blog-item big glass-card overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" alt="blog" className="w-100" />
                    <div className="blog-overlay p-4">
                      <h6 className="text-white fw-bold mb-2">5 bước để trở thành một Freelancer thành công</h6>
                      <p className="blog-item-desc small text-white-50">Bí quyết xây dựng thương hiệu cá nhân chuyên nghiệp.</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col lg={4}>
              <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Tin tức mới</h4>
              <div className="new-content-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="new-content-item d-flex gap-3 mb-4">
                    <div className="small-thumb glass-card flex-shrink-0 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}><Code size={20} className="text-primary"/></div>
                    <div>
                      <h6 className="text-white small fw-bold mb-1 line-clamp-2">Nâng cao kiến thức lập trình hệ thống cho sinh viên năm cuối</h6>
                      <div className="text-white-50 x-small"><Calendar size={10}/> 22/05/2024</div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* --- PHẦN 7: HƯỚNG DẪN SỬ DỤNG (4 CỘT) --- */}
      <section className="how-to-use-section py-5 mb-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="guide-title fw-bold text-white">Hướng dẫn sử dụng Platform</h2>
            <div className="guide-underline mx-auto"></div>
          </div>
          <div className="steps-wrapper">
            <Row className="g-4">
              {[
                { step: 1, title: "Tìm việc", desc: "Duyệt qua hàng ngàn dự án phù hợp với kỹ năng của bạn." },
                { step: 2, title: "Ứng tuyển", desc: "Gửi đề xuất và trao đổi trực tiếp với người đăng tin." },
                { step: 3, title: "Làm việc", desc: "Thực hiện dự án và báo cáo tiến độ qua hệ thống." },
                { step: 4, title: "Nhận tiền", desc: "Nhận thanh toán an toàn sau khi hoàn thành công việc." }
              ].map((item, index) => (
                <Col lg={3} md={6} key={index} className="step-item text-center"> 
                  <div className="guide-step-card p-4 h-100 glass-card">
                    <div className="step-number-circle mx-auto mb-3">{item.step}</div>
                    <h5 className="step-heading text-white fw-bold mb-3">{item.title}</h5>
                    <p className="step-description text-white-50 small mb-0">{item.desc}</p>
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