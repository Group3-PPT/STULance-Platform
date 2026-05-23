import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Star, Clock, RefreshCcw, Check, ChevronLeft, 
  ShieldCheck, MessageCircle, Share2, Globe, User 
} from 'lucide-react';
import '../../CSS/ServiceDetail.css'; // Gọi trực tiếp file CSS mới này
const ServiceDetail = () => {
  // Quản lý tab bảng giá (Basic / Premium)
  const [activePackage, setActivePackage] = useState('basic');

  // Dữ liệu mẫu dịch vụ
  const service = {
    title: "Thiết kế bộ nhận diện thương hiệu chuyên nghiệp cho các Startup sinh viên",
    category: "Thiết kế / Đồ họa",
    rating: 4.9,
    reviews: 128,
    author: {
      name: "Linh Nguyễn",
      user: "@linh_design_ueh",
      avatar: "https://ui-avatars.com/api/?name=Linh+Nguyen&background=0D8ABC&color=fff",
      bio: "Sinh viên năm cuối UEH chuyên ngành Marketing & Design. 2 năm kinh nghiệm làm Freelancer thiết kế.",
      isVerified: true
    },
    description: `Chào bạn! Mình là Linh, hiện đang là sinh viên năm cuối. Mình hiểu các Startup sinh viên thường có ngân sách hạn hẹp nhưng vẫn cần một bộ mặt chuyên nghiệp để gọi vốn hoặc kinh doanh.
    
    Trong gói dịch vụ này, mình cam kết mang lại:
    • 01 Logo vector chất lượng cao (định dạng AI, PNG, JPG).
    • Phối màu và chọn Font chữ thương hiệu chuẩn chỉnh.
    • Thiết kế Namecard và Cover các kênh mạng xã hội.
    • Hỗ trợ chỉnh sửa đến khi bạn hoàn toàn ưng ý.`,
    packages: {
      basic: {
        price: "1.500.000đ",
        delivery: "3 ngày",
        revisions: "2 lần",
        features: ["01 Logo duy nhất", "File PNG trong suốt", "Phối màu cơ bản"]
      },
      premium: {
        price: "3.500.000đ",
        delivery: "5 ngày",
        revisions: "Vô hạn",
        features: ["03 Mẫu Logo lựa chọn", "Đầy đủ file gốc (AI, EPS)", "Namecard & Letterhead", "Brand Guidelines mini"]
      }
    }
  };

  return (
    <div className="service-detail-wrapper py-4">
      <Container>
        {/* Nút quay lại */}
        <div className="mb-4">
          <Link to="/services" className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI DANH SÁCH
          </Link>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT DỊCH VỤ */}
          <Col lg={8}>
            <div className="glass-card p-4 mb-4">
              <h1 className="text-white fw-bold h3 mb-4">{service.title}</h1>
              
              {/* Profile người bán */}
              <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary pb-4">
                <Link to="/portfolio">
                   <img src={service.author.avatar} alt="avatar" className="detail-avatar" />
                </Link>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-white fw-bold">{service.author.name}</span>
                    {service.author.isVerified && <ShieldCheck size={16} className="text-primary" />}
                  </div>
                  <div className="text-warning small d-flex align-items-center gap-1">
                    <Star size={14} fill="currentColor" /> 
                    <span className="fw-bold">{service.rating}</span>
                    <span className="text-muted">({service.reviews} đánh giá)</span>
                  </div>
                </div>
              </div>

              {/* Ảnh sản phẩm chính */}
              <div className="main-image-box mb-4">
                <img src="https://images.unsplash.com/photo-1572044162444-ad60f128bde2" alt="Main Work" className="w-100 rounded-4 shadow-lg" />
              </div>

              {/* Nội dung mô tả */}
              <h4 className="text-primary-glow h5 mb-3">Giới thiệu về dịch vụ</h4>
              <p className="text-white-80 mb-5" style={{ whiteSpace: 'pre-line' }}>
                {service.description}
              </p>

              {/* Thông tin tác giả chi tiết */}
              <div className="author-card p-4 rounded-4 bg-white-5">
                <div className="d-flex gap-4 align-items-start">
                    <img src={service.author.avatar} alt="avatar" className="author-large-img" />
                    <div style={{flex: 1}}>
                        <h5 className="text-white fw-bold mb-2">{service.author.name}</h5>
                        <p className="small text-muted mb-3">{service.author.bio}</p>
                        <Button as={Link} to="/portfolio" variant="outline-primary" size="sm" className="fw-bold px-4">XEM HỒ SƠ NĂNG LỰC</Button>
                    </div>
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: BẢNG GIÁ & THANH TOÁN (STICKY) */}
          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card overflow-hidden">
                {/* Tab chuyển đổi giá */}
                <div className="package-tabs">
                  <div 
                    className={`package-tab-item ${activePackage === 'basic' ? 'active' : ''}`}
                    onClick={() => setActivePackage('basic')}
                  >Cơ bản</div>
                  <div 
                    className={`package-tab-item ${activePackage === 'premium' ? 'active' : ''}`}
                    onClick={() => setActivePackage('premium')}
                  >Cao cấp</div>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="text-white fw-bold mb-0">{service.packages[activePackage].price}</h2>
                    <Badge bg="primary" className="p-2">TIẾT KIỆM</Badge>
                  </div>
                  
                  <p className="small text-white-80 mb-4">
                    Phù hợp cho dự án cá nhân hoặc startup sinh viên quy mô nhỏ.
                  </p>

                  <div className="d-flex gap-4 mb-4 small text-info fw-bold">
                    <span className="d-flex align-items-center gap-1"><Clock size={16}/> {service.packages[activePackage].delivery}</span>
                    <span className="d-flex align-items-center gap-1"><RefreshCcw size={16}/> {service.packages[activePackage].revisions} sửa</span>
                  </div>

                  <ul className="list-unstyled mb-5">
                    {service.packages[activePackage].features.map((feat, i) => (
                      <li key={i} className="text-white-80 small mb-2 d-flex align-items-center gap-2">
                        <Check size={14} className="text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>

                  <Button as={Link} to="/service-invoice" variant="primary" className="w-100 py-3 fw-bold hub-btn-pink shadow-glow mb-2">
                    TIẾP TỤC THANH TOÁN
                  </Button>
                  <div className="text-center mt-3">
                    <span className="x-small text-muted">Thanh toán an toàn qua StudentLance Escrow</span>
                  </div>
                </div>
              </div>

              {/* Các hành động phụ */}
              <div className="d-flex gap-2 mt-3">
                <Button variant="outline-light" className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2">
                   <MessageCircle size={18} /> Chat ngay
                </Button>
                <Button variant="outline-light" className="px-3"><Share2 size={18} /></Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServiceDetail;