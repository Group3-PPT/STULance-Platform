import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { 
  GraduationCap, MapPin, Users, Briefcase, 
  Search, ExternalLink, School, CheckCircle, 
  Globe, Award, BookOpen 
} from 'lucide-react';
import '../CSS/Universities.css';

const Universities = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const schools = [
    {
      id: 1,
      name: "Đại học Bách Khoa Hà Nội",
      type: "Kỹ thuật công nghệ",
      location: "Hai Bà Trưng, Hà Nội",
      students: "15,000+",
      projects: "450",
      rating: "4.9",
      logo: "https://upload.wikimedia.org/wikipedia/vi/e/e1/Logo_Hust.png"
    },
    {
      id: 2,
      name: "Đại học Kinh tế Quốc dân",
      type: "Kinh tế & Quản lý",
      location: "Đồng Tâm, Hà Nội",
      students: "12,000+",
      projects: "320",
      rating: "4.8",
      logo: "https://upload.wikimedia.org/wikipedia/vi/8/82/Logo_Đại_học_Kinh_tế_Quốc_dân.svg"
    },
    {
      id: 3,
      name: "Đại học FPT",
      type: "CNTT & Mỹ thuật số",
      location: "Thạch Thất, Hà Nội",
      students: "20,000+",
      projects: "680",
      rating: "5.0",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo.svg"
    },{
      id: 4,
      name: "Đại học Ngoại thương",
      type: "Kinh tế & Quản lý",
      location: "Thanh Xuân, Hà Nội",
      students: "15,000+",
      projects: "400",
      rating: "5.0",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo.svg"
    },{
        id: 5,
        name: "Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
        type: "CNTT & Khoa học máy tính",
        location: "Quận 9, TP.HCM",
        students: "18,000+",
        projects: "550",
        rating: "4.9",
        logo: "https://upload.wikimedia.org/wikipedia/vi/4/4e/Logo_Đại_học_Công_nghệ_Thông_tin_-_ĐHQG_TP.HCM.png"
    },{
        id: 6,
        name: "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
        type: "Khoa học tự nhiên",
        location: "Quận 9, TP.HCM",
        students: "10,000+",
        projects: "300",
        rating: "4.7",
        logo: "https://upload.wikimedia.org/wikipedia/vi/4/4e/Logo_Đại_học_Công_nghệ_Thông_tin_-_ĐHQG_TP.HCM.png"
    },
  ];

  return (
    <div className="uni-hub-page">
      {/* SECTION 1: HERO BANNER (Giống trang Business) */}
      <section className="uni-hero">
        <div className="uni-banner-wrap">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756defefe" alt="Campus" className="uni-banner-img" />
        </div>
        <Container>
          <div className="uni-hero-content text-center">
            <h1 className="display-3 fw-bold text-white mb-3">
              Mạng Lưới <span className="text-primary-glow">Học Thuật</span>
            </h1>
            <p className="lead text-white-50 mx-auto mb-5" style={{ maxWidth: '800px' }}>
              StudentLance kết nối trực tiếp với phòng công tác sinh viên của các trường đại học hàng đầu, 
              đảm bảo nguồn nhân lực chất lượng cao và hồ sơ sinh viên xác thực 100%.
            </p>
            
            {/* Search Box Pill */}
            <div className="uni-search-pill glass-card mx-auto p-2">
              <Row className="g-0 align-items-center">
                <Col xs={9} md={10}>
                  <div className="d-flex align-items-center px-3">
                    <Search size={20} className="text-primary me-2" />
                    <Form.Control 
                      placeholder="Tìm kiếm trường đại học đối tác..." 
                      className="bg-transparent border-0 text-white shadow-none"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
                <Col xs={3} md={2}>
                  <Button variant="primary" className="w-100 rounded-pill fw-bold py-2">TÌM KIẾM</Button>
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 2: STATS BAR (Chạy ngang) */}
      <Container className="mt-n5 position-relative z-index-20">
        <div className="glass-card stats-bar-uni p-4 shadow-lg">
          <Row className="text-center g-4">
            <Col md={3} className="border-end-gray">
              <h3 className="text-primary-glow mb-0">50+</h3>
              <p className="small text-muted mb-0">Trường liên kết</p>
            </Col>
            <Col md={3} className="border-end-gray">
              <h3 className="text-primary-glow mb-0">100K+</h3>
              <p className="small text-muted mb-0">Sinh viên tham gia</p>
            </Col>
            <Col md={3} className="border-end-gray">
              <h3 className="text-primary-glow mb-0">10B+</h3>
              <p className="small text-muted mb-0">Tổng ngân sách dự án</p>
            </Col>
            <Col md={3}>
              <h3 className="text-success mb-0">98%</h3>
              <p className="small text-muted mb-0">Tỷ lệ hài lòng</p>
            </Col>
          </Row>
        </div>
      </Container>

      {/* SECTION 3: UNIVERSITY GRID */}
      <Container className="py-5">
        <h4 className="text-white fw-bold mb-5 d-flex align-items-center gap-3">
          <Award className="text-primary" /> Danh sách các đơn vị đào tạo ưu tú
        </h4>

        <Row className="g-4">
          {schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((school) => (
            <Col lg={4} md={6} key={school.id}>
              <div className="glass-card school-card h-100 p-4">
                <div className="school-logo-bg mb-4">
                  <img src={school.logo} alt="logo" className="school-logo-img" />
                  <div className="verify-badge-uni"><CheckCircle size={14} fill="#3b82f6" color="white" /></div>
                </div>
                
                <h5 className="text-white fw-bold mb-2">{school.name}</h5>
                <p className="x-small text-primary fw-bold mb-3 uppercase-tracking">{school.type}</p>
                
                <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                  <MapPin size={14} /> {school.location}
                </div>

                <div className="school-data-grid py-3 border-top border-secondary">
                  <div className="data-item">
                    <span className="d-block text-white fw-bold">{school.students}</span>
                    <small className="x-small text-muted">Hồ sơ</small>
                  </div>
                  <div className="data-item">
                    <span className="d-block text-white fw-bold">{school.projects}</span>
                    <small className="x-small text-muted">Dự án</small>
                  </div>
                  <div className="data-item">
                    <span className="d-block text-warning fw-bold">{school.rating}</span>
                    <small className="x-small text-muted">Uy tín</small>
                  </div>
                </div>

                <Button variant="outline-primary" className="w-100 mt-4 rounded-pill fw-bold btn-view-school" onClick={() => alert(`Xem chi tiết ${school.name}\n\nChức năng đang được phát triển.`)}>
                  XEM CHI TIẾT TRƯỜNG <ExternalLink size={14} className="ms-2" />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Universities;